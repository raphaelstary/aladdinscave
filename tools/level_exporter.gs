function onOpen() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuEntries = [
        {
            name: "Export Levels",
            functionName: "exportLevels"
        }
    ];
    ss.addMenu("Export JSON", menuEntries);
}

function makeTextBox(app, name) {
    return app.createTextArea().setWidth('100%').setHeight('200px').setId(name).setName(name);
}

function exportLevels() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var sheetsData = {};
    for (var i = 0; i < sheets.length; i++) {
        var sheet = sheets[i];
        var sheetName = sheet.getName();
        if (sheetName.indexOf('level') === 0) {
            sheetsData[sheetName.substring(5)] = getRows(sheet);
        }
    }
    return displayText_(JSON.stringify(sheetsData));
}

function displayText_(text) {
    var app = UiApp.createApplication().setTitle('Exported JSON');
    app.add(makeTextBox(app, 'json'));
    app.getElementById('json').setText(text);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ss.show(app);
    return app;
}

var boxCounter = 1;

var BackgroundTiles = {
    F: 'F',
    G: 'G'
};
var Tiles = {
    W: 'W',
    P: 'P',
    B: 'B'
};

var EventTrigger = {
    E1: 'E1',
    E2: 'E2'
};

function getRows(sheet) {
    var returnObject = {
        back: [],
        front: [],
        events: []
    };
    var values = sheet.getSheetValues(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());

    for (var i = 0; i < values.length; i++) {
        var row = values[i];
        var foregroundRow = [];
        var backgroundRow = [];
        var eventsRow = [];
        for (var j = 0; j < row.length; j++) {
            var cell = row[j];

            foregroundRow.push(getTileCode(cell));
            backgroundRow.push(getBackgroundTileCode(cell));
            eventsRow.push(getEventTriggerCode(cell));
        }
        returnObject.front.push(foregroundRow);
        returnObject.back.push(backgroundRow);
        returnObject.events.push(eventsRow)
    }
    return returnObject;
}

function getTileCode(cellValue) {
    for (var key in Tiles)
        if (contains(cellValue, key)) {
            var tile = Tiles[key];
            return tile === Tiles.B ? tile + boxCounter++ : tile;
        }
    return 0;
}

function getBackgroundTileCode(cellValue) {
    for (var key in BackgroundTiles)
        if (contains(cellValue, key))
            return BackgroundTiles[key];
    return 0;
}

function getEventTriggerCode(cellValue) {
    for (var key in EventTrigger)
        if (contains(cellValue, key))
            return EventTrigger[key];
    return 0;
}

function contains(cell, string) {
    return cell.indexOf(string) !== -1;
}