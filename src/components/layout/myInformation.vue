<template>
    <a-card :title="'学生姓名：'+ my_info['name']">
        <a-card
                hoverable
                style="width: 240px"
        >
            <img
                    alt="example"
                    :src="'data:image/jpeg;base64,'+img_list[0]['img']"
                    slot="cover"
            />
            <a-card-meta
                    :title="'学院：'+my_info['college_info']['name']">
                <template slot="description">班级：{{my_info['class_info']['name']}}<br/>学号：{{my_info['stu_number']}}</template>
            </a-card-meta>
        </a-card>
    </a-card>
</template>

<script>
    import api from "../../common/api";

    export default {
        name: "myInformation",
        data() {
            return {
                my_info: {},
                img_list: [],
            }
        },
        mounted() {
            console.log(this.$store.state.username);
            api.getStudent(this.$store.state.username).then((response) => {
                this.my_info = response.data.results[0];
                console.log(this.my_info);
            });
            api.getMyImage().then(response => {
                this.img_list = response.data.results;
            });

        }
    }
</script>

<style scoped>

</style>
