<template>
  <div :class="['item', theme]">
    <div
      class="image-box"
      :style="{ right: theme === 'yellow' ? '-2vw' : '2vw' }"
    >
      <swiper ref="mySwiper" :options="swiperOptions">
        <swiper-slide v-for="(url, i) in altasCover[theme]" :key="i">
          <div class="image">
            <img class="int" :src="url" alt />
          </div>
        </swiper-slide>
      </swiper>
    </div>
    <span class="atlas-name" :style="getAtlasStyle()">
      {{ getAtlasName() }}
    </span>
    <span class="vote-number">
      <span class="num">{{ store.voteNums[theme] }} 票</span>
    </span>
  </div>
</template>
<script>
import { altasCover, atlasTitle, atlasCoverText } from "@/common/global/atlas";
import { vw } from "@/common/global/global";

export default {
  inject: ["store"],
  props: {
    theme: String,
  },
  data() {
    return {
      altasCover,
      atlasCoverText,
      atlasTitle,
      colorIndexMap: {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        yellow: 0,
      },
      swiperOptions: {
        initialSlide: 0,
        watchSlidesProgress: true, // 查看slide的progress
        resistanceRatio: 0, // 禁止边缘移动
        loop: true,
        // loopAdditionalSlides: 1,
        // loop: this.theme !== "yellow",
        // loopedSlides: 5,
        watchOverflow: true,
        // slidesPerView: 5,
        // centeredSlides: true,
        on: {
          setTranslate: () => {
            // this.$nextTick(() => {
            //   const swiper = this.swiper;
            //   const slides = swiper.slides;
            //   const len = slides.length;
            //   const offsetAfter = 28.2 * vw * 0.92; // 每个slide的位移值
            //   const positiveOffset = 28.2 * vw * 1.07;

            //   for (let i = 0; i < len; i++) {
            //     let slide = slides.eq(i);
            //     let progress = slides[i].progress;
            //     // console.log(slide[0]);
            //     // console.log(progress);
            //     // console.log("---------------");
            //     slide.css("zIndex", 100 - Math.abs(progress));

            //     if (progress > 0 && progress <= 1) {
            //       slide.transform(`translate3d(0, 0, 0) scale(1)`);
            //       slide.css("zIndex", 101);
            //       slide.css("opacity", 1);
            //     } else if (progress >= 6) {
            //       slide.transform(
            //         `translate3d(${
            //           (progress + 3 * 0.08) * 28.2 * vw
            //         }px, 0, 0) scale(${1 - Math.abs(progress) / 20})`
            //       );
            //     } else if (progress <= 0) {
            //       slide.transform(
            //         `translate3d(${progress * offsetAfter}px, 0, 0) scale(${
            //           1 - Math.abs(progress) / 20
            //         })`
            //       );
            //       slide.css("opacity", progress + 3); // 最左边slide透明
            //     }

            //     if (progress > 0) {
            //       slide.css("opacity", 1 - progress); // 左边slide透明
            //     }
            //   }
            // });
            this.$nextTick(() => {
              const swiper = this.swiper;
              const slides = swiper.slides;
              const len = slides.length;
              const offsetAfter = 28.2 * vw * 0.92; // 每个slide的位移值

              for (let i = 0; i < len; i++) {
                let slide = slides.eq(i);
                let progress = slides[i].progress;
                slide.css("zIndex", 100 - i);

                if (progress <= 0) {
                  // 左边slide位移
                  slide.transform(
                    `translate3d(${progress * offsetAfter}px, 0, 0) scale(${
                      1 - Math.abs(progress) / 20
                    })`
                  );
                  slide.css("opacity", progress + 3); // 最左边slide透明
                }

                if (progress > 0) {
                  slide.css("opacity", 1 - progress); // 左边slide透明
                }
              }
            });
          },
          setTransition: (transition) => {
            this.$nextTick(() => {
              const swiper = this.swiper;
              const slides = swiper.slides;
              for (let i = 0; i < slides.length; i++) {
                let slide = slides.eq(i);
                slide.transition(transition);
              }
            });
          },
          transitionEnd: () => {
            this.$nextTick(() => {
              this.colorIndexMap[this.theme] = this.swiper.realIndex;
            });
          },
        },
      },
    };
  },
  computed: {
    swiper() {
      return this.$refs.mySwiper.$swiper;
    },
  },
  methods: {
    getAtlasStyle() {
      const theme = this.theme;
      const len = atlasCoverText[theme][this.colorIndexMap[theme]].length;
      const size = len >= 6 ? "14px" : "16px";
      return {
        "font-size": size,
      };
    },
    getAtlasName() {
      const theme = this.theme;
      return atlasCoverText[theme][this.colorIndexMap[theme]];
    },
  },
};
</script>
<style lang="scss" scoped>
.item {
  position: relative;
  width: 100%;
  height: 36vw;
  @each $color in red, green, blue, white, yellow {
    &.#{"" + $color} {
      background: url("~@/assets/vote-result/bg-#{$color}.png")
        0
        center
        no-repeat;
      background-size: 100% 75%;
    }
  }
  .image-box {
    position: absolute;
    top: 50%;
    width: 60%;
    height: 100%;
    transform-origin: left center;
    transform: translateY(-50%) skew(10deg);
    // transform: translateY(-50%);
    .swiper-container {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      height: 100%;
      // overflow: visible;
    }
    .image {
      box-sizing: border-box;
      position: absolute;
      top: 50%;
      left: 0;
      width: 45vw !important;
      height: 90%;
      transform: translateY(-50%);
      border: 1vw solid #fff;
      overflow: hidden;
      box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.2);
      background-color: #fff;
      .int {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);
      }
    }
  }
  .atlas-name {
    display: block;
    position: absolute;
    width: 30vw;
    top: 50%;
    transform: translateY(-20%);
    font-size: 16px;
    color: #fff;
    text-align: center;
  }
  .vote-number {
    position: absolute;
    line-height: 6vw;
    padding: 5px 15px;
    .num {
      position: relative;
      color: #fff;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      transform: skew(10deg);
    }
  }

  &:nth-child(2n) {
    .image-box {
      right: 3vw;
    }
    .vote-number {
      top: 4vw;
      left: 0;
    }
    .atlas-name {
      left: 5vw;
    }
  }
  &:nth-child(2n + 1) {
    .image-box {
      left: 6vw;
    }
    .vote-number {
      top: 4vw;
      right: 3.5vw;
    }
    .atlas-name {
      right: 5vw;
    }
  }
}
</style>
