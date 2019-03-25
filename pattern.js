var Pattern = {

    Turtle: function({context, x, y}={}) {
    
        this.context = context;
        this.x = x;
        this.y = y;
        this.angle = 0;
        
        this.lineTo = function({x, y}={}) {
            this.context.moveTo(this.x, this.y);
            this.context.lineTo(x, y);
            this.context.stroke();
            this.x = x;
            this.y = y;
        };
        
        this.forward = function(distance) {
            var x = Math.sin(this.angle) * distance;
            var y = Math.cos(this.angle) * distance;
            this.lineTo({x: this.x + x, y: this.y + y });
        };
        
        this.turn = function({angle}={}) {
            this.angle = this.angle + angle;
        };
        
        this.left = function({angle}={}) {
            if (angle === undefined) {
                angle = Math.PI / 2;
            }
            this.turn({angle: angle});
        };
        
        this.right = function({angle}={}) {
            if (angle === undefined) {
                angle = Math.PI / 2;
            }
            this.turn({angle: angle * -1});
        };
        
    },

    alternate: function({x, y,
                         width, height,
                         stepX, stepY,
                         offset, draw}={}) {
        if (offset === undefined) {
            offset = false;
        }

        for (var j = y - stepY; j < y + height; j = j + ( stepY * 2 )) {
            for (var i = x - stepX; i < x + width + stepX; i = i + stepX) {
                draw({x: i, y: j});
                var i2 = i;
                if (offset) {
                    i2 = i + ( stepX / 2 );                    
                }
                draw({x: i2, y: j + stepY});
            }
        }
    },

    increment: function(from, to) {
        if (from < to) {
            return to - from;
        } else {
            return ( from - to ) * -1;
        }
    },

    drawCircle: function(context, x, y, radius) {
        context.fillStyle = 'white';
        context.beginPath();
        context.arc(x, y, radius * window.devicePixelRatio, 0, 2 * Math.PI);
        context.fill();
    },

    drawLine: function(context, x1, y1, x2, y2, width) {
        context.lineWidth = width * window.devicePixelRatio;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    },

    drawDottedLine: function(context, x1, y1, x2, y2, radius, increment) {
        var stepX = Pattern.increment(x1, x2);
        var stepY = Pattern.increment(y1, y2);
        var distance = Math.sqrt(( stepX * stepX ) + ( stepY * stepY ));
        var steps = Math.floor(distance / (increment * window.devicePixelRatio ));
        stepX = stepX / steps, stepY = stepY / steps;
        for (var i = 0; i < steps; i++) {
            Pattern.drawCircle(context, x1 + (stepX * i), y1 + (stepY * i), radius);
        }
    },

    applyStyle: function(context, style) {
        context.fillStyle = style.backgroundStyle;
        context.strokeStyle = style.foregroundStyle;
    },

    drawers: {

        dottedLine: function(radius, increment) {
            return function(context, x1, y1, x2, y2) {
                Pattern.drawDottedLine(context, x1, y1, x2, y2, radius, increment);
            };
        },

        line: function(width) {
            return function(context, x1, y1, x2, y2) {
                Pattern.drawLine(context, x1, y1, x2, y2, width);
            }
        }

    },

    styles: {

        monochrome: {
            backgroundStyle: '#000000',
            foregroundStyle: '#ffffff',
        },

        darkBlue: {
            backgroundStyle: '#000033',
            foregroundStyle: '#ffffff',
        },

        darkRed: {
            backgroundStyle: '#3B0B17',
            foregroundStyle: '#ffffff',
        },

        purple: {
            backgroundStyle: '#330066',
            foregroundStyle: '#ffffff',
        },

        sky: {
            backgroundStyle: '#ffffff',
            foregroundStyle: '#0033cc',
        },

        blues: {
            backgroundStyle: '#19334d',
            foregroundStyle: '#336699',
        },

        purples: {
            backgroundStyle: '#4f2c64',
            foregroundStyle: '#beafe6',
        },

    },

    asanoha: function({canvas, style, lineDrawer}={}) {

        var drawStar = function(context, x, y, length, altitude, orientation, drawLine) {
            drawLine(context, x, y, x - ( length / 2 ), y - ( ( altitude / 3 ) * orientation ));
            drawLine(context, x, y, x, y + ( ( 2 * ( altitude / 3 ) ) * orientation ));
            drawLine(context, x, y, x + ( length / 2 ), y - ( ( altitude / 3 ) * orientation ));
        };

        var drawPrimitive = function(context, x, y, length, altitude, lineDrawer) {
            lineDrawer(context, x, y, x + ( length / 2 ), y + altitude);
            lineDrawer(context, x + ( length / 2 ), y + altitude, x + length, y);
            lineDrawer(context, x + length, y, x, y);
            drawStar(context, x + ( length / 2 ), y + ( altitude / 3 ), length, altitude, 1, lineDrawer);
            drawStar(context, x + length, y + ( 2 * ( altitude / 3 ) ), length, altitude, -1, lineDrawer);
        };

        var length = 100 * window.devicePixelRatio;
        var altitude = (Math.sqrt(3) / 2 ) * length;

        var context = canvas.getContext('2d');

        Pattern.applyStyle(context, style);

        context.fillRect(0, 0, canvas.width, canvas.height);
        for (var offsetY = 0 - altitude; offsetY < canvas.height + altitude; offsetY = offsetY + ( altitude * 2 ) ) {
            for (var offsetX = 0 - length; offsetX < canvas.width + length; offsetX = offsetX + length) {
                drawPrimitive(context, offsetX - ( length / 2 ), offsetY, length, altitude, lineDrawer);
                drawPrimitive(context, offsetX, offsetY + altitude, length, altitude, lineDrawer);
            }
        }
    },

    shippou: function({canvas, style}={}) {

        var drawCircle = function(context, x, y, radius) {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.stroke();
        };

        var radius = 40 * window.devicePixelRatio;

        var context = canvas.getContext('2d');

        Pattern.applyStyle(context, style);
        context.lineWidth = 4 * window.devicePixelRatio;
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (var offsetY = 0 - radius; offsetY < canvas.height + radius; offsetY = offsetY + ( radius * 2 ) ) {
            for (var offsetX = 0 + radius; offsetX < canvas.width + radius; offsetX = offsetX + ( radius * 2 ) ) {
                drawCircle(context, offsetX, offsetY, radius);
            }
            for (var offsetX = 0; offsetX < canvas.width + radius; offsetX = offsetX + ( radius * 2 ) ) {
                drawCircle(context, offsetX, offsetY + radius, radius);
            }
        }

    },

    seigaiha: function({canvas, style, lineWidth, radius, gap, count, alternating}={}) {

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

        var context = canvas.getContext('2d');

        Pattern.applyStyle(context, style)
        context.lineWidth = lineWidth * window.devicePixelRatio;
        context.fillRect(0, 0, canvas.width, canvas.height);

        var row = 0;
        var column = 0;

        var radius = radius * window.devicePixelRatio;
        var gap = gap * window.devicePixelRatio

        for (var offsetY = 0; offsetY < canvas.height + radius; offsetY = offsetY + ( radius ) ) {
            row++
            column = 0;
            for (var offsetX = 0 + radius; offsetX < canvas.width + radius; offsetX = offsetX + ( radius * 2 ) ) {
                column++
                drawConcentricCircles(context, offsetX, offsetY, radius, gap, count);
            }
            row++;
            column = 0;
            for (var offsetX = 0; offsetX < canvas.width + radius; offsetX = offsetX + ( radius * 2 ) ) {
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

    },

    unknown1: function({canvas, style}={}) {
        
        var drawPattern = function(context, x, y, step, left) {
            var right = Math.PI - left;
            var turtle = new Pattern.Turtle({context: context, x: x, y: y});
            turtle.right({angle: left});
            turtle.forward(step * 7);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step);
            turtle.right({angle: left});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.right({angle: right});
            turtle.forward(step);
            turtle.right({angle: left});
            turtle.forward(step * 7);
            turtle.right({angle: right});
            turtle.forward(step);
            turtle.right({angle: left});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.right({angle: right});
            turtle.forward(step);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step * 7);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step);
            turtle.right({angle: left});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.right({angle: right});
            turtle.forward(step);
            turtle.right({angle: left});
            turtle.forward(step * 7);
            turtle.right({angle: right});
            turtle.forward(step);
            turtle.right({angle: left});
            turtle.forward(step);
            turtle.left({angle: left});
            turtle.forward(step);
            turtle.left({angle: right});
            turtle.forward(step);
            turtle.right({angle: right});
            turtle.forward(step);
            turtle.left({angle: right});
            turtle.forward(step);
        }
        
        var context = canvas.getContext('2d');
        Pattern.applyStyle(context, style);
        context.fillRect(0, 0, canvas.width, canvas.height);
        var step = 10 * window.devicePixelRatio;
        context.lineWidth = 2 * window.devicePixelRatio;
        
        var stepX = 90 * window.devicePixelRatio;
        var stepY = 50 * window.devicePixelRatio;
        var angle = Math.PI / 3;

        Pattern.alternate({x: 0, y: 0,
                           width: canvas.width, height: canvas.height,
                           stepX: stepX, stepY: stepY,
                           draw: function({x, y}={}) {
                               drawPattern(context, x, y, step, angle);
                           }});
    },

    unknown2: function({canvas, style}={}) {

        var drawTriangle = function(context, x, y, width, altitude) {
            context.beginPath();
            context.moveTo(x - ( width / 2), y + (altitude / 2));
            context.lineTo(x + ( width / 2), y + (altitude / 2));
            context.lineTo(x, y - (altitude / 2));
            context.closePath();
            context.fill();
        }

        var radius = 60 * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        Pattern.applyStyle(context, style);

        context.lineWidth = 4 * window.devicePixelRatio;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = style.foregroundStyle;

        padding = 6 * window.devicePixelRatio;
        altitude = radius / 2;

        for (var offsetY = 0 - radius; offsetY < canvas.height + radius; offsetY = offsetY + ( ( altitude + padding ) * 2 ) ) {
            for (var offsetX = 0; offsetX < canvas.width + radius; offsetX = offsetX + radius + padding ) {
                drawTriangle(context, offsetX, offsetY, radius, altitude);
            }
            for (var offsetX = 0; offsetX < canvas.width + radius; offsetX = offsetX + radius + padding ) {
                drawTriangle(context, offsetX - ( ( radius + padding ) / 2 ), offsetY + altitude + padding, radius, altitude);
            }
        }

    },

};
