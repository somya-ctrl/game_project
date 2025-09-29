const canvasR = document.getElementById("right");
const ctxR = canvasR.getContext("2d");

canvasR.width = 100;
canvasR.height = window.innerHeight;

const rightImg = new Image();
rightImg.src = "assets/image1.jpg";


const canvasL = document.getElementById("left");
const ctxL = canvasL.getContext("2d");

canvasL.width = 100;
canvasL.height = window.innerHeight;

const leftImg = new Image();
leftImg.src = "assets/image2.jpg";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = window.innerHeight;

// Game variables 
let x = 0;
let pause = true;
let gameOver = false; 
let backgroundY = 0;
let backgroundSpeed = 5;
let score = 0;
let speedObstacle = 3;
let imageX = canvas.width / 2 - 25;
let imageY = canvas.height - 120;
const imageWidth = 45;
const imageHeight = 80;
const movespeed = 10;

let scoreInterval;
let obstacleInterval;
let powerupInterval;
let speedInterval;

// Start game loops
function startGameLoops() {
    scoreInterval = setInterval(() => {
        score += 1;
    }, 10);

    obstacleInterval = setInterval(createObstacle, 700);

    speedInterval = setInterval(() => {
        if (speedObstacle < 12) {
            speedObstacle += 1;
        }
    }, 10000);

    powerupInterval = setInterval(createPowerup, 5000);
}

// Stop game loops
function stopGameLoops() {
    clearInterval(scoreInterval);
    clearInterval(obstacleInterval);
    clearInterval(powerupInterval);
    clearInterval(speedInterval);
}

// new is used to create an instance of an object
// Background imagees
const img = new Image();
img.src = "assets/road.jpg";

const moto = new Image();
moto.src = "assets/car2.png";

// Obstacle images
const obstacleImgs = [
    "assets/car1.png",
    "assets/car2.png",
    "assets/car3.png",
    "assets/car4.png",
    "assets/car5.png",
    "assets/car.png"
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Powerup images
const powerupImgs = [
    { src: "assets/points.1.png", type: "coin" },
    { src: "assets/shield1.png", type: "shield" },
    { src: "assets/image5.jpg", type: "speed" }
].map(p => {
    const img = new Image();
    img.src = p.src;
    return { img, type: p.type };
});

const powerups = [];
const powerupSize = 30;
let shieldActive = false;


const obstacleWidth = 40;
const obstaclesHeight = 80;
const obstacles = [];

//-----Draw function-----
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
    
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    if (shieldActive) {
        ctx.beginPath();
        ctx.arc(imageX + imageWidth / 2, imageY + imageHeight / 2, imageWidth, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        ctx.fill();
        ctx.closePath();
    }

    if(pause){
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Press 'Escape' to Start", canvas.width / 2 - 180, canvas.height / 2);
    }else{
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "20px Arial";
        ctx.fillText("Press 'Escape' to Pause", canvas.width / 2 - 100, canvas.height - 10);
    }
}

//-----Update function-----
function update() {
    
    if (gameOver) return;
    
    backgroundY = backgroundY + backgroundSpeed;
    if(backgroundY >= canvas.height){
        backgroundY = 0;
    }

    if (pause) {
        draw();
        return;
    }
    draw();
    moveObstacles();
    drawObstacles();
    movePowerups();
    drawPowerups();
    requestAnimationFrame(update);
}

// create obstacles code
function createObstacle() {
    const x = Math.random() * (canvas.width - obstacleWidth - 100) + 50;
    const y = -obstaclesHeight;
    const randomImg = obstacleImgs[Math.floor(Math.random() * obstacleImgs.length)];
    
    obstacles.push({ 
        x,
        y,
        width: obstacleWidth,
        height: obstaclesHeight,
        img: obstacleImgs[Math.floor(Math.random() * obstacleImgs.length)]
    });
}      

// draw obstacles code
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

// collision code
function checkCollision(rect1, rect2) {
    return (
        rect1.x <= rect2.x + rect2.width - 12 &&
        rect1.x + rect1.width - 12 >= rect2.x &&
        rect1.y <= rect2.y + rect2.height - 19 &&
        rect1.y + rect1.height - 19 >= rect2.y
    );
}

// move obstacles code
function moveObstacles(){
    for(let i = 0; i < obstacles.length; i++){
        obstacles[i].y += speedObstacle;
        if(checkCollision({
            x: imageX,
            y: imageY, 
            width: imageWidth, 
            height: imageHeight},
            obstacles[i]
        ) && !shieldActive){ {
            console.log("Collision detected!");
            gameOver = true;
            alert(`Game Over!
                Your score: ${score}`);
                document.location.reload();
                return;
            }
            if(obstacles[i].y > canvas.height){
                obstacles.splice(i, 1);
                i--; // Adjust index after removal
            }
        }
    };
}
    // move car code
    document.addEventListener("keydown", (e)=> {
        if(e.key === "ArrowLeft" && imageX > 50){
            imageX -= movespeed;
        }
        if(e.key === "ArrowRight" && imageX < 454 - imageWidth){
            imageX += movespeed;
        }
    });
    
    // powerup code
    function createPowerup() {
        const x = Math.random() * (canvas.width - powerupSize - 100) + 50;
        const y = -powerupSize;
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
    drawPowerups();
    
    function movePowerups() {
        for (let i = 0; i < powerups.length; i++) {
            const p = powerups[i];
            p.y += speedObstacle;
            
            if (checkCollision(
                { x: imageX, y: imageY, width: imageWidth, height: imageHeight },
                p   
            )) {
            if (p.type === "coin") {
                score += 50; 
            } else if (p.type === "speed") {
                speedObstacle += 2;
                setTimeout(() => speedObstacle -= 2, 5000); 
            } else if (p.type === "shield") {
                shieldActive = true;
                setTimeout(() => shieldActive = false, 5000); 
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
update();

// Pause and Resume code
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        pause = !pause;
        if (pause) {
            backgroundSpeed = 0;
            stopGameLoops();
        } else {
            backgroundSpeed = 5;
            startGameLoops();
            update();
        }
    }
});