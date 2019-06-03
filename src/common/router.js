import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store.js'

import Login from '../components/layout/login.vue'
import Home from '../components/layout/home.vue'
import UploadImg from '../components/layout/uploadImg.vue'
import WelcomeData from '../components/layout/welcomeData.vue'
import WelcomeDataShow from '../components/layout/welcomeDataShow.vue'
import MyImage from '../components/layout/myImage.vue'
import MyInformation from '../components/layout/myInformation.vue'
import PublicInfo from '../components/layout/publicInfo.vue'
import AllPostCard from '../components/layout/allPostCard.vue'
import MyPostCard from '../components/layout/myPostCard.vue'

import YoloWebCam from '../components/YoloWebCamXI'
import api from "./api";

import ObjectDetection from "../components/ObjectDetection";
import gps from "../components/layout/gps"
import adminInfo from "../components/layout/adminInfo"
import monitor from "../components/monitor"
import WelcomeDataShowPhone from "../components/layout/WelcomeDataShowPhone";
import WebSocketWebCam from "../components/WebSocketWebCam"
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
            path: '/welcomeDataShow',
            name: 'welcomeDataShow',
            component: WelcomeDataShow
        },
        {
            path: '/welcomeDataShowPhone',
            name: 'welcomeDataShowPhone',
            component: WelcomeDataShowPhone
        },
        {
            path: '/face',
            name: 'face',
            component: YoloWebCam
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
            path: '/allPostCard',
            name: 'allPostCard',
            component: AllPostCard
        },
        {
            path: '/myPostCard',
            name: 'myPostCard',
            component: MyPostCard
        },
        {
            path: '/publicInfo',
            name: 'publicInfo',
            component: PublicInfo
        },
        {
            path: '/objectDetection',
            name: 'objectDetection',
            component: ObjectDetection
        },
        {
            path: '/gps',
            name: 'gps',
            component: gps
        },
        {
            path: '/adminInfo',
            name: 'adminInfo',
            component: adminInfo
        },
        {
            path: '/monitor',
            name: 'monitor',
            component: monitor
        },
        {
            path:'/webSocketWebCam',
            name:'webSocketWebCam',
            component:WebSocketWebCam
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
    if (to.path == '/uploadImg') localStorage.setItem('refresh', 'yes');
    if (localStorage.getItem('refresh') == 'no' && to.path != '/welcomeDataShow') {
        localStorage.setItem('refresh', 'yes');
        window.location.reload();
    }
    if (localStorage.getItem('refresh') == 'yes' && to.path == '/welcomeDataShow') {
        localStorage.setItem('refresh', 'no');
        window.location.reload();
    }
});

export default router;
