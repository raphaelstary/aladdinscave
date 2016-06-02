G.LevelOverview = (function (Width, Height, Event, Storage, Scenes, UI, Images, Font, Math, MVVMScene, GameScreen,
    loadBoolean, localStorage, wrap, add) {
    "use strict";

    function LevelOverview(services) {
        this.stage = services.stage;
        this.tap = services.tap;
        this.sceneStorage = services.sceneStorage;
        this.events = services.events;
        this.buttons = services.buttons;
        this.messages = services.messages;
        this.device = services.device;
        this.sounds = services.sounds;
        this.timer = services.timer;
        this.levels = services.levels;
        this.scenes = services.scenes;

        this.services = services;
    }

    LevelOverview.prototype.preDestroy = function () {
        this.drawables.forEach(function (drawable) {
            drawable.remove();
        });
        this.taps.forEach(this.tap.remove.bind(this.tap));
    };

    LevelOverview.prototype.postConstruct = function () {
        var self = this;

        function createLevelDrawable(levelNr) {
            var levelKey = levelNr < 10 ? '0' + levelNr : levelNr;
            var isUnlocked = loadBoolean(Storage.LEVEL_UNLOCKED + levelKey);
            var isUnlocking = loadBoolean(Storage.LEVEL_UNLOCKING + levelKey);
            var isFinished = loadBoolean(Storage.LEVEL_FINISHED + levelKey);
            var isFinishedNow = loadBoolean(Storage.LEVEL_FINISHED_NOW + levelKey);
            if (levelNr === 1)
                isUnlocked = true;

            var positionX = ((levelNr - 1) % 4) + 1;
            var xFn = Width.get(5, positionX);
            var yFn = Height.get(6, Math.ceil(levelNr / 4));
            var levelIcon;

            function getInputCallback(isUnlocked, levelNr) {
                return function () {
                    if (isUnlocked) {
                        var resume = self.stopScene();

                        self.events.fire(Event.ANALYTICS, {
                            type: 'level_start',
                            level: levelNr
                        });

                        var gameSceneModel = new GameScreen(self.services, self.services.levels[levelNr], levelNr);
                        var gameScreen = new MVVMScene(self.services, self.services.scenes[Scenes.GAME_SCREEN], gameSceneModel, Scenes.GAME_SCREEN);
                        gameScreen.show(resume);

                    } else {
                        // is locked
                    }
                };
            }

            function createLevelLogo(filled) {
                return self.stage.createImage(Images.LEVEL_BUTTON);
            }

            function addLabel(levelIcon, unlocked) {
                if (unlocked) {
                    var numberLabel = self.stage.createText(levelNr.toString())
                        .setPosition(wrap(levelIcon, 'x'), wrap(levelIcon, 'y'), [levelIcon]).setSize(Font._15)
                        .setFont(UI.FONT).setZIndex(4).setAlpha(0.75);
                    self.drawables.push(numberLabel);
                }

                var touchable = self.stage.createRectangle()
                    .setPosition(wrap(levelIcon, 'x'), wrap(levelIcon, 'y'), [levelIcon]).setWidth(Width.get(5))
                    .setHeight(Height.get(6));

                touchable.hide();

                self.tap.add(touchable, getInputCallback(isUnlocked, levelNr));
                self.drawables.push(levelIcon);
                self.drawables.push(touchable);
                self.taps.push(touchable);
            }

            if (isUnlocking) {
                localStorage.setItem(Storage.LEVEL_UNLOCKING + levelKey, false);

                // unlock animation

                levelIcon = createLevelLogo().setPosition(xFn, yFn);
                addLabel(levelIcon, isUnlocked);

            } else if (isUnlocked) {
                if (isFinishedNow) {
                    localStorage.setItem(Storage.LEVEL_FINISHED_NOW + levelKey, false);

                    // success animation
                    levelIcon = createLevelLogo(true).setPosition(xFn, yFn);
                    addLabel(levelIcon, isUnlocked);

                } else if (isFinished) {
                    levelIcon = createLevelLogo(true).setPosition(xFn, yFn);
                    addLabel(levelIcon, isUnlocked);

                } else {
                    // is unlocked
                    levelIcon = createLevelLogo().setPosition(xFn, yFn);
                    addLabel(levelIcon, isUnlocked);
                }
            } else {
                // is locked
                levelIcon = createLevelLogo().setPosition(xFn, yFn).setAlpha(0.25);
                addLabel(levelIcon, isUnlocked);
            }
        }

        this.taps = [];
        this.drawables = [];

        for (var i = 1; i <= 20; i++) {
            createLevelDrawable(i);
        }
    };

    LevelOverview.prototype.backDown = function () {

    };

    LevelOverview.prototype.backUp = function () {
        this.nextScene();
    };

    return LevelOverview;
})(H5.Width, H5.Height, H5.Event, G.Storage, G.Scenes, G.UI, G.Images, H5.Font, Math, H5.MVVMScene, G.GameScreen,
    H5.loadBoolean, H5.lclStorage, H5.wrap, H5.add);