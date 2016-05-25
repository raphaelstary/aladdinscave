G.PlayFactory = (function (Grid, GridHelper, GridViewHelper, DomainGridHelper, World, WorldView, PlayerController) {

    "use strict";

    return {
        createWorld: function (stage, timer, device, level, successCallback, failureCallback, movesCallback, topOffset,
            bottomOffset, is30fps) {
            var grid = new Grid(level);
            var gridHelper = new GridHelper(grid, grid.xTiles, grid.yTiles);
            var gridViewHelper = new GridViewHelper(stage, device, grid.xTiles, grid.yTiles, topOffset, bottomOffset);
            var domainGridHelper = new DomainGridHelper(gridHelper, grid, grid.xTiles, grid.yTiles);
            var worldView = new WorldView(stage, timer, gridViewHelper, is30fps);
            return new World(worldView, grid, gridHelper, domainGridHelper, gridViewHelper, successCallback, failureCallback, movesCallback);
        },
        createPlayerController: function (world) {
            return new PlayerController(world, world.gridViewHelper, world.gridHelper, world.worldView);
        }
    };
})(H5.Grid, H5.GridHelper, H5.GridViewHelper, G.DomainGridHelper, G.World, G.WorldView, G.PlayerController);