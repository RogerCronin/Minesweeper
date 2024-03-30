// these functions are pretty self-explanatory, they are used when cycling through options on the title screen

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
    root.style.setProperty("--cell-size", cellSizes[cellSizeIndex]); // update css variable
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

// the bomb count button should also display the number of bombs, we wrap it in this function so it's reusable and whatever
function updateBombCountButton() {
    bombCountButton.value = `${bombCountMenu[bombCountIndex]} (${numberOfBombs})`
}

// when we move the mouse, update the position of the cursor info span box thing with the bomb count
window.addEventListener("mousemove", e => {
    cursorInfo.style.left = `${e.clientX + 32}px`;
    cursorInfo.style.top = `${e.clientY - 32}px`;
});
