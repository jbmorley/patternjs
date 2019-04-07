var Utilities = {

    onDocumentReady: function(callback) {
        document.addEventListener('DOMContentLoaded', callback, false);
    },

    button: function(title, callback) {
        var button = document.createElement('div');
        button.innerHTML = title;
        button.classList.add('download');
        button.addEventListener('click', callback);
        return button;
    },

    downloadButton: function(name, width, height, title, renderer) {
        var button = document.createElement('div');
        button.innerHTML = title;
        button.classList.add('download');
        button.addEventListener('click', function() {
            Utilities.download(name, width, height, renderer);
        });
        return button;
    },

    performDownload: function(filename, dataURL) {
        var a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        if (typeof MouseEvent === "function") {
            event = new MouseEvent("click", {
                view: window,
                bubbles: true,
                cancelable: true,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                buttons: 1,
            });
            a.dispatchEvent(event);
        } else if (a.fireEvent) {
            a.fireEvent("onclick");
        }
    },

    download: function(name, width, height, renderer) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        renderer(canvas);
        Utilities.performDownload(name + '_' + width + 'x' + height + '.png', canvas.toDataURL('image/png'));
    },

}
