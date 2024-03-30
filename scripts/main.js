const content = document.getElementById("content"); // main div everything takes place in
const root = document.querySelector(":root"); // root node for css variables
const titleContent = document.getElementById("title-content"); // div the title screen goes in
const titleContentWrapper = document.getElementById("title-content-wrapper"); // wrapper for title screen contents
// title screen button elements
const bombCountButton = document.getElementById("bomb-count-button");
const cellSizeButton = document.getElementById("cell-size-button");
const animationsButton = document.getElementById("animations-button");
const showInfoButton = document.getElementById("show-info-button");
const cursorInfo = document.getElementById("cursor-info"); // bomb counter that follows the cursor

// this is how large each cell is ideally; height and width get fudged so the board is fullscreen, though
let cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
let bombDensity = 0.2; // what percentage of the borad is a bomb?

let gameState = 0; // controls the current state of the game
// 0 - title screen
// 1 - ingame
// 2 - paused
// 3 - win / lose animation

let numberOfFlags = 0; // number of flags currently placed
let firstClick = true; // true if this is the first click of the game; used to prevent first reveal being a bomb
let cells = []; // matrix containing cell HTML elements

let rows, columns, numberOfBombs = 0; // self explanatory, right?
// updates rows, columns, and numberOfBombs variables
function calculateRowsColumnsAndBombs() {
    destroyBoard();
    cellSize = parseInt(getComputedStyle(root).getPropertyValue("--cell-size"));
    rows = Math.round(window.innerHeight / cellSize); // rounds to nearest full cell
    root.style.setProperty("--cell-height", `${window.innerHeight / rows}px`); // sets height so board is perfectly fullscreen
    columns = Math.round(window.innerWidth / cellSize);
    root.style.setProperty("--cell-width", `${window.innerWidth / columns}px`);
    numberOfBombs = Math.floor(rows * columns * bombDensity); // simple calculation using the bomb density
    updateBombCountButton();
}
calculateRowsColumnsAndBombs();

// gets rid of anything on the board + initalizes some variables back to default
function destroyBoard() {
    content.innerHTML = "";
    cells = [];
    numberOfFlags = 0;
}

// creates cell elements and updates the cells variable
// if the board is currently destroyed, it displays an empty checkerboard background through css gradients to trick you
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
            cell.isMarked = false; // I called the opened cell quality "marked" for whatever reason, weird
            cell.isFlagged = false;
            cell.row = row;
            cell.column = column;
    
            const cellLabel = document.createElement("span"); // span containing the number / flag icon / bomb icon
            cell.label = cellLabel;
            cell.appendChild(cellLabel);
    
            cell.addEventListener("click", () => clickCell(row, column)); // I love this shit 🤯
            cell.addEventListener("contextmenu", (e) => { // on right click
                e.preventDefault(); // don't open the right click menu
                toggleFlagForCell(row, column); // then toggle the flag state
            });
    
            rowDiv.appendChild(cell);
            cells[cells.length - 1].push(cell);
        }
    
        content.appendChild(rowDiv);
    }

    seedBombsRandomly(); // after creating the board, add bombs to it
}

function seedBombsRandomly(amount = numberOfBombs) {
    for(let i = 0; i < amount; i++) {
        let row, column;
        do { // get some row and column that isn't a bomb
            row = Math.floor(Math.random() * rows);
            column = Math.floor(Math.random() * columns);
        } while(cells[row][column].isBomb);
        cells[row][column].isBomb = true; // set it to be a bomb
    }
}

// called when you click the big start game button
function startGame() {
    destroyBoard();
    createBoard();
    firstClick = true;
    // animation stuff
    titleContentWrapper.classList.add("up");
    titleContent.classList.add("unblur");
    cursorInfo.style.display = "block";
    updateCursorInfo();

    // weird design pattern so the event listener can be destroyed after it hears the proper event
    const transitionEndHandler = e => {
        if(e.propertyName !== "backdrop-filter") return;
        titleContent.style.zIndex = -1;
        gameState = 1; // enter the currently playing game state once screen is done unblurring
        titleContent.removeEventListener("transitionend", transitionEndHandler);
    }
    titleContent.addEventListener("transitionend", transitionEndHandler);
}

// utility function that runs logic on all of some (row, column)'s neighbors
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
            // logic parameters are the neighboring cell and its row, column
            logic(neighborCell, neighborRow, neighborColumn);
        }
    }
}

function getNeighboringBombs(cell) {
    let neighboringBombs = 0;
    forAllNeighbors(cell.row, cell.column, neighbor => neighboringBombs += neighbor.isBomb ? 1 : 0);
    return neighboringBombs;
}

