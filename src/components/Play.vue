<template>
  <div class="play" ref="play">
    <div class="image-box" ref="imageBox">
      <!-- <div class="img-wrapper" ref="wrapper">
        <img
          :src="img"
          class="img"
          v-for="(img, i) in images"
          :key="i"
          :style="{ 'z-index': i+1 }"
          ref="img"
          alt
        />
      </div>-->
      <div
        class="img"
        v-for="(img, i) in images"
        :key="i"
        :style="{ 'z-index': i + 1 }"
        ref="img"
      >
        <img :src="img" class="int" alt />
      </div>
      <div
        class="title"
        ref="title"
        v-if="atlasTitle[theme][titleIndex]"
        :style="{
          'font-size':
            atlasTitle[theme][titleIndex].length > 10 ? '24px' : '30px'
        }"
        v-html="atlasTitle[theme][titleIndex]"
      ></div>
      <div class="desc" ref="desc" v-html="atlasDesc[theme][titleIndex]"></div>
    </div>
    <div class="skip" ref="skip" @click="flash(false)"></div>
    <div class="mask" ref="mask"></div>
  </div>
</template>
<script>
import Velocity from "velocity-animate";
import {
  atlas,
  atlasTitle,
  atlasDesc,
  atlasBreakPoints
} from "@/common/global/atlas";
import { sleep } from "@/common/utils/utils";
import { coverBgColors } from "@/common/global/colors";
import { vw, vh } from "@/common/global/global";

const imageWidth = 848;
const imageHeight = 616;
const newWidth = document.documentElement.clientWidth;
const newHeight = (newWidth * imageHeight) / imageWidth;

