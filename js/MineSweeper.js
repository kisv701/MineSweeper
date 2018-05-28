/**
 * Created by Kim on 2018-04-25.
 */
//import Tile from './Tile.js'

class MineSweeper {
     
    constructor(canvas, mode, timeCanvas, bombCanvas, smileyCanvas) {
        const settings = {Easy: [8 ,8, 10],
            Intermediate: [16,16, 40],
            Expert: [16, 30, 99]};

        //Size and game field
        this.rows = settings[mode][0];
        this.cols = settings[mode][1];
        this.width = this.cols*33;
        this.height = this.rows*33;
        canvas.width = this.width;
        canvas.height = this.height;
        this.ctx = canvas.getContext("2d");
        this.timeCtx = timeCanvas.getContext("2d");
        this.bombCtx = bombCanvas.getContext("2d");
        this.smileyCtx = smileyCanvas.getContext("2d");

        this.sprites = undefined; 
        this.bombCount = settings[mode][2];
        this.revealedTiles = 0;
        this.bombsLeft = this.bombCount;
        this.timeStarted = new Date().getTime();

        this.restartGame();
    }


     /**
      * Checks the grid and assigns each tile the amount of adjacent bombs.
      */
     assignNeighbours(){

         for (let i = 0; i < this.rows; i++) {
             for (let j = 0; j < this.cols; j++) {

                 if(this.grid[i][j].isBomb){
                     this.grid[i][j].surroundingBombs = -1;
                     continue;
                 }
                 let neighbours = MineSweeper.getNeighbours((i == 0), (i == this.rows-1), (j == 0), (j == this.cols-1));

                 //debugger;
                 let counter = 0;
                 for(let neighbour of neighbours){
                     let dr = neighbour[0];
                     let dc = neighbour[1];
                     if(this.grid[i+dr][j+dc].isBomb){
                         counter++;
                     }
                 }
                 this.grid[i][j].surroundingBombs = counter;
             }
         }
     }

     //Returns true if clicked tile resulted in a win
     clickTile(row, col, button){
         //If left mouse button
         if (button == 0){
             if(this.grid[row][col].isBomb && !this.grid[row][col].isFlagged){
                 this.grid[row][col].isTrigger = true;
                 this.gameOver = true;
                 this.drawSmiley(this.smileyCtx, 'dead')
             }
             this.revealTile(row, col);

         } else if(button == 2 && !this.grid[row][col].isRevealed){
             this.flagTile(row,col);

         }
         if (this.gameWon()){
             this.gameOver = true;
             this.draw();
             this.drawSmiley(this.smileyCtx, 'shades');
             return true;
         }
         this.draw();
         this.drawBombsLeft();
         return false;
     }

     draw(ctx = this.ctx){
         for (let i = 0; i < this.rows; i++) {
             for (let j = 0; j < this.cols; j++) {

                 let tile = this.grid[i][j];
                 //Grab current tile, lots of nestled if-statements to
                 // draw correct image.

                 if(tile.isBomb) {
                     //TILE IS A BOMB
                     if(tile.isFlagged) {
                         tile.drawFlag(ctx, this.sprites);
                         continue;
                     }
                     if(this.gameOver && !this.gameWon()){
                         if (tile.isTrigger){
                             tile.drawTriggerBomb(ctx, this.sprites);
                         } else {
                             tile.drawBomb(ctx, this.sprites);
                         }
                     } else {
                         tile.drawDefault(ctx,this.sprites);
                         }
                 } else {
                     //Tile is not a bomb
                     if(this.gameOver && tile.isFlagged){
                         tile.drawMissedFlag(ctx,this.sprites);
                         continue;
                     }

                     if(tile.isFlagged){
                         tile.drawFlag(ctx,this.sprites);
                         continue;
                     }

                     if(tile.isRevealed){
                         tile.drawNeighbours(ctx, this.sprites);
                     } else {
                         tile.drawDefault(ctx, this.sprites);
                     }
                 }

             }
         }
     }



