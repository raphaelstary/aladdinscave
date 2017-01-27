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
        this.goalTiles = [];
        this.floorTiles = {};
        this.switches = {};
        this.doors = {};

        this.moveSpeed = is30fps ? 5 : 10;
        this.boxFrontMoveSpeed = is30fps ? 15 : 30;
        this.dropInSpeed = is30fps ? 15 : 30;
        this.playerFootPrintEaseOut = is30fps ? 15 : 30;
        this.revertSpeed = is30fps ? 5 : 10;

        this.xTiles = 0;
        this.yTiles = 0;
    }

    WorldView.prototype.preDestroy = function () {
        this.defaultDrawable.remove();
        this.player.remove();
        function removeElem(elem) {
            elem.remove();
        }

        this.walls.forEach(removeElem);
        iterateEntries(this.boxes, function (wrapper) {
            wrapper.front.remove();
        });
        iterateEntries(this.floorTiles, removeElem);
        iterateEntries(this.switches, removeElem);
        iterateEntries(this.doors, removeElem);
        this.goalTiles.forEach(removeElem);
    };

    WorldView.prototype.drawLevel = function (player, boxes, walls, goalTiles, floorTiles, emptyTiles, switchTiles,
        doorTiles, callback) {

        var defaultDrawable = this.defaultDrawable = this.gridViewHelper.create(1, 1, Images.FLOOR);
        var defaultHeight = this.__defaultHeight = defaultDrawable.data.height;
        defaultHeight += 2;
        this.defaultDrawable.show = false; // defaultDrawable.remove();

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
            };
        }, this);

        walls.forEach(function (wall) {
            this.walls.push(dropIn(this.gridViewHelper.create(wall.u, wall.v, Images.WALL, defaultHeight)));
        }, this);

        goalTiles.forEach(function (target) {
            this.goalTiles.push(
                dropIn(this.gridViewHelper.createBackground(target.u, target.v, Images.GOAL, 3, defaultHeight)));
        }, this);

        floorTiles.forEach(function (tile) {
            this.floorTiles[calcCantorPairing(tile.u, tile.v)] = dropIn(
                this.gridViewHelper.createBackground(tile.u, tile.v, Images.FLOOR, 1, defaultHeight));
        }, this);

        switchTiles.forEach(function (switchTile) {
            this.switches[switchTile.type] = {
                front: dropIn(this.gridViewHelper.create(switchTile.u, switchTile.v, Images.SWITCH, defaultHeight)),
                state: Images.SWITCH
            };
        }, this);

        doorTiles.forEach(function (door) {
            this.doors[door.type] = {
                front: dropIn(this.gridViewHelper.create(door.u, door.v, Images.DOOR, defaultHeight)),
                state: Images.DOOR
            };
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

        var path = this.gridViewHelper.move(this.boxes[changeSet.tile].front, changeSet.newU, changeSet.newV,
            this.boxFrontMoveSpeed, callback);
        path.setSpacing(Transition.EASE_OUT_ELASTIC);
        this.boxes[changeSet.tile].path = path;
    };

    WorldView.prototype.undoMove = function (change, callback) {
        if (change.type == 'changed') {
            if (change.tile[0] == 'B')
                this.gridViewHelper.move(this.boxes[change.tile].front, change.oldU, change.oldV, this.revertSpeed,
                    callback);
            if (change.tile == 'P')
                this.gridViewHelper.move(this.player, change.oldU, change.oldV, this.revertSpeed, callback);
        }
    };

    return WorldView;
})(H5.calcCantorPairing, H5.iterateEntries, H5.Transition, H5.wrap, H5.range, G.Images, H5.add, H5.Height, H5.Width,
    H5.changeSign, H5.CallbackCounter);