export default {
  inject: ["store"],
  data() {
    return {
      atlasTitle,
      atlasDesc,
      atlasBreakPoints,
      images: [],
      titleIndex: 0,
      isCurrentPage: false,
      isAllAtlas: true
    };
  },
  mounted() {
    this.init();
    this.$watch("store.step", async (step, prevStep) => {
      if (step !== 3) return;
      if (prevStep === 2) {
        this.isAllAtlas = true;
        // 展示所有图集
        this.images = atlas[this.store.colorType].reduce(
          (res, curr) => [...res, ...curr],
          []
        );
        // this.images = atlas[this.store.colorType][0];
      } else if (prevStep === 4) {
        this.isAllAtlas = false;
        this.images = atlas[this.theme][this.store.groupIndex];
      }

      this.setTitleIndex();

      this.$nextTick(async () => {
        this.isCurrentPage = true;

        await this.initSize();
        this.showPage();
        this.initTextPos();
        await this.play();
      });
    });
    this.$watch("store.groupIndex", groupIndex => {
      this.setTitleIndex();
    });
  },
  computed: {
    theme() {
      return this.store.colorType;
    },
    firstImageAnimateClass() {
      return `${this.theme}-one-animate`;
    }
  },
  methods: {
    init() {
      this.images = atlas[this.theme][this.store.groupIndex];
    },
    showPage() {
      const { play } = this.$refs;
      play.style.opacity = 1;
      play.style.transform = "translateY(0)";
    },
    initTextPos() {
      const { title, desc } = this.$refs;
      const img = this.$refs.img[0];
      const bodyHeight = document.body.clientHeight;
      const imgHeight = +img.style.height.slice(0, -2);
      const imgTop = (bodyHeight - imgHeight) / 2;
      const imgBottom = (bodyHeight - imgHeight) / 2 + imgHeight;
      title.style.top = imgTop - 30 * 1.25 * 2 + "px";
      desc.style.top = imgBottom + 20 + "px";
    },
    initSize() {
      const imgs = this.$refs.img;
      imgs.forEach((img, i) => {
        img.style.width = newWidth + "px";
        img.style.height = newHeight + "px";
        img.style.opacity = i === 0 ? 1 : 0;
      });
      // const documentWidth = document.body.clientWidth;

      // const imgs = this.$refs.img;
      // const imgInstances = imgs.map(item => item.childNodes[0]);

      // const reqs = imgInstances.map((imgIns, i) => {
      //   return new Promise(resolve => {
      //     imgIns.onload = () => {
      //       imgs[i].style.width = newWidth + "px";
      //       imgs[i].style.height = newHeight + "px";

      //       resolve();
      //     };
      //     imgIns.onerror = resolve;
      //     imgIns.src = this.images[i];
      //   });
      // });
      // return Promise.all(reqs);
    },
    async play() {
      const { imageBox, play, skip, mask, title, desc } = this.$refs;
      const imgs = this.$refs.img;
      const wait = this.theme === "yellow" ? 3000 : 2500;
      const points = atlasBreakPoints[this.theme];
      let prevTitleIndex = 1;

      const walk = async (i = 0) => {
        if (!this.isCurrentPage) return Promise.reject(new Error("stop"));
        const curr = imgs[i];
        const next = imgs[i + 1];
        const isReverse = (i + 1) % 2 === 0;
        const nextImage = next.childNodes[0];
        // 标题展示逻辑
        if (this.isAllAtlas && points.includes(i + 1)) {
          this.titleIndex = points.indexOf(i + 1);

          // 切换图集后，尝试播放特效音
          try {
            if (this.prevTitleIndex !== this.titleIndex + 1) {
              this.$pauseBand();
            }
            this.$playBand(this.theme, this.titleIndex + 1);
            prevTitleIndex = this.titleIndex + 1;
          } catch (e) {
            console.log("not have relative audio");
          }
        } else if (!this.isAllAtlas) {
          this.titleIndex = this.store.groupIndex;
        }

        Velocity(
          nextImage,
          { scale: isReverse ? 1.05 : 1 },
          { duration: 0, mobileHA: false }
        );
        Velocity(next, { opacity: 1 }, { mobileHA: false, duration: 500 });
        Velocity(
          nextImage,
          {
            scale: isReverse ? 1 : 1.05,
            translateX: ["-50%", "-50%"],
            translateY: ["-50%", "-50%"]
          },
          { duration: 2500, mobileHA: false, queue: false }
        );

        await sleep(wait);
        setTimeout(() => {
          Velocity(nextImage, { scale: 1 }, { duration: 0, mobileHA: false });
        }, 500);
        if (i === imgs.length - 2) {
          return Promise.resolve();
        } else {
          await walk(i + 1);
        }
      };

      // 从图集页进入标题不显示
      if (this.isAllAtlas) {
        // 如果第一组图有特效音，播放
        try {
          this.$playBand(this.theme, 1);
        } catch (e) {
          console.log("not have relative audio");
        }

        imgs[0].classList.add(this.firstImageAnimateClass); // 首张图片缩放动画

        if (this.store.colorType === "yellow") {
          await sleep(4000);
          Velocity(
            skip,
            { translateX: ["0%", "100%"], opacity: 1 },
            { duration: 500, mobileHA: false }
          );
          Velocity(
            title,
            { opacity: 1 },
            { duration: 300, delay: 1500, mobileHA: false }
          );
          Velocity(
            desc,
            { opacity: 1 },
            { duration: 300, delay: 1800, mobileHA: false }
          );
          await sleep(3500);
        } else {
          await sleep(3000);
          Velocity(
            skip,
            { translateX: ["0%", "100%"], opacity: 1 },
            { duration: 500, mobileHA: false }
          );
          Velocity(title, { opacity: 1 }, { duration: 300, mobileHA: false });
          Velocity(
            desc,
            { opacity: 1 },
            { duration: 300, delay: 150, mobileHA: false }
          );
          await sleep(1500);
        }
      } else {
        try {
          this.$playBand(this.theme, this.store.groupIndex + 1, false);
        } catch (e) {
          console.log("not have relative audio");
        }
        const image = imgs[0].childNodes[0];
        Velocity(image, { scale: 1.05 }, { duration: 0, mobileHA: false });
        Velocity(
          image,
          {
            scale: 1,
            translateX: ["-50%", "-50%"],
            translateY: ["-50%", "-50%"]
          },
          { duration: 2500, mobileHA: false, queue: false }
        );
        Velocity(
          skip,
          { translateX: ["0%", "100%"], opacity: 1 },
          { duration: 500, delay: 800, mobileHA: false }
        );
        Velocity(
          title,
          { opacity: 1 },
          { duration: 300, delay: 800, mobileHA: false }
        );
        Velocity(
          desc,
          { opacity: 1 },
          { duration: 300, delay: 800, mobileHA: false }
        );
        await sleep(wait);
      }

      await walk();

      this.flash();
    },
    async flash(playAudio = true) {
      const { mask, play, skip, title, desc } = this.$refs;

      this.$pauseBand();
      if (playAudio) {
        this.$playBg("flash");
        await sleep(300); // 相机声音预留的时间
      } else {
        this.$pauseBg();
      }

      this.store.nextStep();
      mask.classList.add("animate");
      await sleep(250);

      this.hidePage();
      this.isCurrentPage = false;
      setTimeout(() => {
        this.resetStyles();
      }, 500);
    },
    hidePage() {
      const { play } = this.$refs;
      play.style.opacity = 0;
      play.style.transform = `translateY(-100%)`;
    },
    resetStyles() {
      const { mask, imageBox, play, skip, title, desc } = this.$refs;
      const imgs = this.$refs.img;

      skip.style.opacity = 0;
      skip.style.transform = "translateX(100%)";
      title.style.opacity = 0;
      desc.style.opacity = 0;
      imageBox.classList.remove("animate");
      if (imgs[0].classList.length === 2) {
        imgs[0].classList.remove(imgs[0].classList.item(1));
      }
      imgs.forEach((img, i) => {
        img.style.transform = "";
        img.style.opacity = i > 0 ? 0 : 1;
      });
      mask.classList.remove("animate");
    },
    setTitleIndex() {
      if (this.isAllAtlas) {
        this.titleIndex = 0;
      } else {
        this.titleIndex = this.store.groupIndex;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../styles/animate.scss";

.play {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: translateY(-100%);
  z-index: 97;
  background-color: #000;
  .image-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: 45vw 4.47vw;
    overflow: hidden;
    &.animate {
      animation: boxNarrow 1s ease-in-out forwards;
    }
    .img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      // opacity: 0;
      overflow: hidden;
      transform-origin: 50% 50%;
      &:first-child {
        // opacity: 1;
        &.yellow-one-animate {
          // animation: yellow0Clarity 7s ease-in-out forwards;
          animation: yellowOneClarity 7s cubic-bezier(0.39, 0.575, 0.565, 1)
            forwards;
          // transform: translate(-50%, -50%) scale(1);
        }
        // @each $color in red, green, blue, white {
        //   &.#{"" + $color}-#{0}-animate {
        //     transform: translate(-50%, -50%) scale(1);
        //   }
        // }
        // @each $color in red, green, blue, white, yellow {
        @each $color in red, green, blue, white {
          &.#{"" + $color}-one-animate {
            animation: #{$color}OneClarity 3s ease-in-out forwards;
            // transform: translate(-50%, -50%) scale(1);
          }
        }
      }
      .int {
        position: absolute;
        top: 50%;
        left: 50%;
        height: 100%;
        transform: translate(-50%, -50%);
      }
      &:last-child {
        &.red-animate {
          animation: redFirstNarrow 1s ease-out forwards;
        }
      }
    }
    .title {
      box-sizing: border-box;
      position: absolute;
      top: 30vw;
      left: 50%;
      width: 100%;
      line-height: 1.25;
      text-align: center;
      transform: translateX(-50%);
      color: #fff;
      opacity: 0;
      white-space: pre-wrap;
    }
    .desc {
      box-sizing: border-box;
      position: absolute;
      top: 135vw;
      left: 50%;
      width: 100%;
      padding: 0 5vw;
      text-align: center;
      transform: translateX(-50%);
      font-size: 20px;
      line-height: 24px;
      color: #fff;
      opacity: 0;
      white-space: pre-wrap;
    }
  }
  .skip {
    position: absolute;
    top: 12vw;
    right: 0;
    width: 20vw;
    height: 10vw;
    z-index: 10;
    opacity: 0;
    background: url(../assets/skip.png) 0 0 no-repeat;
    background-size: 100% 100%;
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    z-index: 1000;
    background-color: #fff;
    &.animate {
      display: block;
      animation: flash 1s ease forwards;
    }
  }
}
</style>
