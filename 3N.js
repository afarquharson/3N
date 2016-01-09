/// <reference path="jquery.d.ts" />
/*
Configuration settings for the app
*/
var Config = (function () {
    function Config() {
        this.numberOfObjects = 5;
        this.rows = 10;
        this.columns = 10;
    }
    return Config;
})();
var Point = (function () {
    function Point(eks, why) {
        this.x = eks;
        this.y = why;
    }
    Point.prototype.up = function (n) {
        return new Point(this.x - n, this.y);
    };
    Point.prototype.down = function (n) {
        return new Point(this.x + n, this.y);
    };
    Point.prototype.left = function (n) {
        return new Point(this.x, this.y - n);
    };
    Point.prototype.right = function (n) {
        return new Point(this.x, this.y + n);
    };
    return Point;
})();
/*
A cell on the board
*/
var Cell = (function () {
    function Cell(r, c, v) {
        this.point = new Point(r, c);
        this.value = v;
    }
    Cell.prototype.element = function () {
        return "<span id='" + this.point.x + "," + this.point.y + "'>" + this.value + "</span>";
    };
    return Cell;
})();
/*
The game board
*/
var Board = (function () {
    function Board(config, e) {
        this.playerTurn = false;
        this.directions = { up: 0, down: 1, left: 2, right: 3 };
        this.settings = config;
        this.cells = [];
        this.element = e;
        //Populate board
        var cell = null;
        var validateDirections = [this.directions.up, this.directions.left];
        for (var row = 0; row < this.settings.rows; row++) {
            this.cells[row] = [];
            this.element.innerHTML = this.element.innerHTML + "<div id='row" + row + "'>";
            for (var column = 0; column < this.settings.columns; column++) {
                var v = getRandomInt(1, this.settings.numberOfObjects);
                cell = new Cell(row, column, v);
                var matches = this.getMatches(cell, validateDirections);
                while (matches.length > 0) {
                    cell.value = getRandomInt(1, this.settings.numberOfObjects);
                    matches = this.getMatches(cell, validateDirections);
                }
                this.cells[row][column] = cell;
                this.element.innerHTML = this.element.innerHTML + cell.element();
            }
            this.element.innerHTML = this.element.innerHTML + "</div>";
        }
    }
    Board.prototype.getMatches = function (c, dir) {
        var matches = [];
        //Evaluate matches 
        var functions = [];
        for (var i = 0; i < dir.length; i++) {
            if (dir[i] === this.directions.up && c.point.x > 1) {
                functions.push(c.point.up.bind(c.point));
            }
            else if (dir[i] === this.directions.down && c.point.x < this.settings.rows - 1) {
                functions.push(c.point.down.bind(c.point));
            }
            else if (dir[i] === this.directions.left && c.point.y > 1) {
                functions.push(c.point.left.bind(c.point));
            }
            else if (dir[i] === this.directions.right && c.point.y < this.settings.columns - 1) {
                functions.push(c.point.right.bind(c.point));
            }
        }
        for (var i = 0; i < functions.length; i++) {
            var p1 = functions[i](1);
            var p2 = functions[i](2);
            var first = this.getCell(p1);
            var second = this.getCell(p2);
            if (this.isMatch(c.value, first, second)) {
                matches.push(first);
                matches.push(second);
            }
        }
        return matches;
    };
    Board.prototype.isMatch = function (original, candidateOne, candidateTwo) {
        if (candidateOne.value === original) {
            if (candidateTwo.value === original) {
                return true;
            }
        }
        return false;
    };
    Board.prototype.getCell = function (p) {
        return this.cells[p.x][p.y];
    };
    return Board;
})();
/*
Run the game
*/
var Game = (function () {
    function Game() {
        this.state = Game.gameState.begin;
        this.updateStatus(Game.msgs.gameStart);
        this.board = new Board(new Config(), $("#board")[0]);
    }
    Game.prototype.updateStatus = function (msg) {
        $("#status").slideUp('fast', function () {
            $(this).text(msg).slideDown('fast'); // Then slide in the new text
        });
    };
    Game.gameState = { begin: 0, playerTurn: 1, processTurn: 2, finished: 3 };
    Game.msgs = {
        gameStart: "Start!"
    };
    return Game;
})();
/*
http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range 9-01-2016
*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
$(new Function("var game = new Game();"));
