<template>
    <div>
        <p>江苏理工学院中心点坐标：31.7531303911,119.9144069741</p>
        <p>纬度:{{latitude}}</p>
        <p>经度:{{longitude}}</p>
        <p>{{message}}</p>
    </div>
</template>

<script>
    export default {
        name: "gps",
        data() {
            return {
                latitude: "--",
                longitude: "--",
                message: "--",
                id: -1
            }
        },
        mounted() {
            this.getLocation();
        },
        beforeDestroy() {
            navigator.geolocation.clearWatch(id);
        },
        methods: {
            getLocation() {
                if (navigator.geolocation) {
                    this.id = navigator.geolocation.watchPosition(this.showPosition, null, {
                        enableHighAccuracy: true,
                        //maximumAge: 2000
                    })
                } else {
                    this.message = "Not support GPS..."
                }
            },

            showPosition(position) {
                this.latitude = position.coords.latitude;       //纬度
                this.longitude = position.coords.longitude;      //经度
                const latitude_m = (Number(this.latitude) - 31.7531303911) / 0.00000899;
                const longitude_m = (Number(this.longitude) - 119.9144069741) / 0.00001141;
                const m = Math.sqrt(latitude_m * latitude_m + longitude_m * longitude_m)
                this.message = "您距离江苏理工学院图书馆大约还有 " + m + " 米"
            }
        }
    }
</script>

<style scoped>

</style>
