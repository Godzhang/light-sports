<template>
  <div class="cover" ref="cover">
    <div class="cover-bg" ref="coverBg"></div>
    <div class="lamp-box" ref="lampBox">
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for="color in themes" :key="color" :data-color="color">
          <div :class="['lamp-item']" ref="lamp">
            <div class="gradient"></div>
            <div :class="['lamp', color]"></div>
            <div :class="['lamp-light', color]"></div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <Slider ref="slider" :theme="theme" @slide="onSliderMove"></Slider>
    <div class="note" ref="note">
      <img class="text-pic" src="../assets/cover/color-sport.png" />
    </div>
    <div class="flash" ref="flash"></div>
    <!-- <a :class="['vote-entry', store.colorType]" ref="voteEntry"></a> -->
  </div>
</template>
<script>
import Velocity from "velocity-animate";
import { Swiper, SwiperSlide } from "vue-awesome-swiper";
import {
  gradientColors,
  gradientRgbColors,
  coverBgColors
} from "@/common/global/colors.js";
import {
  hexToRgba,
  colorMix,
  getMixColorRgbStr,
  actionByPercentage,
  sleep,
  clip,
  once
} from "@/common/utils/utils.js";
import { atlas, flattenAtlas } from "@/common/global/atlas";
import { themes } from "@/common/global/global";
import Slider from "./Slider";
import { Verify } from "crypto";

const documentWidth = document.body.clientWidth;
const documentHeight = document.body.clientHeight;
const vw = documentWidth / 100;

