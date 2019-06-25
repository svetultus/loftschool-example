const Map = require('../modules/api.yandex')
var coords = [
    [59.96, 30.38],
    [59.97, 30.38],
    [59.98, 30.38]
];

let storage = localStorage;

export default class {
    constructor(){
        this.myApiMap = new Map()

        this.init()
    }
    async init(){
        this.yandexApi = await this.myApiMap.initMap({
            center: [59.96, 30.38],
            zoom: 7,
            controls: []
        })

        this.myCollection = new this.myApiMap.GeoObjectCollection({}, {
            preset: 'islands#redIcon', //все метки красные
            draggable: true // и их можно перемещать 
        });

        for (var i = 0; i < coords.length; i++) {
            this.myCollection.add(new this.myApiMap.Placemark(coords[i]));
        } 

        this.yandexApi.events.add('click', async e => {
            this.point = await this.myApiMap.getMapPosition(e)
            console.log(this.point);
        })

        this.Balloon = await this.myApiMap.createBalloon(this.position);
    }
}