/**
 * Hero 2.5D 深度视差
 *
 * 原理：拿两张纹理进片元着色器，一张彩色原图、一张深度图。鼠标移动时，按
 * 每个像素的深度值去偏移它的采样坐标——近处偏移大、远处偏移小，大脑把这段
 * 位移差读成纵深。
 *
 * 深度图这里是程序化生成的：hero 用的是城市街景仰视图，天空在最远、街道在
 * 最近，所以一张「上亮下暗」的垂直渐变已经能对上大关系；两侧再压暗一点，让
 * 近景建筑比画面中央动得更多。
 *
 * 这是渐进增强：原 <img> 一直留在 DOM 里，只有这里初始化成功才会把 canvas
 * 淡入盖上去。移动端、低配设备、js 失效、WebGL 不可用，看到的都还是那张静
 * 态图。
 */
(function () {
  'use strict';

  var canvas = document.querySelector('.hero-parallax-canvas');
  if (!canvas) return;

  /* ── 启用条件 ─────────────────────────────────────────────────────────
     移动端由 CSS 直接隐藏了整个 .hero-visual，这里再挡一道：只有带精确
     指针的桌面设备才走 WebGL，触屏和降低动效偏好的用户直接看到静态图。 */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || calm.matches) return;
  if (!window.THREE) return;

  var container = canvas.parentElement;
  if (!container) return;

  var imageUrl = canvas.getAttribute('data-src');
  if (!imageUrl) return;

  /* ── 程序化深度图 ─────────────────────────────────────────────────────
     约定和着色器一致：黑色 0.0 = 离镜头最近，白色 1.0 = 最远。
     512 见方足够，反正它只提供低频的远近信息，不需要细节。 */
  function buildDepthMap() {
    var size = 512;
    var c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    var ctx = c.getContext('2d');

    /* 垂直渐变：顶部天空最远（近白），底部街道最近（近黑） */
    var sky = ctx.createLinearGradient(0, 0, 0, size);
    sky.addColorStop(0.00, '#ffffff');
    sky.addColorStop(0.30, '#d2d2d2');
    sky.addColorStop(0.62, '#5e5e5e');
    sky.addColorStop(1.00, '#0b0b0b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, size, size);

    /* 左右两侧各压一层暗：两侧是近景楼，让它们比画面中央动得多 */
    var edge = Math.round(size * 0.34);
    var left = ctx.createLinearGradient(0, 0, edge, 0);
    left.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    left.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = left;
    ctx.fillRect(0, 0, edge, size);

    var right = ctx.createLinearGradient(size, 0, size - edge, 0);
    right.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    right.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = right;
    ctx.fillRect(size - edge, 0, edge, size);

    return c.toDataURL('image/jpeg', 0.85);
  }

  /* ── 着色器 ───────────────────────────────────────────────────────────
     顶点着色器只传 UV，什么都不变形。 */
  var vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n');

  var fragmentShader = [
    'uniform sampler2D tDiffuse;',
    'uniform sampler2D tDepth;',
    'uniform vec2 uMouse;',
    'uniform float uIntensity;',
    'varying vec2 vUv;',
    'void main() {',
    /* vUv 直接就是图片自身坐标：平面是按 cover 放大的，几何体本身就是
       图片的画布，不需要再做任何换算。 */
    '  float depth = texture2D(tDepth, vUv).r;',
    /* 先把采样范围往中心收一点（等效于画面放大），给下面的偏移留出边缘
       缓冲；否则容器与图片比例接近时，一动就会露出空边。 */
    '  vec2 zoomUv = (vUv - 0.5) * (1.0 - uIntensity * 2.0) + 0.5;',
    /* 近处 (1.0 - depth) 接近 1，偏移最大；远处接近 0，几乎不动 */
    '  vec2 offset = uMouse * (1.0 - depth) * uIntensity;',
    '  vec2 displaced = clamp(zoomUv + offset, 0.0, 1.0);',
    '  gl_FragColor = texture2D(tDiffuse, displaced);',
    '}'
  ].join('\n');

  /* ── 场景 ─────────────────────────────────────────────────────────── */
  var Int = 0.028;               /* 强度：太大边缘会露馅，太小看不出立体 */
  var Lerp = 0.075;              /* 阻尼：越小越绵，越大越跟手 */

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  var uniforms = {
    tDiffuse: { value: null },
    tDepth: { value: null },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uIntensity: { value: Int }
  };

  var mesh = null;
  var imageAspect = 1;
  var ready = false;

  /* 平面按 cover 铺满容器：算出比容器更大的尺寸，超出的部分被容器裁掉。
     这个放大倍数同时喂给着色器，用来把 vUv 还原成图片坐标。 */
  function fitPlane() {
    if (!mesh) return;

    var w = container.clientWidth || 1;
    var h = container.clientHeight || 1;
    var viewAspect = w / h;

    var scaleX = 1;
    var scaleY = 1;

    if (viewAspect > imageAspect) {
      /* 容器比图片宽：宽度铺满，高度溢出 */
      scaleY = viewAspect / imageAspect;
    } else {
      /* 容器比图片高：高度铺满，宽度溢出 */
      scaleX = imageAspect / viewAspect;
    }

    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h, false);

    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(w * scaleX, h * scaleY);
  }

  var target = new THREE.Vector2(0, 0);
  var current = new THREE.Vector2(0, 0);
  var running = false;
  var visible = true;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    if (!ready || !visible) return;

    current.x += (target.x - current.x) * Lerp;
    current.y += (target.y - current.y) * Lerp;
    uniforms.uMouse.value.copy(current);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    frame();
  }

  function stop() {
    running = false;
  }

  /* ── 鼠标：用容器内的相对坐标 ────────────────────────────────────────
     归一化到 -1 … 1，向右为 +x，向上为 +y。 */
  container.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var r = container.getBoundingClientRect();
    if (!r.width || !r.height) return;
    target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    target.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  }, { passive: true });

  /* 指针离开时缓缓回中，不要僵在最后一帧的位置 */
  container.addEventListener('pointerleave', function () {
    target.set(0, 0);
  }, { passive: true });

  /* ── 尺寸变化 ─────────────────────────────────────────────────────── */
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(fitPlane).observe(container);
  }
  window.addEventListener('resize', fitPlane, { passive: true });

  /* ── 省电：滚出视野或切到后台就停掉渲染循环 ───────────────────────── */
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0 }).observe(container);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (visible) start();
  });

  /* ── 加载两张纹理 ─────────────────────────────────────────────────── */
  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  loader.load(
    imageUrl,
    function (colorTexture) {
      loader.load(
        buildDepthMap(),
        function (depthTexture) {
          colorTexture.minFilter = THREE.LinearFilter;
          colorTexture.magFilter = THREE.LinearFilter;
          /* 图片是 sRGB 内容，交给渲染器做色彩空间转换 */
          if ('colorSpace' in colorTexture && THREE.SRGBColorSpace) {
            colorTexture.colorSpace = THREE.SRGBColorSpace;
          }

          depthTexture.minFilter = THREE.LinearFilter;
          depthTexture.magFilter = THREE.LinearFilter;

          uniforms.tDiffuse.value = colorTexture;
          uniforms.tDepth.value = depthTexture;

          imageAspect = (colorTexture.image.width || 1) / (colorTexture.image.height || 1);

          var material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
          });

          mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
          scene.add(mesh);

          ready = true;
          fitPlane();
          canvas.classList.add('is-ready');
          if (visible) start();
        },
        undefined,
        function () {
          /* 深度图失败就安静退出，静态图继续用 */
        }
      );
    },
    undefined,
    function () {
      /* 彩色图加载失败同样静默退出 */
    }
  );
})();
