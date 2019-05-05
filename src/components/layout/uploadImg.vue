<template>
    <div style="text-align: center;">
        <a-card title="上传自己的人脸照片" style="max-width: 600px;margin: 0 auto;">
            <a-upload-dragger id="upload" name="file" :multiple="true" :action="getUploadUrl"
                              @change="handleChange"
                              :headers="header"
            >
                <p class="ant-upload-drag-icon">
                    <a-icon type="inbox"/>
                </p>
                <p class="ant-upload-text">上传文件</p>
                <p class="ant-upload-hint">点击打开文件框/拖拽文件进入</p>
            </a-upload-dragger>
        </a-card>
    </div>
</template>

<script>
    import api from "@/common/api";

    export default {
        name: "uploadImg",
        data() {
            return {
                filename: '',
            }
        },
        computed: {
            header: function () {
                return {'Authorization': 'Token ' + localStorage.getItem('token')}
            }
        },
        mounted() {
            if (localStorage.getItem("faceed") == "no")
                this.$message.error("请先认证！");
            localStorage.removeItem("faceed")
        },
        methods: {
            handleChange(info) {
                console.log(info)
                const status = info.file.status;
                this.filename = info.name;
                if (status !== 'uploading') {
                    console.log(info.file, info.fileList);
                }
                if (status === 'done') {
                    this.$message.success(`${info.file.name} file uploaded successfully.`);
                } else if (status === 'error') {

                    this.$message.error(`${info.file.name} file upload failed.`);
                }
            }
            ,
            getUploadUrl(info) {
                return api.uploadImage(info.name);
            }
        }
        ,
    }
</script>

<style scoped>
</style>
