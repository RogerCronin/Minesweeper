const content = document.getElementById("content");
const root = document.querySelector(":root");
const cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
const bombDensity = 0.05;

const rows = Math.round(window.innerHeight / cellSize);
root.style.setProperty("--cell-height", `${window.innerHeight / rows}px`);
const columns = Math.round(window.innerWidth / cellSize);
root.style.setProperty("--cell-width", `${window.innerWidth / columns}px`);
const numberOfBombs = Math.floor(rows * columns * bombDensity);

const cells = [];

for(let row = 0; row < rows; row++) {
    const rowDiv = document.createElement("div");

    rowDiv.classList.add("row");

    cells.push([]);
    for(let column = 0; column < columns; column++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.classList.add("unmarked");

        cell.isBomb = Math.random() < bombDensity;
        cell.isMarked = false;
        cell.isFlagged = false;
        cell.neighboringBombs = 0;

        const cellLabel = document.createElement("span");
        cell.label = cellLabel;
        cell.appendChild(cellLabel);

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
                neighborRow < 0 || neighborRow >= rows ||
                neighborColumn < 0 || neighborColumn >= columns
            ) continue;

            const neighborCell = cells[neighborRow][neighborColumn];
            logic(neighborCell, neighborRow, neighborColumn);
        }
    }
}

function clickCell(row, column) {
    const cell = cells[row][column];

    if(cell.isFlagged) return;

    if(cell.isMarked) {
        let neighborFlagCount = 0;
        forAllNeighbors(row, column, neighbor => {
            if(neighbor.isFlagged) neighborFlagCount++;
        });

        if(neighborFlagCount >= cell.neighboringBombs) {
            forAllNeighbors(row, column, (neighborCell, neighborRow, neighborColumn) => {
                if(!neighborCell.isMarked && !neighborCell.isFlagged) clickCell(neighborRow, neighborColumn);
            });
        }
    } else {
        cell.isMarked = true;
        if(!cell.isBomb) {
            if(cell.neighboringBombs === 0) {
                cell.classList.replace("unmarked", "bombs0");
                forAllNeighbors(row, column, (neighborCell, neighborRow, neighborColumn) => {
                    if(!neighborCell.isMarked) clickCell(neighborRow, neighborColumn);
                });
            } else {
                cell.label.innerHTML = cell.neighboringBombs;
                animationState.playClick(cell);
            }
        } else {
            animationState.playLabelChange(cell, "💣");
            animationState.playExplosion(cell);
        }
    }
}

function toggleFlagForCell(row, column) {
    const cell = cells[row][column];
    if(cell.isMarked) return;

    cell.isFlagged = !cell.isFlagged;
    if(cell.isFlagged) animationState.playLabelChange(cell, "🚩")
    else cell.label.innerHTML = "";
}
