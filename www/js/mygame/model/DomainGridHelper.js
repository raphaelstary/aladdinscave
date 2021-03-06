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
        GOAL: 'G',
        SWITCH: 'S',
        DOOR: 'D',
        OPEN_DOOR: 'O',
        HIDDEN_GOAL: 'H'
    };

    var Tile = {
        WALL: 'W',
        BOX: 'B',
        PLAYER: 'P',
        EMPTY: 0
    };

    var History = {
        NEW: 'new',
        CHANGED: 'changed',
        REMOVED: 'removed'
    };

    var Interaction = {
        USER: 'user',
        GRAVITY: 'gravity',
        PUSH: 'push',
        REMOVE: 'remove'
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

    DomainGridHelper.prototype.getSwitches = function () {
        return this.__getTiles(BackgroundTile.SWITCH, true);
    };

    DomainGridHelper.prototype.getDoors = function () {
        return this.__getTiles(BackgroundTile.DOOR, true);
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

    // todo: remove. this is already in core in a newer version of H5.js
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

    DomainGridHelper.prototype.isPlayerOnGoal = function (player) {
        return this.grid.getBackground(player.u, player.v) === BackgroundTile.GOAL;
    };
    
    DomainGridHelper.prototype.isEntityOnSwitch = function (entity) {
        return this.grid.getBackground(entity.u, entity.v)[0] === BackgroundTile.SWITCH;
    };

    DomainGridHelper.prototype.canPlayerMove = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (isNeighborOfPlayer) {
            var tileType = this.grid.get(u, v);
            return tileType === Tile.EMPTY && this.__isMovable(this.grid.getBackground(u, v));
        }
        return false;
    };

    DomainGridHelper.prototype.__isMovable = function (backgroundTileType) {
        return backgroundTileType === BackgroundTile.FLOOR || backgroundTileType === BackgroundTile.GOAL ||
            backgroundTileType[0] === BackgroundTile.SWITCH || backgroundTileType[0] === BackgroundTile.OPEN_DOOR;
    };

    DomainGridHelper.prototype.canPlayerPush = function (player, u, v) {
        var isNeighborOfPlayer = this.gridHelper.isNeighbor(player.u, player.v, u, v);
        if (!isNeighborOfPlayer)
            return false;
        var isBox = this.grid.get(u, v)[0] === Tile.BOX;
        if (!isBox)
            return false;
        var tile;
        var backgroundTile;
        if (player.u < u) {
            tile = this.gridHelper.getRightNeighbor(u, v);
            backgroundTile = this.gridHelper.getBackgroundRightNeighbor(u, v);
        }
        if (player.u > u) {
            tile = this.gridHelper.getLeftNeighbor(u, v);
            backgroundTile = this.gridHelper.getBackgroundLeftNeighbor(u, v);
        }
        if (player.v < v) {
            tile = this.gridHelper.getBottomNeighbor(u, v);
            backgroundTile = this.gridHelper.getBackgroundBottomNeighbor(u, v);
        }
        if (player.v > v) {
            tile = this.gridHelper.getTopNeighbor(u, v);
            backgroundTile = this.gridHelper.getBackgroundTopNeighbor(u, v);
        }
        return tile && tile.type === Tile.EMPTY && backgroundTile && backgroundTile.type === BackgroundTile.FLOOR;
    };

    DomainGridHelper.prototype.movePlayer = function (player, u, v) {
        this.grid.set(player.u, player.v, Tile.EMPTY);
        this.grid.set(u, v, Tile.PLAYER);
        var change = {
            oldU: player.u,
            oldV: player.v,
            newU: u,
            newV: v,
            tile: player.type,
            type: History.CHANGED
        };
        player.u = u;
        player.v = v;

        return {
            type: Interaction.USER,
            entity: player,
            change: change
        };
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
            tile: box.type,
            type: History.CHANGED
        };
        box.u = newU;
        box.v = newV;

        return {
            type: Interaction.PUSH,
            entity: box,
            change: change
        };
    };

    DomainGridHelper.prototype.undoChange = function (change, entity) {
        if (change.type != History.REMOVED && change.type != History.NEW) {
            if (change.tile === this.grid.get(change.newU, change.newV))
                this.grid.set(change.newU, change.newV, Tile.EMPTY);

            entity.u = change.oldU;
            entity.v = change.oldV;
        }
        this.grid.set(change.oldU, change.oldV, change.tile);
    };

    return DomainGridHelper;
})();