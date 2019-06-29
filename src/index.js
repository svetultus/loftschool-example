
ymaps.ready(init);

function init(){ 
    // Создание карты.    
    var myMap = new ymaps.Map('map', {
        center: [59.96, 30.38],
        zoom: 10,
        controls: []
    }),
    objectManager = new ymaps.ObjectManager({
        clusterize: true,
        clusterDisableClickZoom: true
    });
    myMap.reviews = {};
    myMap.geoObjects.add(objectManager);

    objectManager.objects.events.add('balloonopen', function (e) {
        // Получим объект, на котором открылся балун.
        var id = e.get('objectId'),
            geoObject = objectManager.objects.getById(id);
        // Загрузим данные для объекта при необходимости.
        setBaloonContent([geoObject], id);
    });

    function setBaloonContent (geoObjects, id, isCluster) {
        geoObjects.forEach(function (geoObject) {
            // Содержимое балуна берем из данных, полученных от сервера.
            // Сервер возвращает массив объектов вида:
            // [ {"balloonContent": "Содержимое балуна"}, ...]
            //geoObject.properties.balloonContent = data[geoObject.id].balloonContent;
            geoObject.properties.balloonContent = 'sdsdfsdf';
        });
        // Оповещаем балун, что нужно применить новые данные.
        setNewData();
    }

    var coords = [
        [59.96, 30.38],
        [59.97, 30.38],
        [59.98, 30.38]
    ];

    var currentCoords;

    var BaloonLayoutClass = ymaps.templateLayoutFactory.createClass(
        '<form id="mapReviewForm">'+
        '<input type="text" name="userName" />'+
        '<input type="text" name="orgName" />'+
        '<textarea name="reviewText" rows="5"></textarea>'+
        '<button type="submit" class="mapReviewFormSubmit">Отправить</button>'+
        '</form>', {
            build: function () {
                BaloonLayoutClass.superclass.build.call(this);
                let form = document.getElementById('mapReviewForm');
                form.onsubmit = this.onMapReviewFormSubmit;
            },

            clear: function () {
                let form = document.getElementById('mapReviewForm');
                form.onsubmit = null;
                BaloonLayoutClass.superclass.clear.call(this);
            },

            onMapReviewFormSubmit: function (e) {
                e.preventDefault();

                let that = this;
                let [userName, orgName , reviewText] = [this.userName.value, this.orgName.value, this.reviewText.value];
                console.log(userName);
                console.log(orgName);
                console.log(reviewText);
                console.log(currentCoords);
                //myCollection.add(new ymaps.Placemark(currentCoords));
                myMap.geoObjects.add(new ymaps.Placemark(currentCoords), {
                    userName: userName,
                    orgName: orgName,
                    reviewText: reviewText || 'нет отзывов'
                },{
                    contentLayout: BaloonLayoutClass,
                    balloonPanelMaxMapArea: 0
                });
                myMap.balloon.close();

                return false;
            }
        }
    );

    var myCollection = new ymaps.GeoObjectCollection({}, {
        preset: 'islands#redIcon', //все метки красные
        draggable: true // и их можно перемещать
    });
    
    for (var i = 0; i < coords.length; i++) {
        myCollection.add(new ymaps.Placemark(coords[i]));
    }
    
    myMap.geoObjects.add(myCollection);
    myMap.events.add('click', function (e) {
        let that = this;
        // Получение координат щелчка 
        currentCoords = e.get('coords');
        // myMap.balloon.close();
        // myMap.balloon.open(currentCoords, "Содержимое балуна", {
        //     contentLayout: BaloonLayoutClass
        // });
    });

    let storage = localStorage;
    //storage['yMaps'] = JSON.stringify(coords);
    
    // При клике на карту все метки будут удалены.
    myCollection.getMap().events.add('click', function(e) {
    });
}