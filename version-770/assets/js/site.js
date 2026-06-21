(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-nav-toggle]");
        var links = document.querySelector("[data-nav-links]");

        function syncHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 40) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        syncHeader();
        window.addEventListener("scroll", syncHeader, { passive: true });

        if (toggle && links && header) {
            toggle.addEventListener("click", function () {
                links.classList.toggle("is-open");
                header.classList.toggle("is-open", links.classList.contains("is-open"));
                toggle.textContent = links.classList.contains("is-open") ? "✕" : "☰";
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function activate(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
                restart();
            });
        });

        restart();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupGlobalSearch() {
        var form = document.querySelector("[data-site-search]");
        var results = document.querySelector("[data-search-results]");
        if (!form || !results || !Array.isArray(window.MovieSearchData)) {
            return;
        }
        var input = form.querySelector("input[type='search']");
        if (!input) {
            return;
        }

        function render(query) {
            var q = normalize(query);
            if (!q) {
                results.hidden = true;
                results.innerHTML = "";
                return [];
            }
            var matches = window.MovieSearchData.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.oneLine
                ].join(" ")).indexOf(q) !== -1;
            }).slice(0, 12);

            if (!matches.length) {
                results.innerHTML = '<p class="search-empty">未找到匹配的影片</p>';
                results.hidden = false;
                return [];
            }

            results.innerHTML = matches.map(function (movie) {
                return '<a class="search-result-item" href="' + movie.href + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">' +
                    '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
                    '<em>' + escapeHtml(movie.year + " · " + movie.region + " · " + movie.type) + '</em>' +
                    '<em>' + escapeHtml(movie.oneLine) + '</em></span>' +
                    '</a>';
            }).join("");
            results.hidden = false;
            return matches;
        }

        input.addEventListener("input", function () {
            render(input.value);
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var matches = render(input.value);
            if (matches[0]) {
                window.location.href = matches[0].href;
            }
        });

        document.addEventListener("click", function (event) {
            if (!form.contains(event.target) && !results.contains(event.target)) {
                results.hidden = true;
            }
        });
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"]/g, function (item) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[item];
        });
    }

    function setupFilters() {
        var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
        if (!lists.length) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-filter-year]");
        var empty = document.querySelector("[data-filter-empty]");

        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = year ? year.value : "";
            var visible = 0;
            lists.forEach(function (list) {
                Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")).forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = (!keyword || text.indexOf(keyword) !== -1) && (!selectedYear || cardYear === selectedYear);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
    }

    function mountPlayer(streamUrl) {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("[data-video]");
        var button = shell.querySelector("[data-player-start]");
        var controller = null;
        var prepared = false;

        function prepare() {
            if (prepared || !video) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                controller = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                controller.loadSource(streamUrl);
                controller.attachMedia(video);
                if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
                    controller.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (shell.getAttribute("data-pending-play") === "1") {
                            playVideo();
                        }
                    });
                }
            } else {
                video.src = streamUrl;
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        function start() {
            shell.setAttribute("data-pending-play", "1");
            prepare();
            window.setTimeout(playVideo, 120);
        }

        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                shell.setAttribute("data-pending-play", "0");
                if (button) {
                    button.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }

        window.addEventListener("beforeunload", function () {
            if (controller && typeof controller.destroy === "function") {
                controller.destroy();
            }
        });
    }

    window.MovieSite = {
        mountPlayer: mountPlayer
    };

    ready(function () {
        setupHeader();
        setupHero();
        setupGlobalSearch();
        setupFilters();
    });
})();
