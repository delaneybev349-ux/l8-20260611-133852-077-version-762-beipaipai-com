import { H as Hls } from './hls.js';

export function initMoviePlayer(root, source) {
    if (!root || !source) {
        return;
    }

    const video = root.querySelector('video');
    const cover = root.querySelector('[data-play-button]');
    const errorBox = root.querySelector('[data-player-error]');
    let hls = null;
    let attached = false;

    const showError = function () {
        if (errorBox) {
            errorBox.hidden = false;
        }
    };

    const hideCover = function () {
        if (cover) {
            cover.classList.add('is-hidden');
        }
    };

    const attach = function () {
        if (attached || !video) {
            return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    showError();
                }
            });
            return;
        }

        showError();
    };

    const play = function () {
        attach();
        hideCover();
        const started = video.play();
        if (started && typeof started.catch === 'function') {
            started.catch(function () {
                showError();
            });
        }
    };

    if (cover) {
        cover.addEventListener('click', play);
    }

    video.addEventListener('play', hideCover);
    video.addEventListener('error', showError);

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
