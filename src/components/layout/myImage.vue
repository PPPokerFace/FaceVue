<template>
    <a-card title="你的图片">
        <a-card-grid v-for="(img,index) in img_list" :style="{width:card_width,textAlign:'center',maxHeight:'300px'}" @click="handleClick(img['name'],index)">
            <div>
                <img :src="'data:image/jpeg;base64,'+img['img']"  style="max-width: 100%;" >
            </div>
        </a-card-grid>
    </a-card>
</template>

<script>
    import api from "../../common/api";

    export default {
        name: "myImage",
        data() {
            return {
                img_list: [],
                card_width: '25%',
            }
        },
        mounted() {
            if (document.body.clientWidth < document.body.clientHeight) {
                this.card_width = '100%';
            }
            api.getMyImage().then(response => {
                this.img_list = response.data.results;
            })
        },
        methods:{
            handleClick(name,index){
                const that=this;
                this.$confirm({
                    title: '你要删除这张照片吗?',
                    onOk() {
                        api.deleteMyImage(name).then(response=>{
                            that.img_list.splice(index,1);

                    })},
                    onCancel() {},
                });
            }
        }
    }
</script>

<style scoped>

</style>
