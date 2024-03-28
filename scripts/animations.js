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
    
}

function playExplosionNoAnimation(cell) {

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
