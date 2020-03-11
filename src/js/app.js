import Vue from 'vue';
import VueRouter from 'vue-router';
import VueSocketIOExt from 'vue-socket.io-extended';
import io from 'socket.io-client'

window.serverURI = window.location.protocol+"//"+window.location.host+"";
window.apiURI = window.location.protocol+"//"+window.location.host+":3001";
window.socketIOURI = window.location.protocol+"//"+window.location.host+":3000";

Vue.use(VueRouter);

import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);

window.axios = require('axios');
window.axios.defaults.withCredentials = true;
window.user = false;

import App from './components/App.vue';

import HeaderBox from './components/HeaderBox.vue';
Vue.component('headerbox', HeaderBox);

Vue.component('MultipleChoiceRender', function (resolve) {
 require(['./components/Questions/Render/MultipleChoice.vue'], resolve)
});

Vue.component('percentage-ring', function (resolve) {
 require(['./components/PercentageRing.vue'], resolve)
});

Vue.component('percentage-bar', function (resolve) {
 require(['./components/PercentageBar.vue'], resolve)
});

const socket = io(window.socketIOURI, {
  autoConnect: false
});
Vue.use(VueSocketIOExt, socket);

import {routes} from './routes.js';
const router = new VueRouter({
  mode: 'history',
  routes: routes,
});

function nextFactory(context, middleware, index) {
  const subsequentMiddleware = middleware[index];
  // If no subsequent Middleware exists,
  // the default `next()` callback is returned.
  if (!subsequentMiddleware) return context.next;

  return (...parameters) => {
    // Run the default Vue Router `next()` callback first.
    context.next(...parameters);
    // Then run the subsequent Middleware with a new
    // `nextMiddleware()` callback.
    const nextMiddleware = nextFactory(context, middleware, index + 1);
    subsequentMiddleware({ ...context, next: nextMiddleware });
  };
}

router.beforeEach((to, from, next) => {
  if (to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware)
      ? to.meta.middleware
      : [to.meta.middleware];

    const context = {
      from,
      next,
      router,
      to,
    };
    const nextMiddleware = nextFactory(context, middleware, 1);

    return middleware[0]({ ...context, next: nextMiddleware });
  }

  return next();
});

import { EventBus } from './eventbus.js';
window.EventBus = EventBus;

const app = new Vue({
  el: "#app",
  router,
  template: '<App/>',
  components: { App }
});
