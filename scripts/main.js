const content = document.getElementById("content");
const root = document.querySelector(":root");
const titleContent = document.getElementById("title-content");
const titleContentWrapper = document.getElementById("title-content-wrapper");

const cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
const bombDensity = 0.05;

let gameState = 0;
// 0 - title screen
// 1 - ingame
// 2 - paused
// 3 - win / lose animation

let numberOfFlags = 0;

let rows, columns, numberOfBombs;
function calculateRowsColumnsAndBombs() {
    rows = Math.round(window.innerHeight / cellSize);
    root.style.setProperty("--cell-height", `${window.innerHeight / rows}px`);
    columns = Math.round(window.innerWidth / cellSize);
    root.style.setProperty("--cell-width", `${window.innerWidth / columns}px`);
    numberOfBombs = Math.floor(rows * columns * bombDensity);
}
calculateRowsColumnsAndBombs();

// preload assets
const explosionAudio = new Audio("./assets/explosion.wav");
new Audio("./assets/fireworks.wav");
new Image().src = "./assets/explosion.png";
new Image().src = "./assets/fireworks.png";

let cells = [];

function destroyBoard() {
    content.innerHTML = "";
    cells = [];
}

function createBoard() {
    for(let row = 0; row < rows; row++) {
        const rowDiv = document.createElement("div");
    
        rowDiv.classList.add("row");
    
        cells.push([]);
        for(let column = 0; column < columns; column++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add("unmarked");
    
            cell.isBomb = false;
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

    seedBombs();
}

function seedBombs() {
    for(let i = 0; i < numberOfBombs; i++) {
        let row, column;
        do {
            row = Math.floor(Math.random() * rows);
            column = Math.floor(Math.random() * columns);
        } while(cells[row][column].isBomb);
        cells[row][column].isBomb = true;
    }

    for(let row = 0; row < rows; row++) {
        for(let column = 0; column < columns; column++) {
            const cell = cells[row][column];
            forAllNeighbors(row, column, (neighborCell) => {
                if(neighborCell.isBomb) cell.neighboringBombs++;
            });
        }
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
            endGame();
        }
    }

    checkForWin();
}

function toggleFlagForCell(row, column) {
    const cell = cells[row][column];
    if(cell.isMarked) return;

    cell.isFlagged = !cell.isFlagged;
    numberOfFlags += cell.isFlagged ? 1 : -1;
    if(cell.isFlagged) animationState.playLabelChange(cell, "🚩")
    else cell.label.innerHTML = "";

    checkForWin();
}

function startGame() {
    destroyBoard();
    createBoard();
    titleContentWrapper.classList.add("up");
    titleContent.classList.add("unblur");

    const transitionEndHandler = e => {
        if(e.propertyName !== "backdrop-filter") return;
        titleContent.style.zIndex = -1;
        gameState = 1;
        titleContent.removeEventListener("transitionend", transitionEndHandler)
    }
    titleContent.addEventListener("transitionend", transitionEndHandler);
}

function checkForWin() {
    if(numberOfBombs !== numberOfFlags || gameState !== 1) return;
    for(let row = 0; row < rows; row++) {
        for(let column = 0; column < columns; column++) {
            if(cells[row][column].isBomb) continue;
            if(!cells[row][column].isMarked) return;
        }
    }
    endGame();
}

function endGame() {
    gameState = 3;
    titleContent.style.zIndex = 3;
    setTimeout(() => {
        titleContentWrapper.classList.remove("up");
        titleContent.classList.remove("unblur");
        gameState = 0;
    }, 3000);
}

function panicEndGame() {
    titleContent.style.zIndex = 3;
    titleContentWrapper.classList.remove("up");
    titleContent.classList.remove("unblur");
    gameState = 0;
    destroyBoard();
}

window.addEventListener("resize", () => {
    calculateRowsColumnsAndBombs();
    if(gameState !== 0) panicEndGame();
    else destroyBoard();
});
