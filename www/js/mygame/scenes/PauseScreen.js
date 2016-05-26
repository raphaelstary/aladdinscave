G.PauseScreen = (function (PauseReturnValue) {
    "use strict";

    function PauseScreen(services) {
    }

    PauseScreen.prototype.resumeDown = function () {
    };

    PauseScreen.prototype.resumeUp = function () {
        this.nextScene(PauseReturnValue.RESUME);
    };

    PauseScreen.prototype.restartDown = function () {
    };

    PauseScreen.prototype.restartUp = function () {
        this.nextScene(PauseReturnValue.RESTART);
    };

    PauseScreen.prototype.exitDown = function () {
    };

    PauseScreen.prototype.exitUp = function () {
        this.nextScene(PauseReturnValue.CANCEL);
    };

    return PauseScreen;
})(G.PauseReturnValue);