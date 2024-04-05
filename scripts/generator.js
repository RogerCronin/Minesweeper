function seedBombsDeterministically(startRow, startColumn) {
    seedBombsRandomly(startRow, startColumn);
    solveBoard(startRow, startColumn);
}

function solverGetNeighboringBombs(solverCells, row, column) {
    let neighboringBombs = 0;
    forAllNeighbors(row, column, neighborCell => {
        if(solverCells[neighborCell.row][neighborCell.column].value === -1) neighboringBombs++;
    });
    return neighboringBombs;
}

function solverOpenCell(solverCells, row, column, todo) {
    const cell = solverCells[row][column];
    if(solverCells.value !== -2) return;
    cell.value = getNeighboringBombs({ row: row, column: column });
    cell.constraints.clear();
    forAllNeighbors(row, column, neighborCell => todo.push([neighborCell.row, neighborCell.column].toString()));
}

function solverFlagCell(solverCells, row, column, todo) {
    const cell = solverCells[row][column];
    if(solverCells.value !== -2) return;
    cell.value = -1;
    cell.constraints.clear();
    forAllNeighbors(row, column, neighborCell => todo.push([neighborCell.row, neighborCell.column].toString()));
}

function solveBoard(startRow, startColumn) {
    const solverCells = [];
    for(let row = 0; row < rows; row++) {
        solverCells.push([]);
        for(let column = 0; column < columns; column++) {
            solverCells[row].push({
                value: -2, // -2 unknown, -1 confirmed bomb, 0 >= confirmed bomb count
                constraints: new Set()
            });
            forAllNeighbors(row, column, neighborCell => {
                if(neighborCell.row === row && neighborCell.column === column) return;
                solverCells[row][solverCells[row].length - 1].constraints.add([neighborCell.row, neighborCell.column].toString());
            });
        }
    }

    solverCells[startRow][startColumn].value = 0;
    const todo = [[startRow, startColumn]]; // list of (row, column) of cells to process
    while(todo.length !== 0) { // while we still have cells to process
        const [ row, column ] = todo[0];

        console.log(`Processing [${row}, ${column}]`);

        const solverCell = solverCells[row][column];

        // update constraints
        forAllNeighbors(row, column, neighborCell => {
            const solverNeighbor = solverCells[neighborCell.row][neighborCell.column];
            if(solverNeighbor.value === -2) return;
            solverCell.constraints.delete([neighborCell.row, neighborCell.column].toString()); // remove from constraints
        });

        console.log(`Value: ${solverCell.value}, Constraints Size: ${solverCell.constraints.size}, Neighboring Bombs: ${solverGetNeighboringBombs(solverCells, row, column)}`);

        // numer of bombs is equal to number of neighbors
        if(solverCell.value === solverCell.constraints.size) {
            console.log("All constraints are bombs");
            for(const neighborCell of solverCell.constraints) {
                const coords = JSON.parse(`[${neighborCell}]`);
                solverFlagCell(solverCells, coords[0], coords[1]);
            }
            solverCell.constraints.clear();
        }
        
        // number of bombs is equal to number of neighbor flags
        if(solverCell.value === solverGetNeighboringBombs(solverCells, row, column)) {
            console.log("All constraints are safe");
            for(const neighborCell of solverCell.constraints) {
                const coords = JSON.parse(`[${neighborCell}]`);
                solverOpenCell(solverCells, coords[0], coords[1]);
            }
        }

        todo.shift(); // done processing this cell
    }

    // update onto screen our progress (for now lol)
    for(let row = 0; row < rows; row++) {
        for(let column = 0; column < columns; column++) {
            if(solverCells[row][column].value === -1) toggleFlagForCell(row, column);
            else if(solverCells[row][column].value >= 0) clickCell(row, column);
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

let seedBombs = (startRow, startColumn) => {
    firstClick = false;
    seedBombsDeterministically(startRow, startColumn);
}
