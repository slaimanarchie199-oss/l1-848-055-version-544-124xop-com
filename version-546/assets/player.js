function initMoviePlayer(streamUrl) {
    var video = document.querySelector('.movie-video');
    var cover = document.querySelector('.play-cover');
    var ready = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function bindVideo() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            ready = true;
            return;
        }

        video.src = streamUrl;
        ready = true;
    }

    function startPlayback() {
        bindVideo();

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;
        var playTask = video.play();

        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function() {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function() {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('beforeunload', function() {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
