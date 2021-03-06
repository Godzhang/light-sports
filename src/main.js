import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import audio from "@/common/utils/audio";
import howler from "@/common/utils/howler";
import orientation from "@/common/utils/orientation";
import VueAwesomeSwiper from "vue-awesome-swiper";
import wx from "@/common/plugins/wx";

Vue.config.productionTip = false;
Vue.use(VueAwesomeSwiper);
Vue.use(orientation);

Vue.use(audio);
Vue.use(howler);

wx();

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
