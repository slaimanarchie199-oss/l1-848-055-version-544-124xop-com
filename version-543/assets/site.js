(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var links = document.querySelector('[data-nav-links]');

        if (toggle && links) {
            toggle.addEventListener('click', function () {
                links.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('img[data-cover]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-missing');
                image.removeAttribute('src');
            });
        });

        setupHeroSlider();
        setupCardFilters();
    });

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupCardFilters() {
        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-card-search]');
            var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-card-filter]'));
            var list = scope.parentElement.querySelector('[data-card-list]');
            var activeValue = '全部';

            if (!list) {
                return;
            }

            function matches(card, query, chip) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();

                var queryOk = !query || haystack.indexOf(query) !== -1;
                var chipOk = !chip || chip === '全部' || haystack.indexOf(chip.toLowerCase()) !== -1;
                return queryOk && chipOk;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
                cards.forEach(function (card) {
                    card.classList.toggle('is-filtered-out', !matches(card, query, activeValue));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            buttons.forEach(function (button) {
                if (button.getAttribute('data-card-filter') === '全部') {
                    button.classList.add('active');
                }

                button.addEventListener('click', function () {
                    activeValue = button.getAttribute('data-card-filter') || '全部';
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });
        });
    }
})();
