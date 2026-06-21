(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
        syncSearchQuery();
    });

    function setupMobileMenu() {
        var toggle = document.querySelector('.mobile-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var year = document.querySelector('[data-filter-year]');
        var category = document.querySelector('[data-filter-category]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
        if (!cards.length || (!input && !year && !category)) {
            return;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var categoryValue = category ? category.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-text') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear.indexOf(yearValue) === -1) {
                    matched = false;
                }
                if (categoryValue && cardCategory !== categoryValue) {
                    matched = false;
                }
                card.classList.toggle('is-hidden', !matched);
            });
        }

        [input, year, category].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener('input', apply);
            control.addEventListener('change', apply);
        });
        apply();
    }

    function syncSearchQuery() {
        var page = document.querySelector('[data-search-page]');
        var input = document.querySelector('[data-filter-input]');
        if (!page || !input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (q) {
            input.value = q;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function setupPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
        boxes.forEach(function (box) {
            var trigger = box.querySelector('.play-trigger');
            var video = box.querySelector('video');
            if (!video) {
                return;
            }
            var play = function () {
                startVideo(box, video);
            };
            if (trigger) {
                trigger.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    function startVideo(box, video) {
        var url = box.getAttribute('data-stream') || '';
        if (!url) {
            return;
        }
        if (video.getAttribute('data-ready') !== '1') {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hls = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            }
            video.setAttribute('data-ready', '1');
        }
        box.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }
})();
