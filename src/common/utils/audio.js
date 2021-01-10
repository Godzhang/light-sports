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
  audio_bg.src = url;
  audio_bg.play();
  audio_bg.muted = false;

  isPlaying = true;
};

const play_band = (type, name) => {
  if (!type || !name) return;

  let url = "";
  if (!cache_band[`${type}-${name}`]) {
    cache_band[
      `${type}-${name}`
    ] = url = require(`../../assets/mp3/${type}/${name}.mp3`);
  } else {
    url = cache_band[`${type}-${name}`];
  }

  if (isBandPlaying) {
    audio_band.pause();
  }
  isBandPlaying = true;

  // 播放特效音时减小背景音的声音
  audio_bg.volume = 0.2;

  audio_band.src = url;
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
  play_band("yellow", "1");
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
      playMuted
    };
    Vue.prototype.$audio_band = {
      play: play_band,
      pause: pause_band
    };
    document.body.appendChild(audio_bg);
    document.body.appendChild(audio_band);
  }
};
