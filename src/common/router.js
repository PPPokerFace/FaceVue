import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store.js'

import Login from '../components/layout/login.vue'
import Home from '../components/layout/home.vue'
import UploadImg from '../components/layout/uploadImg.vue'
import WelcomeData from '../components/layout/welcomeData.vue'
import MyImage from '../components/layout/myImage.vue'
import MyInformation from '../components/layout/myInformation.vue'
import PublicInfo from '../components/layout/publicInfo.vue'
import AllPostCard from '../components/layout/allPostCard.vue'

import Layouttest from '../components/layout'
import api from "./api";

Vue.use(VueRouter);


const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/uploadImg',
            name: 'uploadImg',
            component: UploadImg,
        },
        {
            path: '/welcomeData',
            name: 'welcomeData',
            component: WelcomeData
        },
        {
            path: '/face',
            name: 'face',
            component: Layouttest
        },
        {
            path: '/Home',
            name: 'home',
            component: Home
        },
        {
            path: '/myImage',
            name: 'myImage',
            component: MyImage
        },
        {
            path: '/myInformation',
            name: 'myInformation',
            component: MyInformation
        },
        {
            path:'/allPostCard',
            name:'allPostCard',
            component:AllPostCard
        },
        {
            path:'/publicInfo',
            name:'publicInfo',
            component:PublicInfo
        }

    ]
});

router.beforeEach((to, from, next) => {
    // if (to.matched.some(record => record.meta.requiresAuth)) {
    //     if (store.getters.isLoggedIn) {
    //         next();
    //         return
    //     }
    //     next('/login');
    // } else {
    //     next();
    // }
    if (to.path != '/login' && !store.getters.isLoggedIn) {
        next('/login');
    } else if (to.path == '/login' && store.getters.isLoggedIn || to.path == '/') {
        next('/uploadImg');
    } else {
        if (to.path == '/welcomeData' || to.path == '/myInformation') {
            api.mywelcomeData().then(response => {
                if (response.data.results[0] == undefined) {
                    localStorage.setItem("faceed", "no");
                    next('/uploadImg');
                    return
                }
            })
        }
        next();
    }
});

export default router;
