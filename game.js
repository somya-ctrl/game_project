// Define themes first before using them
const themes = {
    default: {
        road: "assets/road.jpg",
        left: "assets/left.jpg",
        right: "assets/right.jpg"
    },
    desert: {
        road: "assets/road.jpg",
        left: "assets/left2.jpg",
        right: "assets/right2.jpg"
    },
    snow: {
        road: "assets/road.jpg",
        left: "assets/left3.jpg",
        right: "assets/right3.jpg"
    }
};

const canvasR = document.getElementById("right");
const ctxR = canvasR.getContext("2d");

canvasR.width = 100;
canvasR.height = window.innerHeight;

const rightImg = new Image();
rightImg.src = themes.default.right;

const canvasL = document.getElementById("left");
const ctxL = canvasL.getContext("2d");

canvasL.width = 100;
canvasL.height = window.innerHeight;

const leftImg = new Image();
leftImg.src = themes.default.left;

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = window.innerHeight;





const engineSound = new Audio("sounds/engine.mp3");   
const crashSound = new Audio("sounds/crash.mp3");
const coinSound = new Audio("sounds/coin.mp3");

engineSound.loop = true;


let gameOver = false; 
let gamePaused = false;
let engineSoundPlaying = false;
let brakePressed = false;
let boostActive = false;
let boostCharge = 0;
let maxBoostCharge = 100;
let totalDistance = 0;
let distanceSinceLastBoost = 0;
let boostCooldown = 0;
let maxBoostCooldown = 2000; // 2 seconds cooldown
let currentBackgroundSpeed = 0;
let currentObstacleSpeed = 0;
let backgroundY = 0;
let backgroundSpeed = 5;
let score = 0;
let highScore = localStorage.getItem("highScore") ? parseInt(localStorage.getItem("highScore")) : 0;
let speedObstacle = 3;
let imageX = canvas.width / 2 - 25;
let imageY = canvas.height - 120;
const imageWidth = 40;
const imageHeight = 80;
const movespeed = 4;

const img = new Image();
img.src = themes.default.road;
leftImg.src = themes.default.left;
rightImg.src = themes.default.right;

const moto = new Image();
moto.src = "assets/car.png";

const obstacleImgs = [
    "assets/car1.png",
    "assets/car2.png",
    "assets/car3.png",
    "assets/car4.png",
    "assets/car6.png"
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});


const powerupImgs = [
    { src: "assets/coin.png", type: "coin" },
    { src: "assets/shield.png", type: "shield" },
    { src: "assets/speed.jpeg", type: "speed" }
].map(p => {
    const img = new Image();
    img.src = p.src;
    return { img, type: p.type };
});

const powerups = [];
const powerupSize = 30;
let shieldActive = false;
let shieldTimeRemaining = 0;


const obstacleWidth = 40;
const obstaclesHeight = 80;
const obstacles = [];




