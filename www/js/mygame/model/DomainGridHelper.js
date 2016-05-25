G.DomainGridHelper = (function () {
    "use strict";

    function DomainGridHelper(gridHelper, grid, xTiles, yTiles) {
        this.gridHelper = gridHelper;
        this.grid = grid;
        this.xTiles = xTiles;
        this.yTiles = yTiles;
    }

    var BackgroundTile = {
        EMPTY: 0,
        FLOOR: 'F',
        GOAL: 'G'
    };

    var Tile = {
        WALL: 'W',
        BOX: 'B',
        PLAYER: 'P',
        EMPTY: 0
    };

    DomainGridHelper.prototype.getWalls = function () {
        return this.__getTiles(Tile.WALL);
    };

    DomainGridHelper.prototype.getEmptyTiles = function () {
        return this.__getTiles(BackgroundTile.EMPTY, true);
    };

    DomainGridHelper.prototype.getFloorTiles = function () {
        return this.__getTiles(BackgroundTile.FLOOR, true);
    };

    DomainGridHelper.prototype.getBoxes = function () {
        return this.__getTiles(Tile.BOX);
    };

    DomainGridHelper.prototype.getPlayer = function () {
        return this.__getTiles(Tile.PLAYER)[0];
    };

    DomainGridHelper.prototype.getGoalTiles = function () {
        return this.__getTiles(BackgroundTile.GOAL, true);
    };

    DomainGridHelper.prototype.__getTiles = function (name, isBackground) {
        var parts = [];

        for (var y = 0; y < this.yTiles; y++) {
            for (var x = 0; x < this.xTiles; x++) {
                var tile = !isBackground ? this.grid.get(x, y) : this.grid.getBackground(x, y);
                if (tile[0] === name)
                    parts.push({
                        u: x,
                        v: y,
                        type: tile
                    });
            }
        }

        return parts;
    };

    DomainGridHelper.prototype.isPlayerNextToBox = function (player) {
        var neighbors = this.gridHelper.getNeighbors(player.u, player.v);
        return neighbors.length > 0 && neighbors.some(function (tile) {
                return tile.type[0] === Tile.BOX;
            });
    };

    DomainGridHelper.prototype.getTouchingBoxes = function (player) {
        var neighbors = this.gridHelper.getNeighbors(player.u, player.v);
        var boxes = [];
        neighbors.forEach(function (tile) {
            if (tile.type[0] === Tile.BOX)
                boxes.push(tile);
        });
        return boxes;
    };

    DomainGridHelper.prototype.isBoxOnTarget = function (box) {
        return this.grid.getBackground(box.u, box.v) === BackgroundTile.GOAL;
    };

    DomainGridHelper.prototype.isBoxNextToPlayer = function (box) {
        var neighbors = this.gridHelper.getNeighbors(box.u, box.v);
        return neighbors.length > 0 && neighbors.some(function (tile) {
                return tile.type[0] === Tile.PLAYER;
            });
    };

    DomainGridHelper.prototype.canPlayerMove = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (isNeighborOfPlayer) {
            var tileType = this.grid.get(u, v);
            return tileType === Tile.EMPTY;
        }
        return false;
    };

    DomainGridHelper.prototype.canPlayerPush = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (!isNeighborOfPlayer)
            return false;
        var isBox = this.grid.get(u, v)[0] === Tile.BOX;
        if (!isBox)
            return false;
        var tile;
        if (player.u < u) {
            tile = this.gridHelper.getRightNeighbor(u, v);
        } if (player.u > u) {
            tile = this.gridHelper.getLeftNeighbor(u, v);
        } if (player.v < v) {
            tile = this.gridHelper.getBottomNeighbor(u, v);
        } if (player.v > v) {
            tile = this.gridHelper.getTopNeighbor(u, v);
        }
        return tile.type === Tile.EMPTY;
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, Tile.EMPTY);
        this.grid.set(u, v, Tile.PLAYER);
        var change = {
            oldU: player.u,
            oldV: player.v,
            newU: u,
            newV: v,
            tile: player.type
        };
        player.u = u;
        player.v = v;

        return change;
    };

    DomainGridHelper.prototype.pushBox = function (box, deltaU, deltaV) {
        var newU = box.u + deltaU;
        var newV = box.v + deltaV;
        this.grid.set(newU, newV, box.type);
        var change = {
            oldU: box.u,
            oldV: box.v,
            newU: newU,
            newV: newV,
            tile: box.type
        };
        box.u = newU;
        box.v = newV;

        return change;
    };

    return DomainGridHelper;
})();