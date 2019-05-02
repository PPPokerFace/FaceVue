import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import api from './api.js'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        status: localStorage.getItem('status') || '',
        token: localStorage.getItem('token') || '',
        username: localStorage.getItem('username') || '',
    },
    // mutators是被用来改变vuex store的状态
    mutations: {
        auth_request(state, username) {
            state.status = 'loading';
            state.username = username;
            localStorage.setItem('status', 'loading');
            localStorage.setItem('username', username);
        },
        auth_success(state, token) {
            state.status = 'success';
            state.token = token;
            localStorage.setItem('status', 'success');
            localStorage.setItem('token', token);
        },
        auth_error(state) {
            state.status = 'error';
            state.username = '';
            localStorage.setItem('status', 'error');
            localStorage.setItem('username', '');
        },
        logout(state) {
            state.status = '';
            state.token = '';
            state.username='';
            localStorage.setItem('status', '');
            localStorage.setItem('username', '');
        }
    },
    actions: {
        login({commit}, user) {
            return new Promise((resolve, reject) => {
                const username = user.username;
                commit('auth_request', username);
                api.loginIn(user.username, user.password)
                    .then((resp) => {
                        const token = resp.data.token;
                        axios.defaults.headers.common['Authorization'] = "Token " + token;
                        commit('auth_success', token);
                        resolve(resp)
                    })
                    .catch(err => {
                        commit('auth_error');
                        localStorage.removeItem('token');
                        reject(err)
                    })
            })
        }
        ,
        logout({commit}) {
            return new Promise((resolve, reject) => {
                commit('logout');
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
                resolve()
            })
        }
        ,
    }
    ,
// 使用getter来获取vuex状态中的属性值
    getters: {
        isLoggedIn: state => state.token != '',
        authStatus: state => state.status,
        userName: state => state.username,
    }
    ,
})

