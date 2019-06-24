var Pattern = {

    Polyline: function(x, y) {

        this.points = [];
        this.points.push([x, y]);
        this.isClosed = false;

        this.addPoint = function(x, y) {
            this.points.push([x, y]);
        };

        this.length = function() {
            return this.points.length;
        };

        this.close = function() {
            this.isClosed = true;
        };

        this.svg = function() {
            var element;
            if (this.isClosed) {
                element = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
            } else {
                element = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
            }

            var coordinates = []
            for (var i = 0; i < this.points.length; i++) {
                coordinates.push(this.points[i][0] + "," + this.points[i][1]);
            }
            var points = coordinates.join(" ");

            element.setAttribute('points', points);
            element.setAttribute('stroke', 'black');
            element.setAttribute('stroke-width', '1');
            element.setAttribute('fill', 'none');

            return element;
        }

    },

    Path: function(context) {

        this.moveTo = function(x, y) {
            this.startPolyline(x, y);
            this.context.moveTo(x, y);
            this.x = x;
            this.y = y;
        };

        this.startPolyline = function(x, y) {
            var polyline = new Pattern.Polyline(x, y);
            this.lines.push(polyline);
            this.current = polyline;
        };
        
        this.lineTo = function(x, y) {
            this.current.addPoint(x, y);
            this.context.lineTo(x, y);
            this.x = x;
            this.y = y;
        };

        this.stroke = function() {
            this.context.stroke();
        };
        
        this.forward = function(distance) {
            var x = Math.sin(this.angle) * distance;
            var y = Math.cos(this.angle) * distance;
            this.lineTo(this.x + x, this.y + y);
        };
        
        this.turn = function(angle) {
            this.angle = this.angle + angle;
        };

        this.setAngle = function(angle) {
            this.angle = angle;
        };
        
        this.left = function(angle) {
            if (angle === undefined) {
                angle = Math.PI / 2;
            }
            this.turn(angle);
        };
        
        this.right = function(angle) {
            if (angle === undefined) {
                angle = Math.PI / 2;
            }
            this.turn(angle * -1);
        };

        this.close = function() {
            this.current.close();
            this.context.closePath();
        };

        this.begin = function() {
            this.context.beginPath();
        };

        this.fill = function() {
            this.context.fill();
        };

        this.svg = function(width, height) {
            var svg = new Pattern.SVG(width, height);
            for (var i = 0; i < this.lines.length; i++) {
                var polyline = this.lines[i];
                svg.appendChild(polyline.svg());
            }
            return svg;
        };

        this.context = context;
        this.angle = 0;
        this.lines = [];
        this.context.beginPath();
        this.moveTo(0, 0);
        
    },

    SVG: function(width, height) {

        this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.element.setAttribute('width', width);
        this.element.setAttribute('height', height);
        this.element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

        this.appendChild = function(child) {
            this.element.appendChild(child);
        };

        this.toXML = function() {
            var serializer = new XMLSerializer();
            var output = serializer.serializeToString(this.element);
            return output;
        };

        this.toDataURL = function() {
            return "data:text/svg;charset=UTF-8," + this.toXML();
        };

    },

    alternate: function(x, y, width, height, stepX, stepY, offset, draw) {
        if (offset === undefined) {
            offset = false;
        }

        for (var j = y - stepY; j < y + height + stepY; j = j + ( stepY * 2 )) {
            for (var i = x - stepX; i < x + width + stepX; i = i + stepX) {
                draw(i, j);
                var i2 = i;
                if (offset) {
                    i2 = i + ( stepX / 2 );                    
                }
                draw(i2, j + stepY);
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

    },

    asanoha: function({canvas, size, lineDrawer, backgroundColor, foregroundColor}={}) {

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

        var length = size * window.devicePixelRatio;
        var altitude = (Math.sqrt(3) / 2 ) * length;
        
        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.strokeStyle = foregroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);        
        Pattern.alternate(0, 0, canvas.width, canvas.height, length, altitude, true, function(x, y) {
            drawPrimitive(context, x, y, length, altitude, lineDrawer);
        });
    },

    shippou: function({canvas, lineWidth, radius, backgroundColor, foregroundColor}={}) {

        var drawCircle = function(context, x, y, radius) {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.stroke();
        };

        var radius = radius * window.devicePixelRatio;
        var lineWidth = lineWidth * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.strokeStyle = foregroundColor;
        context.lineWidth = lineWidth;
        context.fillRect(0, 0, canvas.width, canvas.height);
        Pattern.alternate(0, 0, canvas.width, canvas.height, radius * 2, radius, true, function(x, y) {
            drawCircle(context, x, y, radius);
        });
    },

    seigaiha: function({canvas, lineWidth, radius, lineSpacing, count, alternating, backgroundColor, foregroundColor}={}) {

        var drawCircle = function(context, x, y, radius) {
            context.beginPath();
            context.arc(x, y, radius, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
        };

        var drawConcentricCircles = function(context, x, y, radius, step, count) {
            for (var i = 0; i < count; i++) {
                var circleRadius = radius - ( i * step );
                if (circleRadius > 0) {
                    drawCircle(context, x, y, radius - ( i * step ));
                }
            }            
        };

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.strokeStyle = foregroundColor;
        context.lineWidth = lineWidth * window.devicePixelRatio;
        context.fillRect(0, 0, canvas.width, canvas.height);

        var row = 0;
        var column = 0;

        var radius = radius * window.devicePixelRatio;
        var lineSpacing = lineSpacing * window.devicePixelRatio

        for (var offsetY = 0; offsetY < canvas.height + radius; offsetY = offsetY + ( radius ) ) {
            row++
            column = 0;
            for (var offsetX = 0 + radius; offsetX < canvas.width + radius; offsetX = offsetX + ( radius * 2 ) ) {
                column++
                drawConcentricCircles(context, offsetX, offsetY, radius, lineSpacing, count);
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
                    drawConcentricCircles(context, offsetX, offsetY + ( radius / 2 ), radius, lineSpacing, count);
                }
            }
        }

    },

    sayagata: function({canvas, style, featureLength, lineWidth, angle, backgroundColor, foregroundColor}={}) {

        if (angle === undefined) { angle = Math.PI / 3; }
        if (featureLength === undefined) { featureLength = 10; }
        
        var drawPattern = function(path, x, y, featureLength, left) {
            var right = Math.PI - left;
            path.moveTo(x, y);
            path.setAngle(( right / 2 ) * -1);
            path.forward(featureLength * 7);
            path.left(right);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength);
            path.right(left);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength);
            path.left(right);
            path.forward(featureLength);
            path.right(right);
            path.forward(featureLength);
            path.right(left);
            path.forward(featureLength * 7);
            path.right(right);
            path.forward(featureLength);
            path.right(left);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength);
            path.left(right);
            path.forward(featureLength);
            path.right(right);
            path.forward(featureLength);
            path.left(right);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength * 7);
            path.left(right);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength);
            path.right(left);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength);
            path.left(right);
            path.forward(featureLength);
            path.right(right);
            path.forward(featureLength);
            path.right(left);
            path.forward(featureLength * 7);
            path.right(right);
            path.forward(featureLength);
            path.right(left);
            path.forward(featureLength);
            path.left(left);
            path.forward(featureLength);
            path.left(right);
            path.forward(featureLength);
            path.right(right);
            path.forward(featureLength);
            path.left(right);
            path.close();
        }
        
        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.strokeStyle = foregroundColor;

        context.fillRect(0, 0, canvas.width, canvas.height);
        featureLength = featureLength * window.devicePixelRatio;
        context.lineWidth = lineWidth * window.devicePixelRatio;

        var right = Math.PI - angle;
        var stepX = 10 * featureLength * Math.sin( right / 2 );
        var stepY = 10 * featureLength * Math.cos( right / 2 );

        var path = new Pattern.Path(context);
        Pattern.alternate(0, 0, canvas.width, canvas.height, stepX, stepY, false, function(x, y) {
            drawPattern(path, x, y, featureLength, angle);
        });
        path.stroke();

        return path.svg(canvas.width, canvas.height);
    },

    stars: function({canvas, featureLength, ratio, foregroundColor, backgroundColor}={}) {

        var starWidth = function(sideLength) {
            return (4 * Math.sqrt((sideLength * sideLength) / 2)) + (2 * sideLength)
        };

        var drawStar = function(path, x, y, sideLength) {
            var offset = Math.sqrt(sideLength * sideLength * 2) / 2;
            path.moveTo(x - offset - sideLength, y + offset + sideLength);
            path.setAngle((Math.PI / 2) * 2);
            for (i=0; i<4; i++) {
                path.forward(sideLength);
                path.left(Math.PI / 4);
                path.forward(sideLength);
                path.right(Math.PI / 2);
                path.forward(sideLength);
                path.left(Math.PI / 4);
                path.forward(sideLength);
                path.right(Math.PI / 2);
            }
            path.close();
        }

        var sideLength = featureLength * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        var largeSize = starWidth(sideLength);
        var smallSideLength = sideLength * (ratio / 100);
        var smallSize = starWidth(smallSideLength);

        var path = new Pattern.Path(context);
        Pattern.alternate(0, 0, canvas.width, canvas.height, largeSize + smallSize, (largeSize / 2) + (smallSize / 2), true, function(x, y) {
            drawStar(path, x, y, sideLength);
            drawStar(path, x + (largeSize / 2) + (smallSize / 2), y, smallSideLength);
        });
        context.fillStyle = foregroundColor;
        path.fill();

        return path.svg(canvas.width, canvas.height);
    },

    pattern001: function({canvas, style, featureLength, spacing}={}) {

        var drawTriangle = function(path, x, y, width, altitude) {
            path.moveTo(x - ( width / 2), y + (altitude / 2));
            path.lineTo(x + ( width / 2), y + (altitude / 2));
            path.lineTo(x, y - (altitude / 2));
            path.close();
        }

        var radius = featureLength * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        Pattern.applyStyle(context, style);
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = style.foregroundStyle;

        padding = spacing * window.devicePixelRatio;
        altitude = radius / 2;

        var path = new Pattern.Path(context);
        Pattern.alternate(0, 0, canvas.width, canvas.height, radius + padding, altitude + padding, true, function(x, y) {
            drawTriangle(path, x, y, radius, altitude);
        });
        path.fill();

        return path.svg(canvas.width, canvas.height);
    },

    pattern003: function({canvas, style, featureLength, spacing}={}) {

        var drawElement = function(path, x, y, sideLength) {
            path.moveTo(x, y);
            for (i=0; i<4; i++) {
                path.forward(sideLength);
                path.left(Math.PI / 4);
                path.forward(sideLength);
                path.right(Math.PI / 2);
                path.forward(sideLength);
                path.left(Math.PI / 4);
                path.right(Math.PI / 2);
            }
            path.close();
        }

        var radius = featureLength * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        Pattern.applyStyle(context, style);
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = style.foregroundStyle;

        padding = spacing * window.devicePixelRatio;
        altitude = radius / 2;

        var path = new Pattern.Path(context);
        Pattern.alternate(0, 0, canvas.width, canvas.height, 100, 100, false, function(x, y) {
            drawElement(path, x, y, radius, altitude);
        });
        path.stroke();

        return path.svg(canvas.width, canvas.height);
    }

};
