(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        showSlide(0);
        start();
    }

    var panel = document.querySelector("[data-search-panel]");
    var index = window.siteMovieIndex || [];

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function renderSearch(query) {
        if (!panel) {
            return;
        }

        var keyword = normalize(query);

        if (!keyword) {
            panel.classList.remove("is-open");
            panel.innerHTML = "";
            return;
        }

        var results = index.filter(function (item) {
            var haystack = [
                item.title,
                item.region,
                item.year,
                item.type,
                (item.tags || []).join(" "),
                item.text
            ].join(" ").toLowerCase();

            return haystack.indexOf(keyword) !== -1;
        }).slice(0, 12);

        var html = "<div class=\"search-panel-header\"><strong>搜索结果</strong><button type=\"button\" data-close-search>关闭</button></div>";

        if (!results.length) {
            html += "<div class=\"search-result\"><div></div><p>没有找到相关影片</p></div>";
        } else {
            html += results.map(function (item) {
                return [
                    "<a class=\"search-result\" href=\"" + item.url + "\">",
                    "<img src=\"" + item.image + "\" alt=\"" + item.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\">",
                    "<span><strong>" + item.title + "</strong><p>" + item.region + " · " + item.year + " · " + item.text + "</p></span>",
                    "</a>"
                ].join("");
            }).join("");
        }

        panel.innerHTML = html;
        panel.classList.add("is-open");

        var close = panel.querySelector("[data-close-search]");
        if (close) {
            close.addEventListener("click", function () {
                panel.classList.remove("is-open");
            });
        }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-site-search]")).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            renderSearch(input ? input.value : "");
        });
    });

    document.addEventListener("click", function (event) {
        if (!panel || !panel.classList.contains("is-open")) {
            return;
        }

        var insidePanel = panel.contains(event.target);
        var insideSearch = event.target.closest("[data-site-search]");

        if (!insidePanel && !insideSearch) {
            panel.classList.remove("is-open");
        }
    });

    var filterRoot = document.querySelector("[data-filter-root]");

    if (filterRoot) {
        var cards = Array.prototype.slice.call(filterRoot.querySelectorAll("[data-card]"));
        var input = document.querySelector("[data-filter-input]");
        var region = document.querySelector("[data-filter-region]");
        var year = document.querySelector("[data-filter-year]");

        function filterCards() {
            var keyword = normalize(input ? input.value : "");
            var selectedRegion = region ? region.value : "";
            var selectedYear = year ? year.value : "";

            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
                var ok = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }

                if (selectedRegion && card.dataset.region !== selectedRegion) {
                    ok = false;
                }

                if (selectedYear && card.dataset.year !== selectedYear) {
                    ok = false;
                }

                card.classList.toggle("hidden-card", !ok);
            });
        }

        [input, region, year].forEach(function (element) {
            if (element) {
                element.addEventListener("input", filterCards);
                element.addEventListener("change", filterCards);
            }
        });
    }
})();
