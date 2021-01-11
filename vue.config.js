module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/light-sports/" : "",
  devServer: {
    proxy: {
      "/lightsports": {
        target: "http://pd.xinhua-news.cn/",
        changeOrigin: true
      }
    }
  }
};
