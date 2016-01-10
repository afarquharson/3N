/// <reference path="jquery.d.ts" />

/*
Configuration settings for the app
*/

class Config {
    numberOfObjects : number;
    rows : number;
    columns : number;
    easy : boolean;
    constructor() {
        this.numberOfObjects = 5;
        this.rows = 10;
        this.columns = 10;
        this.easy = true;
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
    clicked : boolean;
    
    constructor(r : number, c : number, v : number) {
        this.point = new Point(r, c);
        this.value = v;
    }
    
    element() {
        var elem : HTMLElement = document.createElement("div");
        elem.classList.add("cell");
        elem.setAttribute("data-value", "" + this.value);
        elem.setAttribute("data-column", "" + this.point.y);
        elem.setAttribute("data-row", "" + this.point.x);
        elem.innerText = "" + this.value;
        
        if (this.clicked) {
            elem.classList.add("clicked");
        }
        
        var className : string = "";
        if (this.value === 1) {
            className = "one";
        } else if (this.value === 2) {
            className = "two";
        } else if (this.value === 3) {
            className = "three";
        } else if (this.value === 4) {
            className = "four";
        } else if (this.value === 5) {
            className = "five";
        }
        elem.classList.add(className);
        
/*        var e : string = "<div class='cell' data-value='" + this.value + "' data-column='" + this.point.x + "' data-row='" + this.point.y + "'>" + this.value + "</div>";*/
        
        //hack to get inner html as string
        var wrap = document.createElement("div");
        wrap.appendChild(elem.cloneNode(true));
        return wrap.innerHTML;
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
    score : number;
    
    constructor(config : Config, e : HTMLElement) {
        this.settings = config;
        this.cells = [];
        this.element = e;
        this.score = 0;
        
        //Populate board
        this.initialiseCells();
        this.draw();
        
        var that : Board = this; //cache current Board object for on-click method
        
        //Set on-click
        $(".cell").click(function() {
            var clickedCells : JQuery = $(".clicked");
            var element : JQuery = $(this);
            that.processSelect(clickedCells, element);
        })
    }
    
    processSelect(clickedCells : JQuery, element : JQuery) {
        var p : Point = this.getPoint(element)
        
        if (this.cells[p.x][p.y].clicked) { 
            element.toggleClass("clicked");
            this.cells[p.x][p.y].clicked = false;
            return;
        
        } else if (clickedCells.length === 0 ) {
            element.toggleClass("clicked");
            this.cells[p.x][p.y].clicked = true;
        
        } else if (clickedCells.length === 1) {
            var adjacentCells : Cell[] = this.findAdjacentCells(p);
            var selected : Cell = null;
            for(var i = 0; i < adjacentCells.length; i++) {
                if (adjacentCells[i].clicked) {
                    element.toggleClass("clicked");
                    this.cells[p.x][p.y].clicked = true;
                    
                    if (!this.settings.easy) {
                        //Validate swap  
                    }
                    
                    //Perform swap on model
                    var points : Point[] = [];
                    clickedCells = $(".clicked"); //refresh clicked list
                    for (var i = 0; i < clickedCells.length; i++) {
                        points.push(this.getPointHtml(clickedCells[0]));
                        points.push(this.getPointHtml(clickedCells[1]));
                    }
                    var tmp0 : Cell = this.getCell(points[0]);
                    var tmp1 : Cell = this.getCell(points[1]);
                    this.cells[tmp0.point.x][tmp0.point.y] = tmp1;
                    this.cells[tmp1.point.x][tmp1.point.y] = tmp0;
                    
                    this.draw();
                    
                    //Process match
                }
            }
    
        }
    }
    
    getPoint(element : JQuery) {
        return new Point(parseInt(element.attr("data-row")), parseInt(element.attr("data-column")));
    }
    
    getPointHtml(element : HTMLElement) {
        return new Point(parseInt(element.attributes.getNamedItem("data-row").value), parseInt(element.attributes.getNamedItem("data-column").value));
    }
    
    initialiseCells() {
        var tmp : Cell = null;
        var validateDirections : number[] = [this.directions.up, this.directions.left];
        for (var row : number = 0; row < this.settings.rows; row++) {
            this.cells[row] = [];
            for (var column : number = 0; column < this.settings.columns; column++) {
                var v : number = getRandomInt(1, this.settings.numberOfObjects);
                tmp = new Cell(row, column, v);
                var matches : Cell[] = this.getMatches(tmp, validateDirections);
                while (matches.length > 0) {
                    tmp.value = getRandomInt(1, this.settings.numberOfObjects);
                    matches = this.getMatches(tmp, validateDirections);
                }
                this.cells[row][column] = tmp;
            }
        }
    }
    
    draw() {
        //Add html
        var inner : string = "";
        for (var row : number = 0; row < this.settings.rows; row++) {
            inner = inner + "<div class='row' id='row" + row + "'>";
            for (var column : number = 0; column < this.settings.columns; column++) {
                inner = inner + this.cells[row][column].element();
            }
            inner = inner + "</div>";
        }
        this.element.innerHTML = inner;
    }
    
    findAdjacentCells(p : Point) {
        var adjacentCells : Cell[] = [];
        
        var matchDirections : number[] = [this.directions.up, this.directions.down, this.directions.left, this.directions.right];
        
        var cell : Cell = this.getCell(p);
        
        var functions : Function[] = this.getDirectionFunctions(cell, matchDirections);
        
        for(var i = 0; i < functions.length; i++) {
            var p1 : Point = functions[i](1);
            adjacentCells.push(this.getCell(p1));  
        }
        
        return adjacentCells;
    }
    
    getDirectionFunctions(c : Cell, dir : number[]) {
        //Get candidates in specified directions (if in range) 
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
        return functions;
    }
    
    getMatches(c : Cell, dir : number[]) {
        var matches : Cell[] = [];
        //Evaluate matches 
        var functions : Function[] = this.getDirectionFunctions(c, dir);
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
        gameStart: "Start!",
        calculating: "Calculating"
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