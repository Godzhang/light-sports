<template>
  <div class="animate">
    <Shuffle />
    <Play />
    <Cover />
    <Load />
    <VoteResult />
  </div>
</template>
<script>
import axios from "axios";
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
      showVote: false,
      voteNums: {
        red: 0,
        green: 0,
        blue: 0,
        white: 0,
        yellow: 0
      },
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
    axios.get("/savc?id=6").then(res => {
      const { data } = res;
      if (data.code === 200) {
        for (let key in data) {
          if (key !== "code") {
            this.voteNums[numToColor[key]] = data[key];
          }
        }
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
      axios.post(`/savc?id=${colorToNum[this.colorType]}`).then(res => {
        const { data } = res;
        if (data.code === 200) {
          this.voteNums[this.colorType] = data.count;
          this.voteStatus[this.colorType] = true;
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
}
</style>
