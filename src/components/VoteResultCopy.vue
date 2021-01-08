<template>
  <div :class="['vote-result', voteDisplay]">
    <div class="container">
      <!-- <ul class="list">
        <li v-for="theme in themes" :key="theme" :class="['item', theme]">
          <div class="image-box">
            <div class="image" v-for="(url, i) in altasCover.red" :key="i">
              <img :src="url" alt />
            </div>
          </div>
          <span class="atlas-name">颜色名称</span>
          <span class="vote-number">
            <span class="num">140564票</span>
          </span>
        </li>
      </ul>-->
      <ul class="result-list">
        <li v-for="theme in themes" :key="theme" :class="['result-item', theme]">
          <div class="result-number">140564票</div>
          <ul class="image-list">
            <li class="image-item" v-for="(img, i) in altasCover[theme]" :key="i">
              <div class="image-name">{{atlasTitle[theme][i]}}</div>
              <div class="image">
                <img class="int" :src="img" alt />
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <a class="return-btn" @click="store.setVoteVisible(false)"></a>
  </div>
</template>
<script>
import { altasCover, atlasTitle } from "@/common/global/atlas";

const themes = ["red", "yellow", "blue", "white", "green"];

export default {
  inject: ["store"],
  data() {
    return { themes, altasCover, atlasTitle, voteDisplay: "" };
  },
  watch: {
    "store.showVote"(isShow) {
      this.voteDisplay = isShow ? "show" : "hide";
    }
  },
  methods: {}
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
          top: 0;
          width: 45vw;
          height: 90%;
          .image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 1vw solid #fff;
            transform-origin: left center;
            transform: skew(10deg);
            overflow: hidden;
            box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.2);
            &:first-child {
              transform: translateX(-20px) scale(0.8) skew(10deg);
            }
            &:nth-child(2) {
              transform: translateX(-10px) scale(0.9) skew(10deg);
            }
            img {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 100%;
              transform: translate(-50%, -50%);
            }
          }
        }
        .atlas-name {
          position: absolute;
          top: 50%;
          font-size: 16px;
          color: #fff;
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
            right: 8vw;
          }
          .vote-number {
            top: 4vw;
            left: 0;
          }
          .atlas-name {
            left: 8vw;
          }
        }
        &:nth-child(2n + 1) {
          .image-box {
            left: 10vw;
          }
          .vote-number {
            top: 4vw;
            right: 3.5vw;
          }
          .atlas-name {
            right: 8vw;
          }
        }
      }
      .item + .item {
        margin-top: 9vw;
      }
    }

    .result-list {
      .result-item {
        position: relative;
        padding: 8vw 0 17vw;
        @each $colorName, $color in $voteThemeBgColors {
          &.#{"" + $colorName} {
            background-color: #{$color};
          }
        }
        .result-number {
          position: absolute;
          top: -1.2vw;
          padding: 2vw 3.5vw;
          color: #fff;
          font-size: 3vw;
          background-color: #000;
        }
        &:nth-child(2n + 1) {
          .result-number {
            left: -1.2vw;
          }
        }
        &:nth-child(2n) {
          .result-number {
            right: -1.2vw;
          }
        }
        .image-list {
          .image-item {
            position: relative;
            height: 32vw;
            .image-name {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              padding: 3vw 6vw;
              font-size: 4vw;
              color: #fff;
              background-color: #b31111;
            }
            .image {
              box-sizing: border-box;
              position: absolute;
              top: 0;
              width: 45vw;
              height: 32vw;
              border: 4px solid #fff;
              overflow: hidden;
              .int {
                position: absolute;
                top: 50%;
                left: 0;
                transform: translateY(-50%);
                width: 100%;
              }
            }
            &:nth-child(2n) {
              .image-name {
                right: -1.2vw;
              }
              .image {
                left: 4vw;
              }
            }
            &:nth-child(2n + 1) {
              .image-name {
                left: -1.2vw;
              }
              .image {
                right: 4vw;
              }
            }
          }
          .image-item + .image-item {
            margin-top: 2.7vw;
          }
        }
      }
      .result-item + .result-item {
        margin-top: 9.5vw;
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
