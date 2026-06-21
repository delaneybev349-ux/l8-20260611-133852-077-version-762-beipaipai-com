(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = qs('[data-mobile-menu-button]');
        var menu = qs('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupImageFallbacks() {
        qsa('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.classList.add('is-missing');
                img.removeAttribute('src');
            }, { once: true });
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restartTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                activate(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                activate(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(current + 1);
                restartTimer();
            });
        }

        restartTimer();
    }

    function setupFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var container = qs('[data-filter-container]');
            if (!container) {
                return;
            }
            var cards = qsa('[data-card]', container);
            var input = qs('[data-filter-input]', panel);
            var year = qs('[data-filter-year]', panel);
            var region = qs('[data-filter-region]', panel);
            var type = qs('[data-filter-type]', panel);
            var reset = qs('[data-filter-reset]', panel);

            function applyFilter() {
                var query = normalize(input && input.value);
                var selectedYear = year ? year.value : '';
                var selectedRegion = region ? region.value : '';
                var selectedType = type ? type.value : '';

                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute('data-search'));
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                    var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                    var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
                    card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchRegion && matchType));
                });
            }

            [input, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (input) {
                        input.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    applyFilter();
                });
            }
        });
    }

    function createResultCard(item) {
        var tags = (item.tags || []).slice(0, 5).join(' ');
        return [
            '<article class="movie-card">',
            '    <a class="poster-link" href="' + item.url + '">',
            '        <span class="poster-shell">',
            '            <img class="poster-image" src="' + item.image + '" alt="' + item.title + '" loading="lazy">',
            '            <span class="poster-fallback">' + item.title + '</span>',
            '            <span class="poster-shade"></span>',
            '            <span class="play-mark">▶</span>',
            '            <span class="duration-badge">' + item.duration + '</span>',
            '        </span>',
            '    </a>',
            '    <div class="card-body">',
            '        <div class="card-meta">',
            '            <a href="' + item.categoryUrl + '">' + item.channel + '</a>',
            '            <span>' + item.year + '</span>',
            '            <span>' + item.region + '</span>',
            '        </div>',
            '        <h2><a href="' + item.url + '">' + item.title + '</a></h2>',
            '        <p>' + item.oneLine + '</p>',
            '        <div class="tag-line">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function setupGlobalSearch() {
        var input = qs('[data-global-search]');
        var form = qs('[data-global-search-form]');
        var results = qs('[data-search-results]');
        if (!input || !results || !window.SEARCH_INDEX) {
            return;
        }

        function render() {
            var query = normalize(input.value);
            var items = window.SEARCH_INDEX.filter(function (item) {
                return !query || normalize(item.search).indexOf(query) !== -1;
            }).slice(0, 96);
            results.innerHTML = items.map(createResultCard).join('\n');
            setupImageFallbacks();
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render();
            });
        }

        input.addEventListener('input', render);

        var params = new URLSearchParams(window.location.search);
        if (params.get('q')) {
            input.value = params.get('q');
        }
        render();
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }
            var script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function setupPlayer() {
        var player = qs('[data-player]');
        if (!player) {
            return;
        }
        var video = qs('[data-video-player]', player);
        var button = qs('[data-play-button]', player);
        var status = qs('[data-player-status]', player);
        if (!video || !button) {
            return;
        }
        var source = video.getAttribute('data-src');
        var isAttached = false;
        var hlsInstance = null;

        function setStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function attachSource() {
            if (isAttached) {
                return Promise.resolve();
            }
            setStatus('正在初始化播放器');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                isAttached = true;
                return Promise.resolve();
            }

            function attachWithHls() {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('点击播放');
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus('视频加载失败，请刷新后重试');
                        }
                    });
                    isAttached = true;
                    return Promise.resolve();
                }
                setStatus('当前浏览器不支持该播放源');
                return Promise.reject(new Error('HLS is not supported'));
            }

            if (window.Hls) {
                return attachWithHls();
            }

            return loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js').then(attachWithHls).catch(function (error) {
                setStatus('播放器脚本加载失败');
                throw error;
            });
        }

        function playVideo() {
            attachSource().then(function () {
                return video.play();
            }).then(function () {
                player.classList.add('is-playing');
            }).catch(function () {
                setStatus('请再次点击或更换浏览器播放');
            });
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('play', function () {
            player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            player.classList.remove('is-playing');
            setStatus('点击播放');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupImageFallbacks();
        setupHero();
        setupFilters();
        setupGlobalSearch();
        setupPlayer();
    });
})();
