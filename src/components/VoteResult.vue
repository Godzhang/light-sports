<template>
  <div :class="['vote-result', voteDisplay]">
    <div class="vote-mask" @click="store.setVoteVisible(false)"></div>
    <div class="container">
      <div class="list">
        <!-- <VoteSwiper theme="red" /> -->
        <VoteSwiper v-for="theme in themes" :key="theme" :theme="theme" />
      </div>
    </div>
    <a class="return-btn" @click="store.setVoteVisible(false)"></a>
  </div>
</template>
<script>
import { copy } from "@/common/utils/utils";
import VoteSwiper from "./VoteSwiper";

export default {
  inject: ["store"],
  data() {
    return {
      themes: ["red", "green", "blue", "white", "yellow"],
      voteDisplay: ""
    };
  },
  mounted() {
    this.sortByNums();
  },
  watch: {
    "store.showVote"(isShow) {
      this.voteDisplay = isShow ? "show" : "hide";
    }
  },
  methods: {
    sortByNums() {
      const voteNums = this.store.voteNums;
      const arr = [];
      for (let key in voteNums) {
        arr.push({ key, nums: voteNums[key] });
      }
      arr.sort((a, b) => b.nums - a.nums);
      this.themes = arr.map(item => item.key);
    }
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
  z-index: 105;
  .vote-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }
  &.show {
    animation: voteShow 0.2s linear forwards;
  }
  &.hide {
    animation: voteHide 0.2s linear forwards;
  }
  .container {
    box-sizing: border-box;
    position: absolute;
    top: 15vh;
    left: 0;
    width: 100%;
    height: 85vh;
    padding: 9vw 3vw;
    background: #e2e4e9;
    overflow-y: auto;
    overflow-x: hidden;
    .list {
      .item + .item {
        margin-top: 9vw;
      }
    }
  }
  .return-btn {
    position: absolute;
    top: 14vh;
    right: 0;
    width: 20vw;
    height: 10vw;
    background: url(../assets/vote-result/return-btn.png) 0 0 no-repeat;
    background-size: 100% 100%;
  }
}
</style>
