G.WorldView = (function (calcCantorPairing, iterateEntries, Transition, wrap, range, Images, add, Height, Width,
    changeSign, CallbackCounter) {
    "use strict";

    function WorldView(stage, timer, gridViewHelper, is30fps) {
        this.stage = stage;
        this.timer = timer;
        this.gridViewHelper = gridViewHelper;

        this.player = null;
        this.boxes = {};
        this.walls = [];
        this.targetTiles = [];
        this.emptyTiles = {};
        this.nothingTiles = [];

        this.moveSpeed = is30fps ? 5 : 10;
        this.boxFrontMoveSpeed = is30fps ? 15 : 30;
        // this.boxHighlight = is30fps ? 6 : 15;
        // this.boxOldBack = is30fps ? 15 : 30;
        // this.boxNewBack = is30fps ? 15 : 30;
        this.dropInSpeed = is30fps ? 15 : 30;
        this.boxFrontOpacityEaseIn = is30fps ? 30 : 60;
        this.boxFrontOpacityEaseOut = is30fps ? 30 : 60;
        this.playerFootPrintEaseOut = is30fps ? 15 : 30;
        
        this.xTiles = 0;
        this.yTiles = 0;
    }

    WorldView.prototype.preDestroy = function () {
        this.player.remove();
        function removeElem(elem) {
            elem.remove();
        }

        this.walls.forEach(removeElem);
        iterateEntries(this.boxes, function (wrapper) {
            wrapper.front.remove();
            // wrapper.back.remove();
        });
        iterateEntries(this.emptyTiles, removeElem);
        this.nothingTiles.forEach(removeElem);
        this.targetTiles.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (player, boxes, walls, goalTiles, floorTiles, emptyTiles, callback) {
        var defaultDrawable = this.gridViewHelper.create(1, 1, Images.FLOOR);
        var defaultHeight = this.__defaultHeight = defaultDrawable.data.height;
        defaultHeight += 2;
        defaultDrawable.remove();

        var spacing = Transition.EASE_IN_SIN;
        var yFn = changeSign(Height.HALF);
        var self = this;

        var callbackCounter = new CallbackCounter(callback);

        function dropIn(drawable) {
            drawable.show = false;
            self.timer.doLater(function () {
                drawable.show = true;
                drawable.moveFrom(wrap(drawable, 'x'), yFn, [drawable]).setDuration(self.dropInSpeed)
                    .setSpacing(spacing).setCallback(callbackCounter.register());
            }, 1);

            return drawable;
        }

        this.player = dropIn(this.gridViewHelper.create(player.u, player.v, Images.PLAYER, defaultHeight));

        boxes.forEach(function (box) {
            this.boxes[box.type] = {
                front: dropIn(this.gridViewHelper.create(box.u, box.v, Images.BOX, defaultHeight)),
                state: Images.BOX
                // back: dropIn(this.gridViewHelper.createBackground(box.u, box.v, Images.BOX_BG, 2, defaultHeight))
            };
            this.boxes[box.type].front.alpha = 0.8;
            this.boxes[box.type].front.opacityPattern([
                {
                    value: 1,
                    duration: this.boxFrontOpacityEaseIn,
                    easing: Transition.EASE_IN_QUAD
                }, {
                    value: 0.8,
                    duration: this.boxFrontOpacityEaseOut,
                    easing: Transition.EASE_OUT_QUAD
                }
            ], true);
        }, this);

        walls.forEach(function (wall) {
            this.walls.push(dropIn(this.gridViewHelper.create(wall.u, wall.v, Images.WALL, defaultHeight)));
        }, this);

        goalTiles.forEach(function (target) {
            this.targetTiles.push(dropIn(
                this.gridViewHelper.createBackground(target.u, target.v, Images.GOAL, 3, defaultHeight)));
        }, this);

        floorTiles.forEach(function (tile) {
            this.emptyTiles[calcCantorPairing(tile.u, tile.v)] = dropIn(
                this.gridViewHelper.createBackground(tile.u, tile.v, Images.FLOOR, 1, defaultHeight));
        }, this);

        emptyTiles.forEach(function (tile) {
            // var randomValue = range(0, 100);
            // var drawable, scaleFactor;
            // if (randomValue < 80 || tile.v == 0 || tile.v == this.yTiles - 1 || tile.u == 0 ||
            //     tile.u == this.xTiles - 1) {
            //     this.nothingTiles.push(
            //         dropIn(this.gridViewHelper.createRectBackground(tile.u, tile.v, Colors.NOTHING_COLOR, 2)));
            // } else if (randomValue < 85) {
            //     var offset = defaultHeight - 0;
            //
            //     drawable = this.stage.createImage(Images.BG_DARK)
            //         .setPosition(this.gridViewHelper.__getX(tile.u), this.gridViewHelper.__getY(tile.v)).setZIndex(1);
            //     scaleFactor = drawable.data.height / defaultHeight;
            //     drawable.scale = this.gridViewHelper.__calcBaseScale(drawable.getHeight()) * scaleFactor;
            //     this.nothingTiles.push(dropIn(drawable));
            //
            // } else {
            //     drawable = this.stage.createImage(Images.BG_LIGHT)
            //         .setPosition(add(this.gridViewHelper.__getX(tile.u), Width.get(1920, 4)),
            //             add(this.gridViewHelper.__getY(tile.v), Height.get(1080, 4))).setZIndex(2);
            //     scaleFactor = drawable.data.height / defaultHeight;
            //     drawable.scale = this.gridViewHelper.__calcBaseScale(drawable.getHeight()) * scaleFactor;
            //     this.nothingTiles.push(dropIn(drawable));
            // }

        }, this);
    };

    WorldView.prototype.movePlayer = function (changeSet, callback) {
        var path = this.gridViewHelper.move(this.player, changeSet.newU, changeSet.newV, this.moveSpeed, callback);
        path.setSpacing(Transition.EASE_OUT_EXPO);

        var prints = this.gridViewHelper.createBackground(changeSet.oldU, changeSet.oldV, Images.PRINTS, 2,
            this.__defaultHeight);
        prints.alpha = 0.8;
        prints.opacityTo(0.3).setDuration(this.playerFootPrintEaseOut).setSpacing(Transition.EASE_IN_EXPO)
            .setCallback(function () {
                prints.remove();
            });
    };

    WorldView.prototype.moveBox = function (changeSet, callback) {
        if (this.boxes[changeSet.tile].path) {
            this.boxes[changeSet.tile].path.finish();
        }

        // var self = this;
        var path = this.gridViewHelper.move(this.boxes[changeSet.tile].front, changeSet.newU, changeSet.newV,
            this.boxFrontMoveSpeed, callback);
        path.setSpacing(Transition.EASE_OUT_ELASTIC);
        this.boxes[changeSet.tile].path = path;

        // this.timer.doLater(function () {
        //     self.boxes[changeSet.tile].back.remove();
        //     var back = self.boxes[changeSet.tile].back = self.gridViewHelper.createBackground(changeSet.newU,
        //         changeSet.newV, Images.BOX_BG, 2, self.__defaultHeight);
        //     back.alpha = 0.3;
        //     back.opacityTo(1).setDuration(self.boxNewBack).setSpacing(Transition.EASE_OUT_EXPO);
        // }, this.boxHighlight);

        // var back = this.boxes[changeSet.tile].back;
        // back.alpha = 1;
        // back.opacityTo(0.3).setDuration(this.boxOldBack).setSpacing(Transition.EASE_IN_EXPO).setCallback(function () {
        //     back.remove();
        // });
    };

    WorldView.prototype.activateBox = function (box) {
        // this.__changeBoxFront(box, Images.BOX_ACTIVE);
    };

    WorldView.prototype.changeBoxToOnTarget = function (box) {
        // this.__changeBoxFront(box, Images.BOX_TARGET);
    };

    WorldView.prototype.changeBoxToNormal = function (box) {
        this.__changeBoxFront(box, Images.BOX);
    };

    WorldView.prototype.__changeBoxFront = function (box, nextImg) {
        var wrapper = this.boxes[box.type];
        if (wrapper.state === nextImg)
            return;
        wrapper.front.data = this.stage.getGraphic(nextImg);
        wrapper.state = nextImg;
    };

    return WorldView;
})(H5.calcCantorPairing, H5.iterateEntries, H5.Transition, H5.wrap, H5.range, G.Images, H5.add, H5.Height, H5.Width,
    H5.changeSign, H5.CallbackCounter);