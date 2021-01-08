module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "/light-sports/" : "",
  devServer: {
    proxy: {
      "/savc": {
        target: "http://pd.xinhua-news.cn/lightsports",
        changeOrigin: true
      }
    }
  }
};
