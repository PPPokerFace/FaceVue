import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import axios from 'axios'

import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';

import api from './common/api.js'
import store from './common/store.js'
import router from './common/router.js'

Vue.config.productionTip = false

Vue.prototype.$api = api;
Vue.prototype.$store = store;
Vue.prototype.$axios = axios;


const token = localStorage.getItem('token');
if (token) {
  Vue.prototype.$axios.defaults.headers.common['Authorization'] = 'Token ' + token;
}

Vue.use(Antd);
// Vue.use(ElementUI);
Vue.use(Vuex);
Vue.use(VueRouter);

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')

