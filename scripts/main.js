const content = document.getElementById("content");
const root = document.querySelector(":root");
const titleContent = document.getElementById("title-content");
const titleContentWrapper = document.getElementById("title-content-wrapper");
const bombCountButton = document.getElementById("bomb-count-button");
const cellSizeButton = document.getElementById("cell-size-button");
const animationsButton = document.getElementById("animations-button");
const showInfoButton = document.getElementById("show-info-button");
const cursorInfo = document.getElementById("cursor-info")

let cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
let bombDensity = 0.2;

let gameState = 0;
// 0 - title screen
// 1 - ingame
// 2 - paused
// 3 - win / lose animation

let numberOfFlags = 0;
let cells = [];

let rows, columns, numberOfBombs = 0;
function calculateRowsColumnsAndBombs() {
    destroyBoard();
    cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
    rows = Math.round(window.innerHeight / cellSize);
    root.style.setProperty("--cell-height", `${window.innerHeight / rows}px`);
    columns = Math.round(window.innerWidth / cellSize);
    root.style.setProperty("--cell-width", `${window.innerWidth / columns}px`);
    numberOfBombs = Math.floor(rows * columns * bombDensity);
    updateBombCountButton();
}
calculateRowsColumnsAndBombs();

// preload assets
const explosionAudio = new Audio("./assets/explosion.wav");
const fireworkAudio = new Audio("./assets/fireworks.wav");
new Image().src = "./assets/explosion.png";
new Image().src = "./assets/fireworks.png";

function destroyBoard() {
    content.innerHTML = "";
    cells = [];
    numberOfFlags = 0;
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

    updateCursorInfo();
    checkForWin();
}

function toggleFlagForCell(row, column) {
    const cell = cells[row][column];
    if(cell.isMarked) return;

    cell.isFlagged = !cell.isFlagged;
    numberOfFlags += cell.isFlagged ? 1 : -1;
    if(cell.isFlagged) animationState.playLabelChange(cell, "🚩")
    else cell.label.innerHTML = "";

    updateCursorInfo();
    checkForWin();
}

function checkForWin() {
    if(numberOfBombs !== numberOfFlags || gameState !== 1) return;
    for(let row = 0; row < rows; row++) {
        for(let column = 0; column < columns; column++) {
            if(cells[row][column].isBomb) continue;
            if(!cells[row][column].isMarked) return;
        }
    }
    animationState.playFireworks();
    endGame();
}

function endGame() {
    gameState = 3;
    titleContent.style.zIndex = 3;
    setTimeout(() => {
        titleContentWrapper.classList.remove("up");
        titleContent.classList.remove("unblur");
        gameState = 0;
        cursorInfo.innerHTML = "";
    }, 3000);
}

function panicEndGame() {
    titleContent.style.zIndex = 3;
    titleContentWrapper.classList.remove("up");
    titleContent.classList.remove("unblur");
    gameState = 0;
    cursorInfo.innerHTML = "";
    destroyBoard();
}

function updateCursorInfo() {
    cursorInfo.innerHTML = `💣 ${numberOfBombs - numberOfFlags}`;
}

window.addEventListener("resize", () => {
    calculateRowsColumnsAndBombs();
    if(gameState !== 0) panicEndGame();
    else destroyBoard();
});
