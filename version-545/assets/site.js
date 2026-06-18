(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stopTimer();
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var yearSelect = scope.querySelector('[data-year-filter]');
      var regionSelect = scope.querySelector('[data-region-filter]');
      var list = document.querySelector('[data-card-list]');
      var resultCount = document.querySelector('[data-result-count]');

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = card.getAttribute('data-search') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear === year;
          var matchedRegion = !region || cardRegion === region;
          var shouldShow = matchedKeyword && matchedYear && matchedRegion;

          card.classList.toggle('hidden-card', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (resultCount) {
          resultCount.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      if (input) {
        var initialQuery = getQuery('q');
        if (initialQuery) {
          input.value = initialQuery;
        }
        input.addEventListener('input', applyFilter);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', applyFilter);
      }
      if (regionSelect) {
        regionSelect.addEventListener('change', applyFilter);
      }

      applyFilter();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-player-trigger]');
      var source = video ? video.getAttribute('data-m3u8') : '';
      var hls = null;

      function loadSource() {
        if (!video || !source || video.getAttribute('data-loaded') === 'true') {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        }

        video.setAttribute('data-loaded', 'true');
      }

      function playVideo() {
        if (!video) {
          return;
        }
        loadSource();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('playing');
          });
        }
        player.classList.add('playing');
      }

      if (trigger) {
        trigger.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('playing');
        });
        video.addEventListener('ended', function () {
          player.classList.remove('playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  setupHero();
  setupFilters();
  setupPlayers();
})();
