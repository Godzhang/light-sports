const audio = new Audio();
let isPlaying = false;

const cache = {};

const play = name => {
  if (!name) return;

  let url = "";
  if (!cache[name]) {
    cache[name] = url = require(`../../assets/mp3/${name}.mp3`);
  } else {
    url = cache[name];
  }

  if (isPlaying) {
    audio.pause();
  }
  isPlaying = true;

  audio.src = url;
  audio.play();
};

const pause = () => {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
  }
};

const playMuted = () => {
  audio.muted = true;
  play("flash");
  setTimeout(() => {
    pause();
    audio.muted = false;
  }, 250);
};

audio.addEventListener("ended", () => {
  isPlaying = false;
});

export default {
  install(Vue) {
    Vue.prototype.$audio = { play, pause, playMuted };
    document.body.appendChild(audio);
  }
};
