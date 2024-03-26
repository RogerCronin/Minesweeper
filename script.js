const content = document.getElementById("content");
const cellSize = parseInt(getComputedStyle(content).getPropertyValue("--cell-size"));
const bombDensity = 0.1;

const rows = Math.floor(window.innerHeight / cellSize);
const columns = Math.floor(window.innerWidth / cellSize);
const numberOfBombs = Math.floor(rows * columns * bombDensity);

const cells = [];

for(let row = 0; row < rows; row++) {
    const rowDiv = document.createElement("div");

    rowDiv.classList.add("row");

    cells.push([]);
    for(let column = 0; column < columns; column++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        cell.isBomb = Math.random() < bombDensity;
        cell.isMarked = false;
        cell.isFlagged = false;
        cell.neighboringBombs = 0;

        cell.addEventListener("click", () => clickCell(row, column));
        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            toggleFlagForCell(row, column);
        });

        rowDiv.appendChild(cell);
        cells[cells.length - 1].push(cell);
    }

    content.appendChild(rowDiv);
}

// lmao
for(let row = 0; row < rows; row++) {
    for(let column = 0; column < columns; column++) {
        const cell = cells[row][column];
        forAllNeighbors(row, column, (neighborCell) => {
            if(neighborCell.isBomb) cell.neighboringBombs++;
        });
    }
}

function forAllNeighbors(row, column, logic) {
    for(let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for(let columnOffset = -1; columnOffset <= 1; columnOffset++) {
            const neighborRow = row + rowOffset;
            const neighborColumn = column + columnOffset;

            if(
                neighborRow < 0 || neighborRow >= cells.length ||
                neighborColumn < 0 || neighborColumn >= cells[0].length
            ) continue;

            const neighborCell = cells[neighborRow][neighborColumn];
            logic(neighborCell, neighborRow, neighborColumn);
        }
    }
}

function clickCell(row, column) {
    const cell = cells[row][column];
    if(!cell.isBomb) {
        cell.isMarked = true;
        cell.innerHTML = cell.neighboringBombs;

        cell.classList.add("marked");

        if(cell.neighboringBombs === 0) {
            forAllNeighbors(row, column, (neighborCell, neighborRow, neighborColumn) => {
                if(!neighborCell.isMarked) clickCell(neighborRow, neighborColumn);
            });
        }
    } else {
        cell.innerHTML = "X";
    }
}

function toggleFlagForCell(row, column) {
    const cell = cells[row][column];
    if(cell.isMarked) return;

    cell.isFlagged = !cell.isFlagged;
    if(cell.isFlagged) {
        cell.innerHTML = "F";
    } else {
        cell.innerHTML = "";
    }
}
