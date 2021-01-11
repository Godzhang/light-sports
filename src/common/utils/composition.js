import { vw } from "@/common/global/global";
import { altasInfos } from "@/common/global/atlas";

const wrapperWidth = 91 * vw;
const wrapperHeight = 52 * vw;
const imageWidth = wrapperWidth * 0.765;
const imageHeight = wrapperHeight;

const erweimaTop = 45.3 * vw;
const erweimaLeft = 77.07 * vw;
const erweimaWidth = 5.47 * vw;
const erweimaHeight = 6.13 * vw;

let erweima;
let box;
const boxCache = {};
const cache = {};

const loadBox = type => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = require(`../../assets/shuffle/${type}-box.png`);
  });
};
const loadErweima = () => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.src = require(`../../assets/shuffle/erweima.png`);
  });
};

const loadImage = src => {
  const boxRatio = imageWidth / imageHeight;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const ratio = width / height;
      if (boxRatio < ratio) {
        resolve({
          img,
          width: (imageHeight * width) / height,
          height: imageHeight
        });
      } else {
        resolve({
          img,
          width: imageWidth,
          height: (imageWidth * height) / width
        });
      }
    };
    img.onerror = resolve;
    img.src = src;
  });
};

const drawText = (context, type, index) => {
  const { value, fontSize, disRatio, textTop, textLeft } = altasInfos[type][
    index
  ] || {
    fontSize: 36,
    value: "标题",
    disRatio: 5.5 * vw,
    textTop: 18 * vw,
    textLeft: 80 * vw
  };

  context.textAlign = "center";
  context.textBaseline = "middle";
  for (let i = 0; i < value.length; i++) {
    let top = textTop + i * disRatio;
    let text = Array.isArray(value[i]) ? value[i].join("") : value[i];
    context.font = `bold ${fontSize}px 黑体`;
    context.strokeStyle = "#000";
    context.lineWidth = 2;
    context.strokeText(value[i], textLeft, top);

    context.font = `bold ${fontSize}px 黑体`;
    context.fillStyle = "#fff";
    context.fillText(text, textLeft, top);
  }
};

const drawClip = context => {
  context.beginPath();
  context.moveTo(55, 0);
  context.lineTo(0, 55);
  context.lineTo(0, imageHeight - 55);
  context.lineTo(55, imageHeight);
  context.lineTo(imageWidth - 50, imageHeight);
  context.lineTo(imageWidth, imageHeight - 50);
  context.lineTo(imageWidth, 50);
  context.lineTo(imageWidth - 50, 0);
  context.stroke();
  context.clip();
};

const createImageClip = img => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = imageWidth;
  canvas.height = imageHeight;

  drawClip(context);
  context.drawImage(img, 0, 0, imageWidth, imageHeight);

  return canvas;
};

const createDataUrl = ({ img, width, height }, type, index) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = wrapperWidth;
  canvas.height = wrapperHeight;

  const imgClipCanvas = createImageClip(img);

  context.drawImage(imgClipCanvas, 0, 0, imageWidth, imageHeight);
  if (box) {
    context.drawImage(box, 0, 0, wrapperWidth, wrapperHeight);
  }

  context.drawImage(
    erweima,
    erweimaLeft,
    erweimaTop,
    erweimaWidth,
    erweimaHeight
  );

  drawText(context, type, index);

  return canvas.toDataURL();
};

const getCompositionUrl = async (urls = [], type = "red") => {
  if (!urls.length) return [];

  if (cache[type]) return cache[type];

  if (boxCache[type]) {
    box = boxCache[type];
  } else {
    boxCache[type] = box = await loadBox(type);
  }
  erweima = await loadErweima();

  const loadImages = urls.map(url => loadImage(url));
  const imgInfos = await Promise.all(loadImages);
  const result = imgInfos.map((imgInfo, index) =>
    createDataUrl(imgInfo, type, index)
  );

  cache[type] = result;

  return result;
};

export default getCompositionUrl;
