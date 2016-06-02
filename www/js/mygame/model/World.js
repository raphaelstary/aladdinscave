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
        this.history = [];
    }

    World.prototype.init = function (callback) {
        this.player = this.domainGridHelper.getPlayer();
        this.boxes = this.domainGridHelper.getBoxes();
        this.worldView.drawLevel(this.player, this.boxes, this.domainGridHelper.getWalls(),
            this.domainGridHelper.getGoalTiles(), this.domainGridHelper.getFloorTiles(),
            this.domainGridHelper.getEmptyTiles(), this.domainGridHelper.getSwitches(),
            this.domainGridHelper.getDoors(), callback);

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

            if (self.changedBoxes.length > 0)
                self.changedBoxes = [];

            self.movesCounter++;
            self.movesCallback(self.movesCounter);

            var success = self.domainGridHelper.isPlayerOnGoal(self.player);
            if (success) {
                self.gameOverSuccess();
                return;
            }

            // i donno ... flash smth or highlight smth

            if (callback)
                callback();
        }

        if (canMove) {
            var changeHistory = this.domainGridHelper.movePlayer(player, u, v);
            this.history.push(changeHistory);
            this.worldView.movePlayer(changeHistory.change, postMove);

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

            var boxChangeHistory = this.domainGridHelper.pushBox(myBox, deltaU, deltaV);
            var moveChangeHistory = this.domainGridHelper.movePlayer(player, u, v);

            this.history.push(moveChangeHistory);
            this.history.push(boxChangeHistory);

            this.worldView.movePlayer(moveChangeHistory.change, postMove);
            this.worldView.moveBox(boxChangeHistory.change);
        }
        return true;
    };

    World.prototype.undoLastMove = function (callback) {
        if (this.history.length < 1) {
            if (callback)
                callback();
            return false;
        }

        var self = this;
        var last;

        function extendedCallback() {
            if (last.type != 'user') {
                undo();
            } else if (callback)
                callback();
        }

        function undo() {
            last = self.history.pop();
            self.domainGridHelper.undoChange(last.change, last.entity);
            self.worldView.undoMove(last.change, extendedCallback);
        }

        undo();
        return true
    };

    return World;
})();