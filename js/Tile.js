/**
 * Created by Kim on 2018-04-26.
 */
class Tile {

    constructor(row, col) {
        this.isRevealed = false;
        this.isBomb = false;
        this.isFlagged = false;
        this.isTrigger = false; //The bomb that triggered game over, to paint it red in the draw stage
        this.surroundingBombs = 5;
        this.row = row;
        this.col = col;
    }

    reveal(){
        this.isRevealed = true;
    }
    

    drawDefault(ctx, sprites){
        ctx.drawImage(sprites, 9 * 33, 0, 33, 33, this.col * 33, this.row * 33, 33, 33);
    }

    drawBomb(ctx, sprites){
        ctx.drawImage(sprites, 11*33, 0, 33, 33, this.col*33, this.row*33, 33,33);
    }

    drawFlag(ctx, sprites){
        ctx.drawImage(sprites, 10 * 33, 0, 33, 33, this.col * 33, this.row * 33, 33, 33);
    }

    drawMissedFlag(ctx, sprites){
        ctx.drawImage(sprites, 12*33, 33, 33, 33, this.col*33, this.row*33, 33,33);
    }

    drawNeighbours(ctx, sprites){
        ctx.drawImage(sprites, this.surroundingBombs * 33, 0, 33, 33, this.col * 33, this.row * 33, 33, 33);
    }

    drawTriggerBomb(ctx, sprites){
        ctx.drawImage(sprites, 12*33, 0, 33, 33, this.col*33, this.row*33, 33,33);
    }

    drawHover(ctx, sprites){
        if(!(this.isRevealed || this.isFlagged)) {
            ctx.drawImage(sprites, 0, 0, 33, 33, this.col * 33, this.row * 33, 33, 33);
        }
    }

}