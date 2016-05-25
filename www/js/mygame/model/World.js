G.World = (function () {
    "use strict";

    function World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper, successFn, failureFn, movesFn) {
        this.worldView = worldView;
        this.grid = grid;
        this.gridHelper = gridHelper;
        this.domainGridHelper = domainGridHelper;
        this.gridViewHelper = gridViewHelper;
        this.gameOverSuccess = successFn;
        // this.failure = failureFn;
        this.movesCallback = movesFn;

        this.changedBoxes = [];
    }

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();
        this.boxes = this.domainGridHelper.getBoxes();
        this.worldView.drawLevel(this.player, this.boxes, this.domainGridHelper.getWalls(),
            this.domainGridHelper.getGoalTiles(), this.domainGridHelper.getFloorTiles(),
            this.domainGridHelper.getEmptyTiles(), callback);
        
        this.movesCounter = 0;
    };

    World.prototype.moveLeft = function (callback) {
        return this.__move(this.player, this.player.u - 1, this.player.v, callback);
    };

    World.prototype.moveRight = function (callback) {
        return this.__move(this.player, this.player.u + 1, this.player.v, callback);
    };

    World.prototype.moveTop = function (callback) {
        return this.__move(this.player, this.player.u, this.player.v - 1, callback);
    };

    World.prototype.moveBottom = function (callback) {
        return this.__move(this.player, this.player.u, this.player.v + 1, callback);
    };

    World.prototype.__move = function (player, u, v, callback) {
        var canMove = this.domainGridHelper.canPlayerMove(player, u, v);
        if (!canMove) {
            var canPush = this.domainGridHelper.canPlayerPush(player, u, v);
            if (!canPush)
                return false;
        }

        var self = this;

        function postMove() {
            self.changedBoxes.forEach(function (box) {
                if (!(self.domainGridHelper.isBoxNextToPlayer(box) || self.domainGridHelper.isBoxOnTarget(box))) {
                    self.worldView.changeBoxToNormal(box);
                }
            });
            if (self.changedBoxes.length > 0)
                self.changedBoxes = [];

            self.movesCounter++;
            self.movesCallback(self.movesCounter);

            var success = self.boxes.every(self.domainGridHelper.isBoxOnTarget.bind(self.domainGridHelper));
            if (success) {
                self.gameOverSuccess();
                return;
            }

            if (self.domainGridHelper.isPlayerNextToBox(player)) {
                var boxesToActivate = self.domainGridHelper.getTouchingBoxes(player);
                boxesToActivate.forEach(function (box) {
                    self.changedBoxes.push(box);
                    self.worldView.activateBox(box);
                    if (self.domainGridHelper.isBoxOnTarget(box)) {
                        self.worldView.changeBoxToOnTarget(box);
                    }
                });
            }

            // i donno ... flash smth or highlight smth

            if (callback)
                callback();
        }

        if (canMove) {
            var change = this.domainGridHelper.movePlayer(player, u, v);
            this.worldView.movePlayer(change, postMove);

        } else if (canPush) {
            var deltaU = u - player.u;
            var deltaV = v - player.v;
            var boxType = this.grid.get(u, v);
            var myBox;
            var foundSmth = this.boxes.some(function (box) {
                var foundIt = box.type === boxType;
                if (foundIt)
                    myBox = box;
                return foundIt;
            });
            if (!foundSmth)
                return false;

            var boxChange = this.domainGridHelper.pushBox(myBox, deltaU, deltaV);
            var moveChange = this.domainGridHelper.movePlayer(player, u, v);

            this.worldView.movePlayer(moveChange, postMove);
            this.worldView.moveBox(boxChange);
        }
        return true;
    };

    return World;
})();