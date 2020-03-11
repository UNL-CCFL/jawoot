import Home from './components/Home.vue'
import Quiz from './components/Quiz.vue'
import QuizInfo from './components/QuizInfo.vue'
import Quizzes from './components/Quizzes.vue'
import Users from './components/Users.vue'
import User from './components/User.vue'
import HostControl from './components/HostControl.vue'
import Sessions from './components/Sessions.vue'
import SessionInfo from './components/SessionInfo.vue'
import Play from './components/Play.vue'
import Login from './components/Login.vue'
import Vue from 'vue';

import IsLoggedIn from './middleware/IsLoggedIn'

export const routes = [
  {
    path: '/',
    component: Home,
    name: 'Home',
    meta: {
      'needsSocketIO': true,
    },
  },
  {
    path: '/login',
    component: Login,
    name: 'Login',
  },
  {
    path: '/quizzes',
    component: Quizzes,
    name: 'Quizzes',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/quizzes/new',
    components: {'default': Quizzes, 'slideout': Quiz},
    name: 'QuizNew',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/quizzes/info/:id',
    components: {'default': Quizzes, 'slideout': QuizInfo},
    name: 'QuizInfo',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/quizzes/:id',
    components: {'default': Quizzes, 'slideout': Quiz},
    name: 'QuizEdit',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/sessions',
    component: Sessions,
    name: 'Sessions',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/sessions/info/:code',
    components: {'default': Sessions, 'slideout': SessionInfo},
    name: 'SessionInfo',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/users/',
    component: Users,
    name: 'Users',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/users/new',
    components: {'default': Users, 'slideout': User},
    name: 'UserNew',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/users/:user_id',
    components: {'default': Users, 'slideout': User},
    name: 'UserEdit',
    meta: {
      'needsNav': true,
      'middleware': [IsLoggedIn],
    },
  },
  {
    path: '/host/:code',
    component: HostControl,
    name: 'HostControl',
    meta: {
      'middleware': [IsLoggedIn],
      'needsSocketIO': true,
    },
  },
  {
    path: '/play',
    component: Play,
    name: 'Play',
    meta: {
      'needsSocketIO': true,
    },
  },
  {
    path: '/:code',
    component: Home,
    name: 'home',
  },

  //don't really like this since we can't return a legit 404 header
  /*
  {
    path: '/404',
    component: DisplayPage
  },
  {
    path: '*',
    redirect: '/404'
  },
  */
];
