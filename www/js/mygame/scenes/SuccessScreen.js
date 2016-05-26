G.SuccessScreen = (function () {
    "use strict";

    function SuccessScreen(services) {
        this.timer = services.timer;
        this.sceneStorage = services.sceneStorage;
    }

    SuccessScreen.prototype.postConstruct = function () {
        var __60 = this.sceneStorage.do30fps ? 30 : 60;
        this.timer.doLater(this.nextScene.bind(this), __60);
    };

    return SuccessScreen;
})();