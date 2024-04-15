function seedBombsDeterministically(startRow, startColumn) {
    determineBoard(startRow, startColumn);
}

// this function attempts to solve the board, moving mines if it can't
function determineBoard(startRow, startColumn) {
    let solved = false;
    while(!solved) {
        for(let row = 0; row < rows; row++) { // get rid of all bombs
            for(let column = 0; column < columns; column++) {
                cells[row][column].isBomb = false;
            }
        }
        seedBombsRandomly(startRow, startColumn); // add new bombs
        solved = solveBoard(startRow, startColumn); // can we solve it?
    }
}

function isBoardSolvable(startRow, startColumn) {
    return true;
}

function seedBombsRandomly(startRow, startColumn) {
    for(let i = 0; i < numberOfBombs; i++) { // generate numberOfBombs bombs
        let row, column;
        do {
            row = Math.floor(Math.random() * rows);
            column = Math.floor(Math.random() * columns);
        } while( // keep generating until we have a non bomb cell that's > 2 cells away from start
            cells[row][column].isBomb ||
            (Math.abs(row - startRow) <= 2 && Math.abs(column - startColumn) <= 2)
        );
        cells[row][column].isBomb = true;
    }
}

let seedBombs = (startRow, startColumn) => {
    firstClick = false;
    seedBombsRandomly(startRow, startColumn);
};
