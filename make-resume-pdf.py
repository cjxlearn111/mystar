# -*- coding: utf-8 -*-
"""
重新生成简历 PDF —— 改完简历 HTML 后跑一次即可。

用法（在 mystar/ 目录下）：
    python make-resume-pdf.py
或双击：
    make-resume-pdf.bat

它做四件事：
  1. 找到简历 HTML（默认 ../求职/陈嘉希简历.html）
  2. 用 Edge 无头模式量出内容的真实渲染高度
  3. 把高度写回简历 HTML 的 @page 尺寸（内容 + 余量，自动收敛到单页）
  4. 打印成单页长页 PDF → source/files/resume.pdf

前置条件：本机装有 Microsoft Edge。改完 PDF 记得 git push 才会发布。
"""

import glob
import os
import re
import subprocess
import sys
from urllib.parse import quote

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

EDGE_PATHS = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
]

RESUME_DEFAULT = os.path.join("..", "求职", "陈嘉希简历.html")
OUT_PDF = os.path.join("source", "files", "resume.pdf")
PAGE_W_MM = 220          # 页面宽：简历容器 820px ≈ 217mm，必须比 A4 的 210 宽
SAFETY_MM = 6            # 内容高度之上的余量
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


def measure_height(edge, resume_path):
    """用 Edge 加载简历、由 JS 读出容器真实高度（px）。"""
    tmp = os.path.abspath("_resume_measure_tmp.html")
    uri = "file:///" + quote(os.path.abspath(resume_path).replace("\\", "/"))
    with open(tmp, "w", encoding="utf-8") as f:
        f.write("""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>pending</title></head>
<body style="margin:0;padding:0">
<iframe id="f" src="%s" style="width:%dpx;height:8000px;border:0"></iframe>
<script>
window.addEventListener('load', function () {
  setTimeout(function () {
    try {
      var d = document.getElementById('f').contentDocument;
      document.title = 'H_' + d.querySelector('.container').offsetHeight;
    } catch (e) { document.title = 'ERR_' + e.message; }
  }, 800);
});
</script>
</body></html>""" % (uri, round(PAGE_W_MM * 96 / 25.4)))
    dom_file = os.path.abspath("_resume_dom_tmp.txt")
    try:
        # 输出直接落盘，不走管道：Edge 的日志不是 UTF-8，走 PIPE 会在读线程里解码报错
        with open(dom_file, "wb") as sink:
            subprocess.run(
                [edge, "--headless=new", "--disable-gpu", "--allow-file-access-from-files",
                 "--virtual-time-budget=5000",
                 "--user-data-dir=" + os.path.join(os.environ.get("TEMP", "."), "pdfgen"),
                 "--dump-dom", "file:///" + quote(tmp.replace("\\", "/"))],
                stdout=sink, stderr=subprocess.DEVNULL, timeout=180)
        with open(dom_file, encoding="utf-8", errors="replace") as f:
            out = f.read()
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
    subprocess.run(
        [edge, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
         "--user-data-dir=" + os.path.join(os.environ.get("TEMP", "."), "pdfgen"),
         "--print-to-pdf=" + pdf_path, uri],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)


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
