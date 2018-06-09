/**
 * Created by Kim on 2018-04-25.
 */
//import MineSweeper from './MineSweeper.js'
let sprites = new Image();
let setting = 'Easy';

sprites.onload = function createGame(){
    let gameCanvas = document.getElementById("screen"),
        bombCanvas = document.getElementById("bombsLeft"),
        timeCanvas = document.getElementById("timer"),
        smileyCanvas = document.getElementById("smileyFace"),
        aiSelector = document.getElementById("ai"),
        aiControlPanel = document.getElementById("controlPanelAI"),
        aiHistoryOutput = document.getElementById("historyAI"),
        difficultySelector = document.getElementById("difficulty");

    let gameCtx = gameCanvas.getContext("2d");
    let bombCtx = bombCanvas.getContext("2d");
    let timeCtx = timeCanvas.getContext("2d");
    let smileCtx = smileyCanvas.getContext("2d");

    bombCanvas.width = 24.5*3; //24.5 pixels per number, 3 numbers
    bombCanvas.height = 45;
    timeCanvas.width = 24.5*3; //24.5 pixels per number, 3 numbers
    timeCanvas.height = 45;
    smileyCanvas.width = 64;
    smileyCanvas.height = 66;

    let leftButtonDown = false;
    let rightButtonDown = false;
    let ai = undefined;

    let game = new MineSweeper(gameCanvas, setting, timeCanvas, bombCanvas, smileyCanvas);
    game.setSprites(sprites);
    game.draw(gameCtx);
    game.drawBombsLeft(bombCtx);
    game.drawTimer(timeCtx);
    game.drawSmiley(smileCtx, 'happy');
    //Add event listeners
    smileyCanvas.addEventListener("mouseup", (event) => {
        game.drawSmiley(smileCtx, 'happy');
        game.restartGame();
        aiHistoryOutput.innerHTML = "";
        game.draw(gameCtx);
    });

    smileyCanvas.addEventListener("mousedown", (event) => {
        game.drawSmiley(smileCtx, 'down');
    });

    gameCanvas.addEventListener('mousedown', (event) => {
        if(event.button == 0){
            leftButtonDown = true;
        } else if(event.button == 2){
            rightButtonDown = true;
        }

        if(leftButtonDown && rightButtonDown && !game.gameOver){
            let col = Math.floor(event.layerX / gameCanvas.width * game.cols);
            let row = Math.floor(event.layerY / gameCanvas.height * game.rows);
            let neighbours = MineSweeper.getNeighbours((row == 0), (row == game.rows - 1), (col == 0), (col == game.cols - 1));
            for(let neighbour of neighbours) {
                let r = row + neighbour[0],
                    c = col + neighbour[1];
                let n = game.grid[r][c];
                n.drawHover(gameCtx, sprites);
            }
        }

        if(!game.gameOver)
            game.drawSmiley(smileCtx, 'oface');
    });

    gameCanvas.addEventListener('mouseup', (event) => {
        event.preventDefault();

        let col = Math.floor(event.layerX / gameCanvas.width * game.cols);
        let row = Math.floor(event.layerY / gameCanvas.height * game.rows);

        if(event.button == 0){
            leftButtonDown = false;
        } else if(event.button == 2){
            rightButtonDown = false;
        }

        if (game.gameOver) {
            return;
        }

        let winner = false;
        if (leftButtonDown || rightButtonDown){
            winner = game.doubleClickTile(row,col);
        } else {
            winner = game.clickTile(row,col,event.button);
        }

        if (game.gameOver) {
            if (winner) {
                game.drawSmiley(smileCtx, 'shades');
            } else {
                game.drawSmiley(smileCtx, 'dead');
            }
        } else {
            game.drawSmiley(smileCtx, 'happy');
        }
        game.draw(gameCtx);
        game.drawBombsLeft(bombCtx);
        game.drawTimer(timeCtx);
    });

    setInterval(function(){
        if(!game.gameOver)
            game.drawTimer(timeCtx);
    }, 500);

    difficultySelector.addEventListener("input", () => {
        setting = difficultySelector.value;
        game = new MineSweeper(gameCanvas, setting, timeCanvas, bombCanvas, smileyCanvas);
        window.game = game;
        game.setSprites(sprites);
        game.draw(gameCtx);
        game.drawBombsLeft(bombCtx);
        game.drawTimer(timeCtx);
        game.drawSmiley(smileCtx, 'happy');
    });

    aiSelector.addEventListener("input", () => {
        let selectedAI = aiSelector.value;

        if (selectedAI == 'none'){
            aiControlPanel.style.display = "none";
        } else {
            aiControlPanel.style.display = "block";
            if(selectedAI == 'rule') {
                ai = new RuleBased();
                aiHistoryOutput.innerHTML = "RuleBased AI: ";
            }
            

        }

    });

    window.game = game;
    return game;
};
sprites.src = './assets/minesweeper_sprites.png';
