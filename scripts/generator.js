function seedBombsDeterministically(startRow, startColumn) {
    solveBoard(startRow, startColumn);
}

function solverGetNumberOfUnknownNeighbors(solverCells, row, column) {
    let neighborUnknowns = 0;
    forAllNeighbors(row, column, neighborCell => {
        if(solverCells[neighborCell.row][neighborCell.column] === -2) neighborUnknowns++;
    });
    return neighborUnknowns;
}

function solverGetKnownBombNeighbors(solverCells, row, column) {
    let neighborBombs = 0;
    forAllNeighbors(row, column, neighborCell => {
        if(solverCells[neighborCell.row][neighborCell.column] === -1) neighborBombs++;
    });
    return neighborBombs;
}

function solverFlagAllUnknownNeighborsAsBombs(solverCells, row, column, todo) {
    forAllNeighbors(row, column, neighborCell => {
        if(solverCells[neighborCell.row][neighborCell.column] === -2) flagCell(solverCells, neighborCell.row, neighborCell.column, todo);
    });
}

function solverOpenAllUnknownNeighbors(solverCells, row, column, todo) {
    forAllNeighbors(row, column, neighborCell => {
        if(solverCells[neighborCell.row][neighborCell.column] === -2) solverOpenCell(solverCells, neighborCell.row, neighborCell.column, todo);
    });
}

function solverOpenCell(solverCells, row, column, todo) {
    solverCells[row][column] = getNeighboringBombs({ row: row, column: column });
    forAllNeighbors(row, column, neighborCell => todo.push([neighborCell.row, neighborCell.column]));
}

function solverFlagCell(solverCells, row, column, todo) {
    solverCells[row][column] = -1;
    forAllNeighbors(row, column, neighborCell => todo.push([neighborCell.row, neighborCell.column]));
}

function solveBoard(startRow, startColumn) {
    const solverCells = []; // -2 unknown, -1 confirmed bomb, 0 >= confirmed bomb count
    for(let row = 0; row < rows; row++) {
        solverCells.push([]);
        for(let column = 0; column < columns; column++) {
            solverCells[row].push(-2);
        }
    }

    solverCells[startRow][startColumn] = 0;
    const todo = [[startRow, startColumn]]; // list of (row, column) of cells to process
    while(todo.length !== 0) { // while we still have cells to process
        const [ row, column ] = todo[0];

        const numberOfBombs = solverCells[row][column];
        const numberOfUnknownNeighbors = solverGetNumberOfUnknownNeighbors(solverCells, row, column);
        const numberOfKnownBombNeighbors = solverGetKnownBombNeighbors(solverCells, row, column);

        // if a cell's number equals number of known bombs, non bombs are guaranteed free
        if(numberOfKnownBombNeighbors === numberOfBombs) {
            solverOpenAllUnknownNeighbors(solverCells, row, column, todo);
        }
        // if a cell's number equals number of unopened squares, they are guaranteed bombs
        if(numberOfUnknownNeighbors === numberOfBombs - numberOfKnownBombNeighbors) {
            solverFlagAllUnknownNeighborsAsBombs(solverCells, row, column, todo);
        }

        todo.shift(); // done processing this cell
    }

    // update onto screen our progress (for now lol)
    for(let row = 0; row < rows; row++) {
        for(let column = 0; column < columns; column++) {
            if(solverCells[row][column] === -1) toggleFlagForCell(row, column);
            else if(solverCells[row][column] >= 0) clickCell(row, column);
        }
    }
}

function seedBombsRandomly(startRow, startColumn) {
    firstClick = false; // it's not our first click anymore, huh
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

let seedBombs = seedBombsDeterministically;
