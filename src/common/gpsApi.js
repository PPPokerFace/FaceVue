export function getLocation() {
    let latitude = 0;
    let longitude = 0;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude
        });
        return [true, latitude, longitude]
    } else {
        return [false, 0, 0];
    }
}

export function calcDistanceWithJSUT(latitude, longitude) {
    const JSTUlatitude = 31.7531303911;
    const JSTUlongitude = 119.9144069741
    const latitude_m = (Number(latitude) - JSTUlatitude) / 0.00000899;
    const longitude_m = (Number(longitude) - JSTUlongitude) / 0.00001141;
    const ret = Math.sqrt(latitude_m * latitude_m + longitude_m * longitude_m)
    return ret;
}

