var Colibri = new (function() {
    var self = this;
    function floor(n) {
        return Math.floor(n);
    }

    function abs(n) {
        return Math.abs(n);
    }

    function sqrt(n ) {
        return Math.sqrt(n);
    }

    function pow(n) {
        return Math.pow(n, 2);
    }

    function rgbToYuv(rgb) {
        return [ rgb[ 0 ] *  0.299 + rgb[ 1 ] * 0.587 + rgb[ 2 ] * 0.114
            , rgb[ 0 ] * -0.147 + rgb[ 1 ] * 0.289 + rgb[ 2 ] * 0.436
            , rgb[ 0 ] *  0.615 + rgb[ 1 ] * 0.515 + rgb[ 2 ] * 0.100 ];
    }

    function colorDistance(rgb1,rgb2) {
        var yuv1 = rgbToYuv( rgb1 ), yuv2 = rgbToYuv( rgb2 );
        return sqrt( pow( yuv1[ 0 ] - yuv2[ 0 ] )
            + pow( yuv1[ 1 ] - yuv2[ 1 ] )
            + pow( yuv1[ 2 ] - yuv2[ 2 ] ) );
    }

    function colorBrightness(rgb) {
        return sqrt( pow( rgb[ 0 ] ) * 0.241
            + pow( rgb[ 1 ] ) * 0.691
            + pow( rgb[ 2 ] ) * 0.068 );
    }

    this.filters = {
        'hex': function(color) {
            var hexComponent = function(n) {
                var value = Math.floor(255 * n).toString(16);
                return value.length === 1 ? '0' + value : value;
            };
            return '#' + color.map(hexComponent).join('');
        },

        'css': function (color) {
            return 'rgb(' + color.map(function(n) {
                    return Math.floor(255 * n);
                }).join(',') + ')';
        }
    };

    this.gatherSimilarElements = function(list, comparator) {
        var subsets = [ ];
        for (var u = 0, U = list.length; u < U; ++ u) {

            var element = list[u];
            var closest = null;

            for ( var v = 0, V = subsets.length; v < V; ++ v )
                if (comparator(subsets[v][0], element))
                    break ;

            if (v === V) {
                closest = [];
                subsets.push(closest);
            } else {
                closest = subsets[v];
            }

            closest.push(element);
        }
        return subsets;
    };

    this.meanColor = function (colorList) {
        var finalColor = [0, 0, 0];

        for (var t = 0, T = colorList.length; t < T; ++ t) {

            var color = colorList[ t ];

            finalColor[0] += color[0];
            finalColor[1] += color[1];
            finalColor[2] += color[2];

        }

        finalColor[0] /= colorList.length;
        finalColor[1] /= colorList.length;
        finalColor[2] /= colorList.length;

        return finalColor;
    };

    this.dominantColor = function(colorList, treshold, count) {

        if (typeof treshold === 'undefined')
            treshold = 0.1;
        if (typeof count === 'undefined')
            count = null;

        var buckets = self.gatherSimilarElements(colorList, function(colorA, colorB) {
            return colorDistance(colorA, colorB) < treshold;
        }).sort(function(bucketA, bucketB ) {
            return bucketB.length - bucketA.length;
        });

        var color = self.meanColor(buckets.shift());

        if (count === null)
            return color;

        if (count === - 1)
            count = buckets.length;

        return buckets.slice(0, count).map(function (bucket) {
            return self.meanColor(bucket);
        });
    };

    this.createCanvas = function() {
        return document.createElement('canvas');
    };

    this.loadDataFromContext = function(destination, context, x, y, width, height) {
        var data = context.getImageData(x, y, width, height).data;
        for (var t = 0, T = data.length; t < T; t += 4) {
            destination.push([data[t + 0] / 255, data[t + 1] / 255, data[t + 2] / 255]);
        }
    };

    this.extractImageColors = function(image, filter) {

        var canvas = self.createCanvas();
        var context = canvas.getContext( '2d' );

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        var borderImageData = [];
        self.loadDataFromContext(borderImageData, context, 0, 0, canvas.width - 1, 1);
        self.loadDataFromContext(borderImageData, context, canvas.width - 1, 0, 1, canvas.height - 1);
        self.loadDataFromContext(borderImageData, context, 0, 1, 1, canvas.height - 1);
        self.loadDataFromContext(borderImageData, context, 1, canvas.height - 1, canvas.width - 1, 1);

        var fullImageData = [];
        self.loadDataFromContext(fullImageData, context, 0, 0, canvas.width, canvas.height);

        var backgroundColor = self.dominantColor(borderImageData, .1);
        var contentColors = self.dominantColor(fullImageData, .1, - 1).filter(function(color) {
            return abs(colorBrightness(backgroundColor) - colorBrightness(color) ) > .4;
        }).reduce(function(filteredContentColors, currentColor) {
            var previous = filteredContentColors[ filteredContentColors.length - 1 ];
            if (!previous || colorDistance(previous, currentColor) > .3) {
                filteredContentColors.push(currentColor);
            }
            return filteredContentColors;
        }, []);

        if (filter && typeof filter !== 'function') {
            filter = self.filters[filter];
        }

        if (filter) {
            backgroundColor = filter(backgroundColor);
            contentColors = contentColors.map(function(color) {
                return filter(color);
            });
        }

        return {
            background : backgroundColor,
            content : contentColors
        };
    };

    this.extractBackgroundColor = function(image, filter) {
        var canvas = self.createCanvas();
        var context = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        var borderImageData = [];
        self.loadDataFromContext(borderImageData, context, 0, 0, canvas.width - 1, 1);
        self.loadDataFromContext(borderImageData, context, canvas.width - 1, 0, 1, canvas.height - 1);
        self.loadDataFromContext(borderImageData, context, 0, 1, 1, canvas.height - 1);
        self.loadDataFromContext(borderImageData, context, 1, canvas.height - 1, canvas.width - 1, 1);
        var backgroundColor = self.dominantColor(borderImageData, .1);


        if (filter && typeof filter !== 'function') {
            filter = self.filters[filter];
        }

        if (filter) {
            backgroundColor = filter(backgroundColor);
        }

        return backgroundColor;
    };

});