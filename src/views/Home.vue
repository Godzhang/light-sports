<template>
  <div class="animate">
    <Shuffle />
    <Play />
    <Cover />
    <Load />
    <VoteResult ref="vote" />
    <audio id="audio_bg" ref="audio_bg" src></audio>
    <audio id="audio_band" ref="audio_band" src></audio>
  </div>
</template>
<script>
// import Vue from "vue";
import axios from "axios";
// import audio from "@/common/utils/audio";
import Load from "../components/Load";
import Cover from "../components/Cover";
import Play from "../components/Play";
import Shuffle from "../components/Shuffle";
import VoteResult from "../components/VoteResult";

const colorToNum = {
  red: 1,
  green: 2,
  blue: 3,
  white: 4,
  yellow: 5
};
const numToColor = (obj => {
  const result = {};
  for (let key in obj) {
    result[`count${obj[key]}`] = key;
  }
  return result;
})(colorToNum);

export default {
  name: "Home",
  provide() {
    return {
      store: this
    };
  },
  data() {
    return {
      step: 1, // 页面索引，从 1 开始
      colorType: "red", // 主题
      groupIndex: 0, // 表示当前主题图集的第几组索引
      showVote: false, // 投票页显隐控制变量
      // 投票统计
      voteNums: {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        yellow: 0
      },
      // 对应颜色投票状态，一个颜色只能投一次
      voteStatus: {
        red: false,
        green: false,
        blue: false,
        white: false,
        yellow: false
      }
    };
  },
  created() {
    axios.get("/lightsports/savc?id=6").then(res => {
      const { data } = res;
      if (data.code === 200) {
        for (let key in data) {
          if (key !== "code") {
            this.voteNums[numToColor[key]] = data[key];
          }
        }
        this.$refs.vote.sortByNums();
      }
    });
  },
  methods: {
    nextStep() {
      this.step++;
    },
    setStep(s) {
      this.step = s;
    },
    setType(type) {
      this.colorType = type;
    },
    setGroupIndex(index) {
      this.groupIndex = index;
    },
    setVoteVisible(bol) {
      this.showVote = bol;
    },
    setVoteNum() {
      axios
        .post(`/lightsports/savc?id=${colorToNum[this.colorType]}`)
        .then(res => {
          const { data } = res;
          if (data.code === 200) {
            this.voteNums[this.colorType] = data.count;
            this.voteStatus[this.colorType] = true;
            this.$refs.vote.sortByNums();
            this.setVoteVisible(true);
          }
        });
    }
  },
  components: {
    Load,
    Cover,
    Play,
    Shuffle,
    VoteResult
  }
};
</script>
<style lang="scss" scoped>
.animate {
  position: relative;
  width: 100%;
  height: 100%;
  #audio_bg,
  #audio_band {
    position: absolute;
    top: 0;
    left: -9999px;
    visibility: hidden;
  }
}
</style>
