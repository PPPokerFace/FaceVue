<template>
    <a-card title="你的图片">
        <a-card-grid v-for="img in img_list" :style="{width:card_width,textAlign:'center',maxHeight:'300px'}">
            <div>
                <img :src="'data:image/jpeg;base64,'+img['img']" style="max-width: 100%;" >
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
        }
    }
</script>

<style scoped>

</style>
