const explosionAudio = new Audio("./assets/explosion.wav");
const fireworkAudio = new Audio("./assets/fireworks.wav");
const flagAudio = new Audio("./assets/flag.wav");

function playExplosionSound() {
    explosionAudio.play();
}

function playFireworksSound() {
    fireworkAudio.play();
}

function playFlagSound() {
    new Audio("./assets/flag.wav").play();
}

function playUnflagSound() {
    new Audio("./assets/unflag.wav").play();
}

function playClickSound() {
    new Audio("./assets/dig.wav").play();
}

function playSnapSound() {
    new Audio("./assets/snap.wav").play();
}
