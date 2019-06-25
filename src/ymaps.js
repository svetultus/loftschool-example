var reviews = {};
var currentCoords;
var balloon;
var point;
var myMap, objectManager;

ymaps.ready(function () {
    myMap = new ymaps.Map('map', {
        center: [55.751574, 37.573856],
        zoom: 10,
        controls: []
    });
    objectManager = new ymaps.ObjectManager({
        clusterize: true,
        clusterDisableClickZoom: true
    });
    myMap.geoObjects.add(objectManager);

    var BaloonLayoutClass = ymaps.templateLayoutFactory.createClass(
        '11'+
        ' 22 {{ properties.orgName }} 44 {{ properties.reviewText }} <form id="mapReviewForm">'+
        '<form id="mapReviewForm">33'+
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

                let [userName, orgName , reviewText] = [this.userName.value, this.orgName.value, this.reviewText.value];
                console.log(userName);
                console.log(orgName);
                console.log(reviewText);
                console.log(currentCoords);

                myMap.geoObjects.add(new ymaps.Placemark(currentCoords), {
                    userName: userName,
                    orgName: orgName,
                    reviewText: reviewText || 'нет отзывов'
                },{
                    contentLayout: BaloonLayoutClass,
                    balloonPanelMaxMapArea: 0
                });
                // myMap.balloon.close();

                // return false;
            }
        }
    );

    myMap.events.add('click', async function (e) {
        point = await getMapPosition(e);
        currentCoords = point.coords;
        console.log(currentCoords);
        showBaloon (e);
        // myMap.balloon.close();
        // myMap.balloon.setOptions({contentLayout: BaloonLayoutClass});
        // myMap.balloon.open(currentCoords, "Содержимое балуна", {
            //contentLayout: BaloonLayoutClass
        //});
    });
    

    objectManager.objects.events.add('balloonopen', async function (e) {
        console.log(e);
        // Получим объект, на котором открылся балун.
        var id = e.get('objectId'),
            geoObject = objectManager.objects.getById(id);
            currentCoords = geoObject.geometry.coordinates;
        // Загрузим данные для объекта при необходимости.
        await downloadContent([geoObject], id);

        document.getElementById('mapReviewForm').addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('form submit2'); 
            onMapReviewFormSubmit(e);
        });
    });

    objectManager.clusters.events.add('balloonopen', async function (e) {
        // Получим id кластера, на котором открылся балун.
        var id = e.get('objectId'),
        // Получим геообъекты внутри кластера.
            cluster = objectManager.clusters.getById(id),
            geoObjects = cluster.properties.geoObjects;

            currentCoords = cluster.geometry.coordinates;
        // Загрузим данные для объектов при необходимости.
        await downloadContent(geoObjects, id, true);
        document.getElementById('mapReviewForm').addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('form submit3'); 
            onMapReviewFormSubmit(e);
        });
    });

    function downloadContent(geoObjects, id, isCluster) {
        // Формируем массив идентификаторов
        var ids = geoObjects.map(function (geoObject) {
                    return geoObject.id;
                });
        if (ids.length) {
            //objectManager.objects.balloon.contentLayout = BaloonLayoutClass;
            // geoObjects.forEach(function (geoObject) {
            //     geoObject.properties.balloonContent = 
            //     '<form id="mapReviewForm">'+
            //     '<input type="text" name="userName" />'+
            //     '<input type="text" name="orgName" />'+
            //     '<textarea name="reviewText" rows="5"></textarea>'+
            //     '<button type="submit" class="mapReviewFormSubmit">Отправить</button>'+
            //     '</form>';
                
            // });
            // Оповещаем балун, что нужно применить новые данные.
            setNewData();
        }

        function setNewData(){
            if (isCluster && objectManager.clusters.balloon.isOpen(id)) {
                objectManager.clusters.balloon.setData(objectManager.clusters.balloon.getData());
            } else if (objectManager.objects.balloon.isOpen(id)) {
                objectManager.objects.balloon.setData(objectManager.objects.balloon.getData());
            }
        }
    }

    function onMapReviewFormSubmit (e) {
        e.preventDefault();
        let obj = e.target;
        let [userName, orgName , reviewText] = [obj.userName.value, obj.orgName.value, obj.reviewText.value];

        console.log(userName);
        console.log(orgName);
        console.log(reviewText);
        console.log(currentCoords);
        myMap.geoObjects.add(new ymaps.Placemark(currentCoords), {
            userName: userName,
            orgName: orgName,
            reviewText: reviewText || 'нет отзывов',
        },{
            //balloonContentBody: reviewText,
            contentLayout: BaloonLayoutClass,
            balloonPanelMaxMapArea: 0
        });
        //myMap.balloon.close();

        return false;
    }

    $.ajax({
        url: "data.json"
    }).done(function (data) {
        objectManager.add(data);
    });
});

async function createBalloon(data, myMap) {

    var BaloonLayoutClass = ymaps.templateLayoutFactory.createClass(
        '11'+
        data.userName +
        ' 22 {{ properties.orgName }} 44 {{ properties.reviewText }} <form id="mapReviewForm">'+
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
                let [userName, orgName , reviewText] = [this.userName.value, this.orgName.value, this.reviewText.value];
                console.log(userName);
                console.log(orgName);
                console.log(reviewText);
                myMap.geoObjects.add(new ymaps.Placemark(data.coords), {
                    userName: userName,
                    orgName: orgName,
                    reviewText: reviewText || 'нет отзывов'
                },{
                    contentLayout: BaloonLayoutClass,
                    // Запретим замену обычного балуна на балун-панель.
                    // Если не указывать эту опцию, на картах маленького размера откроется балун-панель.
                    balloonPanelMaxMapArea: 0
                });
                
                if (!data.reviews) {
                    reviews[data.coords] = []
                    
                };
                reviews[data.coords].push({
                    userName: userName,
                    orgName: orgName,
                    reviewText: reviewText
                });

                return false;
            }
        }
    );
    console.log(data.coords);
    
    balloon = myMap.balloon.open(data.coords, {
        reviewText: data.reviews || 'нет отзывов'
        }, {
        autoPan: false,
        contentLayout: BaloonLayoutClass,
        balloonPanelMaxMapArea: 0
    });
}

function showBaloon (e) {
    let data = {};
    data.coords = point.coords;
    if (reviews[data.coords]) {
        data.reviews = reviews[data.currentCoords];
    } 

    data.address = point.address;
    balloon = createBalloon(data, myMap);
}
async function getMapPosition (e) {
    const coords = e.get('coords');
    const geocode = await ymaps.geocode(coords);
    const address = geocode.geoObjects.get(0).properties.get('text')

    return {
        coords,
        address
    }
}