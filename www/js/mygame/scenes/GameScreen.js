G.GameScreen = (function (Height, Event, PlayFactory, zero, Width, Scenes, MVVMScene, PauseScreen, add, Math, Font,
    changeSign, Transition, installPlayerKeyBoard, SuccessScreen, ScreenShaker, PauseReturnValue, Storage,
    localStorage, loadBoolean) {
    "use strict";

    function GameScreen(services, level, levelNr) {
        this.device = services.device;
        this.events = services.events;
        this.sceneStorage = services.sceneStorage;
        this.stage = services.stage;
        this.timer = services.timer;

        this.scenes = services.scenes;
        this.level = level;
        this.levelNr = levelNr;
        this.services = services;

        this.abort = false;
        this.__paused = false;
        this.__itIsOver = false;

        this.gameState = {
            undo: false
        };
    }

    GameScreen.prototype.__pause = function () {
        this.playerController.pause();
        this.__paused = true;
    };

    GameScreen.prototype.__resume = function () {
        this.playerController.resume();
        this.__paused = false;
    };

    GameScreen.prototype.stepDown = function () {
        if (this.__paused)
            return;
        if (this.__itIsOver)
            return;
    };

    GameScreen.prototype.stepUp = function () {
        if (this.__paused)
            return;
        if (this.__itIsOver)
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
        if (this.__itIsOver)
            return;
    };

    GameScreen.prototype.pauseUp = function () {
        if (this.__paused)
            return;
        if (this.__itIsOver)
            return;

        this.__pause();

        var pauseScene = new MVVMScene(this.services, this.services.scenes[Scenes.PAUSE_SCREEN], new PauseScreen(this.services), Scenes.PAUSE_SCREEN);
        var self = this;
        pauseScene.show(function (state) {
            if (state == PauseReturnValue.RESUME) {
                self.__resume();
            } else if (state == PauseReturnValue.RESTART) {
                self.restartScene();
            } else if (state == PauseReturnValue.CANCEL) {
                self.__itIsOver = true;
                self.nextScene();
            } else {
                throw 'internal error: unhandled code branch';
            }
        });
    };

    GameScreen.prototype.__showSuccessOverlay = function (next) {
        this.__pause();
        var successScreen = new MVVMScene(this.services, this.scenes[Scenes.SUCCESS_SCREEN], new SuccessScreen(this.services), Scenes.SUCCESS_SCREEN);

        successScreen.show(next);
    };

    GameScreen.prototype.postConstruct = function () {
        this.__paused = false;
        this.__itIsOver = false;
        this.abort = false;
        this.gameState = {
            undo: false
        };

        if (this.sceneStorage.abortGame) {
            this.__itIsOver = true;
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
            self.__itIsOver = true;

            var levelNr = self.levelNr;
            var levelKey = levelNr < 10 ? '0' + levelNr : levelNr;
            var nextLevelNr = levelNr + 1;
            var nextLevelKey = nextLevelNr < 10 ? '0' + nextLevelNr : nextLevelNr;
            var isUnlocked = loadBoolean(Storage.LEVEL_UNLOCKED + nextLevelKey);
            var isFinished = loadBoolean(Storage.LEVEL_FINISHED + levelKey);

            if (!isUnlocked) {
                localStorage.setItem(Storage.LEVEL_UNLOCKED + nextLevelKey, true);
                localStorage.setItem(Storage.LEVEL_UNLOCKING + nextLevelKey, true);
            }
            if (!isFinished) {
                localStorage.setItem(Storage.LEVEL_FINISHED + levelKey, true);
                localStorage.setItem(Storage.LEVEL_FINISHED_NOW + levelKey, true);
            }

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

        self.world.init(function () {
            self.__resume();
        });

        this.playerController = PlayFactory.createPlayerController(this.world);
        this.__pause();
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
})(H5.Height, H5.Event, G.PlayFactory, H5.zero, H5.Width, G.Scenes, H5.MVVMScene, G.PauseScreen, H5.add, Math, H5.Font,
    H5.changeSign, H5.Transition, G.installPlayerKeyBoard, G.SuccessScreen, H5.ScreenShaker, G.PauseReturnValue,
    G.Storage, H5.lclStorage, H5.loadBoolean);