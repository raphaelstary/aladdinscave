G.installPlayerKeyBoard = (function (Event, Key) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var upPressed = false;
        var downPressed = false;

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (keyBoard[Key.LEFT] && !leftPressed) {
                leftPressed = true;
                playerController.handleKeyLeft();
            } else if (!keyBoard[Key.LEFT] && leftPressed) {
                leftPressed = false;
            }

            if (keyBoard[Key.RIGHT] && !rightPressed) {
                rightPressed = true;
                playerController.handleKeyRight();
            } else if (!keyBoard[Key.RIGHT] && rightPressed) {
                rightPressed = false;
            }

            if (keyBoard[Key.UP] && !upPressed) {
                upPressed = true;
                playerController.handleKeyUp();
            } else if (!keyBoard[Key.UP] && upPressed) {
                upPressed = false;
            }

            if (keyBoard[Key.DOWN] && !downPressed) {
                downPressed = true;
                playerController.handleKeyDown();
            } else if (!keyBoard[Key.DOWN] && downPressed) {
                downPressed = false;
            }
        });
    }

    return installPlayerKeyBoard;
})(H5.Event, H5.Key);