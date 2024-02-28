var Colibri = (function () {

    var pow = function (n) {

        return Math.pow(n, 2);

    };

    var filters = {

        'hex': function (color) {

            if (color === null)
                return null;

            var hexComponent = function (n) {
                var value = Math.floor(255 * n).toString(16);
                return value.length === 1 ? '0' + value : value;
            };

            return '#' + color.map(hexComponent).join('');

        },

        'css': function (color) {

            if (color === null)
                return null;

            return 'rgb(' + color.map(function (n) {
                return Math.floor(255 * n);
            }).join(',') + ')';

        }

    };

    var rgbToInt = function (rgb) {

        return (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];

    };

    var hexToInt = function (hex) {

        return parseInt(hex.slice(1), 16);

    };

    var rgbToYuv = function (rgb) {

        return [
            rgb[0] *  0.299 + rgb[1] * 0.587 + rgb[2] * 0.114,
            rgb[0] * -0.147 + rgb[1] * 0.289 + rgb[2] * 0.436,
            rgb[0] *  0.615 + rgb[1] * 0.515 + rgb[2] * 0.100
        ];

    };

    var colorDistance = function (rgb1, rgb2) {

        var yuv1 = rgbToYuv(rgb1), yuv2 = rgbToYuv(rgb2);

        return Math.sqrt(pow(yuv1[0] - yuv2[0]) + pow(yuv1[1] - yuv2[1]) + pow(yuv1[2] - yuv2[2]));

    };

    var colorBrightness = function (rgb) {

        if (rgb === null)
            return null;

        return Math.sqrt(pow(rgb[0]) * 0.241 + pow(rgb[1]) * 0.691 + pow(rgb[2]) * 0.068);

    };

    var gatherSimilarElements = function (list, comparator) {

        var subsets = [];

        for (var u = 0, U = list.length; u < U; ++ u) {

            var element = list[u];
            var closest = null;

            for (var v = 0, V = subsets.length; v < V; ++ v)
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

    var meanColor = function (colorList) {

        var finalColor = [ 0, 0, 0 ];

        for (var t = 0, T = colorList.length; t < T; ++ t) {

            var color = colorList[t];

            finalColor[0] += color[0];
            finalColor[1] += color[1];
            finalColor[2] += color[2];

        }

        finalColor[0] /= colorList.length;
        finalColor[1] /= colorList.length;
        finalColor[2] /= colorList.length;

        return finalColor;

    };

    var dominantColor = function (colorList, treshold, count) {

        if (typeof treshold === 'undefined')
            treshold = 0.1;
        if (typeof count === 'undefined')
            count = null;

        var buckets = gatherSimilarElements(colorList, function (colorA, colorB) {
            return colorDistance(colorA, colorB) < treshold;
        }).sort(function (bucketA, bucketB) {
            return bucketB.length - bucketA.length;
        });

        var color = buckets.length > 0
            ? meanColor(buckets.shift())
            : null;

        if (count === null)
            return color;

        if (count === -1)
            count = buckets.length;

        return buckets.slice(0, count).map(function (bucket) {
            return meanColor(bucket);
        });

    };

    var createCanvas = function () {

        if (typeof document !== 'undefined')
            return document.createElement('canvas');

        if (typeof require !== 'undefined')
            return new (require('canvas').Canvas)();

        throw new Error('Canvas creation failed');

    };

    var loadDataFromContext = function (destination, context, x, y, width, height, ignoredColors) {

        var data = context.getImageData(x, y, width, height).data;
        var transparent = false;

        for (var t = 0, T = data.length; t < T; t += 4) {

            if (data[t + 3] === 0) {
                transparent = true;
                continue;
            }

            if (ignoredColors && ignoredColors.has((data[t + 0] << 16) | (data[t + 1] << 8) | (data[t + 2] << 0)))
                continue;

            destination.push([ data[t + 0] / 255, data[t + 1] / 255, data[t + 2] / 255 ]);

        }

        return transparent;

    };

    var extractImageColors = function (image, options) {

        if (typeof options === 'undefined')
            options = 'hex';
        if (typeof options === 'string')
            options = {outputType: options};

        var canvas = createCanvas();
        var context = canvas.getContext('2d');

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        var ignoredColors = options.ignoredColors ? new Set(options.ignoredColors.map(function (hex) {
            return hexToInt(hex);
        })) : null;

        var borderImageData = [];
        var transparentBorder = false;

        transparentBorder = loadDataFromContext(borderImageData, context, 0, 0, canvas.width - 1, 1, ignoredColors) || transparentBorder;
        transparentBorder = loadDataFromContext(borderImageData, context, canvas.width - 1, 0, 1, canvas.height - 1, ignoredColors) || transparentBorder;
        transparentBorder = loadDataFromContext(borderImageData, context, 0, 1, 1, canvas.height - 1, ignoredColors) || transparentBorder;
        transparentBorder = loadDataFromContext(borderImageData, context, 1, canvas.height - 1, canvas.width - 1, 1, ignoredColors) || transparentBorder;

        if (transparentBorder)
            borderImageData = [];

        var fullImageData = [];
        loadDataFromContext(fullImageData, context, 0, 0, canvas.width, canvas.height, ignoredColors);

        var backgroundColor = borderImageData.length > 0
            ? dominantColor(borderImageData, .1)
            : dominantColor(fullImageData, .1);

        var contentColors = dominantColor(fullImageData, .1, -1).filter(function (color) {

            return Math.abs(colorBrightness(backgroundColor) - colorBrightness(color)) > .4;

        }).reduce(function (filteredContentColors, currentColor) {

            var previous = filteredContentColors[filteredContentColors.length - 1];

            if (!previous || colorDistance(previous, currentColor) > .3)
                filteredContentColors.push(currentColor);

            return filteredContentColors;

        }, []);

        if (contentColors.length === 0)
            contentColors.push(colorBrightness(backgroundColor) >= 0.5 ? [0, 0, 0] : [1, 1, 1]);

        var filter = options.outputType && typeof options.outputType === 'string'
            ? filters[options.outputType]
            : options.outputType;

        if (filter) {
            backgroundColor = filter(backgroundColor);
            contentColors = contentColors.map(function (color) {
                return filter(color);
            });
        }

        return {
            background: backgroundColor,
            content: contentColors
        };

    };

    return {

        dominantColor: dominantColor,
        extractImageColors: extractImageColors

    };

})();

if (typeof module !== `undefined`) {
    module.exports = Colibri;
}