export default {
  name: "Cover",
  inject: ["store"],
  data() {
    return {
      theme: "red",
      themes,
      percentage: 0,
      timer: null,
      moveDir: "right",
      isSliding: false,
      savedActiveIndex: 0,
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
          progress: progress => {
            this.$nextTick(() => {
              this.calcSlidePos(progress);
            });
          },
          transitionEnd: () => {
            this.$nextTick(() => {
              this.theme = themes[this.swiper.realIndex];
              this.store.setType(this.theme);
              this.savedActiveIndex = this.swiper.activeIndex;
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
    this.swiperOptions.initialSlide = themes.indexOf(this.store.colorType);
  },
  mounted() {
    this.init();
    this.bindAudio();
    this.$watch("store.step", step => {
      if (step === 1) {
        this.resetLamp();
        this.resetAround();
        this.$refs.slider.resetButton(true);
        if (this.timer) clearTimeout(this.timer);
        this.pollLight();
        this.store.setGroupIndex(0);
        this.resetPage();
      }
    });
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },
    currentLamp() {
      if (this.swiper) {
        return this.swiper.slides[this.swiper.activeIndex].children[0];
      }
      return null;
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
    },
    bindAudio() {
      const slider = this.$refs.slider.$el;
      once(slider, "touchstart", () => {
        this.$audio.playMuted();
      });
      slider.addEventListener("touchend", () => {
        if (this.percentage === 1) {
          this.$audio.play("play-bg");
        }
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
      Velocity(
        this.$refs.lampBox,
        { opacity: 1 },
        { duration: 800, mobileHA: false }
      );
      Velocity(
        this.$refs.slider.$el,
        { opacity: 1 },
        { duration: 800, delay: 400, mobileHA: false }
      );
      Velocity(
        this.$refs.note,
        { opacity: 1 },
        { duration: 800, delay: 400, mobileHA: false }
      );
      Velocity(
        this.$refs.voteEntry,
        {
          translateX: ["0%", "100%"],
          opacity: 1
        },
        { duration: 800, delay: 800, mobileHA: false }
      );
      setTimeout(() => {
        this.pollLight();
      }, 2000);
    },
    onSliderMove(percentage) {
      this.percentage = percentage;
      this.switchLamp(percentage);
      this.fadeOutAround(percentage);
      if (percentage === 1) {
        clearTimeout(this.timer);
        this.animationToNext();
      }
    },
    async animationToNext() {
      const cover = this.$refs.cover;
      const currentLamp = this.swiper.slides[this.swiper.activeIndex]
        .children[0];
      const [gradient, lamp, lampLight] = currentLamp.childNodes;

      this.store.nextStep();
      Velocity(lampLight, { opacity: 0 }, { duration: 300, mobileHA: false });
      Velocity(lamp, { opacity: 0 }, { duration: 300, mobileHA: false });
      await Velocity(
        this.$refs.slider.$el,
        { opacity: 0 },
        { duration: 500, delay: 250, mobileHA: false }
      );
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

      await Velocity(
        cover,
        { opacity: 0 },
        { duration: 1000, mobileHA: false }
      );
      Velocity(
        cover,
        { translateY: "-100%" },
        { duration: 0, mobileHA: false }
      );
      // 因为要播放整个图集，轮播图要定位到最后一张
      // this.store.setGroupIndex(atlas[this.store.colorType].length - 1);
    },
    initSlide() {
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

        let scale = 1 - Math.abs(slideProgress) / 5;
        let translateY = -(129.6 * vw * (1 - scale)) / 2;
        let zIndex = 999 - Math.abs(Math.round(10 * slideProgress));
        let opacity = 1;

        if (activeIndex === i + 1 || activeIndex === i - 1) {
          lamp.style.filter = `brightness(0.5)`;
          opacity = 0.8;
        } else if (activeIndex === i + 2 || activeIndex === i - 2) {
          lamp.style.filter = `brightness(0.3)`;
          opacity = 0.6;
        } else {
          lamp.style.filter = `brightness(${activeIndex === i ? 1 : 0.3})`;
          opacity = activeIndex === i ? 1 : 0.3;
          if (activeIndex === i) {
            this.changeCoverBg(slideProgress);
          }
        }

        Velocity(slide, { translateY, scale, zIndex }, { duration: 0 });
      }
    },
    changeCoverBg(progress) {
      if (!this.isSliding) return;
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
      const mixColor = `rgba(${getMixColorRgbStr(
        coverBgColors[color],
        coverBgColors[nextColor],
        ratio
      )}, 1)`;
      this.$refs.coverBg.style.backgroundColor = mixColor;
      this.$refs.slider.transitionColor(color, nextColor, ratio);
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
    resetLamp() {
      const currentLamp = this.swiper.slides[this.swiper.activeIndex]
        .children[0];
      const [gradient, lamp, lampLight] = currentLamp.childNodes;

      gradient.style.boxShadow = `0 0 0px 0px rgba(0,0,0,0)`;
      lamp.style.opacity = 1;
      this.$refs.slider.$el.style.opacity = 1;
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
    },
    resetPage() {
      // this.$refs.voteEntry.style.opacity = 1;
      this.$refs.note.style.opacity = 1;
      this.$refs.cover.style.opacity = 1;
      this.$refs.cover.style.transform = `translateY(0)`;
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
          { opacity: 0.8 },
          { duration: 1000, mobileHA: false }
        );
        await Velocity(
          lampLight,
          { opacity: 0 },
          { duration: 1000, mobileHA: false }
        );
        this.timer = setTimeout(fn, 2000);
      };

      setTimeout(fn, 2000);
    }
  },
  components: { Slider }
};
</script>
<style lang="scss" scoped>
@import "../styles/animate.scss";

$lamp-width: 44vw;
$lamp-height: 115vw;
// $lamp-width: 47.07vw;
// $lamp-height: 129.6vw;

.cover {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 100;
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
        @each $color in red, green, blue, white, yellow {
          &.#{"" + $color} {
            background: url("~@/assets/cover/#{$color}-lamp.png") 0 0 no-repeat;
            background-size: 100% 100%;
          }
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
    bottom: 5vw;
    left: 50%;
    transform: translateX(-50%);
    width: 13vw;
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
    right: 0;
    width: 37.73vw;
    height: 9.07vw;
    opacity: 0;
    @each $color in red, green, blue, white, yellow {
      &.#{"" + $color} {
        background: url("../assets/vote/vote-entry-#{$color}.png")
          0
          0
          no-repeat;
        background-size: 100% 100%;
      }
    }
  }
}
</style>
