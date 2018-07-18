/**
 * Created by Kim on 2018-05-22.
 */

class RuleBased{
    constructor(){

        //Using properties instead of return statements to save amount of garbage generated
        this.row = 0;
        this.col = 0;
        this.button = 0;

        let interval = setInterval(() => {

            if(!window.ai) clearInterval(interval);

            this.makeMove();
            if(window.game){
                if(window.game.gameOver){
                    window.game.restartGame();
                } else {
                    if(window.game.exportData){
                        if(Math.random() > 0.7){
                            let board = window.game.exportGameState();
                            let target = window.game.exportTargetState();
                            let url = 'http://localhost:3333/?board=' + board + '&target=' + target;
                            let xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function() {
                              if (this.readyState == 4 && this.status == 200) {
                                console.log('Server: ', this.responseText);
                              }
                            };
                            xhttp.open('GET', url, true);
                            xhttp.send();
                            console.log('Sening..');
                        }
                    }

                }
            }
        }, 20);

    }


    parseGameState(){

        let textLines = window.game.exportGameState().split(',');

        //Extract data about the game
        this.gameWon = Boolean(textLines[textLines.length-2] === '1');
        this.gameOver = Boolean(textLines[textLines.length-1]=== '1');
        this.timeElapsed = Number(textLines[textLines.length-3]);
        this.bombsLeft = Number(textLines[textLines.length-4]);

        //Extract game field
        this.grid =  new Array(textLines.length-4).fill(0).map(x => new Array(textLines[0].length).fill(0));

        for(let i=0; i < this.grid.length; i++){
            for(let j=0; j < this.grid[0].length; j++){
                this.grid[i][j] = textLines[i].charAt(j);
            }
        }

        this.rows = this.grid.length;
        this.cols = this.grid[0].length;

    }

    makeMove(){
        this.parseGameState();
        if(!this.gameOver) {
            this.selectAction();
            window.game.clickTile(this.row, this.col, this.button);
        }
        window.ai = this;
    }

    selectAction(){
            if(!this.applyRuleOne()){
                if(!this.applyRuleTwo()){
                    this.applyRandomGuessing();
                }
            }
        }

    //Generates the neighbours one should iterate over to check all neighbours in the grid.
    getNeighbours(row, col){
        let isTop = (row == 0),
            isBottom = (row == this.rows - 1),
            isLeft = (col == 0),
            isRight = (col == this.cols - 1);
        let neighbours = [[-1, -1], [-1, 0],[-1, 1],[0, -1],[0, 1],[1, -1], [1, 0],[1, 1]];
        //            [ -1,-1    -1, 0   -1, 1 ]
        // neighbours [ 0, -1             0, 1 ]
        //            [ 1, -1     1, 0    1, 1 ]


        //IF is top row, removes neightbours above
        if(isTop) {
            neighbours = neighbours.filter(function (e) {
                return e[0] !== -1
            })
        }

        if(isBottom){
            neighbours = neighbours.filter(function (e) {
                return e[0] !== 1
            })
        }

        if(isLeft){
            neighbours = neighbours.filter(function (e) {
                return e[1] !== -1
            })
        }

        if(isRight){
            neighbours = neighbours.filter(function (e) {
                return e[1] !== 1
            })
        }

        neighbours.forEach(e => {
            e[0] += row;
            e[1] += col;
        });
        return neighbours;
    }

    /**
     * If number on tile minus adjacent F's is the same as number of adjacent D's
     * then all surrounding D's are bombs
     *
     * if number on tile equals adjacent flags all bombs are flagged, safe to click
     *
     * If all adjacent default tiles are bombs, flag them.
     * If all adjacent default tiles are safe, click them.
     */
    applyRuleOne(){
        for(let r=0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if(!(this.grid[r][c] == 'D' || this.grid[r][c] == 'F' || this.grid[r][c] == '0')){
                    let neigh = this.getNeighbours(r,c);
                    let adjBombs = Number(this.grid[r][c]);
                    let adjFlags = 0;
                    let adjDefaults = 0;
                    let defaults = [];
                    for(let i=0; i < neigh.length; i++){
                        let current = this.grid[neigh[i][0]][neigh[i][1]];
                        if(current == 'F'){
                            adjFlags += 1;
                        } else if(current == 'D'){
                            adjDefaults += 1;
                            defaults.push(neigh[i])
                        }
                    }

                    if(adjDefaults > 0 && adjDefaults == (adjBombs - adjFlags)){
                        //If all adjacent default tiles are bombs, flag them.
                        this.row = defaults[0][0];
                        this.col = defaults[0][1];
                        this.button = 2;
                        //console.log("Flagging... Row: " + this.row + " , Col: " + this.col);
                        return true;
                    } else if(adjDefaults > 0  && adjBombs == adjFlags) {
                        //If all adjacent default tiles are safe, click them.
                        this.row = defaults[0][0];
                        this.col = defaults[0][1];
                        this.button = 0;
                        //console.log("Clicking... Row: " + this.row + " , Col: " + this.col);
                        return true;
                    }
                }
            }
        }

