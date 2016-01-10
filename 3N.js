/// <reference path="jquery.d.ts" />
/*
Configuration settings for the app
*/
var Config = (function () {
    function Config() {
        this.numberOfObjects = 5;
        this.rows = 10;
        this.columns = 10;
        this.easy = true;
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
        var elem = document.createElement("div");
        elem.classList.add("cell");
        elem.setAttribute("data-value", "" + this.value);
        elem.setAttribute("data-column", "" + this.point.y);
        elem.setAttribute("data-row", "" + this.point.x);
        elem.innerText = "" + this.value;
        if (this.clicked) {
            elem.classList.add("clicked");
        }
        var className = "";
        if (this.value === 1) {
            className = "one";
        }
        else if (this.value === 2) {
            className = "two";
        }
        else if (this.value === 3) {
            className = "three";
        }
        else if (this.value === 4) {
            className = "four";
        }
        else if (this.value === 5) {
            className = "five";
        }
        elem.classList.add(className);
        /*        var e : string = "<div class='cell' data-value='" + this.value + "' data-column='" + this.point.x + "' data-row='" + this.point.y + "'>" + this.value + "</div>";*/
        //hack to get inner html as string
        var wrap = document.createElement("div");
        wrap.appendChild(elem.cloneNode(true));
        return wrap.innerHTML;
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
        this.score = 0;
        //Populate board
        this.initialiseCells();
        this.draw();
        var that = this; //cache current Board object for on-click method
        //Set on-click
        $(".cell").click(function () {
            var clickedCells = $(".clicked");
            var element = $(this);
            that.processSelect(clickedCells, element);
        });
    }
    Board.prototype.processSelect = function (clickedCells, element) {
        var p = this.getPoint(element);
        if (this.cells[p.x][p.y].clicked) {
            element.toggleClass("clicked");
            this.cells[p.x][p.y].clicked = false;
            return;
        }
        else if (clickedCells.length === 0) {
            element.toggleClass("clicked");
            this.cells[p.x][p.y].clicked = true;
        }
        else if (clickedCells.length === 1) {
            var adjacentCells = this.findAdjacentCells(p);
            var selected = null;
            for (var i = 0; i < adjacentCells.length; i++) {
                if (adjacentCells[i].clicked) {
                    element.toggleClass("clicked");
                    this.cells[p.x][p.y].clicked = true;
                    if (!this.settings.easy) {
                    }
                    //Perform swap on model
                    var points = [];
                    clickedCells = $(".clicked"); //refresh clicked list
                    for (var i = 0; i < clickedCells.length; i++) {
                        points.push(this.getPointHtml(clickedCells[0]));
                        points.push(this.getPointHtml(clickedCells[1]));
                    }
                    var tmp0 = this.getCell(points[0]);
                    var tmp1 = this.getCell(points[1]);
                    this.cells[tmp0.point.x][tmp0.point.y] = tmp1;
                    this.cells[tmp1.point.x][tmp1.point.y] = tmp0;
                    this.draw();
                }
            }
        }
    };
    Board.prototype.getPoint = function (element) {
        return new Point(parseInt(element.attr("data-row")), parseInt(element.attr("data-column")));
    };
    Board.prototype.getPointHtml = function (element) {
        return new Point(parseInt(element.attributes.getNamedItem("data-row").value), parseInt(element.attributes.getNamedItem("data-column").value));
    };
    Board.prototype.initialiseCells = function () {
        var tmp = null;
        var validateDirections = [this.directions.up, this.directions.left];
        for (var row = 0; row < this.settings.rows; row++) {
            this.cells[row] = [];
            for (var column = 0; column < this.settings.columns; column++) {
                var v = getRandomInt(1, this.settings.numberOfObjects);
                tmp = new Cell(row, column, v);
                var matches = this.getMatches(tmp, validateDirections);
                while (matches.length > 0) {
                    tmp.value = getRandomInt(1, this.settings.numberOfObjects);
                    matches = this.getMatches(tmp, validateDirections);
                }
                this.cells[row][column] = tmp;
            }
        }
    };
    Board.prototype.draw = function () {
        //Add html
        var inner = "";
        for (var row = 0; row < this.settings.rows; row++) {
            inner = inner + "<div class='row' id='row" + row + "'>";
            for (var column = 0; column < this.settings.columns; column++) {
                inner = inner + this.cells[row][column].element();
            }
            inner = inner + "</div>";
        }
        this.element.innerHTML = inner;
    };
    Board.prototype.findAdjacentCells = function (p) {
        var adjacentCells = [];
        var matchDirections = [this.directions.up, this.directions.down, this.directions.left, this.directions.right];
        var cell = this.getCell(p);
        var functions = this.getDirectionFunctions(cell, matchDirections);
        for (var i = 0; i < functions.length; i++) {
            var p1 = functions[i](1);
            adjacentCells.push(this.getCell(p1));
        }
        return adjacentCells;
    };
    Board.prototype.getDirectionFunctions = function (c, dir) {
        //Get candidates in specified directions (if in range) 
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
        return functions;
    };
    Board.prototype.getMatches = function (c, dir) {
        var matches = [];
        //Evaluate matches 
        var functions = this.getDirectionFunctions(c, dir);
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
        gameStart: "Start!",
        calculating: "Calculating"
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
