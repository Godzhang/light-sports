import { vw } from "./global";

export const redAtlas = [
  [require("../../assets/atlas/red/1/1.jpg")],
  [
    require("../../assets/atlas/red/2/1.jpg"),
    require("../../assets/atlas/red/2/2.jpg"),
    require("../../assets/atlas/red/2/3.jpg")
  ],
  [
    require("../../assets/atlas/red/3/1.jpg"),
    require("../../assets/atlas/red/3/2.jpg"),
    require("../../assets/atlas/red/3/3.jpg")
  ],
  [
    require("../../assets/atlas/red/4/1.jpg"),
    require("../../assets/atlas/red/4/2.jpg")
  ],
  [
    require("../../assets/atlas/red/5/1.jpg"),
    require("../../assets/atlas/red/5/2.jpg"),
    require("../../assets/atlas/red/5/3.jpg")
  ],
  [
    require("../../assets/atlas/red/6/1.jpg"),
    require("../../assets/atlas/red/6/2.jpg"),
    require("../../assets/atlas/red/6/3.jpg")
  ],
  [
    require("../../assets/atlas/red/7/1.jpg"),
    require("../../assets/atlas/red/7/2.jpg"),
    require("../../assets/atlas/red/7/3.jpg")
  ]
];
export const greenAtlas = [
  [
    require("../../assets/atlas/green/1/1.jpg"),
    require("../../assets/atlas/green/1/2.jpg"),
    require("../../assets/atlas/green/1/3.jpg"),
    require("../../assets/atlas/green/1/4.jpg")
  ],
  [
    require("../../assets/atlas/green/2/1.jpg"),
    require("../../assets/atlas/green/2/2.jpg"),
    require("../../assets/atlas/green/2/3.jpg")
  ],
  [
    require("../../assets/atlas/green/3/1.jpg"),
    require("../../assets/atlas/green/3/2.jpg"),
    require("../../assets/atlas/green/3/3.jpg"),
    require("../../assets/atlas/green/3/4.jpg"),
    require("../../assets/atlas/green/3/5.jpg")
  ]
];
export const blueAtlas = [
  [
    require("../../assets/atlas/blue/1/1.jpg"),
    require("../../assets/atlas/blue/1/2.jpg"),
    require("../../assets/atlas/blue/1/3.jpg")
  ],
  [
    require("../../assets/atlas/blue/2/1.jpg"),
    require("../../assets/atlas/blue/2/2.jpg"),
    require("../../assets/atlas/blue/2/3.jpg"),
    require("../../assets/atlas/blue/2/4.jpg")
  ],
  [
    require("../../assets/atlas/blue/3/1.jpg"),
    require("../../assets/atlas/blue/3/2.jpg"),
    require("../../assets/atlas/blue/3/3.jpg")
  ],
  [
    require("../../assets/atlas/blue/4/1.jpg"),
    require("../../assets/atlas/blue/4/2.jpg")
  ],
  [
    require("../../assets/atlas/blue/5/1.jpg"),
    require("../../assets/atlas/blue/5/2.jpg"),
    require("../../assets/atlas/blue/5/3.jpg"),
    require("../../assets/atlas/blue/5/4.jpg")
  ]
];
export const whiteAtlas = [
  [
    require("../../assets/atlas/white/1/1.jpg"),
    require("../../assets/atlas/white/1/2.jpg"),
    require("../../assets/atlas/white/1/3.jpg"),
    require("../../assets/atlas/white/1/4.jpg")
  ],
  [
    require("../../assets/atlas/white/2/1.jpg"),
    require("../../assets/atlas/white/2/2.jpg"),
    require("../../assets/atlas/white/2/3.jpg"),
    require("../../assets/atlas/white/2/4.jpg")
  ],
  [
    require("../../assets/atlas/white/3/1.jpg"),
    require("../../assets/atlas/white/3/2.jpg"),
    require("../../assets/atlas/white/3/3.jpg")
  ],
  [
    require("../../assets/atlas/white/4/1.jpg"),
    require("../../assets/atlas/white/4/2.jpg")
  ],
  [
    require("../../assets/atlas/white/5/1.jpg"),
    require("../../assets/atlas/white/5/2.jpg"),
    require("../../assets/atlas/white/5/3.jpg")
  ]
];
export const yellowAtlas = [
  [
    require("../../assets/atlas/yellow/1/1.jpg"),
    require("../../assets/atlas/yellow/1/2.jpg"),
    require("../../assets/atlas/yellow/1/3.jpg"),
    require("../../assets/atlas/yellow/1/4.jpg"),
    require("../../assets/atlas/yellow/1/5.jpg")
  ]
];

export const atlas = {
  red: redAtlas,
  green: greenAtlas,
  blue: blueAtlas,
  white: whiteAtlas,
  yellow: yellowAtlas
};

export const flattenAtlas = (atlas => {
  let result = {};
  for (let key in atlas) {
    result[key] = atlas[key].reduce((res, curr) => [...res, ...curr], []);
  }
  return result;
})(atlas);

// 图集每组断点索引
export const atlasBreakPoints = (atlas => {
  const result = {};
  for (let key in atlas) {
    let arr = [0];
    for (let i = 1, len = atlas[key].length; i < len; i++) {
      arr.push(arr[arr.length - 1] + atlas[key][i - 1].length);
    }
    result[key] = arr;
  }
  return result;
})(atlas);

