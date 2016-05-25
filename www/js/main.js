window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.pointer().responsive().keyBoard().build(G.MyGameResources, G.installMyScenes);
    app.start();
};