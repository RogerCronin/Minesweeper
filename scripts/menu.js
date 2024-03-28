function startGame() {
    destroyBoard();
    createBoard();
    titleContentWrapper.classList.add("up");
    titleContent.classList.add("unblur");
    updateCursorInfo();

    const transitionEndHandler = e => {
        if(e.propertyName !== "backdrop-filter") return;
        titleContent.style.zIndex = -1;
        gameState = 1;
        titleContent.removeEventListener("transitionend", transitionEndHandler)
    }
    titleContent.addEventListener("transitionend", transitionEndHandler);
}

const bombCountMenu = ["Few bombs", "Some bombs", "Many bombs"];
const bombDensities = [0.1, 0.2, 0.3];
let bombCountIndex = 1;
function scrollBombCount() {
    bombCountIndex++;
    if(bombCountIndex === bombCountMenu.length) bombCountIndex = 0;
    bombDensity = bombDensities[bombCountIndex];
    calculateRowsColumnsAndBombs();
}

const cellSizeMenu = ["Small squares", "Normal squares", "Big squares"];
const cellSizes = ["32px", "64px", "128px"];
let cellSizeIndex = 1;
function scrollCellSize() {
    cellSizeIndex++;
    if(cellSizeIndex === cellSizeMenu.length) cellSizeIndex = 0;
    cellSizeButton.value = cellSizeMenu[cellSizeIndex];
    root.style.setProperty("--cell-size", cellSizes[cellSizeIndex]);
    calculateRowsColumnsAndBombs();
}

const animationsMenu = ["Normal animations", "Laggy animations", "No animations"];
const animations = [formingAnimationState, breakingAnimationState, noAnimationState];
let animationsIndex = 0;
function scrollAnimations() {
    animationsIndex++;
    if(animationsIndex === animationsMenu.length) animationsIndex = 0;
    animationsButton.value = animationsMenu[animationsIndex];
    animationState = animations[animationsIndex];
}

const showInfoMenu = ["Show info by cursor", "Show info in pause menu"];
let showInfoIndex = 0;
function scrollShowInfo() {
    showInfoIndex++;
    if(showInfoIndex === showInfoMenu.length) showInfoIndex = 0;
    showInfoButton.value = showInfoMenu[showInfoIndex];
}

function updateBombCountButton() {
    bombCountButton.value = `${bombCountMenu[bombCountIndex]} (${numberOfBombs})`
}

window.addEventListener("mousemove", e => {
    cursorInfo.style.left = `${e.clientX + 32}px`;
    cursorInfo.style.top = `${e.clientY - 32}px`;
});
