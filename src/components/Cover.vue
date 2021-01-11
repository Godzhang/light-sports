<template>
  <div class="cover" ref="cover">
    <div class="cover-bg" ref="coverBg"></div>
    <div class="lamp-box" ref="lampBox" @click="showColorAtlas">
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide
          v-for="(color, i) in themes"
          :key="color"
          :data-color="color"
        >
          <div class="lamp-item" ref="lamp">
            <div class="gradient"></div>
            <div :class="['lamp', color]">
              <img :src="lamps[color]" alt class="lamp-img" />
              <div class="mask"></div>
            </div>
            <div :class="['lamp-light', color]" :data-index="i"></div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <div class="note" ref="note">
      <img class="text-pic" src="../assets/cover/color-sport.png" />
    </div>
    <div class="logo" ref="logo">
      <img class="logo-pic" src="../assets/cover/logo.png" />
    </div>
    <a
      :class="['vote-entry', store.colorType]"
      ref="voteEntry"
      @click="store.setVoteVisible(true)"
    >
      <span class="vote-entry-txt">pick你心中的年度体育色彩</span>
    </a>
  </div>
</template>
<script>
import Velocity from "velocity-animate";
import {
  gradientColors,
  gradientRgbColors,
  coverBgColors,
} from "@/common/global/colors.js";
import {
  hexToRgba,
  colorMix,
  getMixColorRgbStr,
  sleep,
  clip,
  once,
} from "@/common/utils/utils.js";
import { atlas, flattenAtlas } from "@/common/global/atlas";
import { themes } from "@/common/global/global";

const documentWidth = document.body.clientWidth;
const documentHeight = document.body.clientHeight;
const vw = documentWidth / 100;

const lamps = {};
themes.forEach((color) => {
  lamps[color] = require(`../assets/cover/${color}-lamp.png`);
});

