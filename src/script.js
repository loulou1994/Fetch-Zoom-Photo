const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fetchPhotoBtn = document.querySelector("button");

let cvsWidth = canvas.width;
let cvsHeight = canvas.height;
let originImg;
let imgData;
let imgIsLoaded = false;

const getRandomImg = async () => {
  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random/?client_id=${process.env.ACCESS_KEY}`
    );
    const data = await res.json()
    return data.urls.regular
  } catch (error) {
    console.log("error happened " + error)
  }
};

const generateImg = async () => {
  const newImg = new Image();
  newImg.crossOrigin = "Anonymous";

  imgIsLoaded = false;

  newImg.addEventListener("load", (e) => {
    imgIsLoaded = true;
    originImg = e.target;
    const ratio = newImg.height / newImg.width;
    canvas.height = cvsHeight = cvsWidth * ratio;

    ctx.drawImage(newImg, 0, 0, cvsWidth, canvas.height);
    imgData = ctx.getImageData(0, 0, cvsWidth, cvsHeight);
  });

  newImg.src = await getRandomImg();
};

const drawCircle = (rad, e) => {
  const [posX, posY] = moveCircle(e);

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(posX, posY, rad, 0, Math.PI * 2);
  ctx.stroke();
  ctx.clip();

  return [posX, posY, rad];
};

const moveCircle = (mouseEv) => {
  const { x, y } = mouseEv.target.getBoundingClientRect();
  const mouseX = mouseEv.clientX;
  const mouseY = mouseEv.clientY;

  return [mouseX - x, mouseY - y];
};

canvas.addEventListener("mousemove", (eventObj) => {
  if (imgIsLoaded) {
    ctx.save();
    ctx.clearRect(0, 0, cvsWidth, cvsHeight);
    ctx.putImageData(imgData, 0, 0);

    const [arcX, arcY, radius] = drawCircle(45, eventObj);

    const newX = (arcX / imgData.width) * originImg.width;
    const newY = (arcY / imgData.height) * originImg.height;

    let offsetX = newX - arcX - radius / 2;
    let offsetY = newY - arcY - radius / 2;

    offsetX = offsetX <= 0 ? 0 : offsetX;
    offsetY = offsetY <= 0 ? 0 : offsetY;

    ctx.drawImage(
      originImg,
      0,
      0,
      originImg.width,
      originImg.height,
      -offsetX,
      -offsetY,
      originImg.width,
      originImg.height
    );
    ctx.restore();
  }
});

fetchPhotoBtn.addEventListener("click", generateImg);

generateImg();