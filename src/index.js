ymaps.ready(init);

function init(){ 
    // Создание карты.    
    var myMap = new ymaps.Map("map", {
        // Координаты центра карты.
        // Порядок по умолчанию: «широта, долгота».
        // Чтобы не определять координаты центра карты вручную,
        // воспользуйтесь инструментом Определение координат.
        center: [59.96, 30.38],
        // Уровень масштабирования. Допустимые значения:
        // от 0 (весь мир) до 19.
        zoom: 7
    });

    var coords = [
        [59.96, 30.38],
        [59.97, 30.38],
        [59.98, 30.38]
    ];
    var myCollection = new ymaps.GeoObjectCollection({}, {
        preset: 'islands#redIcon', //все метки красные
        draggable: true // и их можно перемещать
    });
    
    for (var i = 0; i < coords.length; i++) {
        myCollection.add(new ymaps.Placemark(coords[i]));
    }
    
    myMap.geoObjects.add(myCollection);
    myMap.events.add('click', function (e) {
        // Получение координат щелчка
        var coords = e.get('coords');
        myCollection.add(new ymaps.Placemark(coords));
    });

    let storage = localStorage;
    //storage['yMaps'] = JSON.stringify(coords);
    
    // При клике на карту все метки будут удалены.
    myCollection.getMap().events.add('click', function(e) {
    });
}