(function () {
  var video = document.querySelector('[data-video-player]');
  var button = document.querySelector('[data-play-button]');
  var box = document.querySelector('[data-player-box]');

  if (!video || !button || !box) {
    return;
  }

  var source = video.getAttribute('data-video-src');
  var loaded = false;
  var hlsInstance = null;

  function attachSource() {
    if (loaded || !source) {
      return;
    }

    loaded = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    attachSource();
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', function () {
    startPlayback();
  });

  video.addEventListener('play', function () {
    box.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    box.classList.remove('is-playing');
  });

  video.addEventListener('ended', function () {
    box.classList.remove('is-playing');
  });

  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
