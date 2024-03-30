const sleep = ms => new Promise(a => setTimeout(a, ms)); // pauses execution for ms milliseconds

// preload assets
const explosionAudio = new Audio("./assets/explosion.wav");
const fireworkAudio = new Audio("./assets/fireworks.wav");
new Image().src = "./assets/explosion.png";
new Image().src = "./assets/fireworks.png";

// when we update an icon, it kind of pops in a little bit
function playLabelChangePopSpawnAnimation(cell, newText) {
    cell.label.innerHTML = newText;
    cell.label.style.animation = "pop-spawn 0.05s linear"; // start the animation
    cell.label.addEventListener("animationend", () => {
        cell.label.style.animation = ""; // stop(?) the animation; idk if this is necessary, I've never used css animations before
    }, { once: true });
}

// don't play the little pop animation
function playLabelChangeNoAnimation(cell, newText) {
    cell.label.innerHTML = newText;
}

// clicking immediately changes the cell's colors and stuff
function playClickNoAnimation(cell) {
    cell.classList.replace("unmarked", `bombs${getNeighboringBombs(cell)}`);
}

// cell pops in a little bit like the labels
function playClickFormingAnimation(cell) {
    // making a forming piece right above the current cell, then remove once it's done popping and set the underlying cell to look
    // like the piece we just formed up
    // does that make sense?
    const neighboringBombs = getNeighboringBombs(cell);
    const formingPiece = document.createElement("div");
    formingPiece.classList.add("cell", "forming-cell", `bombs${neighboringBombs}`);
    formingPiece.innerHTML = neighboringBombs;
    cell.appendChild(formingPiece); // put the forming piece
    cell.addEventListener("animationend", () => { // once animation is over,
        formingPiece.remove(); // remove the forming piece
        cell.classList.replace("unmarked", `bombs${neighboringBombs}`); // update state of the actual cell / piece
    }, { once: true });
}

