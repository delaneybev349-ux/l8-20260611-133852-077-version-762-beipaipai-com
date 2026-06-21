(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      if (slides.length < 2) {
        return;
      }
      var index = 0;
      var timer = null;
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          var active = position === index;
          slide.classList.toggle("is-active", active);
          slide.setAttribute("aria-hidden", active ? "false" : "true");
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === index);
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
      dots.forEach(function (dot, position) {
        dot.addEventListener("click", function () {
          show(position);
          start();
        });
      });
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    });
  }

  function setupFilters() {
    document.querySelectorAll(".filter-panel").forEach(function (panel) {
      var input = panel.querySelector(".site-search");
      var list = panel.parentElement ? panel.parentElement.querySelector(".searchable-list") : null;
      if (!input || !list) {
        return;
      }
      var items = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
      function normalize(text) {
        return String(text || "").trim().toLowerCase();
      }
      function filter() {
        var value = normalize(input.value);
        items.forEach(function (item) {
          var haystack = normalize(item.getAttribute("data-search") + " " + item.textContent);
          item.classList.toggle("is-filtered-out", value && haystack.indexOf(value) === -1);
        });
      }
      input.addEventListener("input", filter);
      panel.querySelectorAll("[data-chip]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          input.value = chip.getAttribute("data-chip") || chip.textContent || "";
          filter();
          input.focus();
        });
      });
      filter();
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    onReady(function () {
      var card = document.querySelector("[data-player]");
      if (!card || !streamUrl) {
        return;
      }
      var video = card.querySelector("video");
      var overlay = card.querySelector(".player-overlay");
      if (!video || !overlay) {
        return;
      }
      var loaded = false;
      var hls = null;
      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }
      function start() {
        overlay.classList.add("is-hidden");
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
              hls = null;
              video.src = streamUrl;
              playVideo();
            }
          });
          return;
        }
        video.src = streamUrl;
        playVideo();
      }
      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
    });
  };

  onReady(function () {
    setupMenu();
    setupCarousels();
    setupFilters();
  });
})();
