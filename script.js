const content = document.getElementById("content");
const root = document.querySelector(":root");
const cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
const bombDensity = 0.1;

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

function playFormingAnimation(cell) {
    const formingPiece = document.createElement("div");
    formingPiece.classList.add("cell", "forming-cell", `bombs${cell.neighboringBombs}`);
    formingPiece.innerHTML = cell.neighboringBombs;
    cell.appendChild(formingPiece);
    cell.addEventListener("animationend", () => {
        formingPiece.remove();
        cell.classList.replace("unmarked", `bombs${cell.neighboringBombs}`);
    });
}

function playBreakingAnimation(cell) {
    const bounds = cell.getBoundingClientRect();

    const pieceContainer = document.createElement("div");
    pieceContainer.classList.add("broken-piece-container");
    pieceContainer.style.top = `${bounds.top}px`;
    pieceContainer.style.left = `${bounds.left}px`;

    const pieces = [];
    for(let i = 0; i < 4; i++) {
        const piece = document.createElement("div");
        piece.classList.add("broken-piece");
        pieces.push(piece);
        pieceContainer.appendChild(piece);
    }

    pieces[0].classList.add("left");
    pieces[1].classList.add("top");
    pieces[2].classList.add("right");
    pieces[3].classList.add("bottom");

    setTimeout(() => {
        pieces.forEach(p => p.style.opacity = 0);

        pieces[0].style.transform = `translate(-${Math.random() * (cellSize / 2) + (cellSize / 2)}px, ${Math.random() * cellSize - (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;
        pieces[1].style.transform = `translate(${Math.random() * cellSize - (cellSize / 2)}px, -${Math.random() * (cellSize / 2) + (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;
        pieces[2].style.transform = `translate(${Math.random() * (cellSize / 2) + (cellSize / 2)}px, ${Math.random() * cellSize - (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;
        pieces[3].style.transform = `translate(${Math.random() * cellSize - (cellSize / 2)}px, ${Math.random() * (cellSize / 2) + (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;

        pieces[0].addEventListener("transitionend", () => {
            pieces.forEach(p => p.remove());
        });
    }, 1);

    content.appendChild(pieceContainer);
}

function clickCell(row, column) {
    const cell = cells[row][column];

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
        if(!cell.isBomb) {
            cell.isMarked = true;

            if(cell.neighboringBombs === 0) {
                cell.classList.replace("unmarked", "bombs0");
                forAllNeighbors(row, column, (neighborCell, neighborRow, neighborColumn) => {
                    if(!neighborCell.isMarked) clickCell(neighborRow, neighborColumn);
                });
            } else {
                cell.label.innerHTML = cell.neighboringBombs;
                playFormingAnimation(cell);
            }
        } else {
            cell.label.innerHTML = "💣";
        }
    }
}

function toggleFlagForCell(row, column) {
    const cell = cells[row][column];
    if(cell.isMarked) return;

    cell.isFlagged = !cell.isFlagged;
    if(cell.isFlagged) {
        cell.label.innerHTML = "🚩";
    } else {
        cell.label.innerHTML = "";
    }
}
