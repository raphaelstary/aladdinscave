G.installMyScenes = (function (SceneManager, MVVMScene, StartScreen, Scenes, TapManager, Event, LevelOverview) {
    "use strict";

    function installMyScenes(sceneServices) {
        // create your scenes and add them to the scene manager

        var tap = new TapManager();
        sceneServices.tap = tap;
        sceneServices.events.subscribe(Event.POINTER, tap.inputChanged.bind(tap));

        var sceneManager = new SceneManager();

        var startScreen = new MVVMScene(sceneServices, sceneServices.scenes[Scenes.START_SCREEN], new StartScreen(sceneServices), Scenes.START_SCREEN);

        var levelOverview = new MVVMScene(sceneServices, sceneServices.scenes[Scenes.LEVEL_OVERVIEW], new LevelOverview(sceneServices), Scenes.LEVEL_OVERVIEW);

        sceneManager.add(startScreen.show.bind(startScreen));
        sceneManager.add(levelOverview.show.bind(levelOverview));

        return sceneManager;
    }

    return installMyScenes;
})(H5.SceneManager, H5.MVVMScene, G.StartScreen, G.Scenes, H5.TapManager, H5.Event, G.LevelOverview);