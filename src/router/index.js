import { createRouter, createWebHashHistory } from 'vue-router'
import VrPlayer from '../view/VrPlayer.vue'

const routes = [
  {
    path: '/',
    name: 'VrPlayer',
    component: VrPlayer,
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
