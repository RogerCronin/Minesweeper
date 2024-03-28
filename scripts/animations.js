const sleep = ms => new Promise(a => setTimeout(a, ms));

function playLabelChangePopSpawnAnimation(cell, newText) {
    cell.label.innerHTML = newText;
    cell.label.style.animation = "pop-spawn 0.05s linear";
    cell.label.addEventListener("animationend", () => {
        cell.label.style.animation = "";
    }, { once: true });
}

function playLabelChangeNoAnimation(cell, newText) {
    cell.label.innerHTML = newText;
}

function playClickNoAnimation(cell) {
    cell.classList.replace("unmarked", `bombs${cell.neighboringBombs}`);
}

function playClickFormingAnimation(cell) {
    const formingPiece = document.createElement("div");
    formingPiece.classList.add("cell", "forming-cell", `bombs${cell.neighboringBombs}`);
    formingPiece.innerHTML = cell.neighboringBombs;
    cell.appendChild(formingPiece);
    cell.addEventListener("animationend", () => {
        formingPiece.remove();
        cell.classList.replace("unmarked", `bombs${cell.neighboringBombs}`);
    }, { once: true });
}

function playClickBreakingAnimation(cell) {
    cell.classList.replace("unmarked", `bombs${cell.neighboringBombs}`);

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
        }, { once: true });
    }, 1);

    content.appendChild(pieceContainer);
}

function playExplosionStandardAnimation(cell) {
    const bounds = cell.getBoundingClientRect();

    for(let i = 0; i < 16; i++) {
        const r = cellSize * 3 * Math.sqrt(Math.random());
        const theta = 2 * Math.PI * Math.random();
        spawnExplosionImage(bounds.left + r * Math.cos(theta) - 160 / 2, bounds.top + r * Math.sin(theta) - 160 / 2);
    }
}

function playExplosionNoAnimation(cell) {
    playExplosionSound();
}

async function spawnExplosionImage(left, top) {
    playExplosionSound();

    const imageElement = document.createElement("div");
    imageElement.classList.add("explosion");
    imageElement.style.left = `${left}px`;
    imageElement.style.top = `${top}px`;
    imageElement.style.transform = `scale(${2 * cellSize / 160 * 1.5})`;
    content.appendChild(imageElement);

    for(let i = 0; i < 16; i++) {
        imageElement.style.backgroundPosition = `0px -${i * 160}px`;
        await sleep(25);
    }
    imageElement.remove();
}

function playExplosionSound() {
    explosionAudio.play();
}

const formingAnimationState = {
    playClick: playClickFormingAnimation,
    playLabelChange: playLabelChangePopSpawnAnimation,
    playExplosion: playExplosionStandardAnimation
};

const breakingAnimationState = {
    playClick: playClickBreakingAnimation,
    playLabelChange: playLabelChangePopSpawnAnimation,
    playExplosion: playExplosionStandardAnimation
};

const noAnimationState = {
    playClick: playClickNoAnimation,
    playLabelChange: playLabelChangeNoAnimation,
    playExplosion: playExplosionNoAnimation
};

let animationState = formingAnimationState;
