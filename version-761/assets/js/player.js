(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function loadVideo(video) {
    if (video.dataset.ready === "true") {
      return Promise.resolve();
    }
    var streamUrl = video.getAttribute("data-stream-url");
    if (!streamUrl) {
      return Promise.reject(new Error("empty stream"));
    }
    video.dataset.ready = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = streamUrl;
    return Promise.resolve();
  }

  function startPlayer(wrapper) {
    var video = wrapper.querySelector("video");
    var overlay = wrapper.querySelector(".play-overlay");
    if (!video) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    loadVideo(video)
      .then(function () {
        return video.play();
      })
      .catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
          var label = overlay.querySelector("strong");
          if (label) {
            label.textContent = "暂时无法播放，请稍后重试";
          }
        }
      });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (wrapper) {
      var overlay = wrapper.querySelector(".play-overlay");
      if (overlay) {
        overlay.addEventListener("click", function () {
          startPlayer(wrapper);
        });
      }
    });
  });
})();
