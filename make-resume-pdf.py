# -*- coding: utf-8 -*-
"""
重新生成简历 PDF —— 改完简历 HTML 后跑一次即可。

用法（在 mystar/ 目录下）：
    macOS  ： python3 make-resume-pdf.py   （或双击 make-resume-pdf.command）
    Windows： python  make-resume-pdf.py   （或双击 make-resume-pdf.bat）

它做四件事：
  1. 找到简历 HTML（默认 ../求职/陈嘉希简历.html）
  2. 用 Chrome/Edge 无头模式量出内容的真实渲染高度（按平台分两套参数）
  3. 把高度写回简历 HTML 的 @page 尺寸（内容 + 余量，自动收敛到单页）
  4. 打印成单页长页 PDF → source/files/resume.pdf

为什么不是 A4 分页：A4 会切成几页，每页底部留一大段空白（最后一页尤其明显），
而这份简历的内容量正好适合一张排满的长页。

前置条件：本机装有 Google Chrome 或 Microsoft Edge（脚本自动探测 macOS / Windows 常见安装路径）。
改完 PDF 记得 git push 才会发布。
"""

import glob
import os
import re
import subprocess
import sys
import tempfile
import time
from urllib.parse import quote

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# 按平台依次探测：先 macOS 常见路径，再 Windows 常见路径
EDGE_PATHS = [
    # macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    # Windows
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
]

# 无头浏览器用的临时 profile 目录（跨平台，避免落在仓库里）
PROFILE_DIR = os.path.join(tempfile.gettempdir(), "pdfgen")

# ---- 两套无头参数（Windows / macOS 各自一套）----
# Windows 这套是原来验证可用的，保持不动；macOS 是换机后新配的一套。
IS_MAC = sys.platform == "darwin"

if IS_MAC:
    # macOS：新版 Chrome 的 --headless=new 在缺首启参数时会挂住不退出，
    #        这里补 --no-first-run / --no-default-browser-check / --no-sandbox；
    #        并且不靠 --virtual-time-budget（改由测量页在 iframe onload 时同步写 title）。
    MEASURE_FLAGS = [
        "--headless=new", "--disable-gpu", "--no-first-run",
        "--no-default-browser-check", "--no-sandbox",
        "--allow-file-access-from-files", "--dump-dom",
    ]
    PRINT_FLAGS = [
        "--headless=new", "--disable-gpu", "--no-first-run",
        "--no-default-browser-check", "--no-sandbox", "--no-pdf-header-footer",
    ]
else:
    MEASURE_FLAGS = [
        "--headless=new", "--disable-gpu", "--allow-file-access-from-files",
        "--virtual-time-budget=5000", "--dump-dom",
    ]
    PRINT_FLAGS = ["--headless=new", "--disable-gpu", "--no-pdf-header-footer"]

# 无头进程超时（秒）：macOS 下失败得更快，别干等 3 分钟
HEADLESS_TIMEOUT = 60 if IS_MAC else 180

RESUME_DEFAULT = os.path.join("..", "求职", "陈嘉希简历.html")
OUT_PDF = os.path.join("source", "files", "resume.pdf")
PAGE_W_MM = 210          # 页面宽 = A4 标准宽度，与原有排版对齐
SAFETY_MM = 3            # 内容底边之上的余量（原来 6mm，页面底部显得太空）
RETRY_STEP_MM = 10       # 若一轮下来仍不是单页，每轮加这么多
MAX_TRY = 3


def find_edge():
    for p in EDGE_PATHS:
        if os.path.exists(p):
            return p
    return None


def find_resume():
    if os.path.exists(RESUME_DEFAULT):
        return RESUME_DEFAULT
    # 兜底：上级目录里找 5 个汉字 + .html（文件名长度 10）
    for f in glob.glob(os.path.join("..", "*", "*.html")):
        if len(os.path.basename(f)) == 10:
            return f
    return None


