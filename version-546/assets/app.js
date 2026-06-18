(function() {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuButton = $('[data-menu-button]');
    var mobileNav = $('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = $('[data-hero]');

    if (hero) {
        var slides = $all('[data-hero-slide]', hero);
        var dots = $all('[data-hero-dot]', hero);
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
            });
        });

        window.setInterval(function() {
            showSlide(current + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupSearch() {
        var input = $('[data-search-box]');
        var results = $('[data-search-results]');

        if (!input || !results || !window.SEARCH_INDEX) {
            return;
        }

        function render(items) {
            results.innerHTML = items.map(function(item) {
                return [
                    '<a class="search-result-item" href="', item.url, '">',
                    '<img src="', item.image, '" alt="', item.title.replace(/"/g, '&quot;'), '">',
                    '<span><strong>', item.title, '</strong><em>', item.year, ' · ', item.region, ' · ', item.category, '</em></span>',
                    '</a>'
                ].join('');
            }).join('');
        }

        input.addEventListener('input', function() {
            var keyword = normalize(input.value);

            if (!keyword) {
                results.innerHTML = '';
                return;
            }

            var matched = window.SEARCH_INDEX.filter(function(item) {
                return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.category).indexOf(keyword) !== -1;
            }).slice(0, 8);

            render(matched);
        });
    }

    function setupPageFilter() {
        var input = $('[data-page-filter]');
        var select = $('[data-year-filter]');
        var grid = $('[data-filter-grid]');

        if (!grid) {
            return;
        }

        var cards = $all('[data-title]', grid);

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var year = select ? select.value : '';

            cards.forEach(function(card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region')
                ].join(' '));

                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute('data-year') === year;

                card.classList.toggle('is-filtered-out', !(matchKeyword && matchYear));
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applyFilter);
        }
    }

    setupSearch();
    setupPageFilter();
})();
