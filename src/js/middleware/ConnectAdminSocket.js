import Vue from 'vue';
import VueSocketIO from 'vue-socket.io';
export default function ConnectAdminSocket({ next, router }) {
  Vue.use(new VueSocketIO({
    connection: window.socketIOURI+'?token='+window.user.token,
  }));
  return next();
}
