/**
 * Created by Kim on 2018-05-22.
 */

class RuleBased{
    constructor(){

        //Using properties instead of return statements to save amount of garbage generated
        this.row = 0;
        this.col = 0;
        this.button = 0;

        setInterval(() => {
            this.makeMove();
        }, 100);

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
                        console.log("Flagging... Row: " + this.row + " , Col: " + this.col);
                        return true;
                    } else if(adjDefaults > 0  && adjBombs == adjFlags) {
                        //If all adjacent default tiles are safe, click them.
                        this.row = defaults[0][0];
                        this.col = defaults[0][1];
                        this.button = 0;
                        console.log("Clicking... Row: " + this.row + " , Col: " + this.col);
                        return true;
                    }
                }
            }
        }

        return false;

    }

    /**
     *
     *
     */
    applyRuleTwo(){
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
        console.log("Guessing... Row: " + this.row + " , Col: " + this.col);
    }
}