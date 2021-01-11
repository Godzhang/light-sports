import { sleep } from "./utils";

const audio_bg = new Audio();
const audio_band = new Audio();

let isPlaying = false;
let isBandPlaying = false;

const cache = {};
const cache_band = {};

const play_bg = name => {
  if (!name) return;

  audio_bg.loop = name !== "flash";

  let url = "";
  if (!cache[name]) {
    cache[name] = url = require(`../../assets/mp3/${
      name === "flash" ? "" : "bg/"
    }${name}.mp3`);
  } else {
    url = cache[name];
  }

  if (isPlaying) {
    audio_bg.pause();
  }
  isPlaying = true;

  audio_bg.src = url;
  audio_bg.play();
};

const pause_bg = () => {
  if (isPlaying) {
    audio_bg.pause();
    isPlaying = false;
  }
};

const playEntry = () => {
  const url = require("../../assets/mp3/bg/entry.mp3");
  audio_bg.muted = true;
  audio_bg.loop = true;
  audio_bg.src = url;
  audio_bg.play();
  audio_bg.volume = 1;
  audio_bg.muted = false;

  isPlaying = true;
};

const play_band = async (type, name, flag = true) => {
  if (!type || !name) return;

  let url = "";
  const key = `${type}-${name}`;
  if (cache_band[key] === "none") {
    return;
  } else if (!cache_band[key]) {
    try {
      cache_band[key] = url = require(`../../assets/mp3/${type}/${name}.mp3`);
    } catch (e) {
      cache_band[key] = "none";
      return;
    }
  } else {
    url = cache_band[key];
  }

  if (isBandPlaying) {
    audio_band.pause();
  }
  isBandPlaying = true;

  // 播放特效音时减小背景音的声音

  audio_band.src = url;
  // 科比的声音延时播放
  if (name === 1) {
    if (type === "yellow") {
      await sleep(4500);
    } else {
      await sleep(2000);
    }
  }
  if (flag) {
    audio_bg.volume = 0.2;
  }
  audio_band.play();
};

const pause_band = () => {
  if (isBandPlaying) {
    audio_band.pause();
    isBandPlaying = false;
  }
};

const playMuted = () => {
  // audio_bg.muted = true;
  play_band.muted = true;
  // play_bg("flash");
  play_band("yellow", "1", false);
  setTimeout(() => {
    // pause_bg();
    pause_band();
    // audio_bg.muted = false;
    play_band.muted = false;
  }, 250);
};

audio_bg.addEventListener("ended", () => {
  isPlaying = false;
});
audio_band.addEventListener("ended", () => {
  isBandPlaying = false;
  audio_bg.volume = 1;
});

export default {
  install(Vue) {
    Vue.prototype.$audio_bg = {
      play: play_bg,
      pause: pause_bg,
      playEntry,
      audio: audio_bg
    };
    Vue.prototype.$audio_band = {
      play: play_band,
      pause: pause_band,
      playMuted
    };
    document.body.appendChild(audio_bg);
    document.body.appendChild(audio_band);
  }
};
