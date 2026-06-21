(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let activeIndex = 0;
        let timer = null;

        const showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === activeIndex);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === activeIndex);
            });
        };

        const startTimer = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    const list = document.querySelector('[data-card-list]');
    if (list) {
        const cards = Array.from(list.querySelectorAll('.movie-card'));
        const input = document.querySelector('[data-search-input]');
        const sortSelect = document.querySelector('[data-sort-select]');
        const chips = Array.from(document.querySelectorAll('[data-filter]'));
        const emptyState = document.querySelector('[data-empty-state]');
        let filterValue = 'all';

        const urlParams = new URLSearchParams(window.location.search);
        const initialQuery = urlParams.get('q');
        if (input && initialQuery) {
            input.value = initialQuery;
        }

        const normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        const apply = function () {
            const query = normalize(input ? input.value : '');
            const sortValue = sortSelect ? sortSelect.value : 'default';
            let visibleCount = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.dataset.category
                ].join(' '));
                const filterMatched = filterValue === 'all' || haystack.includes(normalize(filterValue));
                const queryMatched = !query || haystack.includes(query);
                const visible = filterMatched && queryMatched;
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });

            const sortedCards = cards.slice().sort(function (a, b) {
                if (sortValue === 'latest') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (sortValue === 'hot') {
                    return Number(b.dataset.hot || 0) - Number(a.dataset.hot || 0);
                }
                if (sortValue === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }
                return 0;
            });

            sortedCards.forEach(function (card) {
                list.appendChild(card);
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        };

        if (input) {
            input.addEventListener('input', apply);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                filterValue = chip.dataset.filter || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
                apply();
            });
        });

        apply();
    }
}());
