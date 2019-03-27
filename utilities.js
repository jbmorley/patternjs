var Utilities = {

    onDocumentReady: function(callback) {
        document.addEventListener('DOMContentLoaded', callback, false);
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

    download: function(name, width, height, renderer) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        renderer(canvas);
        var a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = name + '_' + width + 'x' + height + '.png';
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

}
