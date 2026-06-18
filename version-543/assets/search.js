(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var data = window.MOVIE_DATA || [];
        var input = document.getElementById('movie-search-input');
        var regionFilter = document.getElementById('movie-region-filter');
        var typeFilter = document.getElementById('movie-type-filter');
        var yearFilter = document.getElementById('movie-year-filter');
        var results = document.getElementById('search-results');
        var summary = document.getElementById('search-summary');

        if (!input || !results) {
            return;
        }

        fillSelect(regionFilter, unique(data.map(function (movie) { return movie.region; })).sort(), '全部地区');
        fillSelect(typeFilter, unique(data.map(function (movie) { return movie.type; })).sort(), '全部类型');
        fillSelect(yearFilter, unique(data.map(function (movie) { return movie.year; })).sort().reverse(), '全部年份');

        function applySearch() {
            var query = input.value.trim().toLowerCase();
            var region = regionFilter.value;
            var type = typeFilter.value;
            var year = yearFilter.value;

            var matched = data.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.one_line
                ].join(' ').toLowerCase();

                return (!query || text.indexOf(query) !== -1)
                    && (!region || movie.region === region)
                    && (!type || movie.type === type)
                    && (!year || movie.year === year);
            }).slice(0, 120);

            renderResults(matched);
            summary.textContent = matched.length ? '已显示相关影片。' : '没有找到匹配影片，可更换关键词。';
        }

        [input, regionFilter, typeFilter, yearFilter].forEach(function (element) {
            element.addEventListener('input', applySearch);
            element.addEventListener('change', applySearch);
        });

        renderResults(data.slice(0, 48));
    });

    function unique(values) {
        var map = Object.create(null);
        values.forEach(function (value) {
            if (value) {
                map[value] = true;
            }
        });
        return Object.keys(map);
    }

    function fillSelect(select, values, firstLabel) {
        if (!select) {
            return;
        }
        select.innerHTML = '<option value="">' + firstLabel + '</option>';
        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function renderResults(movies) {
        var results = document.getElementById('search-results');
        results.innerHTML = movies.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster-box" href="movies/' + movie.slug + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '        <span class="poster-fallback">热门亚洲电影</span>',
                '        <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" data-cover loading="lazy" onerror="this.classList.add(\'is-missing\'); this.removeAttribute(\'src\');">',
                '        <span class="poster-mask"><span class="play-dot">▶</span></span>',
                '        <span class="type-pill">' + escapeHtml(movie.type || '影片') + '</span>',
                '        <span class="region-pill">' + escapeHtml(movie.region || '精选') + '</span>',
                '    </a>',
                '    <div class="movie-info">',
                '        <h3><a href="movies/' + movie.slug + '">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(' · ')) + '</p>',
                '        <p class="movie-one-line">' + escapeHtml(movie.one_line || '') + '</p>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }
})();
