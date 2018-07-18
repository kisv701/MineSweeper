function rref(A) {
    var rows = A.length;
    var columns = A[0].length;
    
    var lead = 0;
    for (var k = 0; k < rows; k++) {
        if (columns <= lead) return;
        
        var i = k;
        while (A[i][lead] === 0) {
            i++;
            if (rows === i) {
                i = k;
                lead++;
                if (columns === lead) return;
            }
        }
        var irow = A[i], krow = A[k];
        A[i] = krow, A[k] = irow;
         
        var val = A[k][lead];
        for (var j = 0; j < columns; j++) {
            A[k][j] /= val;
        }
         
        for (var i = 0; i < rows; i++) {
            if (i === k) continue;
            val = A[i][lead];
            for (var j = 0; j < columns; j++) {
                A[i][j] -= val * A[k][j];
            }
        }
        lead++;
    }
    return A;
};


//Given a matrix on row reduced echelor form this function will return a solved row which can be used to draw conculsions about the board.
function findSolvedRow(A){
    var rows = A.length;
    var columns = A[0].length;    

    for(var r=0; r < rows; r++){
        var total = A[r][columns-1];

        //Start off with easiest example, if we can say for sure that this is a bomb, row of style ... 0,0,1,0,0,1
        if(total >= 1){
            var foundOnes = 0;
            for(var c=columns-2; c >= 0; c--){
                if(A[r][c] === 1) foundOnes++;
            }
            if(foundOnes === total) return A[r];
        } else if(total == 0){
            //If we can say for sure that a square is safe, row of style ... 0,0,1,0,0,0
            var foundOnes = 0;
            var foundOthers = 0;
            for(var c=columns-2; c >= 0; c--){
                if(A[r][c] === 1) foundOnes++;
                if(A[r][c] !== 1 && A[r][c] !== 0) foundOthers++;
            }
            if(foundOnes === 1 && foundOthers === 0) return A[r];
        }
        
    }
    //TODO: Draw more conclucions from the row reduced matrix, such as 1 0 0 -1 0 1 would require x1 = (mine) and x4 = (not mine)
    // https://massaioli.wordpress.com/2013/01/12/solving-minesweeper-with-matricies/comment-page-1/
    return null;
}