export default {
  name: "Cover",
  inject: ["store"],
  data() {
    return {
      themes,
      lamps,
      percentage: 0,
      timer: null,
      moveDir: "right",
      isSliding: false,
      isTrigger: false,
      savedActiveIndex: 0,
      moveX: 0,
      moveTime: 0,
      swiperOptions: {
        initialSlide: 0,
        touchRatio: 0.25,
        watchSlidesProgress: true,
        slidesPerView: 5,
        centeredSlides: true,
        loop: true,
        on: {
          init: () => {
            this.$nextTick(() => {
              this.calcSlidePos();
            });
          },
          progress: (progress) => {
            this.$nextTick(() => {
              this.calcSlidePos(progress);
            });
          },
          transitionEnd: () => {
            this.$nextTick(() => {
              if (this.store.step === 2) {
                this.store.setType(themes[this.swiper.realIndex]);
              }
              this.savedActiveIndex = this.swiper.activeIndex;
            });
          },
          slideNextTransitionStart: () => {
            this.moveDir = "right";
          },
          slidePrevTransitionStart: () => {
            this.moveDir = "left";
          },
        },
      },
    };
  },
  created() {
    // init random color
    let initIndex = Math.floor(Math.random() * 5);
    this.store.setType(themes[initIndex]);
    this.swiperOptions.initialSlide = initIndex;
  },
  mounted() {
    this.init();
    this.$watch("store.step", async (step, prevStep) => {
      if (step === 2) {
        // 如果不是从Load页面进入，需重置页面
        if (prevStep !== 1) {
          this.resetCoverPage();
          this.$playBg("entry");
          // 如果从图集页返回，自动往下啵一个
          setTimeout(() => {
            this.swiper.slideNext(300);
          }, 800);
        }
        this.showPage(); // 显示整体页面
        await this.showParts(); // 显示页面各部分
        this.pollLight(); // 间隔2s无序亮灯
      }
    });
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },
    theme() {
      return this.store.colorType;
    },
  },
  watch: {
    theme(theme) {
      const coverBg = this.$refs.coverBg;
      const coverBgColor = coverBg.style.backgroundColor.slice(4, -1);
      const bgColor = hexToRgba(coverBgColors[theme]).rgbStr;
      if (coverBgColor !== bgColor) {
        coverBg.style.backgroundColor = coverBgColors[theme];
      }
    },
  },
  methods: {
    init() {
      this.$refs.coverBg.style.backgroundColor = coverBgColors[this.theme];
      this.bindAudio();
      this.bindSwiper();
    },
    bindAudio() {
      const lampBox = this.$refs.lampBox;
      once(lampBox, "touchstart", () => {
        this.$initPlayBand();
      });
    },
    bindSwiper() {
      const swiperDom = this.$refs.mySwiper.$el;
      let startX = 0;
      let startTime = 0;

      swiperDom.addEventListener("touchstart", (e) => {
        this.isSliding = true;
        startX = e.touches[0].clientX;
        startTime = Date.now();
      });
      swiperDom.addEventListener("touchmove", (e) => {
        if (!this.isSliding) return;
        this.moveX = Math.abs(e.touches[0].clientX - startX);
        if (e.touches[0].clientX - startX < 0) {
          this.moveDir = "right";
        } else {
          this.moveDir = "left";
        }
      });
      swiperDom.addEventListener("touchend", () => {
        this.moveTime = Date.now() - startTime;
        this.isSliding = false;
      });
    },
    showPage() {
      const { cover } = this.$refs;
      cover.style.opacity = 1;
      cover.style.transform = `translateY(0)`;
    },
    async showParts() {
      const { note, logo, voteEntry } = this.$refs;
      this.showSlide();
      Velocity(
        note,
        { opacity: 1 },
        { duration: 800, delay: 400, mobileHA: false }
      );
      Velocity(
        logo,
        { opacity: 1 },
        { duration: 800, delay: 400, mobileHA: false }
      );
      await Velocity(
        voteEntry,
        {
          translateX: ["0%", "-100%"],
          opacity: 1,
        },
        { duration: 800, delay: 800, mobileHA: false }
      );
    },
    showSlide() {
      const slides = this.swiper.slides;
      const activeIndex = this.swiper.activeIndex;
      const allSlides = Object.values(slides).slice(0, -1);
      for (let i = 0; i < allSlides.length; i++) {
        const slide = allSlides[i];

        if (activeIndex === i) {
          Velocity(slide, { opacity: 1 }, { duration: 1000, delay: 400 });
        } else if (activeIndex === i + 1 || activeIndex === i - 1) {
          Velocity(slide, { opacity: 1 }, { duration: 500, delay: 800 });
        } else {
          Velocity(slide, { opacity: 1 }, { duration: 500, delay: 1000 });
        }
      }
    },
    async animationToNext() {
      const cover = this.$refs.cover;
      const lampBox = this.$refs.lampBox;
      const currentLamp = this.swiper.slides[this.swiper.activeIndex]
        .children[0];
      const [gradient, lamp, lampLight] = currentLamp.childNodes;

      await this.showGradient(gradient, lamp, lampLight);
      this.store.nextStep();
      Velocity(lampLight, { opacity: 0 }, { duration: 300, mobileHA: false });
      await Velocity(lamp, { opacity: 0 }, { duration: 300, mobileHA: false });
      this.hidePage();
      this.$playBg(this.theme);
    },
    async showGradient(gradient, lamp, lampLight) {
      return new Promise((resolve) => {
        let percentage = 0;
        let timer = null;
        const fn = () => {
          if (percentage < 1) {
            percentage += 0.015;
          } else {
            cancelAnimationFrame(timer);
            resolve();
            return;
          }
          if (percentage <= 0.5) {
            lampLight.style.opacity = clip(percentage + 0.5, 0, 1);
          } else {
            Velocity(lampLight, { opacity: 0 }, { duration: 200 });
            Velocity(
              this.$refs.voteEntry,
              { opacity: 0 },
              { duration: 500, mobileHA: false }
            );
            Velocity(
              this.$refs.note,
              { opacity: 0 },
              { duration: 500, mobileHA: false }
            );
            Velocity(
              this.$refs.logo,
              { opacity: 0 },
              { duration: 500, mobileHA: false }
            );
            setTimeout(() => {
              Velocity(this.$refs.voteEntry, "finish");
              Velocity(this.$refs.note, "finish");
              Velocity(this.$refs.logo, "finish");
            }, 1500);
          }
          lamp.style.opacity = 1 - percentage;
          gradient.style.boxShadow = `0 0 ${140}px ${
            (percentage * documentHeight) / 1.2
          }px rgba(${gradientRgbColors[this.theme]}, 1)`;

          timer = requestAnimationFrame(fn);
        };
        fn();
      });
    },
    calcSlidePos(progress) {
      const coverBg = this.$refs.coverBg;
      const slides = this.swiper.slides;
      const activeIndex = this.swiper.activeIndex;
      const allSlides = Object.values(slides).slice(0, -1);
      for (let i = 0; i < allSlides.length; i++) {
        const slide = allSlides[i];
        const slideProgress = slide.progress;
        const lampItem = slide.children[0];
        const [gradient, lamp, lampLight] = lampItem.childNodes;
        const mask = lamp.childNodes[1];

        let scale = 1 - Math.abs(slideProgress) / 5;
        let translateY = -(130 * vw * (1 - scale)) / 2;
        let zIndex = 999 - Math.abs(Math.round(10 * slideProgress));

        // if (activeIndex === i) {
        //   this.changeCoverBg(slideProgress);
        // }
        if (activeIndex === i + 1 || activeIndex === i - 1) {
          lamp.style.filter = `brightness(0.5)`;
        } else if (activeIndex === i + 2 || activeIndex === i - 2) {
          lamp.style.filter = `brightness(0.3)`;
        } else {
          lamp.style.filter = `brightness(${activeIndex === i ? 1 : 0.3})`;
        }
        Velocity(slide, { translateY, scale, zIndex }, { duration: 0 });

        // slide.style.webkitTransform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        // slide.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
        // slide.style.zIndex = zIndex;
        // console.log(slide);
      }
    },
    // changeCoverBg(progress) {
    //   if (!this.isSliding) return;
    //   const { color, nextColor, ratio } = this.getMovingColorsAndRatio(
    //     progress
    //   );

    //   let mixColor = `rgba(${getMixColorRgbStr(
    //     coverBgColors[color],
    //     coverBgColors[nextColor],
    //     ratio
    //   )}, 1)`;

    //   this.$refs.coverBg.style.backgroundColor = mixColor;
    // },
    // getMovingColorsAndRatio(progress) {
    //   const { slides } = this.swiper;
    //   const activeIndex = this.savedActiveIndex;
    //   const color = slides[activeIndex].dataset.color;
    //   let nextColor = "";
    //   let ratio = 1;
    //   if (this.moveDir === "right") {
    //     nextColor = slides[activeIndex + 1].dataset.color;
    //     ratio = progress > 0 ? progress : progress + 1;
    //   } else {
    //     nextColor = slides[activeIndex - 1].dataset.color;
    //     ratio = progress < 0 ? Math.abs(progress) : 1 - progress;
    //   }
    //   return { color, nextColor, ratio };
    // },
    pollLight() {
      const fn = async (prevIndex = -1) => {
        const { slides, activeIndex } = this.swiper;
        const arr = [
          activeIndex - 2,
          activeIndex - 1,
          activeIndex + 1,
          activeIndex + 2,
        ].filter((i) => i !== prevIndex);
        const random = Math.floor(Math.random() * arr.length);
        const index = arr[random];
        const slide = slides[index];
        const [gradient, lamp, lampLight] = slide.children[0].childNodes;

        await Velocity(
          lampLight,
          { opacity: 0.4 },
          { duration: 1000, mobileHA: false }
        );
        await Velocity(
          lampLight,
          { opacity: 0 },
          { duration: 1000, mobileHA: false }
        );
        this.timer = setTimeout(fn.bind(null, index), 2000);
      };

      this.timer = setTimeout(fn, 2000);
    },
    hidePage() {
      const { cover } = this.$refs;
      Velocity(
        cover,
        { opacity: 0 },
        { duration: 2500, easing: "ease-out" }
      ).then(() => {
        cover.style.transform = `translateY(-100%)`;
      });
    },
    showColorAtlas(e) {
      if (this.isTrigger) return;
      this.isTrigger = true;
      const target = e.target;
      if (target.classList.contains("lamp-light")) {
        const index = +target.dataset.index;
        if (this.swiper.realIndex === index) {
          this.animationToNext();
        }
      }
    },
    resetCoverPage() {
      this.resetLamp();
      this.resetAround();
      this.resetPage();
      this.isTrigger = false;
    },
    resetPage() {
      this.$refs.cover.style.opacity = 1;
      this.$refs.cover.style.transform = `translateY(0)`;
    },
    resetLamp() {
      const lampBox = this.$refs.lampBox;
      const currentLamp = this.swiper.slides[this.swiper.activeIndex]
        .children[0];
      const [gradient, lamp] = currentLamp.childNodes;

      lampBox.style.opacity = 1;
      gradient.style.boxShadow = `0 0 0px 0px rgba(0,0,0,0)`;
      lamp.style.opacity = 1;
    },
    resetAround() {
      const currentSlide = this.swiper.slides[this.swiper.activeIndex];
      const parent = currentSlide.parentNode;
      const childs = Array.from(parent.childNodes);
      const index = childs.findIndex((child) => child === currentSlide);

      childs[index - 2].style.opacity = 1;
      childs[index - 1].style.opacity = 1;
      childs[index + 1].style.opacity = 1;
      childs[index + 2].style.opacity = 1;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../styles/animate.scss";
@import "../styles/variable.scss";

$lamp-width: 42vw;
$lamp-height: 130vw;

.cover {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 100;
  opacity: 0;
  transform: translateY(-100%);
  .cover-bg {
    width: 100%;
    height: 100%;
  }
  .lamp-box {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    z-index: 999;
    .swiper-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ::v-deep .swiper-wrapper {
        perspective: 3000;
        -webkit-perspective: 3000;
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      ::v-deep .swiper-slide {
        will-change: transform;
        width: $lamp-width;
        height: $lamp-height;
        opacity: 0;
      }
    }
    .lamp-item {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: $lamp-width;
      height: $lamp-height;
      .gradient {
        position: absolute;
        top: 80%;
        left: 50%;
        transform: translateX(-50%) scale(1);
        width: 1px;
        height: 1px;
        border-radius: 50%;
        box-shadow: none;
      }
      .lamp {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        .lamp-img {
          width: 100%;
          height: 100%;
        }
        .mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          clip-path: polygon(42% 0, 48% 0, 53% 30%, 100% 100%, 0 100%, 38% 30%);
        }
      }
      .lamp-light {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        @each $color in red, green, blue, white, yellow {
          &.#{"" + $color} {
            background: url("~@/assets/cover/#{$color}-lamp-light.png")
              0
              0
              no-repeat;
            background-size: 100% 100%;
          }
        }
      }
    }
  }
  .note {
    position: absolute;
    bottom: 22vw;
    left: 50%;
    transform: translateX(-50%);
    width: 65vw;
    opacity: 0;
    .text-pic {
      width: 100%;
    }
  }
  .logo {
    position: absolute;
    bottom: 5vw;
    right: 5vw;
    width: 32vw;
    .logo-pic {
      width: 100%;
    }
  }
  .vote-entry {
    display: block;
    position: absolute;
    top: 5.33vw;
    left: -5vw;
    width: 48vw;
    height: 9.07vw;
    transform: translateX(-100%);
    z-index: 1001;
    @media screen and (max-width: 320px) {
      left: -7vw;
      width: 52vw;
    }
    &::before {
      content: "";
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 1vw solid #fff;
      transform: skew(-15deg);
    }
    @each $colorName, $color in $voteBtnColor {
      &.#{"" + $colorName} {
        &::before {
          background-color: #{$color};
        }
      }
    }
    .vote-entry-txt {
      position: absolute;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      display: block;
      width: calc(100% - 5vw);
      line-height: 1.25;
      text-align: center;
      color: #fff;
      font-weight: bold;
      font-size: 3vw;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.6);
      @media screen and (max-width: 320px) {
        font-size: 12px;
        transform: translateY(-50%) scale(0.9);
      }
    }
  }
}
</style>
