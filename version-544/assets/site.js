(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-mobile-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  var searchInput = document.querySelector('[data-page-search]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var empty = document.querySelector('[data-empty-state]');

  function filterCards() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var shown = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      var visible = matchedKeyword && matchedYear;

      card.style.display = visible ? '' : 'none';

      if (visible) {
        shown += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }
})();

function initMoviePlayer(sourceUrl) {
  var player = document.querySelector('[data-player]');

  if (!player) {
    return;
  }

  var video = player.querySelector('video');
  var overlay = player.querySelector('[data-play-overlay]');
  var status = document.querySelector('[data-player-status]');
  var hls = null;
  var loaded = false;

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function loadSource() {
    if (!video || loaded) {
      return;
    }

    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('视频暂时无法播放，请稍后再试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else {
      setStatus('视频暂时无法播放，请稍后再试');
    }
  }

  function play() {
    loadSource();

    if (overlay) {
      overlay.classList.add('hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('点击播放按钮继续观看');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!loaded || video.paused) {
        play();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
