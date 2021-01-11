<template>
  <div :class="['shuffle', type]" ref="shuffle">
    <div class="back">
      <div :class="['lamp', type]"></div>
      <div :class="['light', type]"></div>
    </div>
    <div class="return-btn" @click="backToPage(2)">
      <img src="../assets/shuffle/return-btn.png" alt class="btn" />
    </div>
    <div class="vote-box">
      <span class="vote-num">{{ store.voteNums[type] }}</span>
      <span class="vote-done" v-if="store.voteStatus[type]">已投票</span>
      <div
        :class="['vote-btn', type]"
        v-if="!store.voteStatus[type]"
        @click="vote"
      >
        <span class="txt">投票</span>
      </div>
    </div>
    <div :class="['show', type]">
      <!-- <swiper ref="mySwiper" :options="swiperOptions" @click="showDetail"> -->
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for="(image, index) in swiperAtlas" :key="index">
          <div class="image-box" ref="imageBox">
            <img class="image" :src="image" alt />
          </div>
        </swiper-slide>
      </swiper>
      <div class="swiper-pagination" slot="pagination"></div>
    </div>
    <div class="tip">
      <img class="tip-pic" src="../assets/shuffle/tip.png" alt />
    </div>
  </div>
</template>
<script>
import Velocity from "velocity-animate";
import { Swiper, SwiperSlide, directive } from "vue-awesome-swiper";
import { altasCover, atlasCoverText } from "@/common/global/atlas";
import { gradientColors, shuffleBgColors } from "@/common/global/colors";
import getCompositionUrl from "@/common/utils/composition";
import TweenMax from "gsap";

export default {
  inject: ["store"],
  data() {
    return {
      type: "red",
      images: [],
      swiperAtlas: [],
      swiperOptions: {
        loop: true,
        speed: 400,
        effect: "myCustomTransition",
        pagination: {
          el: ".swiper-pagination"
        },
        virtualTranslate: true,
        watchSlidesProgress: true,
        on: {
          setTranslate: translate => {
            this.$nextTick(() => {
              this.setTranslate(this.$refs.mySwiper.$swiper, translate);
            });
          }
        }
      }
    };
  },
  mounted() {
    this.initType(this.store.colorType);
    this.bindEvent();

    this.$watch("store.step", (step, prevStep) => {
      if (step === 3 && prevStep === 2) {
        this.swiper.slideToLoop(0, 0);
      }
      if (step === 4) {
        this.showPage();
      }
    });
    this.$watch("store.colorType", type => {
      this.initType(type);
    });
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    }
  },
  watch: {
    async images(images) {
      this.swiperAtlas = await getCompositionUrl(images, this.type);
    }
  },
  methods: {
    bindEvent() {
      const swiper = this.swiper;
      let startTime = 0;
      let startX = 0;
      let moveX = 0;
      swiper.on("touchStart", e => {
        startTime = Date.now();
        startX = e.touches[0].clientX;
      });
      swiper.on("touchMove", e => {
        moveX = e.touches[0].clientX - startX;
      });
      swiper.on("touchEnd", () => {
        if (Date.now() - startTime <= 300 && moveX === 0) {
          this.showDetail();
        }
        moveX = 0;
      });
    },
    initType(type) {
      this.type = type;
      this.images = altasCover[type];
    },
    showPage() {
      Velocity(
        this.$refs.shuffle,
        { translateY: "0", opacity: 1 },
        { duration: 0, mobileHA: false }
      );
    },
    async backToPage(pageNum) {
      const shuffle = this.$refs.shuffle;
      const prevzIndex = shuffle.style.zIndex;
      shuffle.style.zIndex = 10000;
      this.store.setStep(pageNum);
      await Velocity(
        shuffle,
        { opacity: 0 },
        { duration: 1000, mobileHA: false }
      );
      shuffle.style.transform = `translateY(-100%)`;
      shuffle.style.zIndex = prevzIndex;
      if (pageNum === 3) {
        this.$playBg(this.type);
      }
    },
    setTranslate(swiper, translate) {
      const { activeIndex, slides } = swiper;
      const allSlides = Object.values(slides).slice(0, -1);
      allSlides.map((slide, index) => {
        const offset = slide.swiperSlideOffset;
        let x = -offset;
        if (!swiper.params.virtualTranslate) {
          x -= swiper.translate;
        }
        let y = 0;
        if (!swiper.isHorizontal()) {
          y = x;
          x = 0;
        }
        TweenMax.set(slide, {
          x,
          y
        });
        const clip = (val, min, max) => Math.max(min, Math.min(val, max));
        const ZOOM_FACTOR = 0.8; // 淡入 scale 0.4, 淡出 scale 0.4
        const clippedProgress = clip(slide.progress, -1, 1);
        const scale = 1 - Math.abs(ZOOM_FACTOR * clippedProgress);
        // slide.progress为0时，透明度从1到0；slide.progress 为正负1时，透明度从0.5到1
        const opacity = scale > 0.6 ? 1 : 0;
        TweenMax.to(slide, 0.3, { scale, opacity });
      });
    },
    showDetail() {
      const groupIndex = this.swiper.realIndex;
      this.store.setGroupIndex(groupIndex);
      this.backToPage(3);
    },
    vote() {
      this.store.setVoteNum();
    }
  },
  components: {
    Swiper,
    SwiperSlide
  }
};
</script>
<style lang="scss" scoped>
@import "../styles/variable.scss";