setInterval(() => {
    if(speedObstacle < 8){
        speedObstacle += 1;    
    }
    console.log(speedObstacle); 
    }, 10000);

    // Dynamic obstacle spawn rate based on score
    function scheduleNextObstacle() {
        if (!gameOver && !gamePaused) {
            createObstacle();
            // Decrease spawn interval as score increases (faster spawning)
            const baseInterval = 700;
            const difficultyReduction = Math.floor(score / 500) * 50; // Reduce by 50ms every 500 points
            const spawnInterval = Math.max(baseInterval - difficultyReduction, 200); // Minimum 200ms
            setTimeout(scheduleNextObstacle, spawnInterval);
        } else {
            // If game is over or paused, reschedule for later
            setTimeout(scheduleNextObstacle, 100);
        }
    }
    scheduleNextObstacle();

    setInterval(() => {
        if (!gamePaused && !gameOver) {
            score += 1;
        }
    }, 10);

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (rightImg.complete) {
        ctxR.drawImage(rightImg, 0, backgroundY, canvasR.width, canvasR.height);
        ctxR.drawImage(rightImg, 0, backgroundY - canvasR.height, canvasR.width, canvasR.height);
    }
    if (leftImg.complete) {    
        ctxL.drawImage(leftImg, 0, backgroundY, canvasL.width, canvasL.height);
        ctxL.drawImage(leftImg, 0, backgroundY - canvasL.height, canvasL.width, canvasL.height);
    }
    if (img.complete) {
        ctx.drawImage(img, 0, backgroundY, canvas.width, canvas.height);
        ctx.drawImage(img, 0, backgroundY - canvas.height, canvas.width, canvas.height);
    }
    
    if (moto.complete) {
        ctx.drawImage(moto, imageX, imageY, imageWidth, imageHeight);
        // ctx.strokeStyle = "black";  
        // ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
    }
    
    // Draw pause instruction at fixed position
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press ESC to pause", canvas.width / 2, canvas.height - 20);
    
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, 10, 60);
    
    // Draw distance covered
    ctx.fillText(`Distance: ${Math.floor(totalDistance)}m`, 10, 90);
    
    // Draw difficulty level
    const difficultyLevel = Math.floor(score / 1000) + 1;
    ctx.fillText(`Level: ${difficultyLevel}`, 10, 120);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Controls: ↑ Boost | ↓ Brake", canvas.width - 120, 40);
    ctx.textAlign = "left";
    
    // Draw boost charge indicator
    const boostBarWidth = 200;
    const boostBarHeight = 20;
    const boostBarX = canvas.width - boostBarWidth - 20;
    const boostBarY = 60;
    
    // Background bar
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(boostBarX, boostBarY, boostBarWidth, boostBarHeight);
    
    // Boost charge bar
    const boostPercentage = boostCharge / maxBoostCharge;
    const boostWidth = boostBarWidth * boostPercentage;
    
    // Different colors based on state
    let barColor, borderColor, textColor;
    if (boostCooldown > 0) {
        // Cooldown state - gray
        barColor = "#666666";
        borderColor = "#666666";
        textColor = "#cccccc";
    } else if (boostCharge >= 100) {
        // Ready state - orange
        barColor = "#ff6b00";
        borderColor = "#ff6b00";
        textColor = "white";
    } else {
        // Charging state - gradient
        const boostGradient = ctx.createLinearGradient(boostBarX, boostBarY, boostBarX + boostWidth, boostBarY);
        boostGradient.addColorStop(0, "#ff6b00");
        boostGradient.addColorStop(1, "#ffaa00");
        barColor = boostGradient;
        borderColor = "#ff6b00";
        textColor = "white";
    }
    
    // Draw boost bar
    if (boostCooldown > 0) {
        ctx.fillStyle = barColor;
        ctx.fillRect(boostBarX, boostBarY, boostWidth, boostBarHeight);
    } else {
        if (typeof barColor === 'string') {
            ctx.fillStyle = barColor;
            ctx.fillRect(boostBarX, boostBarY, boostWidth, boostBarHeight);
        } else {
            ctx.fillStyle = barColor;
            ctx.fillRect(boostBarX, boostBarY, boostWidth, boostBarHeight);
        }
    }
    
    // Bar border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(boostBarX, boostBarY, boostBarWidth, boostBarHeight);
    
    // Boost text
    ctx.fillStyle = textColor;
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    if (boostCooldown > 0) {
        ctx.fillText(`Cooldown: ${Math.ceil(boostCooldown / 1000)}s`, boostBarX + boostBarWidth / 2, boostBarY + 14);
    } else {
        ctx.fillText(`Boost: ${Math.floor(boostCharge)}%`, boostBarX + boostBarWidth / 2, boostBarY + 14);
    }
    ctx.textAlign = "left";
    
    // Draw shield indicator
    if (shieldActive) {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(imageX - 5, imageY - 5, imageWidth + 10, imageHeight + 10);
        
        // Draw shield text
        ctx.fillStyle = "cyan";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText("SHIELD ACTIVE", canvas.width / 2, 150);
        ctx.textAlign = "left";
        
        // Draw shield time bar
        const barWidth = 200;
        const barHeight = 20;
        const barX = canvas.width - barWidth - 20;
        const barY = 90;
        
        // Background bar
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Shield time remaining bar
        const timePercentage = shieldTimeRemaining / 5000; // 5000ms total duration
        const remainingWidth = barWidth * timePercentage;
        
        // Gradient effect for the bar
        const gradient = ctx.createLinearGradient(barX, barY, barX + remainingWidth, barY);
        gradient.addColorStop(0, "#00ffff");
        gradient.addColorStop(1, "#0080ff");
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, remainingWidth, barHeight);
        
        // Bar border
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Time text
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Shield: ${Math.ceil(shieldTimeRemaining / 1000)}s`, barX + barWidth / 2, barY + 14);
        ctx.textAlign = "left";
    }
    
    // Draw pause indicator
    if (gamePaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Press ESC to resume", canvas.width / 2, canvas.height / 2 + 50);
        ctx.textAlign = "left";
    }
}

function update() {
    if (gameOver) return;
    if (gamePaused) {
        draw();
        requestAnimationFrame(update);
        return;
    }
    
      currentBackgroundSpeed = backgroundSpeed;
      currentObstacleSpeed = speedObstacle;

    // Calculate difficulty based on score
    const difficultyMultiplier = 1 + Math.floor(score / 1000) * 0.2; // Increase difficulty every 1000 points
    const baseObstacleSpeed = speedObstacle * difficultyMultiplier;
    
    if (boostActive) {
        currentBackgroundSpeed = backgroundSpeed * 2;
        currentObstacleSpeed = Math.max(baseObstacleSpeed * 1.5, 1); // Ensure minimum speed of 1
    } else if (brakePressed) {
        currentBackgroundSpeed = backgroundSpeed / 2;
        currentObstacleSpeed = Math.max(baseObstacleSpeed / 2, 1); // Ensure minimum speed of 1
    } else {
        currentObstacleSpeed = Math.max(baseObstacleSpeed, 1); // Ensure minimum speed of 1
    }

       
    const leftBoundary = 60;
    const rightBoundary = 445 - imageWidth;
    
    if (leftPressed && imageX > leftBoundary) {
        imageX -= movespeed;
    }
    if (rightPressed && imageX < rightBoundary) {
        imageX += movespeed;
    }

    backgroundY = (backgroundY + currentBackgroundSpeed) % canvas.height;

    // Update shield timer
    if (shieldActive && shieldTimeRemaining > 0) {
        shieldTimeRemaining -= 16; // Assuming ~60fps, subtract ~16ms per frame
        if (shieldTimeRemaining <= 0) {
            shieldActive = false;
            shieldTimeRemaining = 0;
        }
    }

    // Update distance and boost charge
    if (!gamePaused && !gameOver) {
        // Track total distance
        totalDistance += currentBackgroundSpeed;
        
        // Update boost cooldown
        if (boostCooldown > 0) {
            boostCooldown -= 16; // Assuming ~60fps, subtract ~16ms per frame
            if (boostCooldown < 0) {
                boostCooldown = 0;
            }
        }
        
        // Track distance since last boost (only after cooldown)
        if (boostCooldown <= 0) {
            distanceSinceLastBoost += currentBackgroundSpeed;
        }
        
        // Recharge boost based on distance since last use (only after cooldown)
        if (boostCharge < maxBoostCharge && boostCooldown <= 0) {
            const rechargeRate = 0.1; // Charge per distance unit (much slower recharge)
            boostCharge += currentBackgroundSpeed * rechargeRate;
            if (boostCharge > maxBoostCharge) {
                boostCharge = maxBoostCharge;
            }
        }
    }

    draw();
    moveObstacles();
    drawObstacles();
    movePowerups();
    drawPowerups();
    requestAnimationFrame(update);

    if (!engineSoundPlaying) {
    engineSound.loop = true;
    engineSound.volume = 0.3;
    engineSound.play();
    engineSoundPlaying = true;
}

}

function createObstacle() {
    let attempts = 0;
    let x, y;
    let validPosition = false;
    
    // Try to find a valid position (max 10 attempts)
    while (!validPosition && attempts < 10) {
        x = Math.random() * (canvas.width - obstacleWidth - 100) + 50;
        y = -obstaclesHeight;
        
        if (isPositionValid(x, y, obstacleWidth, obstaclesHeight)) {
            validPosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a valid position, skip creating this obstacle
    if (!validPosition) {
        return;
    }
    
    const randomImg = obstacleImgs[Math.floor(Math.random() * obstacleImgs.length)];

    obstacles.push({ 
        x,
        y,
        width: obstacleWidth,
        height: obstaclesHeight,
        img: randomImg // Use the already selected image
    });
}      

function drawObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (obs.img.complete){
            ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);
            // ctx.strokeStyle = "black";
            // ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }else {
            ctx.fillStyle = "red";
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
    }
}
function checkCollision(rect1, rect2) {
    return (
        rect1.x <= rect2.x + rect2.width - 12 &&
        rect1.x + rect1.width - 12 >= rect2.x &&
        rect1.y <= rect2.y + rect2.height - 19 &&
        rect1.y + rect1.height - 19 >= rect2.y
    );
}

function checkOverlap(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function isPositionValid(x, y, width, height) {
    // Check against obstacles
    for (let i = 0; i < obstacles.length; i++) {
        if (checkOverlap({x, y, width, height}, obstacles[i])) {
            return false;
        }
    }
    
    // Check against powerups
    for (let i = 0; i < powerups.length; i++) {
        if (checkOverlap({x, y, width, height}, powerups[i])) {
            return false;
        }
    }
    
    return true;
}

function moveObstacles(){
    for(let i = 0; i < obstacles.length; i++){
        obstacles[i].y += currentObstacleSpeed;
        if(checkCollision({
            x: imageX,
            y: imageY, 
            width: imageWidth, 
            height: imageHeight},
            obstacles[i]
        )) {
            if (shieldActive) {
                // Shield protects from collision - remove obstacle and continue
                obstacles.splice(i, 1);
                i--; // Adjust index after removal
                console.log("Shield protected from collision!");
                continue;
            } else {
                // No shield - game over
                crashSound.volume = 0.5;
                crashSound.play();

                console.log("Collision detected!");
                gameOver = true;

                if(score > highScore){
                    highScore = score;
                    localStorage.setItem("highScore", highScore);
                }

                // Show Game Over message and Play Again button
                const gameOverContainer = document.getElementById("gameOverContainer");
                const gameOverMessage = document.getElementById("gameOverMessage");
                gameOverContainer.style.display = "block";
                gameOverMessage.innerHTML = score > highScore
                    ? `Game Over!<br>Your score: ${score}<br>New High Score!`
                    : `Game Over!<br>Your score: ${score}<br>High Score: ${highScore}`;

                return;
            }
        }
        if(obstacles[i].y > canvas.height){
            obstacles.splice(i, 1);
            i--; //
        }
    }
}

let leftPressed = false;
let rightPressed = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        gamePaused = !gamePaused;
        if (gamePaused) {
            engineSound.pause();
        } else {
            engineSound.play();
        }
        return;
    }
    
    if (gamePaused) return; // Don't process other keys when paused
    
    if (e.key === "ArrowLeft") leftPressed = true;
    if (e.key === "ArrowRight") rightPressed = true;
    if (e.key === "ArrowDown") brakePressed = true; 

    
    if (e.key === "ArrowUp" && !boostActive && boostCharge >= 100 && boostCooldown <= 0) {
        boostActive = true;
        boostCharge = 0; // Discharge completely
        distanceSinceLastBoost = 0; // Reset distance counter
        boostCooldown = maxBoostCooldown; // Start cooldown
        setTimeout(() => {
            boostActive = false;
        }, 2000);
    }
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") leftPressed = false;
    if (e.key === "ArrowRight") rightPressed = false;
    if (e.key === "ArrowDown") brakePressed = false; 
});

function createPowerup() {
    let attempts = 0;
    let x, y;
    let validPosition = false;
    
    // Try to find a valid position (max 10 attempts)
    while (!validPosition && attempts < 10) {
        x = Math.random() * (canvas.width - powerupSize - 100) + 50;
        y = -powerupSize;
        
        if (isPositionValid(x, y, powerupSize, powerupSize)) {
            validPosition = true;
        }
        attempts++;
    }
    
    // If we couldn't find a valid position, skip creating this powerup
    if (!validPosition) {
        return;
    }
    
    const randomPowerup = powerupImgs[Math.floor(Math.random() * powerupImgs.length)];

    powerups.push({
        x,
        y,
        width: powerupSize,
        height: powerupSize,
        img: randomPowerup.img,
        type: randomPowerup.type
    });
}
setInterval(createPowerup, 5000);

function drawPowerups() {
    for (let i = 0; i < powerups.length; i++) {
        const p = powerups[i];
        if (p.img.complete) {
            ctx.drawImage(p.img, p.x, p.y, p.width, p.height);
        } else {
            ctx.fillStyle = "yellow";
            ctx.fillRect(p.x, p.y, p.width, p.height);
        }
    }
}

function movePowerups() {
    for (let i = 0; i < powerups.length; i++) {
        const p = powerups[i];
        p.y += currentObstacleSpeed;


if (checkCollision(
    { x: imageX, y: imageY, width: imageWidth, height: imageHeight },
    p   
)) {
    if (p.type === "coin") {
        score += 50; 
        coinSound.currentTime = 0; 
        coinSound.play();           


    } else if (p.type === "speed") {
        speedObstacle += 2;
        setTimeout(() => speedObstacle -= 2, 5000); 
    } else if (p.type === "shield") {
        shieldActive = true;
        shieldTimeRemaining = 5000; // shield lasts 5 seconds (5000ms)
    }

    
    powerups.splice(i, 1);
    i--;
    continue;

}
       
        if (p.y > canvas.height) {
            powerups.splice(i, 1);
            i--;
        }
    }
}


const themeButtons = document.querySelectorAll(".themeBtn");
themeButtons.forEach(button => {
    button.addEventListener("click", () => {
        themeButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const selectedTheme = button.dataset.theme;

        img.src = themes[selectedTheme].road;
        leftImg.src = themes[selectedTheme].left;
        rightImg.src = themes[selectedTheme].right;
    });
});

const playAgainBtn = document.getElementById("playAgainBtn");
playAgainBtn.addEventListener("click", () => {
    score = 0;
    gameOver = false;
    gamePaused = false;
    backgroundY = 0;
    speedObstacle = 3;
    imageX = canvas.width / 2 - 25;
    imageY = canvas.height - 120;
    obstacles.length = 0;
    powerups.length = 0;
    shieldActive = false;
    shieldTimeRemaining = 0;
    boostCharge = 0;
    totalDistance = 0;
    distanceSinceLastBoost = 0;
    boostCooldown = 0;
    document.getElementById("gameOverContainer").style.display = "none";
    update();
});
update();