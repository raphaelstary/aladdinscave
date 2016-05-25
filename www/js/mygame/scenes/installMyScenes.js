G.installMyScenes = (function (SceneManager, GameScreen, MVVMScene, StartScreen, Scenes, EndScreen) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var sceneManager = new SceneManager();

        var startScreen = new MVVMScene(sceneServices, sceneServices.scenes[Scenes.START_SCREEN], new StartScreen(sceneServices), Scenes.START_SCREEN);
        var gameSceneModel = new GameScreen(sceneServices, sceneServices.levels[1]);
        var gameScreen = new MVVMScene(sceneServices, sceneServices.scenes[Scenes.GAME_SCREEN], gameSceneModel, Scenes.GAME_SCREEN);
        var endScreen = new MVVMScene(sceneServices, sceneServices.scenes[Scenes.END_SCREEN], new EndScreen(sceneServices), Scenes.END_SCREEN);

        sceneManager.add(startScreen.show.bind(startScreen));
        sceneManager.add(gameScreen.show.bind(gameScreen));
        sceneManager.add(endScreen.show.bind(endScreen));

        return sceneManager;
    }

    return installMyScenes;
})(H5.SceneManager, G.GameScreen, H5.MVVMScene, G.StartScreen, G.Scenes, G.EndScreen);