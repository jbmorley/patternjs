var Patterns = {

    drawAsaNoHa: function(context, x, y, width, height) {
        context.strokeStyle = 'white';
        context.fillStyle = '#000033';
        context.fillRect(x, y, width, height);

        var drawStar = function(context, center, length, altitude, orientation) {

            context.beginPath();
            context.moveTo(center.x, center.y);
            context.lineTo(center.x - ( length / 2 ), center.y - ( ( altitude / 3 ) * orientation ) );
            context.stroke();

            context.beginPath();
            context.moveTo(center.x, center.y);
            context.lineTo(center.x, center.y + ( ( 2 * ( altitude / 3 ) ) * orientation ) );
            context.stroke();

            context.beginPath();
            context.moveTo(center.x, center.y);
            context.lineTo(center.x + ( length / 2 ), center.y - ( ( altitude / 3 ) * orientation ) );
            context.stroke();
        };

        var drawPrimitive = function(context, x, y, length, altitude) {

            context.lineWidth = 2;

            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + ( length / 2 ), y + altitude);
            context.lineTo(x + length, y);
            context.closePath();
            context.stroke();

            var center = { x: x + ( length / 2 ), y: y + ( altitude / 3 )};
            drawStar(context, center, length, altitude, 1);

            var center = { x: x + length, y: y + ( 2 * ( altitude / 3 ) )};
            drawStar(context, center, length, altitude, -1);
        };

        var length = 100;
        var altitude = (Math.sqrt(3) / 2 ) * length;
        for (var offsetY = y - altitude; offsetY < height + altitude; offsetY = offsetY + ( altitude * 2 ) ) {
            for (var offsetX = x - length; offsetX < width + length; offsetX = offsetX + length) {
                drawPrimitive(context, offsetX - ( length / 2 ), offsetY, length, altitude);
                drawPrimitive(context, offsetX, offsetY + altitude, length, altitude);
            }
        }
    },

    drawPattern: function(context, x, y, width, height) {

        var drawCircle = function(context, x, y, radius) {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.stroke();
        };

        context.lineWidth = 4;
        context.strokeStyle = 'white';
        context.fillStyle = '#330066';
        context.fillRect(x, y, width, height);

        var radius = 40;

        for (var offsetY = y - radius; offsetY < height + radius; offsetY = offsetY + ( radius * 2 ) ) {
            for (var offsetX = x + radius; offsetX < width + radius; offsetX = offsetX + ( radius * 2 ) ) {
                drawCircle(context, offsetX, offsetY, radius);
            }
            for (var offsetX = x; offsetX < width; offsetX = offsetX + ( radius * 2 ) ) {
                drawCircle(context, offsetX, offsetY + radius, radius);
            }
        }

    },

    drawWaves: function(context, x, y, width, height, strokeStyle, fillStyle, lineWidth, radius, gap, count, alternating) {

        var drawCircle = function(context, x, y, radius) {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
        };

        var drawConcentricCircles = function(context, x, y, radius, step, count) {
            for (var i = 0; i < count; i++) {
                drawCircle(context, x, y, radius - ( i * step ));
            }            
        };

        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.fillStyle = fillStyle;
        context.fillRect(x, y, width, height);

        var row = 0;
        var column = 0;

        for (var offsetY = y; offsetY < height + radius; offsetY = offsetY + ( radius ) ) {
            row++
            column = 0;
            for (var offsetX = x + radius; offsetX < width + radius; offsetX = offsetX + ( radius * 2 ) ) {
                column++
                drawConcentricCircles(context, offsetX, offsetY, radius, gap, count);
            }
            row++;
            column = 0;
            for (var offsetX = x; offsetX < width; offsetX = offsetX + ( radius * 2 ) ) {
                column++
                if (alternating && ( column % 2 == 0 && row % 4 == 0 ) ) {
                    drawCircle(context, offsetX, offsetY + ( radius / 2 ), radius);
                } else if ( alternating && ( column % 2 == 1 && row % 4 == 2 ) ) {
                    drawCircle(context, offsetX, offsetY + ( radius / 2 ), radius);
                } else {
                    drawConcentricCircles(context, offsetX, offsetY + ( radius / 2 ), radius, gap, count);
                }
            }
        }

    }

};
