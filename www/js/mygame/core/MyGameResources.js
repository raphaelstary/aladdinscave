G.MyGameResources = (function (AtlasResourceHelper, DeviceInfo, userAgent, resolveAtlasPaths, Files, width, height,
    addFontToDOM, URL, UI) {
    "use strict";

    // your files
    var scenes, levels, atlases = [], font;

    function registerFiles(resourceLoader) {
        // add your files to the resource loader for downloading
        var isMobile = new DeviceInfo(userAgent, 1, 1, 1).isMobile;
        AtlasResourceHelper.register(resourceLoader, atlases, isMobile, resolveAtlasPaths);

        levels = resourceLoader.addJSON(Files.LEVELS);
        scenes = resourceLoader.addJSON(Files.SCENES);
        font = resourceLoader.addFont(Files.GAME_FONT);

        return resourceLoader.getCount(); // number of registered files
    }

    function processFiles() {
        // process your downloaded files

        if (URL) {
            addFontToDOM([
                {
                    name: UI.FONT,
                    url: URL.createObjectURL(font.blob)
                }
            ]);
        }

        return {
            // services created with downloaded files
            gfxCache: AtlasResourceHelper.process(atlases, width, height),
            levels: levels,
            scenes: scenes
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(H5.AtlasResourceHelper, H5.DeviceInfo, window.navigator.userAgent, G.resolveAtlasPaths, G.Files, window.innerWidth,
    window.innerHeight, H5.addFontToDOM, window.URL || window.webkitURL, G.UI);