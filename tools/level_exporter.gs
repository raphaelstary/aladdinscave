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
    F: 'F', // floor
    G: 'G', // goal
    S1: 'S1', // switch
    S2: 'S2', // switch
    S3: 'S3', // switch
    S4: 'S4', // switch
    S5: 'S5', // switch
    T: 'T', // trench
    D: 'D', // door
    R1: 'R1', // river
    R2: 'R2', // river
    R3: 'R3', // river
    R4: 'R4', // river
    R5: 'R5', // river
    R6: 'R6', // river
    R7: 'R7', // river
    R8: 'R8', // river
    R9: 'R9', // river
    R10: 'R10', // river
    R11: 'R11', // river
    R12: 'R12', // river
    R13: 'R13', // river
    R14: 'R14', // river
    RS1: 'RS1', // river switch
    RS2: 'RS2', // river switch
    RS3: 'RS3', // river switch
    RS4: 'RS4', // river switch
    RS5: 'RS5', // river switch
    RS6: 'RS6', // river switch
    RS7: 'RS7', // river switch
    RS8: 'RS8', // river switch
    RS9: 'RS9', // river switch
    RS10: 'RS10', // river switch
    RS11: 'RS11', // river switch
    RS12: 'RS12', // river switch
    RS13: 'RS13', // river switch
    RS14: 'RS14' // river switch
};
var Tiles = {
    W: 'W', // wall
    P: 'P', // player
    B: 'B', // box
    V: 'V', // vase
    F2L: 'F2L', // fire ball spawner 2 left
    F2R: 'F2R', // fire ball spawner 2 right
    F3L: 'F3L', // fire ball spawner 3 left
    F3R: 'F3R', // fire ball spawner 3 right
    AL: 'AL', // arrow trap left
    AR: 'AR' // arrow trap right

};

var EventTrigger = {
    E1: 'E1',
    E2: 'E2',
    E3: 'E3',
    E4: 'E4',
    E5: 'E5',
    E6: 'E6'
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
            var tileValues = cell.split(',');

            foregroundRow.push(getTileCode(tileValues));
            backgroundRow.push(getBackgroundTileCode(tileValues));
            eventsRow.push(getEventTriggerCode(tileValues));
        }
        returnObject.front.push(foregroundRow);
        returnObject.back.push(backgroundRow);
        returnObject.events.push(eventsRow)
    }
    return returnObject;
}

function getTileCode(cellValues) {
    for (var i = 0; i < cellValues.length; i++) {
        var cellValue = cellValues[i];
        for (var key in Tiles) {
            if (contains(cellValue, key)) {
                var tile = Tiles[key];
                return tile === Tiles.B ? tile + boxCounter++ : tile;
            }
        }
    }
    return 0;
}

function getBackgroundTileCode(cellValues) {
    for (var i = 0; i < cellValues.length; i++) {
        var cellValue = cellValues[i];
        for (var key in BackgroundTiles) {
            if (contains(cellValue, key))
                return BackgroundTiles[key];
        }
    }
    return 0;
}

function getEventTriggerCode(cellValues) {
    for (var i = 0; i < cellValues.length; i++) {
        var cellValue = cellValues[i];
        for (var key in EventTrigger) {
            if (contains(cellValue, key))
                return EventTrigger[key];
        }
    }
    return 0;
}

function contains(cell, string) {
    return cell.indexOf(string) !== -1;
}