// cell breaks up into four randomly animated pieces (can be laggy be careful!)
function playClickBreakingAnimation(cell) {
    cell.classList.replace("unmarked", `bombs${getNeighboringBombs(cell)}`);

    const bounds = cell.getBoundingClientRect();

    // pieceContainer is a div that contains the pieces, it's put anywhere in the screen since the pieces are all absolutely positioned
    const pieceContainer = document.createElement("div");
    pieceContainer.classList.add("broken-piece-container");
    pieceContainer.style.top = `${bounds.top}px`;
    pieceContainer.style.left = `${bounds.left}px`;

    // create four pieces to break up into
    const pieces = [];
    for(let i = 0; i < 4; i++) {
        const piece = document.createElement("div");
        piece.classList.add("broken-piece");
        pieces.push(piece);
        pieceContainer.appendChild(piece);
    }

    // update each piece's individual css classes
    // each piece is the same size div and is positioned right above the cell we're breaking, but has different clip masks so they
    // look like different triangles
    pieces[0].classList.add("left");
    pieces[1].classList.add("top");
    pieces[2].classList.add("right");
    pieces[3].classList.add("bottom");

    content.appendChild(pieceContainer); // put the pieceContainer somewhere on the screen, triggering the whole process

    // just after they're created, start the fade out and animate them moving and rotating randomly
    setTimeout(() => {
        pieces.forEach(p => p.style.opacity = 0);
    
        pieces[0].style.transform = `translate(-${Math.random() * (cellSize / 2) + (cellSize / 2)}px, ${Math.random() * cellSize - (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;
        pieces[1].style.transform = `translate(${Math.random() * cellSize - (cellSize / 2)}px, -${Math.random() * (cellSize / 2) + (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;
        pieces[2].style.transform = `translate(${Math.random() * (cellSize / 2) + (cellSize / 2)}px, ${Math.random() * cellSize - (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;
        pieces[3].style.transform = `translate(${Math.random() * cellSize - (cellSize / 2)}px, ${Math.random() * (cellSize / 2) + (cellSize / 2)}px) rotate(${Math.random() * 45 * (Math.random() < 0.5 ? 1 : 1)}deg)`;

        // after they're done animating, delete the pieces
        pieces[0].addEventListener("transitionend", () => {
            pieces.forEach(p => p.remove());
        }, { once: true });
    }, 1);
}

// kaboom!
function playExplosionStandardAnimation(cell) {
    const bounds = cell.getBoundingClientRect();

    playExplosionSound(); // play the explosion sfx
    for(let i = 0; i < 16; i++) {
        // spawn 16 explosion instances in a circle centered on the cell, randomly
        const r = cellSize * 3 * Math.sqrt(Math.random());
        const theta = 2 * Math.PI * Math.random();
        spawnExplosionImage(bounds.left + r * Math.cos(theta) - 160 / 2, bounds.top + r * Math.sin(theta) - 160 / 2);
    }
}

// kaboom also, kinda
async function playFireworksStandardAnimation(_) {
    playFireworksSound(); // play the fireworks sfx
    for(let i = 0; i < rows * columns; i++) {
        // spawn number of fireworks equal to the number of cells, randomly spread across the whole screen
        spawnFireworkImage(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        await sleep(10); // with a little delay between each
    }
}

// these functions just play the sound effects, no animations

function playExplosionNoAnimation(_) {
    playExplosionSound();
}

function playFireworksNoAnimation(_) {
    playFireworksSound();
}

// creates one instance of an explosion
async function spawnExplosionImage(left, top) {
    const explosion = document.createElement("div");
    explosion.classList.add("explosion");
    explosion.style.left = `${left}px`;
    explosion.style.top = `${top}px`;
    explosion.style.transform = `scale(${2 * cellSize / 160 * 1.5})`; // resize so it's proportional to the cell size
    content.appendChild(explosion);

    // animate the explosion
    for(let i = 0; i < 16; i++) {
        // scroll across the sprite sheet (each sprite is 160 pixels large on the sheet)
        explosion.style.backgroundPosition = `0px -${i * 160}px`;
        await sleep(25);
    }
    explosion.remove(); // delete once the explosion is done exploding
}

// similarly, creates one instance of a firework
async function spawnFireworkImage(left, top) {
    // basically the same code
    const firework = document.createElement("div");
    firework.classList.add("firework");
    firework.style.left = `${left}px`;
    firework.style.top = `${top}px`;
    firework.style.transform = `scale(${cellSize / 35 * 0.75})`;
    firework.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)` // give the firework a random color tho
    content.appendChild(firework);

    for(let i = 0; i < 16; i++) {
        // each sprite in the sprite sheet is only 40 pixels
        firework.style.backgroundPosition = `0px -${i * 40}px`;
        await sleep(75);
    }
    await sleep(Math.random() * 800); // wait a random bit of time before deleting the firework
    firework.remove();
}

// these play the sound effects, audio variables are HTML Audio elements located in main.js

function playExplosionSound() {
    explosionAudio.play();
}

function playFireworksSound() {
    fireworkAudio.play();
}

// I overengineered this a bit, but basically we move between predetermined animation states so there's never an invalid animation
// function trying to be called or anything like that
// idk originally I wanted the game state to be kind of like this too but it was unnecessary

const formingAnimationState = {
    playClick: playClickFormingAnimation,
    playLabelChange: playLabelChangePopSpawnAnimation,
    playExplosion: playExplosionStandardAnimation,
    playFireworks: playFireworksStandardAnimation
};

const breakingAnimationState = {
    playClick: playClickBreakingAnimation,
    playLabelChange: playLabelChangePopSpawnAnimation,
    playExplosion: playExplosionStandardAnimation,
    playFireworks: playFireworksStandardAnimation
};

const noAnimationState = {
    playClick: playClickNoAnimation,
    playLabelChange: playLabelChangeNoAnimation,
    playExplosion: playExplosionNoAnimation,
    playFireworks: playFireworksNoAnimation
};

let animationState = formingAnimationState; // animationState is the variable you call the animation functions from
