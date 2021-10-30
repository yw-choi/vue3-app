module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/common.scss";
        `
      }
    }
  },
  configureWebpack: {
    devtool: "source-map"
  }
};