.shuffle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 96;
  opacity: 0;
  transform: translateY(-100%);
  @each $color in red, green, blue, white, yellow {
    &.#{"" + $color} {
      background: url("~@/assets/shuffle/bg-#{$color}.jpg") 0 0 no-repeat;
      background-size: 100% 100%;
    }
  }
  .return-btn {
    position: absolute;
    top: 4.25vw;
    right: 0;
    width: 20vw;
    img {
      width: 100%;
    }
  }
  .vote-box {
    $vote-box-height: 9vw;
    $vote-skew-deg: -20deg;
    box-sizing: border-box;
    position: absolute;
    top: 20vw;
    left: 50%;
    transform: translateX(-50%);
    min-width: 32vw;
    height: $vote-box-height;
    color: #fff;
    padding: 0 16vw 0 0;
    text-align: center;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      transform: skew($vote-skew-deg);
    }
    .vote-num {
      position: relative;
      display: inline-block;
      height: $vote-box-height;
      line-height: $vote-box-height;
      padding: 0 2vw;
    }
    .vote-done {
      position: absolute;
      top: 0;
      right: 0;
      height: $vote-box-height;
      line-height: $vote-box-height;
      padding-right: 3vw;
      font-size: 4vw;
    }
    .vote-btn {
      position: absolute;
      top: 0;
      right: 0;
      width: 15vw;
      height: $vote-box-height;
      line-height: $vote-box-height;
      text-align: center;
      .txt {
        position: relative;
        text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.2);
        font-size: 4vw;
      }
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 1px;
        width: 100%;
        height: 100%;
        transform: skew($vote-skew-deg);
      }
      @each $colorName, $color in $btnBgColor {
        &.#{"" + $colorName} {
          &::before {
            background-color: #{$color};
          }
        }
      }
    }
  }
  .back {
    position: relative;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    .lamp {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 67.87vw;
      height: 18.13vw;
      @each $color in red, green, blue, white, yellow {
        &.#{"" + $color} {
          background: url("~@/assets/shuffle/#{$color}-lamp.png") 0 0 no-repeat;
          background-size: 100% 100%;
        }
      }
    }
    .light {
      position: absolute;
      left: 0;
      bottom: 7vw;
      width: 100%;
      height: 117.47vw;
      @each $color in red, green, blue, white, yellow {
        &.#{"" + $color} {
          background: url("~@/assets/shuffle/#{$color}-light.png")
            0
            0
            no-repeat;
          background-size: 100% 100%;
        }
      }
    }
  }
  .show {
    position: absolute;
    top: 45vw;
    left: 50%;
    transform: translateX(-50%);
    width: 91vw;
    height: 52vw;
    // @each $colorName, $color in $paginationActiveColors {
    //   &.#{"" + $colorName} {
    //     .swiper-pagination {
    //       ::v-deep .swiper-pagination-bullet-active {
    //         background-color: $color;
    //       }
    //     }
    //   }
    // }
  }
  .swiper-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 91vw;
    height: 52vw;
    overflow: visible;
  }
  .swiper-pagination {
    width: 100%;
    bottom: -40px;
    left: 0;
    ::v-deep .swiper-pagination-bullet {
      margin: 0 5px;
      background-color: rgba(255, 255, 255, 0.6);
      opacity: 1;
    }
    ::v-deep .swiper-pagination-bullet-active {
      width: 16px;
      height: 16px;
      transform: translateY(4px);
      background-color: #fff;
    }
  }
  .image-box {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    .image {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
    }
  }
  .tip {
    position: absolute;
    left: 50%;
    bottom: 42vw;
    transform: translateX(-50%);
    width: 30vw;
    .tip-pic {
      width: 100%;
    }
  }
}
</style>
