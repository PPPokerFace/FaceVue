<template>
        <YoloWebCam></YoloWebCam>

</template>
<script>
    import YoloWebCam from './YoloWebCamXI'

    export default {
        name: "layouttest",
        data() {
            return {
                visible: false,
            }
        },
        components: {
            YoloWebCam,                                 // eslint-disable-line
        },
    }
</script>
