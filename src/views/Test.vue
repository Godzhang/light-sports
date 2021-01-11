<template>
  <div class="test">
    <!-- <div class="lamp">
      <img src="../assets/cover/green-lamp.png" alt />
      <div class="mask"></div>
    </div>-->
    <img ref="img" @click="playAudio" :src="src" alt />
    <button style="width: 200px" @click="changeVol(2)">
      2
    </button>
    <br />
    <button style="width: 200px" @click="changeVol(4)">
      4
    </button>
    <br />
    <button style="width: 200px" @click="changeVol(6)">
      6
    </button>
    <br />
    <button style="width: 200px" @click="changeVol(8)">
      8
    </button>
    <!-- <audio src ref="audio"></audio> -->
    <!-- <canvas id="canvas" ref="canvas"></canvas> -->
  </div>
  <!-- <div class="test" ref="test">
    <img src="../assets/atlas/red/1/4-1.jpg" alt />
  </div>-->
</template>
<script>
import { Howl, Howler } from "howler";
import { atlas, redAtlasCover } from "@/common/global/atlas";
import { once } from "@/common/utils/utils";
import getCompositionUrl from "@/common/utils/composition";

const vw = document.body.clientWidth / 100;
// const imageWidth = 63.2 * vw * 2; // 261.648
// const imageHeight = 94.4 * vw * 2; // 390.816

export default {
  data() {
    return {
      src: "",
      iframe: null,
      sound: null,
      url: ""
    };
  },
  mounted() {
    this.init();
    this.initHowl();
    // this.playAudio();
    // this.initCanvas();
  },
  methods: {
    async init() {
      // const pics = atlas.red.reduce((res, curr) => [...res, ...curr], []);
      let color = "green";
      const pics = atlas[color][0];
      const result = await getCompositionUrl(pics, color);
      this.src = result[0];
    },
    initCanvas() {
      const canvas = this.$refs.canvas;
      const context = canvas.getContext("2d");
      const color = "yellow";
      const pics = atlas[color][0];
      const wrapperWidth = 91 * vw;
      const wrapperHeight = 52 * vw;
      const imageWidth = wrapperWidth * 0.765;
      const imageHeight = wrapperHeight;

      canvas.width = wrapperWidth;
      canvas.height = wrapperHeight;

      const img = new Image();
      img.src = pics[0];
      img.onload = () => {
        context.drawImage(img, 0, 0, imageWidth, imageHeight);
      };
    },
    playAudio() {
      this.sound.stop();
      this.url = require("../assets/mp3/bg/red.mp3");
      this.sound.unload();
      this.sound = new Howl({
        src: [this.url],
        volume: 1
      });
      this.sound.play();
      // const url = require("../assets/mp3/bg/yellow.mp3");
      // this.$refs.audio.src = url;
      // this.$refs.audio.play();
      // this.$audio_bg.play("yellow");
      // this.$audio_band.play("yellow", 1);
    },
    changeVol(vol) {
      this.sound.volume(vol / 10);
      // this.$refs.audio.volume = vol / 10;
      // this.$audio_bg.audio.volume = vol / 10;
    },
    initHowl() {
      this.url = require("../assets/mp3/bg/yellow.mp3");
      this.sound = new Howl({
        src: [this.url],
        volume: 1,
        autoplay: true
      });
      console.log(this.sound);

      // this.sound.play();
    }
  }
};
</script>
<style lang="scss" scoped>
$lamp-width: 42vw;
$lamp-height: 130vw;

.test {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #16430d;
  img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 91vw;
    height: 52vw;
    box-shadow: 0 0 10px 2px rgba($color: #000000, $alpha: 0.5);
  }
  #canvas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 60%);
    width: 91vw;
    height: 52vw;
  }
  .lamp {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: $lamp-width;
    height: $lamp-height;
    img {
      width: 100%;
      height: 100%;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba($color: #430d0d, $alpha: 0.8);
      clip-path: polygon(42% 0, 48% 0, 53% 30%, 100% 100%, 0 100%, 38% 30%);
      // clip-path: url(../assets/cover/green-lamp.png);
    }
    // background: url("~@/assets/cover/green-lamp.png") 0 0 no-repeat;
    // background-size: 100% 100%;
  }
}
</style>
