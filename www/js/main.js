window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.pointer().responsive().build(G.MyGameResources, G.installMyScenes);
    app.start();
};