     drawBombsLeft(ctx = this.bombCtx){
         let w = 24.5, h = 45;

         let hundreds = (this.bombsLeft / 100 | 0), tens = ((this.bombsLeft-hundreds*100) / 10 | 0), singles = (this.bombsLeft % 10);
         ctx.drawImage(this.sprites, w*hundreds, 33, w, h, 0, 0, w, h);
         ctx.drawImage(this.sprites, w*tens, 33, w, h, w, 0, w,h);
         ctx.drawImage(this.sprites, w*singles, 33, w, h, 2*w, 0, w,h);

     }

     drawSmiley(ctx = this.smileyCtx, state = 'happy'){
         let w = 64, h = 66;
         switch(state) {
             case 'happy':
                 ctx.drawImage(this.sprites, 0, (33+45), w, h, 0, 0, w, h);
                 break;
             case 'dead':
                 ctx.drawImage(this.sprites, 3*w, (33+45), w, h, 0, 0, w, h);
                 break;
             case 'shades':
                 ctx.drawImage(this.sprites, w, (33+45), w, h, 0, 0, w, h);
                 break;
             case 'oface':
                 ctx.drawImage(this.sprites, 2*w, (33+45), w, h, 0, 0, w, h);
                 break;
             case 'down':
                 ctx.drawImage(this.sprites, 4*w, (33+45), w, h, 0, 0, w, h);
                 break;
             
         }
         
         
     }
     drawTimer(ctx = this.timeCtx){
         let seconds = ((new Date().getTime() - this.timeStarted)/1000 | 0);
         let w = 24.5, h = 45;
         let hundreds = (seconds/100 | 0), tens = ((seconds - hundreds*100)/10 | 0), singles = seconds % 10;

         if(hundreds > 9){
             hundreds = tens = singles = 9;
         }

         ctx.drawImage(this.sprites, w*hundreds, 33, w, h, 0, 0, w,h);
         ctx.drawImage(this.sprites, w*tens, 33, w, h, w, 0, w,h);
         ctx.drawImage(this.sprites, w*singles, 33, w, h, 2*w, 0, w,h);
     }

     //Opens surrounding tiles if all surrounding bombs are flagged
     doubleClickTile(row, col){

         let tile = this.grid[row][col];
         if(tile.isRevealed){
             let neighbours = MineSweeper.getNeighbours((row == 0), (row == this.rows - 1), (col == 0), (col == this.cols - 1));
             let flaggedNeighbours = 0;
             for(let neighbour of neighbours){
                 let r = row + neighbour[0],
                     c = col + neighbour[1];
                 if (this.grid[r][c].isFlagged){
                     flaggedNeighbours++;
                 }
             }

             let winner = false;
             if(flaggedNeighbours == tile.surroundingBombs){
                 for(let neighbour of neighbours){
                     let r = row + neighbour[0],
                         c = col + neighbour[1];
                     if (!this.grid[r][c].isFlagged){
                         winner = winner || this.clickTile(r,c, 0);
                     }
                 }
             }
             return winner;
         }
     }

     flagTile(row,col){
         if(this.grid[row][col].isFlagged){
             this.bombsLeft++;
         } else {
             this.bombsLeft--;
         }
         this.grid[row][col].isFlagged = !this.grid[row][col].isFlagged;
     }

     gameWon(){
         let hasUnflaggedBombs = false;
         let hasTrigger = false;
         this.revealedTiles = 0;
         for (let i = 0; i < this.rows; i++) {
             for (let j = 0; j < this.cols; j++) {
                 let tile = this.grid[i][j];
                 if(tile.isBomb && !tile.isFlagged){
                     hasUnflaggedBombs = true;
                 }
                 if (tile.isRevealed){
                     this.revealedTiles++;
                 }
                 if(tile.isTrigger){
                     hasTrigger = true;
                 }
             }
         }

         //console.log("R: " + revealedCounter + ", tiles: " + (this.rows*this.cols) + ", bombs: " + this.bombCount);
         return !hasTrigger && (this.revealedTiles == (this.rows*this.cols)-this.bombCount);
     }