def _stop(proc):
    """主动结束无头浏览器进程：先 terminate，5 秒不退再 kill。"""
    try:
        proc.terminate()
        proc.wait(timeout=5)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def measure_height(edge, resume_path):
    """用无头浏览器加载简历，由 JS 读出「从容器顶边到最后一个可见元素底边」的距离。

    这里刻意不用 container.offsetHeight：容器底部还带着自己的 padding 和尾部
    元素的 margin，直接量总高度会让页面最下方多出一大段空白（实测约 80px）。
    """
    tmp = os.path.abspath("_resume_measure_tmp.html")
    uri = "file:///" + quote(os.path.abspath(resume_path).replace("\\", "/"))
    with open(tmp, "w", encoding="utf-8") as f:
        f.write("""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>pending</title></head>
<body style="margin:0;padding:0">
<iframe id="f" src="%s" style="width:%dpx;height:8000px;border:0" onload="measure()"></iframe>
<script>
function measure() {
  try {
    var d = document.getElementById('f').contentDocument;
    var c = d.querySelector('.container');
    var padBottom = parseFloat(d.defaultView.getComputedStyle(c).paddingBottom) || 0;
    /* 量「容器高度 − 底部内边距」，而不是容器总高度：底部那 40px 内边距
       会被算进页面高度，在 PDF 最下方留出一段空白。 */
    document.title = 'H_' + Math.ceil(c.offsetHeight - padBottom);
  } catch (e) { document.title = 'ERR_' + e.message; }
}
/* iframe 一加载完就先算一次（macOS 无 virtual-time 时靠这一下拿到结果），
   load 后再等 800ms 复算一次（有 virtual-time 时更准）。 */
window.addEventListener('load', function () { setTimeout(measure, 800); });
</script>
</body></html>""" % (uri, round(PAGE_W_MM * 96 / 25.4)))
    dom_file = os.path.abspath("_resume_dom_tmp.txt")
    try:
        # 输出直接落盘，不走管道：Edge 的日志不是 UTF-8，走 PIPE 会在读线程里解码报错
        # 不等 Chrome 自己退出：轮询 DOM 文件，拿到结果就主动结束进程
        # （新版 Chrome 在 macOS 上常会打完不走，干等会耗尽超时）。
        with open(dom_file, "wb") as sink:
            proc = subprocess.Popen(
                [edge] + MEASURE_FLAGS
                + ["--user-data-dir=" + PROFILE_DIR, "file:///" + quote(tmp.replace("\\", "/"))],
                stdout=sink, stderr=subprocess.DEVNULL)
        deadline = time.time() + HEADLESS_TIMEOUT
        out = ""
        while time.time() < deadline:
            with open(dom_file, encoding="utf-8", errors="replace") as f:
                out = f.read()
            if re.search(r"<title>(H_\d+|ERR_)", out):
                break
            if proc.poll() is not None:
                break
            time.sleep(0.4)
        _stop(proc)
        m = re.search(r"<title>H_(\d+)</title>", out)
        if not m:
            anyt = re.search(r"<title>([^<]*)</title>", out)
            raise RuntimeError("量高度失败：" + (anyt.group(1) if anyt else "页面无 title"))
        return int(m.group(1))
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
        if os.path.exists(dom_file):
            os.remove(dom_file)


def set_page_height(resume_path, height_mm):
    """把 @page 的高度改成 height_mm，保留宽度不动。"""
    with open(resume_path, encoding="utf-8") as f:
        src = f.read()
    new, n = re.subn(r"(size:\s*\d+mm\s+)\d+mm", r"\g<1>%dmm" % height_mm, src)
    if n == 0:
        raise RuntimeError("简历 HTML 里没找到 @page size，请检查 @media print 块")
    with open(resume_path, "w", encoding="utf-8", newline="") as f:
        f.write(new)
    return n


def print_pdf(edge, resume_path, pdf_path):
    uri = "file:///" + quote(os.path.abspath(resume_path).replace("\\", "/"))
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    # 同上：轮询 PDF 是否生成且大小稳定，拿到就结束进程，不等 Chrome 退出
    proc = subprocess.Popen(
        [edge] + PRINT_FLAGS
        + ["--user-data-dir=" + PROFILE_DIR, "--print-to-pdf=" + pdf_path, uri],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    deadline = time.time() + HEADLESS_TIMEOUT
    last_size = -1
    while time.time() < deadline:
        if os.path.exists(pdf_path):
            size = os.path.getsize(pdf_path)
            if size > 0 and size == last_size:
                break
            last_size = size
        elif proc.poll() is not None:
            break
        time.sleep(0.4)
    _stop(proc)


def inspect(pdf_path):
    """返回 (页面数, 页面尺寸说明)。"""
    data = open(pdf_path, "rb").read()
    boxes = re.findall(rb"/MediaBox\s*\[([^\]]+)\]", data)
    page_objs = len(re.findall(rb"/Type\s*/Page[^s]", data))
    detail = ""
    if boxes:
        v = boxes[0].decode("latin-1").split()
        try:
            w, h = float(v[2]), float(v[3])
            detail = "%.0f x %.0f mm" % (w * 25.4 / 72, h * 25.4 / 72)
        except Exception:
            pass
    return max(len(boxes), page_objs), detail


def main():
    edge = find_edge()
    if not edge:
        print("找不到 Edge/Chrome，无法生成 PDF。")
        return 1

    resume = find_resume()
    if not resume:
        print("找不到简历 HTML（默认位置：../求职/陈嘉希简历.html）")
        return 1

    print("简历文件 :", resume)
    print("浏览器   :", edge)

    height_px = measure_height(edge, resume)
    base_mm = height_px * 25.4 / 96
    print("内容高度 : %d px = %.1f mm" % (height_px, base_mm))

    pdf_abs = os.path.abspath(OUT_PDF)
    for attempt in range(MAX_TRY):
        page_mm = round(base_mm) + SAFETY_MM + attempt * RETRY_STEP_MM
        set_page_height(resume, page_mm)
        print("第 %d 次：页面高 %dmm（余量 %dmm）…" % (attempt + 1, page_mm, page_mm - round(base_mm)))
        print_pdf(edge, resume, pdf_abs)
        pages, detail = inspect(pdf_abs)
        print("         → %d 页  %s" % (pages, detail))
        if pages == 1:
            print("完成：单页 PDF %.1f KB" % (os.path.getsize(pdf_abs) / 1024))
            print("输出：", OUT_PDF)
            print("记得 git push 才会发布到线上。")
            return 0

    print("三轮都没收敛到单页，请检查简历内容是否异常变长。")
    return 1


if __name__ == "__main__":
    sys.exit(main())
