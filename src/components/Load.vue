<template>
  <div class="load" ref="load">
    <div class="round"></div>
    <div class="tip">
      施主莫急，调色中...
    </div>
  </div>
</template>
<script>
import Velocity from "velocity-animate";
import { themes } from "@/common/global/global";
import { flattenAtlas } from "@/common/global/atlas";
import { isWeixin } from "@/common/utils/sniffer";

export default {
  inject: ["store"],
  data() {
    return {};
  },
  mounted() {
    this.playEntryMusic();
    this.preloadImages();
  },
  methods: {
    playEntryMusic() {
      if (isWeixin) {
        document.addEventListener("DOMContentLoaded", () => {
          const audioAutoPlay = () => {
            document.addEventListener("WeixinJSBridgeReady", () => {
              this.$audio_bg.playEntry();
            });
          };
          audioAutoPlay();
        });
      } else {
        this.$audio_bg.playEntry();
        // let myEvent = new Event("play");
        // document.addEventListener("play", () => {
        // });
        // if (window.dispatchEvent) {
        //   window.dispatchEvent(myEvent);
        // } else {
        //   window.fireEvent(myEvent);
        // }
      }
    },
    preloadImages() {
      const load = this.$refs.load;
      const loadReqs = flattenAtlas[this.store.colorType].map(url => {
        return new Promise(resolve => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = url;
        });
      });
      Promise.all(loadReqs).then(() => {
        this.store.nextStep();
        Velocity(load, { opacity: 0 }, { duration: 500 }).then(() => {
          load.remove();
        });
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@keyframes roundExpand {
  0% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.25);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
}

.load {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1a1c1e;
  z-index: 101;
  .round {
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    width: 1px;
    height: 1px;
    background-color: rgba($color: #4e5158, $alpha: 0.5);
    border-radius: 50%;
    box-shadow: 0 0 20px 40px #4e5158;
    animation: roundExpand 1.5s linear infinite;
  }
  .tip {
    position: absolute;
    bottom: 30vw;
    left: 0;
    width: 100%;
    font-size: 16px;
    color: #fff;
    text-align: center;
  }
}
</style>
