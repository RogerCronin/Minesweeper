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

    playExplosionSound();
    for(let i = 0; i < 16; i++) {
        const r = cellSize * 3 * Math.sqrt(Math.random());
        const theta = 2 * Math.PI * Math.random();
        spawnExplosionImage(bounds.left + r * Math.cos(theta) - 160 / 2, bounds.top + r * Math.sin(theta) - 160 / 2);
    }
}

async function playFireworksStandardAnimation(_) {
    playFireworksSound();
    for(let i = 0; i < rows * columns; i++) {
        spawnFireworkImage(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        await sleep(10);
    }
}

function playExplosionNoAnimation(_) {
    playExplosionSound();
}

function playFireworksNoAnimation(_) {
    playFireworksSound();
}

async function spawnExplosionImage(left, top) {
    const explosion = document.createElement("div");
    explosion.classList.add("explosion");
    explosion.style.left = `${left}px`;
    explosion.style.top = `${top}px`;
    explosion.style.transform = `scale(${2 * cellSize / 160 * 1.5})`;
    content.appendChild(explosion);

    for(let i = 0; i < 16; i++) {
        explosion.style.backgroundPosition = `0px -${i * 160}px`;
        await sleep(25);
    }
    explosion.remove();
}

async function spawnFireworkImage(left, top) {
    const firework = document.createElement("div");
    firework.classList.add("firework");
    firework.style.left = `${left}px`;
    firework.style.top = `${top}px`;
    firework.style.transform = `scale(${cellSize / 35 * 0.75})`;
    firework.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg)`
    content.appendChild(firework);

    for(let i = 0; i < 16; i++) {
        firework.style.backgroundPosition = `0px -${i * 40}px`;
        await sleep(75);
    }
    await sleep(Math.random() * 800);
    firework.remove();
}

function playExplosionSound() {
    explosionAudio.play();
}

function playFireworksSound() {
    fireworkAudio.play();
}

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

let animationState = formingAnimationState;
