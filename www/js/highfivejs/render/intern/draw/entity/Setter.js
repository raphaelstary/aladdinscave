var Setter = (function (changeCoords) {
    "use strict";

    return {
        setAlpha: function (drawable, alpha) {
            drawable.alpha = alpha;
            return drawable;
        },

        setRotation: function (drawable, rotation) {
            drawable.rotation = rotation;
            return drawable;
        },

        setScale: function (drawable, scale) {
            drawable.scale = scale || 1;
            return drawable;
        },

        setColor: function (drawable, color) {
            drawable.data.color = color;
            return drawable;
        },

        setTextMessage: function (drawable, msg) {
            drawable.data.msg = msg;
            return drawable;
        },

        setTextFont: function (drawable, font) {
            drawable.data.fontFamily = font;
            return drawable;
        },

        setPosition: function (addToResizer, screen, drawable, xFn, yFn, resizeDependencies) {
            drawable.x = xFn(screen.width, screen.height);
            drawable.y = yFn(screen.height, screen.width);

            addToResizer(drawable, function (width, height) {
                changeCoords(drawable, xFn(width, height), yFn(height, width));
            }, resizeDependencies);

            return drawable;
        },

        setTextSize: function (addToResizer, screen, drawable, sizeFn, resizeDependencies) {
            drawable.data.size = sizeFn(screen.width, screen.height);
            addToResizer(drawable, function (width, height) {
                drawable.data.size = sizeFn(width, height);
            }, resizeDependencies);

            return drawable;
        },

        setTextMaxLineLength: function (addToResizer, screen, drawable, maxLineLengthFn, resizeDependencies) {
            drawable.data.maxLineLength = maxLineLengthFn(screen.width, screen.height);
            addToResizer(drawable, function (width, height) {
                drawable.data.maxLineLength = maxLineLengthFn(width, height);
            }, resizeDependencies);

            return drawable;
        },

        setTextLineHeight: function (addToResizer, screen, drawable, lineHeightFn, resizeDependencies) {
            drawable.data.lineHeight = lineHeightFn(screen.height, screen.width);
            addToResizer(drawable, function (width, height) {
                drawable.data.lineHeight = lineHeightFn(height, width);
            }, resizeDependencies);

            return drawable;
        },

        setLength: function (addToResizer, screen, drawable, lengthFn, resizeDependencies) {
            drawable.data.length = lengthFn(screen.width, screen.height);
            addToResizer(drawable, function (width, height) {
                drawable.data.length = lengthFn(width, height);
            }, resizeDependencies);

            return drawable;
        },

        setWidth: function (addToResizer, screen, drawable, widthFn, resizeDependencies) {
            drawable.data.width = widthFn(screen.width, screen.height);
            addToResizer(drawable, function (width, height) {
                drawable.data.width = widthFn(width, height);
            }, resizeDependencies);

            return drawable;
        },

        setHeight: function (addToResizer, screen, drawable, heightFn, resizeDependencies) {
            drawable.data.height = heightFn(screen.height, screen.width);
            addToResizer(drawable, function (width, height) {
                drawable.data.height = heightFn(height, width);
            }, resizeDependencies);

            return drawable;
        },

        setLineWidth: function (addToResizer, screen, drawable, lineWidthFn, resizeDependencies) {
            drawable.data.lineWidth = lineWidthFn(screen.width, screen.height);
            addToResizer(drawable, function (width, height) {
                drawable.data.lineWidth = lineWidthFn(width, height);
            }, resizeDependencies);

            return drawable;
        },

        setFilled: function (drawable, filled) {
            drawable.data.filled = filled;
            return drawable;
        },

        setRadius: function (addToResizer, screen, drawable, radiusFn, resizeDependencies) {
            drawable.data.radius = radiusFn(screen.width, screen.height);
            addToResizer(drawable, function (width, height) {
                drawable.data.radius = radiusFn(width, height);
            }, resizeDependencies);

            return drawable;
        },

        setAngle: function (drawable, angle) {
            drawable.data.angle = angle;
            return drawable;
        },

        setGraphic: function (stage, drawable, imgName) {
            drawable.data = stage.getGraphic(imgName);
            return drawable;
        }
    };
})(changeCoords);