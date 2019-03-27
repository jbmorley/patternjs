var Utilities = {

    onDocumentReady: function(callback) {
        document.addEventListener('DOMContentLoaded', callback, false);
    },

    downloadButton: function(width, height, title, renderer) {
        var button = document.createElement('div');
        button.innerHTML = title;
        button.classList.add('download');
        button.addEventListener('click', function() {
            Utilities.download(width, height, renderer);
        });
        return button;
    },

    download: function(width, height, renderer) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        renderer(canvas);
        window.open(canvas.toDataURL('image/png'));
    },

}
