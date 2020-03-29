var Pattern = {

    logbase: function(base, value) {
        return Math.log(value) / Math.log(base);
    },

    Arc: function(context, x, y, radius, startAngle, endAngle) {

        this.context = context;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.transform = function(point) { return point; }

        this.apply = function() {
            this.context.beginPath();
            var [x, y] = this.transform([this.x, this.y]);
            this.context.arc(x, y, radius, this.startAngle, this.endAngle);
        }

        this.stroke = function() {
            this.apply();
            this.context.stroke();
        }

        this.fill = function() {
            this.apply();
            this.context.fill();
        }

    },

    Polyline: function(x, y) {

        this.points = [];
        this.points.push([x, y]);
        this.isClosed = false;
        this.minX = null;
        this.maxX = null;
        this.minY = null;
        this.maxY = null;

        this.addPoint = function(x, y) {
            this.points.push([x, y]);
            if (this.minX === null || x < this.minX) {
                this.minX = x;
            }
            if (this.maxX === null || x > this.maxX) {
                this.maxX = x;
            }
            if (this.minY === null || y < this.minY) {
                this.minY = y;
            }
            if (this.maxY === null || y > this.maxY) {
                this.maxY = y;
            }
        };

        this.length = function() {
            return this.points.length;
        };

        this.close = function() {
            this.isClosed = true;
        };

        this.svg = function(transform) {
            var element;
            if (this.isClosed) {
                element = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
            } else {
                element = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
            }

            var coordinates = []
            for (var i = 0; i < this.points.length; i++) {
                var [x, y] = transform([this.points[i][0], this.points[i][1]]);
                coordinates.push(x + "," + y);
            }
            var points = coordinates.join(" ");

            element.setAttribute('points', points);
            element.setAttribute('stroke', 'black');
            element.setAttribute('stroke-width', '1');
            element.setAttribute('fill', 'none');

            return element;
        }

        this.forEach = function(iterator) {
            for (var i = 0; i < this.points.length; i++) {
                iterator(this.points[i], i);
            }
        }

    },

    Image: function(context) {

        this.add = function(element) {
            this.elements.push(element);
        };

        this.svg = function(width, height) {
            var svg = new Pattern.SVG(width, height);
            this.elements.forEach(function(element) {
                element.lines.forEach(function(polyline) {
                    svg.appendChild(polyline.svg(element.transform));
                });
            });
            return svg;
        };

        this.elements = [];

    },

    Path: function(context) {

        this.moveTo = function(x, y) {
            this.startPolyline(x, y);
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
            this.x = x;
            this.y = y;
        };

        this.apply = function() {
            var context = this.context;
            var transform = this.transform;
            this.forLines(function(polyline) {
                if (polyline.length < 2) {
                    return;
                }
                polyline.forEach(function(point, index) {
                    var [x, y] = transform(point);
                    if (index == 0) {
                        context.moveTo(x, y);
                    }
                    context.lineTo(x, y);
                });
                if (polyline.isClosed) {
                    context.closePath();
                }
            });
        }

        this.stroke = function() {
            this.apply();
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
            this.apply();
            this.context.fill();
        };

        this.svg = function(width, height) {
            var svg = new Pattern.SVG(width, height);
            for (var i = 0; i < this.lines.length; i++) {
                var polyline = this.lines[i];
                svg.appendChild(polyline.svg(this.transform));
            }
            return svg;
        };

        this.forLines = function(iterator) {
            for (var i = 0; i < this.lines.length; i++) {
                var polyline = this.lines[i];
                iterator(polyline);
            }
        }

        this.bounds = function() {

            var minX = null;
            var maxX = null;
            var minY = null;
            var maxY = null;

            this.forLines(function(polyline) {
                if (polyline.length() < 2) {
                    return;
                }
                if (minX === null || line.minX < minX) {
                    minX = polyline.minX;
                }
                if (maxX == null || line.maxX > maxX) {
                    maxX = polyline.maxX;
                }
                if (minY === null || line.minY < minY) {
                    minY = polyline.minY;
                }
                if (maxY == null || line.maxY > maxY) {
                    maxY = polyline.maxY;
                }
            });

            return [minX, minY, maxX - minX, maxY - minY];
        }

        this.width = function() {
            var [x, y, width, height] = this.bounds();
            return width;
        }

        this.height = function() {
            var [x, y, width, height] = this.bounds();
            return height;
        }

        this.setCenter = function(x, y) {
            var self = this;
            this.transform = function(point) {
                var [pointX, pointY] = point;
                var [minX, minY, width, height] = self.bounds();
                var centerX  =  minX + (width / 2);
                var centerY = minY + (height / 2);
                return [pointX - centerX + x, pointY - centerY + y];
            };
        }

        this.context = context;
        this.angle = 0;
        this.lines = [];
        this.context.beginPath();
        this.transform = function(point) { return point; }
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

    alternate: function(context, x, y, width, height, stepX, stepY, offset, draw, debug) {

        function alternate(x, y, width, height, stepX, stepY, offset, draw) {
            if (offset === undefined) {
                offset = false;
            }

            for (var j = y - stepY; j < y + height + stepY; j = j + ( stepY * 2 )) {
                for (var i = x - stepX; i < x + width + stepX; i = i + stepX) {
                    draw(i, j, false);
                    var i2 = i;
                    if (offset) {
                        i2 = i + ( stepX / 2 );
                    }
                    draw(i2, j + stepY, offset);
                }
            }
        }

        alternate(x, y, width, height, stepX, stepY, offset, draw);
        if (debug) {
            alternate(x, y, width, height, stepX, stepY, offset, function(x, y, offset) {
                if (offset) {
                    context.fillStyle = 'cyan';
                } else {
                    context.fillStyle = 'magenta';
                }
                context.beginPath();
                context.arc(x, y, 4, 0, 2 * Math.PI);
                context.fill();
            });
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

    render: function(canvas, pattern, options) {
        return Pattern[pattern](canvas, options);
    },

    options: function(pattern) {
        return Pattern[pattern + "_options"];
    },

    other_options: {
        lineWidth: {title: 'Line Width', min: 1, max: 20},
        size: {title: 'Size', min: 1, max: 200},
        spacing: {title: 'Spacing', min: 0, max: 200},
	    backgroundColor: {title: 'Background Color', type: 'color'},
	    foregroundColor: {title: 'Foreground Color', type: 'color'}
    },

    other: function(canvas, {size, spacing, lineWidth, backgroundColor, foregroundColor}={}) {

        var lineDrawer = Pattern.drawers.line(lineWidth);

		var drawThreeLines = function(context, x, y, length, altitude, space, drawLine) {
			var horY = n => altitude * n / 4 * space;
			drawLine(context, x, y + horY(0), x + length, y + horY(0));
            drawLine(context, x, y + horY(1), x + length, y + horY(1));
            drawLine(context, x, y + horY(2), x + length, y + horY(2));

			var diagX = (n, end) => {
				var actualN = n * space + end;
				return length * actualN / 4;
			};
			drawLine(context, x + diagX(0, 0), y, x + diagX(0, 2), y + altitude);
			drawLine(context, x + diagX(1, 0), y, x + diagX(1, 2), y + altitude);
			drawLine(context, x + diagX(2, 0), y, x + diagX(2, 2), y + altitude);

			drawLine(context, x + diagX(1, 2), y, x + diagX(1, 0), y + altitude);
			drawLine(context, x + diagX(2, 2), y, x + diagX(2, 0), y + altitude);
			drawLine(context, x + diagX(3, 2), y, x + diagX(3, 0), y + altitude);
		};

        var drawPrimitive = function(context, x, y, length, altitude, space, drawLine) {
            drawThreeLines(context, x, y, length, altitude, space, drawLine);
        };

        var length = size * window.devicePixelRatio;
		var altitude = (Math.sqrt(3) / 2 ) * length;
		var space = spacing / 100.0;

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.strokeStyle = foregroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = foregroundColor;
        Pattern.alternate(context, 0, 0, canvas.width, canvas.height, length, altitude, true, function(x, y) {
            drawPrimitive(context, x, y, length, altitude, space, lineDrawer);
        });
    },

    asanoha: function(canvas, {size, lineDrawer, backgroundColor, foregroundColor}={}) {

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
        context.fillStyle = foregroundColor;
        Pattern.alternate(context, 0, 0, canvas.width, canvas.height, length, altitude, true, function(x, y) {
            drawPrimitive(context, x, y, length, altitude, lineDrawer);
        });
    },

    shippou_options: {
        lineWidth: {title: 'Line Width', min: 1, max: 20},
        radius: {title: 'Radius', min: 1, max: 100},
	    backgroundColor: {title: 'Background Color', type: 'color'},
	    foregroundColor: {title: 'Foreground Color', type: 'color'},
    },

    shippou: function(canvas, {lineWidth, radius, backgroundColor, foregroundColor}={}) {

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
        Pattern.alternate(context, 0, 0, canvas.width, canvas.height, radius * 2, radius, true, function(x, y) {
            drawCircle(context, x, y, radius);
        });
    },

    seigaiha_options: {
        lineWidth: {title: 'Line Width', min: 1, max: 20},
        count: {title: 'Line Count', min: 2, max: 20},
        lineSpacing: {title: 'Line Spacing', min: 1, max: 20},
        radius: {title: 'Radius', default: 44, min: 1, max: 200},
	    backgroundColor: {title: 'Background Color', type: 'color'},
	    foregroundColor: {title: 'Foreground Color', type: 'color'},
        alternating: {title: 'Alternate', type: 'boolean'},
    },

    seigaiha: function(canvas, {lineWidth, radius, lineSpacing, count, alternating, backgroundColor, foregroundColor}={}) {

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

    sayagata_options: {
        lineWidth: {title: 'Line Width', min: 1, max: 10},
        featureLength: {title: 'Feature Length', min: 1, max: 75},
	    angle: {title: 'Angle', min: Math.PI / 30, max: Math.PI / 2, step: Math.PI / 60},
	    backgroundColor: {title: 'Background Color', type: 'color'},
	    foregroundColor: {title: 'Foreground Color', type: 'color'},
    },

    sayagata: function(canvas, {featureLength, lineWidth, angle, backgroundColor, foregroundColor}={}) {

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
        Pattern.alternate(context, 0, 0, canvas.width, canvas.height, stepX, stepY, false, function(x, y) {
            drawPattern(path, x, y, featureLength, angle);
        });
        path.stroke();

        return path.svg(canvas.width, canvas.height);
    },

    stars_options: {
        featureLength: {title: 'Feature Length', min: 1, max: 100},
        ratio: {title: 'Ratio', min: 0, max: 100},
        backgroundColor: {title: 'Background Color', type: 'color'},
	    foregroundColor: {title: 'Foreground Color', type: 'color'}
    },

    stars: function(canvas, {featureLength, ratio, foregroundColor, backgroundColor}={}) {

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
        Pattern.alternate(context,
                          0, 0,
                          canvas.width, canvas.height,
                          largeSize + smallSize, (largeSize / 2) + (smallSize / 2),
                          true,
                          function(x, y) {
                              drawStar(path, x, y, sideLength);
                              drawStar(path, x + (largeSize / 2) + (smallSize / 2), y, smallSideLength);
                          });
        context.fillStyle = foregroundColor;
        path.fill();

        return path.svg(canvas.width, canvas.height);
    },

    triangles_options: {
        featureLength: {title: 'Feature Length', min: 1, max: 100},
        spacing: {title: 'Spacing', min: 1, max: 20},
        backgroundColor: {title: 'Background Color', type: 'color'},
	    foregroundColor: {title: 'Foreground Color', type: 'color'},
    },

    triangles: function(canvas, {featureLength, spacing, backgroundColor, foregroundColor}={}) {

        var drawTriangle = function(path, x, y, width, altitude) {
            path.moveTo(x - ( width / 2), y + (altitude / 2));
            path.lineTo(x + ( width / 2), y + (altitude / 2));
            path.lineTo(x, y - (altitude / 2));
            path.close();
        }

        var radius = featureLength * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = foregroundColor;

        padding = spacing * window.devicePixelRatio;
        altitude = radius / 2;

        var path = new Pattern.Path(context);
        Pattern.alternate(context, 0, 0, canvas.width, canvas.height, radius + padding, altitude + padding, true, function(x, y) {
            drawTriangle(path, x, y, radius, altitude);
        });
        path.fill();

        return path.svg(canvas.width, canvas.height);
    },

    pattern003_options: {
        featureLength: {title: 'Feature Length', min: 4, max: 100},
        lineWidth: {title: 'Line Width', min: 1, max: 20},
        backgroundColor: {title: 'Background Color', type: 'color'},
        foregroundColor: {title: 'Foreground Color', type: 'color'},
    },

    pattern003: function(canvas, {featureLength, lineWidth, spacing, backgroundColor, foregroundColor}={}) {

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
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = foregroundColor;
        context.lineWidth = lineWidth;

        padding = spacing * window.devicePixelRatio;
        altitude = radius / 2;

        var path = new Pattern.Path(context);
        Pattern.alternate(context, 0, 0, canvas.width, canvas.height, 100, 100, false, function(x, y) {
            drawElement(path, x, y, radius, altitude);
        });
        path.stroke();

        return path.svg(canvas.width, canvas.height);
    },

    gosper_options: {
        featureLength: {title: 'Feature Length', min: 4, max: 100},
        lineWidth: {title: 'Line Width', min: 1, max: 20},
        backgroundColor: {title: 'Background Color', type: 'color'},
        foregroundColor: {title: 'Foreground Color', type: 'color'},
    },

    gosper: function(canvas, {featureLength, foregroundColor, backgroundColor, lineWidth}={}) {

        var angle = Math.PI / 3;

        var gosperOp = function() {};

        var drawGosper = function(path, order, size, isA) {

            if (order === 0) {
                path.forward(size);
                return;
            }

            var steps = isA ? "A-B--B+A++AA+B-" : "+A-BB--B-A++A+B";
            for (var i = 0; i < steps.length; i++) {
                var operation = gosperOp(steps.charAt(i));
                operation(path, order - 1, size)
            }
        };

        gosperOp = function(op) {
            if (op === "A") {
                return function(path, order, size) { drawGosper(path, order, size, true); };
            }
            if (op === "B") {
                return function(path, order, size) { drawGosper(path, order, size, false); };
            }
            if (op === "-") {
                return function(path, order, size) { path.right(Math.PI / 3); };
            }
            if (op === "+") {
                return function(path, order, size) { path.left(Math.PI / 3); };
            }
        };

        var lineWidth = lineWidth * window.devicePixelRatio;
        var featureLength = featureLength * window.devicePixelRatio;

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.strokeStyle = foregroundColor;
        context.lineWidth = lineWidth;
        context.fillRect(0, 0, canvas.width, canvas.height);

        var approximateScaleFactor = 1.3
        var maxDimension = Math.max(canvas.width, canvas.height);
        order = Math.ceil(Pattern.logbase(3, ( ( ( maxDimension / 4 ) * 6 ) / featureLength ) / approximateScaleFactor )) + 1;
        var numerator = ( approximateScaleFactor * ( 3.0 ** order ) * featureLength )
        var rightShift = numerator / 6.0;

        var path = new Pattern.Path(context);
        path.left(order * ( Math.PI / 9 ) );
        path.right(Math.PI / 3);
        path.moveTo(canvas.width + rightShift, canvas.height/2);
        drawGosper(path, order, featureLength, true);
        path.stroke();

        return path.svg(canvas.width, canvas.height);
    },

    tiles_options: {
        angle: {title: 'Angle', min: 0, max: Math.PI / 4, step: Math.PI / 60},
        lineWidth: {title: 'Line Width', min: 1, max: 20},
        backgroundColor: {title: 'Background Color', type: 'color'},
        foregroundColor: {title: 'Foreground Color', type: 'color'},
        horizontalLength: {title: 'Horizontal Length', min: 1, max: 40},
        verticalLength: {title: 'Vertical Length', min: 1, max: 40},
        alternate: {title: 'Alternate', type: 'boolean'}
    },

    tiles: function(canvas, {foregroundColor, backgroundColor, angle, lineWidth, horizontalLength, verticalLength, alternate}={}) {

        var context = canvas.getContext('2d');
        context.fillStyle = foregroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        var featureWidth = 2 * horizontalLength * Math.cos(angle);
        var featureHeight = verticalLength;
        var verticalSpacing = lineWidth / Math.cos(angle);
        var verticalOffset = verticalLength - (Math.tan(angle) * (featureWidth / 2));

        function drawFeature(path, offset) {
            if (offset) {
                path.setAngle(Math.PI);
            } else {
                path.setAngle(0);
            }
            path.forward(verticalLength);
            path.left((Math.PI / 2) + angle);
            path.forward(horizontalLength);
            path.right(2 * angle);
            path.forward(horizontalLength);
            path.left((Math.PI / 2) + angle);
            path.forward(verticalLength);
            path.left((Math.PI / 2) - angle);
            path.forward(horizontalLength);
            path.close();
        };

        // TODO: Consider adding scaling to the path.
        // TODO: Consider adding fill styles to the path.
        // TODO: Automatically inject the context.

        var image = new Pattern.Image();

        context.fillStyle = backgroundColor;
        Pattern.alternate(
            context,
            0, 0,
            canvas.width,
            canvas.height,
            featureWidth + lineWidth, featureHeight + verticalSpacing,
            alternate,
            function(x, y, offset) {
                var path = new Pattern.Path(context);
                image.add(path);
                drawFeature(path, offset);
                path.setCenter(x, y);
                path.fill();
            });

        return image.svg(canvas.width, canvas.height);
    },

    dots_options: {
        radius: {title: 'Radius', min: 1, max: 20},
        spacing: {title: 'Spacing', min: 1, max: 20},
        backgroundColor: {title: 'Background Color', type: 'color'},
        foregroundColor: {title: 'Foreground Color', type: 'color'},
        alternate: {title: 'Alternate', default: true, type: 'boolean'}
    },

    dots: function(canvas, {foregroundColor, backgroundColor, radius, spacing, alternate}={}) {

        // TODO: Support SVG download.

        var context = canvas.getContext('2d');
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = foregroundColor;
        Pattern.alternate(
            context,
            0, 0,
            canvas.width,
            canvas.height,
            spacing + (2 * radius), spacing + (2 * radius),
            alternate,
            function(x, y, offset) {
                var circle = new Pattern.Arc(context, x, y, radius, 0, 2 * Math.PI);
                circle.fill();
                // Pattern.drawCircle(context, x, y, radius);
            });

    },

};
