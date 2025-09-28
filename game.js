const canvas = document.getElementById("road");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = window.innerHeight;

const roadImg = new Image();
roadImg.src = "assets/road.jpg";

const moto = new Image();
moto.src = "assets/moto.png";

let imageX = 250, imageY = canvas.height - 150, imageWidth = 100, imageHeight = 150;
let roadY = 0;
const roadSpeed = 5;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(roadImg, 0, roadY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(roadImg, 0, roadY, canvas.width, canvas.height);
    ctx.drawImage(moto, imageX, imageY, imageWidth, imageHeight);
}


function animate() {
    roadY += roadSpeed;
    if (roadY >= canvas.height) roadY = 0;

    draw();
    requestAnimationFrame(animate);
}
roadImg.onload = () => {
    moto.onload = () => {
        animate();
    };
};
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const step = 30;

leftBtn.addEventListener("click", () => {
  if (imageX > 0) { 
    imageX -= step; 
  }
});

rightBtn.addEventListener("click", () => {
  if (imageX < canvas.width - imageWidth) {
    imageX += step;
  }
});


