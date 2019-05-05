import Vue from 'vue'

//const api_HOST = "https://192.168.1.102/b";
//const api_HOST = "https://192.168.0.105/b";
const api_HOST = "https://127.0.0.1/b";
//const api_HOST = "https://192.168.3.10/b";

const api_SEND_IMAGE = api_HOST + "/face-recognition/";

const api_LOGIN = api_HOST + "/api-token-auth/";

const api_STUDENT = api_HOST + "/students/";
const api_WELCOME_DATA = api_HOST + "/yearcheckindata/";
const api_WELCOME_EVENT = api_HOST + "/yearcheckinevent/";
const api_UPLOAD_IMAGE = api_HOST + "/upload-image/";
const api_PUBLIC_INFO = api_HOST + "/publicinfo/";
const api_POST_CARD = api_HOST + "/postcard/";
const api_IS_IMAGE_UPLOAD_THIS_YEAR = api_HOST + '/is-image-upload-this-year/';
const api_COMMENT = api_HOST + '/comment/';


export default {
    sendImage: function (canvas, bbox = [], detected = false,
                         recognize = true, name = null, saveVec = false, savePic = false)
    {
        let data={
            "image":canvas.toDataURL('image/jpeg'),
            "detected":detected,
        }
        // If use the detected result
        if (detected == true) {
            data["face"]=bbox
        }
        if (recognize == true) {
            data["recognize"]=true;
        }
        if (savePic == true) {
            data["savePic"]=true;
        }
        if (saveVec == true) {
            data["saveVec"]=true
        }
        if (name != null || name != "") {
            data["name"]=name
        }
        return Vue.prototype.$axios.post(api_SEND_IMAGE, JSON.stringify(data))
    },

    loginIn: function (username, password) {
        let param = new URLSearchParams();
        param.append("username", username);
        param.append("password", password);
        return Vue.prototype.$axios.post(api_LOGIN, param);
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
    addPostCard: function (title, text) {
        let param = new URLSearchParams();
        param.append('title', title);
        param.append('text', text);
        param.append('student', localStorage.getItem("stu_id"));
        param.append("time", this.format(new Date(), "yyyy-MM-dd hh:mm:ss"));
        return Vue.prototype.$axios.post(api_POST_CARD, param);
    },
    commentList: function (postcard) {
        let param = new URLSearchParams();
        param.append("ordering", '-time');
        param.append('post_card', postcard);
        return Vue.prototype.$axios.get(api_COMMENT, {params: param});
    },
    addComment:function(postcard,text){
        let param = new URLSearchParams();
        param.append('post_card',postcard);
        param.append('student',localStorage.getItem("stu_id"));
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
        return Vue.prototype.$axios.get(api_WELCOME_DATA, {params: param});
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
    deleteMyImage:function(filename){
        const param={"name":filename}
        return Vue.prototype.$axios.delete(api_UPLOAD_IMAGE, {data:JSON.stringify(param)})
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
        return Vue.prototype.$axios.get(api_WELCOME_EVENT, {param: param});
    },
    addWelcomeData: function (id) {
        let param = new URLSearchParams();
        param.append("student", id);
        param.append("time", this.format(new Date(), "yyyy-MM-dd hh:mm:ss"));
        param.append("year_check_in_event", localStorage.getItem("yearcheckinevent"));
        return Vue.prototype.$axios.post(api_WELCOME_DATA, param);
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