     /**
      * Places numberOfBombs on the grip at random places.
      * @param numberOfBombs, number of bombs to be used in the game
      */
     placeBombs(numberOfBombs){
         let tileCount = this.rows*this.cols;
         let bombIndices = [];
         while(bombIndices.length < numberOfBombs){
             let randomIndex = Math.floor(Math.random()*tileCount);
             if(bombIndices.indexOf(randomIndex) > -1) continue;
             bombIndices[bombIndices.length] = randomIndex;
         }

         for(let bombIndex of bombIndices){
             let j = Math.floor(bombIndex/this.rows);
             let i = bombIndex % this.rows;
             this.grid[i][j].isBomb = true;
         }
     }

     restartGame(){
         this.grid =  new Array(this.rows).fill(0).map(x => new Array(this.cols).fill(0));
         for (let i = 0; i < this.rows; i++) {
             for (let j = 0; j < this.cols; j++) {
                 this.grid[i][j] = new Tile(i, j);
             }
         }

         this.gameOver = false;
         this.placeBombs(this.bombCount);
         this.assignNeighbours();
         this.timeStarted = new Date().getTime();
         this.revealedTiles = 0;
         this.bombsLeft = this.bombCount;

     }
     revealTile(row,col) {
         let tile = this.grid[row][col];
         if (tile.isFlagged) {
             return;
         }
         tile.reveal();

         //If empty tile open all surrounding tiles
         if (tile.surroundingBombs == 0) {
             let neighbours = MineSweeper.getNeighbours((row == 0), (row == this.rows - 1), (col == 0), (col == this.cols - 1));
             for (let neighbour of neighbours) {
                 let r = row + neighbour[0],
                     c = col + neighbour[1];
                 //If adjacent tile already isRevealed don't reveal again
                 if (!this.grid[r][c].isRevealed) {
                     this.revealTile(r, c);
                 }
             }
         }

         //if bomb GAME OVER
         if (tile.isBomb) {
             this.gameOver = true;
         }
     }
    
     setSprites(sprites){
         this.sprites = sprites;
     }

     // Returns the current state of the game-field so that an AI can interpret it.
     // Each row of the gamefield followed by bombs left, followed by time elapsed,
    // followed by game won and finally game over.
    // Row1, Row2, Row3, ... RowEnd, BombsLeft, TimeElapsed, GameWon, GameOver
     exportGameState(){
         let gameString = "";

         for(let r=0; r < this.rows; r++){
             for(let c=0; c < this.cols; c++){

                 let charRepresentation = '';
                 let tile = this.grid[r][c];

                 if(tile.isFlagged){
                     charRepresentation = 'F'; // F for flagged
                 } else if(!tile.isRevealed) {
                     charRepresentation = 'D'; // D for default
                 } else if(tile.isBomb) {
                     charRepresentation = 'B'; // B for default
                 } else {
                     charRepresentation = '' + tile.surroundingBombs;
                 }
                 gameString += charRepresentation;
             }
             gameString += ','
         }

         let hundreds = (this.bombsLeft / 100 | 0), tens = ((this.bombsLeft-hundreds*100) / 10 | 0), singles = (this.bombsLeft % 10);
         gameString += String(hundreds) + String(tens) + String(singles) + ",";
         let seconds = ((new Date().getTime() - this.timeStarted)/1000 | 0);
         hundreds = (seconds/100 | 0); tens = ((seconds - hundreds*100)/10 | 0); singles = seconds % 10;
         gameString += String(hundreds) + String(tens) + String(singles)+ "," +  String(Number(this.gameWon())) + "," + String(Number(this.gameOver));
         return gameString;
     }


     //Generates the neighbours one should iterate over to check all neighbours in the grid.
     static getNeighbours(isTop, isBottom, isLeft, isRight) {
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
         return neighbours;
     }


}