(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        if (dotIndex === current) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    function startTimer() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restartTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var panel = document.querySelector('[data-filter-panel]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (panel && cards.length) {
    var keyword = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && keyword) {
      keyword.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
      var q = normalize(keyword && keyword.value);
      var selectedRegion = normalize(region && region.value);
      var selectedType = normalize(type && type.value);
      var selectedYear = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var matched = true;

        if (q && haystack.indexOf(q) === -1) {
          matched = false;
        }

        if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
          matched = false;
        }

        if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
          matched = false;
        }

        if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }
})();