export const redAtlasCover = redAtlas.map((item, i) => {
  if (i === 1 || i === 3 || i === 5) {
    return item[0];
  } else if (i === 2 || i === 4 || i === 6) {
    return item[1];
  }
  return item[item.length - 1];
});
export const greenAtlasCover = greenAtlas.map((item, i) => {
  if (i === 1) {
    return item[1];
  } else {
    return item[0];
  }
});
export const blueAtlasCover = blueAtlas.map((item, i) => {
  if (i === 4) {
    return item[1];
  }
  return item[0];
});
export const whiteAtlasCover = whiteAtlas.map((item, i) => {
  if (i === 0 || i === 2 || i === 3) {
    return item[1];
  } else if (i === 4) {
    return item[0];
  }
  return item[item.length - 1];
});
export const yellowAtlasCover = yellowAtlas.map(item => item[0]);

export const altasCover = {
  red: redAtlasCover,
  green: greenAtlasCover,
  blue: blueAtlasCover,
  white: whiteAtlasCover,
  yellow: yellowAtlasCover
};

export const atlasTitle = {
  red: [
    `“小红人儿”来啦`,
    "太极拳申遗成功",
    "国球威武",
    `全力以“复”`,
    "女篮精神“出圈”",
    "红土封王",
    `“红”霸天下`
  ],
  green: ["拥抱绿水青山", "绿茵场恢复生机", "绿茵场上怎么能少了小朋友？"],
  blue: [
    "再见迭戈 蓝色永恒",
    "老将VS新秀",
    "蓝色风暴",
    "新世界纪录！",
    "我们也有一片蓝色天地"
  ],
  white: [
    "未来可期",
    `三亿人上冰雪`,
    "青春在冰雪中绽放",
    "因为疫情\r\n这一年的体育比赛有些不一样......",
    "但这不能阻挡我们在冰上起舞"
  ],
  yellow: ["科比骤逝 巨星陨落"]
};

export const atlasDesc = {
  red: [
    "北京2022年冬奥会和冬残奥会体育图标发布。",
    "你被圈粉了么？",
    "国际乒联女子世界杯成为疫情发生以来在国内举办的第一个有境外选手参加的国际体育赛事。随后，国际乒联总决赛、WTT澳门国际赛相继登场。",
    "CBA以空场赛会制方式复赛，成为疫情发生后国内首个重启的全国性大型体育赛事。",
    "中国女篮惊艳体坛，在东京奥运会女篮资格赛贝尔格莱德赛区比赛中三战全胜，获得东京奥运会入场券。",
    "纳达尔第13次加冕法网男单冠军，追平费德勒20次大满贯夺冠的男子纪录。",
    "30年首冠+提前7轮夺冠，利物浦登顶英超。"
  ],
  green: [
    "这一年，人们纷纷走到户外，呼吸大自然的空气。",
    "五大联赛、中超重启。",
    `足球、篮球、抖空竹、跳绳......体育活动丰富多样。\r\n我爱体育课！`
  ],
  blue: [
    "",
    "澳网赛场上，焦科维奇成就“八冠王”\r\n21岁的小将克宁斩获女单桂冠。",
    "中超大战中，江苏苏宁队夺得队史首个联赛冠军。",
    "全国游泳冠军赛暨东京奥运会达标赛中，男女4X100米混合泳接力新世界纪录诞生。",
    "做一条鱼吧！感受水中的乐趣，无论你在泳池中，还是大海里。"
  ],
  white: [
    "北京冬奥会所有竞赛场馆全面完工",
    "这个冬天你行动了吗？",
    "1月，第三届青冬奥会在瑞士洛桑举行。",
    "",
    "中国杯世界花样滑冰大奖赛在重庆举行。"
  ],
  yellow: [""]
};

export const atlasCoverText = {
  red: [
    `“小红人儿”来啦`,
    "太极拳申遗成功",
    "国球威武",
    `全力以“复”`,
    "女篮精神出圈",
    "红土封王",
    `“红”霸天下`
  ],
  green: ["拥抱绿水青山", "绿茵场恢复生机", "我爱体育课！"],
  blue: ["再见迭戈", "澳网", "蓝色风暴", "新世界纪录！", "水中乐趣"],
  white: [
    "未来可期",
    `三亿人上冰雪`,
    "青春在冰雪中绽放",
    "疫情下的体育赛场",
    "花样滑冰大奖赛"
  ],
  yellow: ["科比骤逝"]
};

export const altasInfos = (atlasTitle => {
  const reuslt = [];
  for (let key in atlasTitle) {
    reuslt[key] = atlasTitle[key].map(item => {
      let fontSize = 36;
      let disRatio = 5.5 * vw;
      let textTop = 13.5 * vw;
      if (item.length >= 5 && item.length < 8) {
        fontSize = 24;
        disRatio = 3.7 * vw;
        textTop = 12 * vw;
      } else if (item.length >= 8) {
        fontSize = 18;
        disRatio = 2.5 * vw;
        textTop = 11.5 * vw;
      }
      return {
        value: item,
        fontSize,
        disRatio: Math.floor(disRatio),
        textTop,
        textLeft: 80 * vw
      };
    });
  }
  return reuslt;
})(atlasTitle);
