G.StartScreen = (function () {
    "use strict";

    function StartScreen() {
    }

    StartScreen.prototype.startDown = function () {
    };

    StartScreen.prototype.startUp = function () {
        this.nextScene();
    };

    return StartScreen;
})();