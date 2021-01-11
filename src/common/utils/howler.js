import { Howl } from "howler";
import { sleep } from "./utils";

let audio_bg = createHowl({ src: [require(`../../assets/mp3/bg/yellow.mp3`)] });
let audio_band = createHowl({
  src: [require(`../../assets/mp3/yellow/1.mp3`)]
});

const cache_bg = {};
const cache_band = {};

let isBgPlaying = false;
let isBandPlaying = false;

function createHowl(options, type = "bg") {
  const onend = type === "band" ? onBandend : onBgend;
  return new Howl({ ...options, onend });
}

const getBgAudio = name => {
  return require(`../../assets/mp3/bg/${name}.mp3`);
};

const getBandAudio = (type, name) => {
  return require(`../../assets/mp3/${type}/${name}.mp3`);
};

const playBg = name => {
  if (!name) return;

  let url = null;
  if (!cache_bg[name]) {
    cache_bg[name] = url = getBgAudio(name);
  } else {
    url = cache_bg[name];
  }

  if (isBgPlaying) {
    audio_bg.stop();
    audio_bg.unload();
  }
  isBgPlaying = true;

  audio_bg = createHowl({
    src: [url],
    volume: 1,
    loop: name !== "flash"
  });
  audio_bg.play();
};

const pauseBg = () => {
  if (isBgPlaying) {
    audio_bg.stop();
    audio_bg.unload();
    isBgPlaying = false;
  }
};

const playBand = async (type, name, isAllAtlas = true) => {
  if (!type || !name) return;

  let url = "";
  const key = `${type}-${name}`;
  if (cache_band[key] === "none") {
    return;
  } else if (!cache_band[key]) {
    try {
      cache_band[key] = url = getBandAudio(type, name);
    } catch (e) {
      cache_band[key] = "none";
      return;
    }
  } else {
    url = cache_band[key];
  }

  if (isBandPlaying) {
    audio_band.stop();
    audio_band.unload();
  }
  isBandPlaying = true;

  audio_band = createHowl(
    {
      src: [url],
      volume: 1
    },
    "band"
  );

  if (isAllAtlas && name === 1) {
    if (type === "yellow") {
      await sleep(4500);
    } else {
      await sleep(2000);
    }
  } else if (!isAllAtlas) {
    await sleep(1000);
  }
  // console.log(audio_bg);

  audio_bg.volume(0.2);

  audio_band.play();
};

const pauseBand = () => {
  if (isBandPlaying) {
    audio_band.stop();
    audio_band.unload();
    isBandPlaying = false;
  }
};

const initPlayBand = () => {
  audio_band = createHowl(
    {
      src: [require(`../../assets/mp3/yellow/1.mp3`)],
      mute: true
    },
    "band"
  );
  setTimeout(() => {
    audio_band.stop();
    audio_band.unload();
  }, 150);
};

function onBgend() {
  isBgPlaying = false;
}
function onBandend() {
  isBandPlaying = false;
  audio_bg.volume(1);
}

export default {
  install(Vue) {
    Vue.prototype.$playBg = playBg;
    Vue.prototype.$pauseBg = pauseBg;
    Vue.prototype.$playBand = playBand;
    Vue.prototype.$pauseBand = pauseBand;
    Vue.prototype.$initPlayBand = initPlayBand;
  }
};
