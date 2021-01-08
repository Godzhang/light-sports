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
    <div class="flash" ref="flash"></div>
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
  coverBgColors
} from "@/common/global/colors.js";
import {
  hexToRgba,
  colorMix,
  getMixColorRgbStr,
  sleep,
  clip,
  once
} from "@/common/utils/utils.js";
import { atlas, flattenAtlas } from "@/common/global/atlas";
import { themes } from "@/common/global/global";

const documentWidth = document.body.clientWidth;
const documentHeight = document.body.clientHeight;
const vw = documentWidth / 100;

const lamps = {};
themes.forEach(color => {
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
      savedActiveIndex: 0,
      isTrigger: false,
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
              // this.calcLampMask();
            });
          },
          progress: progress => {
            this.$nextTick(() => {
              this.calcSlidePos(progress);
              // this.calcLampMask(progress);
            });
          },
          transitionEnd: () => {
            this.$nextTick(() => {
              if (this.store.step === 2) {
                this.store.setType(themes[this.swiper.realIndex]);
              }
              this.savedActiveIndex = this.swiper.activeIndex;
              // this.setLampMask();
            });
          },
          slideNextTransitionStart: swiper => {
            this.moveDir = "right";
          },
          slidePrevTransitionStart: swiper => {
            this.moveDir = "left";
          }
        }
      }
    };
  },
  created() {
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
    }
  },
  watch: {
    theme(theme) {
      const coverBg = this.$refs.coverBg;
      const coverBgColor = coverBg.style.backgroundColor.slice(4, -1);
      const bgColor = hexToRgba(coverBgColors[theme]).rgbStr;
      if (coverBgColor !== bgColor) {
        Velocity(coverBg, { backgroundColor: coverBgColors[theme] });
      }
    }
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
        this.$audio.playMuted();
      });
    },
    bindSwiper() {
      const swiperDom = this.$refs.mySwiper.$el;
      let startX = 0;

      swiperDom.addEventListener("touchstart", e => {
        this.isSliding = true;
        startX = e.touches[0].clientX;
      });
      swiperDom.addEventListener("touchmove", e => {
        if (!this.isSliding) return;
        if (e.touches[0].clientX - startX < 0) {
          this.moveDir = "right";
        } else {
          this.moveDir = "left";
        }
      });
      swiperDom.addEventListener("touchend", () => {
        this.isSliding = false;
      });
    },
    showPage() {
      const { cover } = this.$refs;
      cover.style.opacity = 1;
      cover.style.transform = `translateY(0)`;
    },
    async showParts() {
      this.showSlide();
      // Velocity(
      //   this.$refs.slider.$el,
      //   { opacity: 1 },
      //   { duration: 800, delay: 400, mobileHA: false }
      // );
      Velocity(
        this.$refs.note,
        { opacity: 1 },
        { duration: 800, delay: 400, mobileHA: false }
      );
      await Velocity(
        this.$refs.voteEntry,
        {
          translateX: ["0%", "-100%"],
          opacity: 1
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
          Velocity(slide, { opacity: 1 }, { duration: 1000 });
        } else if (activeIndex === i + 1 || activeIndex === i - 1) {
          Velocity(slide, { opacity: 1 }, { duration: 500, delay: 800 });
        } else {
          Velocity(slide, { opacity: 1 }, { duration: 500, delay: 1000 });
        }
      }
    },
    switchLamp(percentage) {
      const currentLamp = this.swiper.slides[this.swiper.activeIndex]
        .children[0];
      const [gradient, lamp, lampLight] = currentLamp.childNodes;

      lampLight.style.opacity = clip(percentage + 0.5, 0, 1);
      lamp.style.opacity = 1 - percentage;
      gradient.style.boxShadow = `0 0 ${120}px ${(percentage * documentHeight) /
        1.2}px rgba(${gradientRgbColors[this.theme]}, 0.5)`;
    },
    fadeOutAround(percentage) {
      const currentSlide = this.swiper.slides[this.swiper.activeIndex];
      const parent = currentSlide.parentNode;
      const childs = Array.from(parent.childNodes);
      const index = childs.findIndex(child => child === currentSlide);
      let ratio = 1;
      if (percentage <= 0.5) {
        ratio = (0.5 - percentage) / 0.5;
      } else {
        ratio = 0;
      }

      childs[index - 2].style.opacity = ratio;
      childs[index - 1].style.opacity = ratio;
      childs[index + 1].style.opacity = ratio;
      childs[index + 2].style.opacity = ratio;
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
      // Velocity(
      //   lampBox,
      //   { opacity: 0 },
      //   { duration: 300, delay: 300, mobileHA: false }
      // );
      this.hidePage();
      this.isTrigger = false;
      this.$audio.play(this.theme);
    },
    async showGradient(gradient, lamp, lampLight) {
      return new Promise(resolve => {
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
          }
          lamp.style.opacity = 1 - percentage;
          gradient.style.boxShadow = `0 0 ${120}px ${(percentage *
            documentHeight) /
            1.2}px rgba(${gradientRgbColors[this.theme]}, 1)`;

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
        let opacity = 1;

        if (activeIndex === i) {
          this.changeCoverBg(slideProgress);
          // this.calcLampMask(slideProgress, activeIndex);
        }
        if (activeIndex === i + 1 || activeIndex === i - 1) {
          lamp.style.filter = `brightness(0.5)`;
          opacity = 0.8;
        } else if (activeIndex === i + 2 || activeIndex === i - 2) {
          lamp.style.filter = `brightness(0.3)`;
          opacity = 0.6;
        } else {
          lamp.style.filter = `brightness(${activeIndex === i ? 1 : 0.3})`;
          opacity = activeIndex === i ? 1 : 0.3;
        }

        Velocity(slide, { translateY, scale, zIndex }, { duration: 0 });
      }
    },
    // calcLampMask(progress, index) {
    //   if (!progress) return;
    //   const slides = this.swiper.slides;
    //   const activeIndex = this.savedActiveIndex;
    //   const allSlides = Object.values(slides).slice(0, -1);

    //   const { color, nextColor, ratio } = this.getMovingColorsAndRatio(
    //     progress
    //   );
    //   for (let i = 0; i < allSlides.length; i++) {
    //     const slide = allSlides[i];
    //     const slideProgress = slide.progress;
    //     const lampItem = slide.children[0];
    //     const [gradient, lamp, lampLight] = lampItem.childNodes;
    //     const mask = lamp.childNodes[1];

    //     if (activeIndex === i + 1 || activeIndex === i - 1) {
    //       mask.style.backgroundColor = `rgba(${getMixColorRgbStr(
    //         coverBgColors[color],
    //         coverBgColors[nextColor],
    //         ratio
    //       )}, 0.8)`;
    //     } else if (activeIndex === i + 2 || activeIndex === i - 2) {
    //       mask.style.backgroundColor = `rgba(${getMixColorRgbStr(
    //         coverBgColors[color],
    //         coverBgColors[nextColor],
    //         ratio
    //       )}, 0.9)`;
    //     } else {
    //       mask.style.backgroundColor = `rgba(${getMixColorRgbStr(
    //         coverBgColors[color],
    //         coverBgColors[nextColor],
    //         ratio
    //       )}, 0)`;
    //     }
    //   }
    // },
    changeCoverBg(progress) {
      if (!this.isSliding) return;
      const { color, nextColor, ratio } = this.getMovingColorsAndRatio(
        progress
      );
      const mixColor = `rgba(${getMixColorRgbStr(
        coverBgColors[color],
        coverBgColors[nextColor],
        ratio
      )}, 1)`;
      this.$refs.coverBg.style.backgroundColor = mixColor;
      // this.$refs.slider.transitionColor(color, nextColor, ratio);
    },
    getMovingColorsAndRatio(progress) {
      const { slides } = this.swiper;
      const activeIndex = this.savedActiveIndex;
      const color = slides[activeIndex].dataset.color;
      let nextColor = "";
      let ratio = 1;
      if (this.moveDir === "right") {
        nextColor = slides[activeIndex + 1].dataset.color;
        ratio = progress > 0 ? progress : progress + 1;
      } else {
        nextColor = slides[activeIndex - 1].dataset.color;
        ratio = progress < 0 ? Math.abs(progress) : 1 - progress;
      }
      return { color, nextColor, ratio };
    },
    pollLight(prevIndex = -1) {
      const fn = async () => {
        const { slides, activeIndex } = this.swiper;
        const arr = [
          activeIndex - 2,
          activeIndex - 1,
          activeIndex + 1,
          activeIndex + 2
        ].filter(i => i !== prevIndex);
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
        this.timer = setTimeout(fn, 2000);
      };

      this.timer = setTimeout(fn, 2000);
    },
    hidePage() {
      const { cover } = this.$refs;
      Velocity(
        cover,
        { opacity: 0 },
        { duration: 3000, easing: "ease-out" }
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
          this.store.setGroupIndex(0);
        }
      }
    },
    resetCoverPage() {
      this.resetLamp();
      this.resetAround();
      this.resetPage();
    },
    resetPage() {
      this.$refs.note.style.opacity = 1;
      this.$refs.cover.style.opacity = 1;
      this.$refs.cover.style.transform = `translateY(0)`;
    },
    resetLamp() {
      const lampBox = this.$refs.lampBox;
      const currentLamp = this.swiper.slides[this.swiper.activeIndex]
        .children[0];
      const [gradient, lamp, lampLight] = currentLamp.childNodes;

      lampBox.style.opacity = 1;
      gradient.style.boxShadow = `0 0 0px 0px rgba(0,0,0,0)`;
      lamp.style.opacity = 1;
      // this.$refs.slider.$el.style.opacity = 1;
    },
    resetAround() {
      const currentSlide = this.swiper.slides[this.swiper.activeIndex];
      const parent = currentSlide.parentNode;
      const childs = Array.from(parent.childNodes);
      const index = childs.findIndex(child => child === currentSlide);

      childs[index - 2].style.opacity = 1;
      childs[index - 1].style.opacity = 1;
      childs[index + 1].style.opacity = 1;
      childs[index + 2].style.opacity = 1;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../styles/animate.scss";
@import "../styles/variable.scss";

$lamp-width: 42vw;
$lamp-height: 130vw;
// $lamp-width: 47.07vw;
// $lamp-height: 129.6vw;

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
    .swiper-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      ::v-deep .swiper-slide {
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
          // background-color: rgba($color: #430d0d, $alpha: 0.8);
          clip-path: polygon(42% 0, 48% 0, 53% 30%, 100% 100%, 0 100%, 38% 30%);
        }
        // @each $color in red, green, blue, white, yellow {
        //   &.#{"" + $color} {
        //     background: url("~@/assets/cover/#{$color}-lamp.png") 0 0 no-repeat;
        //     background-size: 100% 100%;
        //   }
        // }
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
    bottom: 15vw;
    left: 50%;
    transform: translateX(-50%);
    width: 65vw;
    opacity: 0;
    .text-pic {
      width: 100%;
    }
  }
  .flash {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    z-index: 10;
    background-color: #fff;
    &.animate {
      display: block;
      animation: flash 0.6s ease forwards;
    }
  }
  .vote-entry {
    display: block;
    position: absolute;
    top: 5.33vw;
    left: -2vw;
    width: 45vw;
    height: 9.07vw;
    transform: translateX(-100%);
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
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      width: 38vw;
      height: 4.13vw;
      color: #fff;
      font-weight: bold;
      font-size: 13px;
      text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.6);
    }
  }
}
</style>
