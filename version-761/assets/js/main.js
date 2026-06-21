(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-menu-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var next = document.querySelector("[data-hero-next]");
    var prev = document.querySelector("[data-hero-prev]");
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function move(step) {
      show(active + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    restart();
  }

  function initFilter() {
    var input = document.querySelector(".filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid .movie-card"));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();
        card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
      });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderSearchCard(item) {
    return "" +
      "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(item.url) + "\">" +
          "<span class=\"poster-frame\">" +
            "<img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\" onerror=\"this.remove();\">" +
            "<span class=\"poster-gradient\"></span>" +
            "<span class=\"quality-badge\">高清</span>" +
            "<span class=\"type-badge\">" + escapeHtml(item.type) + "</span>" +
          "</span>" +
        "</a>" +
        "<div class=\"card-content\">" +
          "<a class=\"card-title\" href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a>" +
          "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
          "<p class=\"card-desc\">" + escapeHtml(item.desc) + "</p>" +
          "<div class=\"card-tags\"><span>" + escapeHtml(item.genre) + "</span><span>" + escapeHtml(item.category) + "</span></div>" +
        "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    if (!results || !window.XZF_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("search-page-input");
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var list = window.XZF_SEARCH_INDEX.filter(function (item) {
      if (!normalized) {
        return item.featured;
      }
      return [item.title, item.genre, item.tags, item.region, item.year, item.category, item.desc]
        .join(" ")
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 96);

    if (!list.length) {
      results.innerHTML = "<div class=\"search-empty\">没有找到相关内容，可以换一个片名、地区或题材继续搜索。</div>";
      return;
    }
    results.innerHTML = list.map(renderSearchCard).join("");
  }

  function initBackTop() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.textContent = "↑";
    button.setAttribute("aria-label", "返回顶部");
    button.hidden = true;
    document.body.appendChild(button);
    window.addEventListener("scroll", function () {
      button.hidden = window.scrollY < 360;
    });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilter();
    initSearchPage();
    initBackTop();
  });
})();
