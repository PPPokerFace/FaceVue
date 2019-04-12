import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store.js'
import Login from '../components/layout/login.vue'
import Home from '../components/layout/home.vue'
import UploadImg from '../components/layout/uploadImg.vue'
import StartWelcome from '../components/layout/startWelcome.vue'
import WelcomeData from '../components/layout/welcomeData.vue'

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
            component: UploadImg
        },
        {
            path: '/startWelcome',
            name: 'startWelcome',
            component: StartWelcome
        },
        {
            path: '/welcomeData',
            name: 'welcomeData',
            component: WelcomeData
        },

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
        next();
    }
});

export default router;
