G.GameScreen = (function (Height, Event, PlayFactory, zero, Width, Scenes, MVVMScene, DialogScreen, add, Math, Font,
    changeSign, Transition, installPlayerKeyBoard, FailureScreen, SuccessScreen, ScreenShaker) {
    "use strict";

    function GameScreen(services, level) {
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.timer = services.timer;

        this.scenes = services.scenes;
        this.level = level;
        this.services = services;

        this.abort = false;
        this.__paused = false;

        this.gameState = {
            undo: false
        };
    }

    GameScreen.prototype.__pause = function () {
        this.playerController.pause();
        this.__paused = true;
    };

    GameScreen.prototype.__resume = function () {
        this.world.resume();
        this.playerController.resume();
        this.__paused = false;
    };

    GameScreen.prototype.stepDown = function () {
        if (this.__paused)
            return;
    };

    GameScreen.prototype.stepUp = function () {
        if (this.__paused)
            return;

        this.gameState.undo = true;

        var self = this;
        if (!this.world.undoLastMove(function () {
                self.gameState.undo = false;
            }))
            this.shaker.startSmallShake();
    };

    GameScreen.prototype.pauseDown = function () {
        if (this.__paused)
            return;
    };

    GameScreen.prototype.pauseUp = function () {
        if (this.__paused)
            return;

        this.__pause();

        var dialogScreen = new MVVMScene(this.services, this.scenes[Scenes.DIALOG_SCREEN], new DialogScreen(this.services), Scenes.DIALOG_SCREEN);

        var self = this;
        this.timer.doLater(function () {
            dialogScreen.show(function (state) {
                if (state == 'abort') {
                    self.abort = true;

                    self.__showFailureOverlay(self.nextScene.bind(self));
                    return;
                }
                self.__resume();
            })
        }, this.sceneStorage.do30fps ? 15 : 30);
    };

    GameScreen.prototype.__showFailureOverlay = function (next) {
        this.__pause();

        var failureScreen = new MVVMScene(this.services, this.scenes[Scenes.FAILURE_SCREEN], new FailureScreen(this.services), Scenes.FAILURE_SCREEN);

        failureScreen.show(next);
    };

    GameScreen.prototype.__showSuccessOverlay = function (next) {
        this.__pause();

        var successScreen = new MVVMScene(this.services, this.scenes[Scenes.SUCCESS_SCREEN], new SuccessScreen(this.services), Scenes.SUCCESS_SCREEN);

        successScreen.show(next);
    };

    GameScreen.prototype.postConstruct = function () {
        this.__paused = false;
        this.abort = false;
        this.gameState = {
            undo: false
        };

        if (this.sceneStorage.abortGame) {
            this.nextScene();
            return;
        }

        var self = this;

        this.shaker = new ScreenShaker(self.device);
        this.shakerResizeId = self.events.subscribe(Event.RESIZE, this.shaker.resize.bind(this.shaker));
        this.shakerTickId = self.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
        this.shaker.__init(self.sceneStorage.do30fps);

        this.shaker.add(this.stepBack);

        function success() {
            self.__showSuccessOverlay(self.nextScene.bind(self));
        }

        function failure() {
            // log death
        }

        function moves() {
            // log moves
        }

        var topOffset = Height.get(1334, 300);

        this.world = PlayFactory.createWorld(this.stage, this.timer, this.device, this.level, success, failure, moves,
            topOffset, zero, this.sceneStorage.do30fps);

        self.world.init();

        this.playerController = PlayFactory.createPlayerController(this.world);
        this.pointerHandler = this.events.subscribe(Event.POINTER, function (pointer) {
            if (self.gameState.undo)
                return;
            if (pointer.y <= topOffset(self.device.screenHeight))
                return;

            if (pointer.type == 'down')
                self.playerController.handlePointerDown(pointer.x, pointer.y);
            if (pointer.type == 'up')
                self.playerController.handlePointerUp(pointer.x, pointer.y);
            if (pointer.type == 'move')
                self.playerController.handlePointerMove(pointer.x, pointer.y);
        });

        this.keyBoardHandler = installPlayerKeyBoard(this.events, this.playerController, this.gameState);
    };

    GameScreen.prototype.preDestroy = function () {
        if (this.sceneStorage.abortGame) {
            this.sceneStorage.abortGame = false;

            if (!this.abort)
                return;
        }

        this.events.unsubscribe(this.pointerHandler);
        this.events.unsubscribe(this.keyBoardHandler);
        this.events.unsubscribe(this.shakerTickId);
        this.events.unsubscribe(this.shakerResizeId);

        this.world.worldView.preDestroy();
    };

    return GameScreen;
})(H5.Height, H5.Event, G.PlayFactory, H5.zero, H5.Width, G.Scenes, H5.MVVMScene, G.DialogScreen, H5.add, Math, H5.Font,
    H5.changeSign, H5.Transition, G.installPlayerKeyBoard, G.FailureScreen, G.SuccessScreen, H5.ScreenShaker);