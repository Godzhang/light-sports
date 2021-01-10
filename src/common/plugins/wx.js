import { jsonp, loadScript } from "@/common/utils/http";
import { isWeixin } from "@/common/utils/sniffer";

const base = "https://pd.xinhua-news.cn/light-sports/#/";
let cfg = {};
const bootSdk = async ({ appId, timestamp, nonceStr, signature }) => {
  await loadScript("https://res.wx.qq.com/open/js/jweixin-1.2.0.js");
  if (!window.wx) return;
  window.wx.config({
    debug: false,
    appId,
    timestamp,
    nonceStr,
    signature,
    jsApiList: ["onMenuShareTimeline", "onMenuShareAppMessage"]
  });
  window.wx.ready(() => {
    window.wx.onMenuShareTimeline(cfg);
    window.wx.onMenuShareAppMessage(cfg);
  });
};
const requestSign = async () => {
  const url = encodeURIComponent(location.href.split("#")[0]);
  const data = await jsonp(
    "https://pd.xinhua-news.cn/xh/bind/jsapi.do?&mpId=2",
    { url }
  );
  if (data.code !== 200) return;
  bootSdk(data.content);
};
export default (
  opt = {
    title: document.title,
    desc: "pick你心中的年度体育色彩",
    link: base,
    imgUrl: `${location.href.split("#")[0]}share/weixin.jpg`,
    success: () => {},
    cancel: () => {}
  }
) => {
  cfg = Object.assign(cfg, opt);
  if (!isWeixin) return;
  requestSign();
};
