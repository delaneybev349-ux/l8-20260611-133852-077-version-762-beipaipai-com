(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return "0:00";
        }
        var minutes = Math.floor(seconds / 60);
        var remain = Math.floor(seconds % 60).toString().padStart(2, "0");
        return minutes + ":" + remain;
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    function initCoverFallbacks() {
        document.querySelectorAll("img[data-cover]").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden-cover");
            }, { once: true });
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");

        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var previousButton = slider.querySelector("[data-hero-prev]");
        var nextButton = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
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
                timer = null;
            }
        }

        if (previousButton) {
            previousButton.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (nextButton) {
            nextButton.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function getCardText(card) {
        return [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
        ].join(" ").toLowerCase();
    }

    function initFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-card-filter]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var count = scope.querySelector("[data-filter-count]");
            var selectedYear = "all";
            var selectedCategory = "all";

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var matchesQuery = !query || getCardText(card).indexOf(query) !== -1;
                    var matchesYear = selectedYear === "all" || card.getAttribute("data-year") === selectedYear;
                    var matchesCategory = selectedCategory === "all" || card.getAttribute("data-category") === selectedCategory;
                    var shouldShow = matchesQuery && matchesYear && matchesCategory;

                    card.classList.toggle("is-hidden", !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + " 部影片";
                }
            }

            if (input) {
                if (input.hasAttribute("data-read-query")) {
                    var params = new URLSearchParams(window.location.search);
                    var query = params.get("q");
                    if (query) {
                        input.value = query;
                    }
                }

                input.addEventListener("input", apply);
            }

            scope.querySelectorAll("[data-filter-year]").forEach(function (button) {
                button.addEventListener("click", function () {
                    selectedYear = button.getAttribute("data-filter-year") || "all";
                    scope.querySelectorAll("[data-filter-year]").forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });

            scope.querySelectorAll("[data-filter-category]").forEach(function (button) {
                button.addEventListener("click", function () {
                    selectedCategory = button.getAttribute("data-filter-category") || "all";
                    scope.querySelectorAll("[data-filter-category]").forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (shell) {
            var video = shell.querySelector("video[data-src]");
            var source = video ? video.getAttribute("data-src") : "";
            var startButton = shell.querySelector("[data-player-start]");
            var toggleButton = shell.querySelector("[data-player-toggle]");
            var progress = shell.querySelector("[data-player-progress]");
            var timeLabel = shell.querySelector("[data-player-time]");
            var muteButton = shell.querySelector("[data-player-mute]");
            var fullscreenButton = shell.querySelector("[data-player-fullscreen]");
            var hlsInstance = null;

            if (!video || !source) {
                shell.classList.add("is-error");
                return;
            }

            function markReady() {
                shell.classList.add("is-ready");
            }

            function markError() {
                shell.classList.add("is-error");
                var loading = shell.querySelector("[data-player-loading]");
                if (loading) {
                    loading.textContent = "视频加载失败，请稍后重试";
                    loading.style.display = "block";
                }
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, markReady);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        markError();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", markReady, { once: true });
            } else {
                video.src = source;
                markReady();
            }

            function updateState() {
                shell.classList.toggle("is-playing", !video.paused && !video.ended);
                if (toggleButton) {
                    toggleButton.textContent = video.paused ? "播放" : "暂停";
                }
            }

            function togglePlay() {
                if (video.paused) {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(markError);
                    }
                } else {
                    video.pause();
                }
                updateState();
            }

            function updateProgress() {
                var duration = Number.isFinite(video.duration) ? video.duration : 0;
                if (progress) {
                    progress.max = duration || 0;
                    progress.value = video.currentTime || 0;
                }
                if (timeLabel) {
                    timeLabel.textContent = formatTime(video.currentTime) + " / " + formatTime(duration);
                }
            }

            if (startButton) {
                startButton.addEventListener("click", togglePlay);
            }

            if (toggleButton) {
                toggleButton.addEventListener("click", togglePlay);
            }

            video.addEventListener("click", togglePlay);
            video.addEventListener("play", updateState);
            video.addEventListener("pause", updateState);
            video.addEventListener("ended", updateState);
            video.addEventListener("timeupdate", updateProgress);
            video.addEventListener("loadedmetadata", updateProgress);

            if (progress) {
                progress.addEventListener("input", function () {
                    video.currentTime = Number(progress.value) || 0;
                    updateProgress();
                });
            }

            if (muteButton) {
                muteButton.addEventListener("click", function () {
                    video.muted = !video.muted;
                    muteButton.textContent = video.muted ? "取消静音" : "静音";
                });
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener("click", function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (shell.requestFullscreen) {
                        shell.requestFullscreen();
                    }
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initNavigation();
        initCoverFallbacks();
        initHeroSlider();
        initFilters();
        initPlayers();
    });
})();
