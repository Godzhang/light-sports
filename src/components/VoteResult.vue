<template>
  <div :class="['vote-result', voteDisplay]">
    <div class="container">
      <div class="list">
        <VoteSwiper v-for="theme in themes" :key="theme" :theme="theme" />
        <!-- <li v-for="theme in themes" :key="theme" :class="['item', theme]">
          <div class="image-box">
            <swiper ref="mySwiper" :options="swiperOptions">
              <swiper-slide v-for="(url, i) in altasCover[theme]" :key="i">
                <div class="image">
                  <img class="int" :src="url" alt />
                </div>
              </swiper-slide>
            </swiper>
          </div>
          <span
            class="atlas-name"
            :style="{
              'font-size':
                atlasCoverText[theme][colorIndexMap[theme]].length >= 6
                  ? '14px'
                  : '16px'
            }"
            >{{ atlasCoverText[theme][colorIndexMap[theme]] }}</span
          >
          <span class="vote-number">
            <span class="num">{{ store.voteNums[theme] }} 票</span>
          </span>
        </li> -->
      </div>
    </div>
    <a class="return-btn" @click="store.setVoteVisible(false)"></a>
  </div>
</template>
<script>
import { altasCover, atlasTitle, atlasCoverText } from "@/common/global/atlas";
import { vw } from "@/common/global/global";
import VoteSwiper from "./VoteSwiper";

const themes = ["red", "yellow", "blue", "white", "green"];

export default {
  inject: ["store"],
  data() {
    return {
      themes,
      altasCover,
      atlasCoverText,
      atlasTitle,
      voteDisplay: "",
      colorIndexMap: {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        yellow: 0
      },
      swiperOptions: {
        initialSlide: 0,
        watchSlidesProgress: true, // 查看slide的progress
        resistanceRatio: 0, // 禁止边缘移动
        loop: true,
        on: {
          init: () => {
            this.$nextTick(() => {
              const swiper = this.mySwiper[0].$swiper;
              const slides = swiper.slides;
              for (let i = 0; i < slides.length; i++) {
                let slide = slides.eq(i);
                slide.css("zIndex", 100 - i); // 设置slide的z-index层级
              }
            });
          },
          setTranslate: () => {
            this.$nextTick(() => {
              const swiper = this.mySwiper[0].$swiper;
              const slides = swiper.slides;
              const offsetAfter = 28.2 * vw * 0.92; // 每个slide的位移值

              for (let i = 0; i < slides.length; i++) {
                let slide = slides.eq(i);
                let progress = slides[i].progress;

                if (progress <= 0) {
                  // 左边slide位移
                  slide.transform(
                    `translate3d(${progress * offsetAfter}px, 0, 0) scale(${1 -
                      Math.abs(progress) / 20})`
                  );
                  slide.css("opacity", progress + 3); // 最左边slide透明
                }

                if (progress > 0) {
                  slide.css("opacity", 1 - progress); // 左边slide透明
                }
              }
            });
          },
          setTransition: transition => {
            this.$nextTick(() => {
              const swiper = this.mySwiper[0].$swiper;
              const slides = swiper.slides;
              for (let i = 0; i < slides.length; i++) {
                let slide = slides.eq(i);
                slide.transition(transition);
              }
            });
          },
          transitionEnd: () => {
            this.$nextTick(() => {
              this.colorIndexMap[
                this.store.colorType
              ] = this.mySwiper[0].$swiper.realIndex;
            });
          }
        }
      }
    };
  },
  watch: {
    "store.showVote"(isShow) {
      this.voteDisplay = isShow ? "show" : "hide";
    }
  },
  computed: {
    mySwiper() {
      return this.$refs.mySwiper;
    }
  },
  methods: {
    calcSlidePos() {}
  },
  components: { VoteSwiper }
};
</script>
<style lang="scss" scoped>
@import "../styles/variable.scss";

@keyframes voteShow {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes voteHide {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(100%);
  }
}

