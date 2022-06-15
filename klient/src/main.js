import Vue from "vue";
import App from "./App.vue";
import Vuex from "vuex";

import state from "./store/state";
import actions from "./store/actions";
import getters from "./store/getters";
import mutations from "./store/mutations";

Vue.config.productionTip = false;

Vue.use(Vuex);

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});

new Vue({
  store: store,
  render: (h) => h(App),
}).$mount("#app");
