import Vue from 'vue'

//const api_HOST = "https://192.168.1.102/b";
//const api_HOST = "https://192.168.43.37/b";
const api_HOST = "https://127.0.0.1/b";
//const ws_HOST = "wss://192.168.1.102/b";          // WebSocket
const ws_HOST = "wss://127.0.0.1/b";          // WebSocket
//const ws_HOST = "wss://192.168.43.37/b";          // WebSocket
const api_SEND_IMAGE = api_HOST + "/face-recognition/";

const api_LOGIN = api_HOST + "/api-token-auth/";
const api_REGISTER = api_HOST + '/auth-user/';

const api_STUDENT = api_HOST + "/students/";
const api_WELCOME_DATA = api_HOST + "/yearcheckindata/";
const api_WELCOME_DATA_SHOW = api_HOST + '/welcome-data-show/';
const api_WELCOME_EVENT = api_HOST + "/yearcheckinevent/";
const api_UPLOAD_IMAGE = api_HOST + "/upload-image/";
const api_PUBLIC_INFO = api_HOST + "/publicinfo/";
const api_POST_CARD = api_HOST + "/postcard/";
const api_IS_IMAGE_UPLOAD_THIS_YEAR = api_HOST + '/is-image-upload-this-year/';
const api_COMMENT = api_HOST + '/comment/';

const ws_MONITOR = ws_HOST + "/ws/monitor/";
const ws_WELCOME_DATA = ws_HOST + "/ws/welcome-data/"

export default {
    getHttpApi: function () {
        return api_HOST;
    },

    getWsMonitor: function () {
        return ws_MONITOR;
    },
    getWsWelcomeData: function () {
        return ws_WELCOME_DATA;
    },
    sendImage: function (canvas, bbox = [], detected = false,
                         recognize = true, name = null, saveVec = false, savePic = false) {
        let data = {
            "image": canvas.toDataURL('image/jpeg'),
            "detected": detected,
        };
        // If use the detected result
        if (detected == true) {
            data["face"] = bbox
        }
        if (recognize == true) {
            data["recognize"] = true;
        }
        if (savePic == true) {
            data["savePic"] = true;
        }
        if (saveVec == true) {
            data["saveVec"] = true
        }
        if (name != null || name != "") {
            data["name"] = name
        }
        return Vue.prototype.$axios.post(api_SEND_IMAGE, JSON.stringify(data))
    },

    loginIn: function (username, password) {
        let param = new URLSearchParams();
        param.append("username", username);
        param.append("password", password);
        return Vue.prototype.$axios.post(api_LOGIN, param);
    },
    register: function (username, password) {
        let param = new URLSearchParams();
        param.append("username", username);
        param.append("password", password);
        return Vue.prototype.$axios.post(api_REGISTER, param);
    },
    studentList: function () {
        return Vue.prototype.$axios.get(api_STUDENT);
    },
    publicInfoList: function () {
        return Vue.prototype.$axios.get(api_PUBLIC_INFO);
    },
    postCardList: function (page) {
        let param = new URLSearchParams();
        param.append("ordering", '-time');
        param.append("p", page.toString());
        return Vue.prototype.$axios.get(api_POST_CARD, {params: param});
    },
    deletePostCard: function (id) {
        return Vue.prototype.$axios.delete(api_POST_CARD + id + '/')
    },
    myPostCardList: function (page) {
        let param = new URLSearchParams();
        param.append("ordering", '-time');
        param.append("p", page.toString());
        param.append("student", localStorage.getItem('stu_number'));
        return Vue.prototype.$axios.get(api_POST_CARD, {params: param});
    },
    addPostCard: function (title, text) {
        let param = new URLSearchParams();
        param.append('title', title);
        param.append('text', text);
        param.append('student', localStorage.getItem("stu_number"));
        param.append("time", this.format(new Date(), "yyyy-MM-dd hh:mm:ss"));
        return Vue.prototype.$axios.post(api_POST_CARD, param);
    },
    commentList: function (postcard) {
        let param = new URLSearchParams();
        param.append("ordering", '-time');
        param.append('post_card', postcard);
        return Vue.prototype.$axios.get(api_COMMENT, {params: param});
    },
    addComment: function (postcard, text) {
        let param = new URLSearchParams();
        param.append('post_card', postcard);
        param.append('student', localStorage.getItem("stu_number"));
        param.append("time", this.format(new Date(), "yyyy-MM-dd hh:mm:ss"));
        param.append('text', text);
        return Vue.prototype.$axios.post(api_COMMENT, param);
    },
    welcomeDataList: function (order, page) {
        let param = new URLSearchParams();
        if (order == 'descend')
            param.append("ordering", '-time');
        else if (order == 'ascennd')
            param.append("ordering", 'time');
        if (page != undefined)
            param.append("p", page);
        param.append('checked', true);
        return Vue.prototype.$axios.get(api_WELCOME_DATA, {params: param});
    },
    welcomeDataExtend: function () {
        return Vue.prototype.$axios.get(api_WELCOME_DATA_SHOW);
    },
    mywelcomeData: function () {
        let param = new URLSearchParams();

        return Vue.prototype.$axios.get(api_WELCOME_DATA, {params: param});
    },
    uploadImage: function (filename) {
        return api_UPLOAD_IMAGE;
    },
    getMyImage: function () {
        return Vue.prototype.$axios.get(api_UPLOAD_IMAGE)
    },
    deleteMyImage: function (filename) {
        const param = {"name": filename};
        return Vue.prototype.$axios.delete(api_UPLOAD_IMAGE, {data: JSON.stringify(param)})
    },
    isReadyThisYear: async function () {
        return Vue.prototype.$axios.get(api_IS_IMAGE_UPLOAD_THIS_YEAR);
    },
    getStudent: function (stu_number) {
        let param = new URLSearchParams();
        param.append("id_number", stu_number);
        return Vue.prototype.$axios.get(api_STUDENT, {params: param})
    },
    getYearCheckInEvent: function () {
        let param = new URLSearchParams();
        param.append("year", new Date().getFullYear());
        return Vue.prototype.$axios.get(api_WELCOME_EVENT, {params: param});
    },
    addWelcomeData: function (stu_number) {
        let paramm = new URLSearchParams();
        paramm.append("student", stu_number)
        Vue.prototype.$axios.get(api_WELCOME_DATA, {params: paramm}).then(response => {
                let param = new URLSearchParams();
                param.append("time", this.format(new Date(), "yyyy-MM-dd hh:mm:ss"));
                param.append('checked', true);
                console.log(response);
                Vue.prototype.$axios.put(api_WELCOME_DATA + response.data.results[0]['id'] + '/', param).then(response => {
                    console.log('ok');
                });
            }
        )
    },

    format: function (date, fmt) {
        var o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }
}