.vote-result {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: translateY(100%);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 105;
  &.show {
    animation: voteShow 0.2s linear forwards;
  }
  &.hide {
    animation: voteHide 0.2s linear forwards;
  }
  .container {
    box-sizing: border-box;
    position: absolute;
    top: 3vh;
    left: 0;
    width: 100%;
    height: 97vh;
    padding: 9vw 3vw;
    background: #e2e4e9;
    overflow: auto;
    .list {
      // .item {
      //   position: relative;
      //   width: 100%;
      //   height: 36vw;
      //   @each $color in red, green, blue, white, yellow {
      //     &.#{"" + $color} {
      //       background: url("~@/assets/vote-result/bg-#{$color}.png")
      //         0
      //         center
      //         no-repeat;
      //       background-size: 100% 75%;
      //     }
      //   }
      //   .image-box {
      //     position: absolute;
      //     top: 50%;
      //     width: 60%;
      //     height: 100%;
      //     // width: 45vw;
      //     // height: 90%;
      //     transform-origin: left center;
      //     transform: translateY(-50%) skew(10deg);
      //     // transform: translateY(-50%);
      //     .swiper-container {
      //       position: absolute;
      //       right: 0;
      //       top: 50%;
      //       transform: translateY(-50%);
      //       // width: 45vw;
      //       // height: 90%;
      //       width: 100%;
      //       height: 100%;
      //     }
      //     ::v-deep .swiper-wrapper {
      //       // width: 45vw !important;
      //       // height: 90%;
      //     }
      //     .swiper-slide {
      //       // width: 45vw !important;
      //       // height: 90%;
      //       // width: 100% !important;
      //       // height: 100%;
      //     }
      //     .image {
      //       box-sizing: border-box;
      //       position: absolute;
      //       top: 50%;
      //       left: 0;
      //       width: 45vw !important;
      //       height: 90%;
      //       transform: translateY(-50%);
      //       border: 1vw solid #fff;
      //       overflow: hidden;
      //       box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.2);
      //       // &:first-child {
      //       //   transform: translateX(-20px) scale(0.8) skew(10deg);
      //       // }
      //       // &:nth-child(2) {
      //       //   transform: translateX(-10px) scale(0.9) skew(10deg);
      //       // }
      //       .int {
      //         position: absolute;
      //         top: 50%;
      //         left: 50%;
      //         width: 100%;
      //         transform: translate(-50%, -50%);
      //       }
      //     }
      //   }
      //   .atlas-name {
      //     display: block;
      //     position: absolute;
      //     width: 30vw;
      //     top: 50%;
      //     transform: translateY(-20%);
      //     font-size: 16px;
      //     color: #fff;
      //     text-align: center;
      //   }
      //   .vote-number {
      //     position: absolute;
      //     line-height: 6vw;
      //     padding: 5px 15px;
      //     .num {
      //       position: relative;
      //       color: #fff;
      //       font-size: 14px;
      //       letter-spacing: 0.5px;
      //     }
      //     &::before {
      //       content: "";
      //       position: absolute;
      //       top: 0;
      //       right: 0;
      //       width: 100%;
      //       height: 100%;
      //       background-color: #000;
      //       transform: skew(10deg);
      //     }
      //   }

      //   &:nth-child(2n) {
      //     .image-box {
      //       // right: 8vw;
      //       // right: 7vw;
      //       right: -4vw;
      //     }
      //     .vote-number {
      //       top: 4vw;
      //       left: 0;
      //     }
      //     .atlas-name {
      //       left: 5vw;
      //     }
      //   }
      //   &:nth-child(2n + 1) {
      //     .image-box {
      //       // left: 10vw;
      //       left: 6vw;
      //       // left: 0;
      //     }
      //     .vote-number {
      //       top: 4vw;
      //       right: 3.5vw;
      //     }
      //     .atlas-name {
      //       right: 5vw;
      //     }
      //   }
      // }
      .item + .item {
        margin-top: 9vw;
      }
    }
  }
  .return-btn {
    position: absolute;
    top: 1.5vh;
    right: 0;
    width: 20vw;
    height: 10vw;
    background: url(../assets/vote-result/return-btn.png) 0 0 no-repeat;
    background-size: 100% 100%;
  }
}
</style>
