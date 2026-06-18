import { H as Hls } from './hls-vendor-dru42stk.js';

function setupMoviePlayer() {
    var video = document.querySelector('.movie-player[data-src]');
    var overlay = document.querySelector('.player-overlay');
    var status = document.querySelector('.player-status');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var isReady = false;

    function setStatus(message, hidden) {
        if (!status) {
            return;
        }
        status.textContent = message;
        status.classList.toggle('is-hidden', Boolean(hidden));
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay && video.paused) {
            overlay.classList.remove('is-hidden');
        }
    }

    function attachSource() {
        if (isReady || !source) {
            return;
        }

        isReady = true;
        setStatus('正在加载播放源', false);

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                setStatus('播放源已就绪', true);
            });

            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus('播放源连接异常，可刷新页面重试', false);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                setStatus('播放源已就绪', true);
            }, { once: true });
        } else {
            video.src = source;
            setStatus('播放器正在尝试使用浏览器能力播放', false);
        }
    }

    function playVideo() {
        attachSource();
        var promise = video.play();
        hideOverlay();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                showOverlay();
                setStatus('点击播放按钮后开始播放', false);
            });
        }
    }

    attachSource();

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        hideOverlay();
        setStatus('播放中', true);
    });

    video.addEventListener('pause', showOverlay);

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMoviePlayer);
} else {
    setupMoviePlayer();
}
