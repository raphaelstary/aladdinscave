G.PlayerController = (function (Vectors, Math) {
    "use strict";

    function PlayerController(world, gridViewHelper, gridHelper, worldView) {
        this.world = world;
        this.gridViewHelper = gridViewHelper;
        this.gridHelper = gridHelper;
        this.worldView = worldView;

        this.moving = false;
        this.__paused = false;
    }

    PlayerController.prototype.pause = function () {
        this.__paused = true;
    };

    PlayerController.prototype.resume = function () {
        this.__paused = false;
    };

    PlayerController.prototype.handlePointerMove = function (x, y) {
        //if (this.__paused)
        //    return;
    };

    PlayerController.prototype.handlePointerUp = function (x, y) {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        var self = this;

        function myCallback() {
            self.moving = false;
        }

        var target = this.gridViewHelper.getCoordinates(x, y);
        if (target === undefined || target.u === undefined || target.v === undefined)
            return;

        var success;

        if (this.gridHelper.isOnSameAxis(target.u, target.v, this.world.player.u, this.world.player.v)) {
            if (this.world.player.u > target.u) {
                success = this.world.moveLeft(myCallback);
            } else if (this.world.player.u < target.u) {
                success = this.world.moveRight(myCallback);
            } else if (this.world.player.v > target.v) {
                success = this.world.moveTop(myCallback);
            } else if (this.world.player.v < target.v) {
                success = this.world.moveBottom(myCallback);
            }
            if (success) {
                this.moving = true;
            }

        } else {
            var playerCoords = this.gridViewHelper.getPosition(this.world.player.u, this.world.player.v);
            var vector = Vectors.get(playerCoords.x, playerCoords.y, x, y);
            var angle = Vectors.getAngle(vector.x, vector.y);

            if (angle >= -Math.PI / 4 && angle <= Math.PI / 4) {
                success = this.world.moveRight(myCallback);

            } else if (angle >= -Math.PI / 4 * 3 && angle <= -Math.PI / 4) {
                success = this.world.moveTop(myCallback);

            } else if (angle >= Math.PI / 4 && angle <= Math.PI / 4 * 3) {
                success = this.world.moveBottom(myCallback);

            } else if (angle >= Math.PI / 4 * 3 || angle <= -Math.PI / 4 * 3) {
                success = this.world.moveLeft(myCallback);
            }
            if (success) {
                this.moving = true;
            }

        }
    };

    PlayerController.prototype.handlePointerDown = function (x, y) {
        //if (this.__paused)
        //    return;
        //if (this.moving)
        //    return;
    };

    PlayerController.prototype.__myCallback = function () {
        this.moving = false;
    };

    PlayerController.prototype.handleKeyLeft = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveLeft(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyRight = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveRight(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyUp = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveTop(this.__myCallback.bind(this));
    };

    PlayerController.prototype.handleKeyDown = function () {
        if (this.__paused)
            return;
        if (this.moving)
            return;

        this.moving = this.world.moveBottom(this.__myCallback.bind(this));
    };

    return PlayerController;
})(H5.Vectors, Math);