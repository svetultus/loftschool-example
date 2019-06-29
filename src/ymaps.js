/* eslint-disable no-unused-vars */
var reviews = {};
var currentCoords;
var balloon;
var point;
var myMap;
var dateOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };

ymaps.ready(function () {
    myMap = new ymaps.Map('map', {
        center: [55.751574, 37.573856],
        zoom: 10,
        controls: []
    });

    var customItemContentLayoutHTML = 
        '<div class="mapReviewWrapper">' +
            '<div class="mapReviewItems">' +
                '<div class="mapReviewItem">' +
                    '<div class="mapReviewHeader">'+
                        '{{ properties.balloonContentHeader|raw }}'+
                    '</div>' +
                    '<div>' +
                        '<span class="userName">{{ properties.reviewUserName|raw }}</span>' +
                        '<span class="orgName">{{ properties.reviewOrgName|raw }}</span>' +
                        '<span class="time">{{ properties.reviewTime|raw }}</span>' +
                    '</div>' +
                    '<div>' +
                        '{{ properties.reviewReviewText|raw }}' +
                    '</div>' +
                    // вот тут надо условно выводить, но не получается
                    '{{ if (!properties.reviewUserName) { <div class="mapReviewEmpty">Отзывов пока нет...</div> } }}' +
                    //'<div class="mapReviewEmpty">Отзывов пока нет...</div>' +
                '</div>' +
            '</div>' +    
            '<div id="mapReviewFormWrapper"  class="mapReview mapReview_formWrapper">'+
                '<div class="mapReviewH1">Ваш отзыв</div>'+
                '<form id="mapReviewForm" class="mapReviewForm">' +
                    '<div class="form-row">' +
                        '<input type="text" name="userName" placeholder="Ваше имя" />' +
                    '</div>' +
                    '<div class="form-row">' +
                        '<input type="text" name="orgName" placeholder="Укажите место"  />' +
                    '</div>' +
                    '<div class="form-row">' +
                        '<textarea name="reviewText" placeholder="Поделитесь впечатлениями" rows="5"></textarea>' +
                    '</div>' +
                    '<div class="form-row">' +
                        '<button type="submit" class="mapReviewFormSubmit">Добавить</button>' +
                    '</div>' +
                '</form>'+
            '</div>' +
        '</div>' ;
    var customClusterContentLayoutHTML = 
        '<div class="mapReview">'+
            '<div>' +
                '<div >' +
                    '{{ properties.reviewOrgName|raw }}' +
                '</div>' +
                '<div class="address">' +
                    '<a href="#" class="linkAddress">' +
                        '{{ properties.reviewAddress|raw }}' +
                    '</a>' +
                '</div>' +
                '<div>' +
                    '{{ properties.reviewReviewText|raw }}' +
                '</div>' +
                '<div>' +
                    '{{ properties.reviewTime|raw }}' +
                '</div>' +
                //'{{ properties.reviewAddress|raw }}' +
            '</div>' +
        '</div>';
    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        customItemContentLayoutHTML, {
            build:  function () {
                customItemContentLayout.superclass.build.call(this);
                let form = document.getElementById('mapReviewForm');

                form.onsubmit = this.onMapReviewFormSubmit;
            },

            clear: function () {
                let form = document.getElementById('mapReviewForm');

                form.onsubmit = null;
                customItemContentLayout.superclass.clear.call(this);
            },

            onMapReviewFormSubmit: async function (e) {
                e.preventDefault();

                let res = await ymaps.geocode(currentCoords)
                let address = await res.geoObjects.get(0).properties.get('text');
                let reviewItems = document.querySelector('.mapReviewItems');
                let reviewItem = document.querySelector('.mapReviewItems .mapReviewItem');
                let date = (new Date()).toLocaleDateString("ru", dateOptions);
                console.log(date);
                let review = {
                    userName: this.userName.value,
                    orgName: this.orgName.value,
                    time: date,
                    reviewText: this.reviewText.value,
                    address: address,
                    currentCoords: currentCoords
                };

                
                Object.defineProperty(review, "currentCoords", {enumerable: false});
                Object.defineProperty(review, "address", {enumerable: false});

                reviewItems.insertBefore(makeHtmlReview(review), reviewItem);
                
                let Placemark = new ymaps.Placemark(currentCoords, {
                    balloonContentHeader: address,
                    //balloonContentBody: makeBaloonLayoutReview(review),
                    //balloonContentFooter: review.time,
                    reviewUserName: review.userName,
                    reviewOrgName: review.orgName,
                    reviewReviewText: review.reviewText,
                    reviewAddress: review.address,
                    reviewTime: review.time,
                    reviewCoords: review.currentCoords
                }, {
                    balloonContentBodyLayout: customItemContentLayout,
                    balloonPanelMaxMapArea: 0,
                    hasBalloon: false
                });

                window.clusterer.add(Placemark);
            }
        }
    );

    var customClusterContentLayout = ymaps.templateLayoutFactory.createClass(
        customClusterContentLayoutHTML, {
            build: function () {
                customClusterContentLayout.superclass.build.call(this);

                let object =this._data.geoObject;
                let linkAddress = document.querySelector('.linkAddress');
                
                currentCoords = this._data.geoObject.geometry._coordinates;
                
                linkAddress.onclick = function(e)  {
                    e.preventDefault(); 
                    createBaloon(currentCoords, object);
                }
            },

            clear: function () {
                let linkAddress = document.querySelector('.linkAddress');

                linkAddress.onclick = null;
                customClusterContentLayout.superclass.clear.call(this);
            }
        }
    );
    
    window.clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customClusterContentLayout
    });

    myMap.geoObjects.add(clusterer);

    // так посмотрим куда мы кликнули 
    clusterer.events.add('click', function (e) {
        var object = e.get('target');
        let point = e.get('coords');

        currentCoords = point;

        if (!object.getGeoObjects) {
            createBaloon(object.geometry._coordinates, object);
        } else {
            if (window.balloon) {
                window.balloon.close();
            }
            clusterer.balloon.open(clusterer.getClusters()[0]);
        }

    });

    myMap.events.add('click', function (e) {
        let point = e.get('coords');
        currentCoords = point;

        createBaloon(point);
    });

    function createBaloon(coords, object) {
        if (window.balloon) {
            window.balloon.close();
        }
        if (clusterer.balloon) {
            clusterer.balloon.close();
        }
        ymaps.geocode(coords)
            .then(async function (res) {
                let address =  await res.geoObjects.get(0).properties.get('text');
                
                window.balloon = new ymaps.Balloon(myMap, {
                    contentLayout: customItemContentLayout
                });
                console.log(address);

                if (object) {
                    window.balloon.setData(object);
                } else {
                    window.balloon.setData({
                        balloonContentHeader: address
                    });
                }
                
                window.balloon.options.setParent(myMap.options);
                window.balloon.open(coords);
            });
    }
})

function makeHtmlReview (obj) {
    let wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'mapReviewItem');

    for (let key in obj) {
        let elem = document.createElement('span');
        elem.innerText = obj[key];
        elem.setAttribute('class', key);
        wrapper.appendChild(elem);
    }
    return wrapper;
}

// function makeBaloonLayoutReview (obj) { 
//     let text = '<div class="review">';

//     for (let key in obj) {
//         text += `<div class= "${key}">`;
//         text += obj[key];   
//         text += '</div>'
//     }
//     text += '</div>';

//     return text;
// }

