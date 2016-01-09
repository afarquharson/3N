/// <reference path="jquery.d.ts" />

/*
Configuration settings for the app
*/

class Config {
    numberOfObjects : number;
    rows : number;
    columns : number;
    constructor() {
        this.numberOfObjects = 5;
        this.rows = 10;
        this.columns = 10;
    }
}

class Point {
    x : number;
    y : number;
    constructor(eks : number, why : number) {
        this.x = eks;
        this.y = why;
    }
    
    up(n : number) {
        return new Point(this.x -n, this.y);
    }
    down(n : number) {
        return new Point(this.x+n, this.y);
    }
    left(n : number) {
        return new Point(this.x, this.y-n);
    }
    right(n : number) {
        return new Point(this.x, this.y+n);
    }  
}

/*
A cell on the board
*/
class Cell {
    point : Point;
    value: number;
    
    constructor(r : number, c : number, v : number) {
        this.point = new Point(r, c);
        this.value = v;
    }
    
    element() {
        return "<span id='" + this.point.x + "," + this.point.y + "'>" + this.value + "</span>"
    }
}

/*
The game board
*/
class Board {
    settings : Config;
    cells : Cell[][];
    element : HTMLElement;
    playerTurn = false;
    directions = {up:0, down:1, left:2, right:3};
    
    constructor(config : Config, e : HTMLElement) {
        this.settings = config;
        this.cells = [];
        this.element = e;
        
        //Populate board
        var cell : Cell = null;
        var validateDirections : number[] = [this.directions.up, this.directions.left];
        for (var row : number = 0; row < this.settings.rows; row++) {
            this.cells[row] = [];
            this.element.innerHTML = this.element.innerHTML + "<div id='row" + row + "'>";
            for (var column : number = 0; column < this.settings.columns; column++) {
                var v : number = getRandomInt(1, this.settings.numberOfObjects);
                cell = new Cell(row, column, v);
                var matches : Cell[] = this.getMatches(cell, validateDirections);
                while (matches.length > 0) {
                    cell.value = getRandomInt(1, this.settings.numberOfObjects);
                    matches = this.getMatches(cell, validateDirections);
                }
                this.cells[row][column] = cell;
                this.element.innerHTML = this.element.innerHTML + cell.element();
            }
            this.element.innerHTML = this.element.innerHTML + "</div>"
        }
    }
    
    getMatches(c : Cell, dir : number[]) {
        var matches : Cell[] = [];
        
        //Evaluate matches 
        var functions : Function[] = [];
        for (var i = 0; i < dir.length; i++) {
            if (dir[i] === this.directions.up && c.point.x > 1) {
                functions.push(c.point.up.bind(c.point));
            } else if (dir[i] === this.directions.down && c.point.x < this.settings.rows - 1) {
                functions.push(c.point.down.bind(c.point));
            } else if (dir[i] === this.directions.left && c.point.y > 1) {
                functions.push(c.point.left.bind(c.point));
            } else if (dir[i] === this.directions.right && c.point.y < this.settings.columns - 1) {
                functions.push(c.point.right.bind(c.point));
            }
        }
        
        for(var i = 0; i < functions.length; i++) {
            var p1 : Point = functions[i](1);
            var p2 : Point = functions[i](2);
            var first : Cell = this.getCell(p1);
            var second : Cell = this.getCell(p2);
            
            if (this.isMatch(c.value, first, second)) {
                matches.push(first);
                matches.push(second);
            }
        }
        
        return matches;
    }

    isMatch(original: number, candidateOne : Cell, candidateTwo : Cell) {
        if (candidateOne.value === original) {
            if (candidateTwo.value === original) {
                return true;
            }
        }
        return false;
    }
    
    getCell(p : Point) {
        return this.cells[p.x][p.y];
    }
}

/*
Run the game
*/
class Game {
    static gameState = {begin: 0, playerTurn: 1, processTurn: 2, finished: 3};
    static msgs = {
        gameStart: "Start!"
    }
    
    state : number = Game.gameState.begin;
    board : Board;
    
    constructor() {
        this.updateStatus(Game.msgs.gameStart);
        this.board = new Board(new Config(), $("#board")[0]);
    }
    
    updateStatus(msg : string) {
        $("#status").slideUp('fast', function () {  // Slide out the old text
            $(this).text(msg).slideDown('fast');  // Then slide in the new text
        });
    }
}

/*
http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range 9-01-2016
*/
function getRandomInt (min : number, max : number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(new Function("var game = new Game();"));