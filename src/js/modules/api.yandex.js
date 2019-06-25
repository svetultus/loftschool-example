export default class {
    initMap(settings){
        return new Promise((resolve, reject) => ymaps.ready(resolve))
            .then(()=>{
                this.map = new ymaps.Map('map', settings)
                this.cluster = new ymaps.Clusterer({
                    clusterDisableClickZoom: true,
                    clusterBalloonContentLayout: 'cluster#balloonCarousel'
                })
                return this.map
            })
    }
    async getMapPosition(e) {
        const coords = e.get('coords')
        const geocode = await ymaps.geocode(coords)
        const adress = geocode.geoObjects.get(0).properties.get('text')

        return {
            coords,
            adress
        }
    }
    async createBalloon(options, customCoords) {

        var BalloonLayout = await ymaps.templateLayoutFactory.createClass(
            '<din> {ddjdjdj}</div>'
        )
    }
}