// when you click on a cell
function clickCell(row, column) {
    const cell = cells[row][column];
    const neighboringBombs = getNeighboringBombs(cell);

    if(cell.isFlagged) return; // don't do anything if there's a flag on it

    if(cell.isMarked) { // if we're clicking on a cell that's already been opened
        // get the number of flags surrounding it
        let neighborFlagCount = 0;
        forAllNeighbors(row, column, neighbor => {
            if(neighbor.isFlagged) neighborFlagCount++;
        });

        if(neighborFlagCount === neighboringBombs) { // if the number of flags equals the number of bombs it covers
            // then we can click all of the non-opened neighbors (this is like a QOL thing in a lot of minesweeper implementations)
            forAllNeighbors(row, column, (neighborCell, neighborRow, neighborColumn) => {
                if(!neighborCell.isMarked && !neighborCell.isFlagged) clickCell(neighborRow, neighborColumn);
            });
        }
    } else { // if the cell is unopened
        cell.isMarked = true; // open it!
        if(!cell.isBomb) { // if it isn't a bomb, we can do the normal clicky things
            if(neighboringBombs === 0) { // if cell doesn't have any bombs, also open its neighbors in a cascade
                cell.classList.replace("unmarked", "bombs0");
                forAllNeighbors(row, column, (neighborCell, neighborRow, neighborColumn) => {
                    if(!neighborCell.isMarked) clickCell(neighborRow, neighborColumn); // ah, so cool
                });
            } else { // if the cell does have bombs, display the bomb count and play the funny animation
                cell.label.innerHTML = neighboringBombs;
                animationState.playClick(cell);
            }
        } else if(firstClick) { // if it is a bomb but this is the first cell we're openeing, move the bomb
            while(cells[row][column].isBomb) { // as long as the current cell has a bomb,
                cells[row][column].isBomb = false; // make it not a bomb
                seedBombsRandomly(1); // and randomly add a bomb back somewhere else
            }
            cell.isMarked = false; // undo the click and retry it
            clickCell(row, column);
        } else { // oops you clicked a bomb!!!
            animationState.playLabelChange(cell, "💣");
            animationState.playExplosion(cell); // kablam
            endGame(); // womp womp lil bro
        }
    }

    firstClick = false; // we're done with our first click, so it's not the first click anymore
    updateCursorInfo(); // I don't think this is necessary...? but whatever
    checkForWin(); // see if you won the game
}

// when you right click on a cell
function toggleFlagForCell(row, column) {
    const cell = cells[row][column];
    if(cell.isMarked) return; // don't do anything to an opened cell

    cell.isFlagged = !cell.isFlagged; // toggle flagged state
    numberOfFlags += cell.isFlagged ? 1 : -1; // update the number of flags you've made
    if(cell.isFlagged) animationState.playLabelChange(cell, "🚩")
    else cell.label.innerHTML = "";

    updateCursorInfo();
    checkForWin(); // see if you won the game
}

// ends the game if you've marked all bombs and all cells are opened
// this is, like, really inefficient, right? but idk it's probably fine
function checkForWin() {
    if(numberOfBombs !== numberOfFlags || gameState !== 1) return; // if you haven't used all flags, you haven't won
    for(let row = 0; row < rows; row++) {
        for(let column = 0; column < columns; column++) {
            if(cells[row][column].isBomb) continue;
            if(!cells[row][column].isMarked) return; // if you haven't opened all cells, you haven't won
        }
    }
    animationState.playFireworks(); // yippee!!!
    endGame();
}

async function endGame() {
    gameState = 3; // put into waiting state
    titleContent.style.zIndex = 3; // bring up the title screen (invisible rn) so you can't interact with the board anymore
    await sleep(3000);
    // bring back the title screen
    titleContentWrapper.classList.remove("up");
    titleContent.classList.remove("unblur");
    gameState = 0;
    await sleep(500);
    cursorInfo.style.display = "none"; // get rid of the cursor display thing
}

// if we update the size of the screen, we immediately abort the current game cause the board no longer takes the full screen
function panicEndGame() {
    titleContent.style.zIndex = 3;
    titleContentWrapper.classList.remove("up");
    titleContent.classList.remove("unblur");
    gameState = 0;
    cursorInfo.style.display = "none";
    destroyBoard();
}

// update the span that follows the cursor with bomb info
function updateCursorInfo() {
    cursorInfo.innerHTML = `💣 ${numberOfBombs - numberOfFlags}`;
}

// if we resize the screen, update rows and columns and the board and stuff
window.addEventListener("resize", () => {
    calculateRowsColumnsAndBombs();
    if(gameState !== 0) panicEndGame(); // if we aren't at the title screen, get there quick!
    else destroyBoard(); // and otherwise just get rid of the board since it'll no longer be aligned
});