        return false;

    }

    /**
     * Generate an equation system that can be solved using rref
     * Each row of the system contains information gained from one square, i.e adj squares.
     * TODO: ADD equation all D's == Bombs left for end game tactic!
     */
    applyRuleTwo(){
        let matrix = [];
        let report = [];
        matrix.push(Array.apply(null, Array(this.rows*this.cols+1)).map(Number.prototype.valueOf,0)); //Push initial equation all D's == Bombs left
        matrix[0][matrix[0].length-1] = this.bombsLeft;
        for(let r=0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if(!(this.grid[r][c] == 'D' || this.grid[r][c] == 'F' || this.grid[r][c] == '0')){
                    let neigh = this.getNeighbours(r,c);
                    let adjBombs = Number(this.grid[r][c]);
                    let adjFlags = 0;
                    let defaults = [];

                    //Counter number of adjecent flags and save potential bomb locations
                    for(let i=0; i < neigh.length; i++){
                        let current = this.grid[neigh[i][0]][neigh[i][1]];
                        if(current == 'F'){
                            adjFlags += 1;
                        } else if(current == 'D'){
                            defaults.push(neigh[i])
                        }
                    }
                    
                    if(adjBombs > adjFlags){
                        //Initialize row with all zeros
                        matrix.push(Array.apply(null, Array(this.rows*this.cols+1)).map(Number.prototype.valueOf,0));
                        for(let i = 0; i < defaults.length; i++){
                            //Take most recent entry (i.e associated with current hint) and sett all adjDefaults corresponding to 1.
                            matrix[matrix.length-1][defaults[i][0]*this.cols+defaults[i][1]] = 1;
                            report.push("" + matrix.length-1 + ": (" + (defaults[i][0]) + " , " + (defaults[i][1]) + ") => " + (defaults[i][0]*this.cols+defaults[i][1]) + " = 1");
                        }
                        //Grab lower right value in matrix and set it to number of bombs to find.
                        matrix[matrix.length-1][matrix[matrix.length-1].length-1] = adjBombs - adjFlags;
                    }
                } else if(this.grid[r][c] == 'D'){
                    //Add to first row, lets think a bit more about this equation...
                    //TODO: Think a bit more about how this works out..
                    matrix[0][r*this.cols + c] = 1;
                }
            }
        }
        if(matrix.length > 1){

            rref(matrix);

            let solvedRow = findSolvedRow(matrix);
            if(solvedRow){
                for(let index = 0; index < solvedRow.length-1; index++){
                    if (solvedRow[index] === 1){
                        //console.log("USING RULE 2!!!!!!")
                        this.row = (index / this.cols | 0)
                        this.col = index % this.cols
                        this.button = 2 * Math.sign(solvedRow[solvedRow.length-1]);
                        //report.forEach(item => console.log(item));
                        //console.log("rref: ", matrix);
                        //console.log(this.row, this.col, (this.button) ? "Flag" : "Klick");
                        //console.log(solvedRow);
                        return true;

                    }
                };
            }
    }
        return false;
    }
    applyRandomGuessing() {
        let coveredC = [], coveredR = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c] == 'D') { //D for default
                    coveredR.push(r);
                    coveredC.push(c);
                }
            }
        }

        this.row = coveredR[(coveredR.length * Math.random() | 0)];
        this.col = coveredC[(coveredC.length * Math.random() | 0)];
        this.button = 0;
        //console.log("Guessing... Row: " + this.row + " , Col: " + this.col);
    }

    
}