var SceneManager = (function () {
    "use strict";

    function SceneManager(scene) {
        this.scene = scene;
        this.todos = [];
    }

    SceneManager.prototype.update = function () {

        for (var i = this.todos.length - 1; i >= 0; i--) {
            var toAdd = this.todos[i];

            if (toAdd.duration < toAdd.time) {

                this.scene.add(toAdd.addable.item, toAdd.addable.path, toAdd.addable.ready);

                if (toAdd.ready)
                    toAdd.ready();

                this.todos.splice(i, 1);

            } else {
                toAdd.time++;
            }
        }
    };

    SceneManager.prototype.throttleAdd = function (itemToAdd, duration, callback) {
        this.todos.push({
            addable: itemToAdd,
            duration: duration,
            time: 0,
            ready: callback
        });
    };

    return SceneManager;
})();