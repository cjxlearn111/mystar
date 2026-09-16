/**
 * 文章目录交互
 * 1. 折叠：只展开当前章节的小节，其余收起
 * 2. 高亮：滚动时标记当前所在章节
 * 3. 跳转：点击条目平滑滚动，避开顶部固定区域
 * 4. 渐隐：目录内容超出可视高度时，底部加遮罩提示可继续滚动
 */
(function () {
  var toc = document.querySelector('.article-toc');
  if (!toc) return;

  var list = toc.querySelector('ol.toc');
  var prose = document.querySelector('.article-prose');
  if (!list || !prose) return;

  var chapters = Array.prototype.slice.call(
    list.querySelectorAll(':scope > .toc-level-2')
  );
  if (!chapters.length) return;

  // 目录 href 经过 encodeURL 编码，中文锚点要先解码才能查到元素
  function resolveTarget(href) {
    if (!href || href.charAt(0) !== '#') return null;
    var raw = href.slice(1);
    var node = document.getElementById(raw);
    if (node) return node;
    try {
      return document.getElementById(decodeURIComponent(raw));
    } catch (err) {
      return null;
    }
  }

  var sections = [];
  chapters.forEach(function (li) {
    var link = li.querySelector(':scope > a');
    if (!link) return;
    var target = resolveTarget(link.getAttribute('href') || '');
    if (!target) return;
    sections.push({ item: li, link: link, target: target });
  });
  if (!sections.length) return;

  list.classList.add('toc-js-ready');

  var activeIndex = -1;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    sections.forEach(function (section, i) {
      var on = i === index;
      section.item.classList.toggle('is-open', on);
      section.link.classList.toggle('is-active', on);
    });
  }

  function currentIndex() {
    var anchorLine = 140;
    var index = 0;
    for (var i = 0; i < sections.length; i += 1) {
      if (sections[i].target.getBoundingClientRect().top - anchorLine <= 0) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      setActive(currentIndex());
      updateFade();
      ticking = false;
    });
  }

  function updateFade() {
    var remaining = toc.scrollHeight - toc.clientHeight - toc.scrollTop;
    toc.classList.toggle('has-more', remaining > 8);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  toc.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var target = resolveTarget(href);
    if (!target) return;
    event.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - 110;
    window.scrollTo({ top: top < 0 ? 0 : top, behavior: 'smooth' });
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', href);
    }
  });

  setActive(currentIndex());
  updateFade();
})();
