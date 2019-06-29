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
        '<div>' +
            '{{ properties.balloonContentHeader|raw }}'+
            '<div>' +
                '{{ properties.reviewUserName|raw }}' +
                '{{ properties.reviewOrgName|raw }}' +
                '{{ properties.reviewTime|raw }}' +
            '</div>' +
            '<div>' +
                '{{ properties.reviewReviewText|raw }}' +
            '</div>' +
            //'{{ properties.reviewAddress|raw }}' +
            '<div class="balloonContentBodyEmpty">Отзывов пока нет...</div>' +
        '</div>' +
        '<div id="mapReviewFormWrapper"  class="mapReview">'+
            '<div class="balloonContentH1">Ваш отзыв</div>'+
            '<form id="mapReviewForm">' +
                '<div>' +
                    '<input type="text" name="userName" placeholder="Ваше имя" />' +
                '</div>' +
                '<div>' +
                    '<input type="text" name="orgName"placeholder="Укажите место"  />' +
                '</div>' +
                '<div>' +
                    '<textarea name="reviewText" placeholder="Поделитесь впечатлениями" rows="5"></textarea>' +
                '</div>' +
                '<div>' +
                    '<button type="submit" class="mapReviewFormSubmit">Добавить</button>' +
                '</div>' +
            '</form>'+
        '</div>';
    var customClusterContentLayoutHTML = 
        '<div class="mapReview">'+
            '<div>' +
                '<div>' +
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
                let form = document.querySelector('#mapReviewForm');
                let formWrapper = document.querySelector('#mapReviewFormWrapper');
                let date = new Date();
                date = date.toLocaleDateString("ru", dateOptions);
                let review = {
                    userName: this.userName.value,
                    orgName: this.orgName.value,
                    reviewText: this.reviewText.value,
                    address: address,
                    time: date,
                    currentCoords: currentCoords
                };
                Object.defineProperty(review, "currentCoords", {enumerable: false});
                Object.defineProperty(review, "time", {enumerable: false});

                formWrapper.insertBefore(makeHtmlReview(review), form);
                
                let Placemark = new ymaps.Placemark(currentCoords, {
                    balloonContentHeader: address,
                    balloonContentBody: makeBaloonLayoutReview(review),
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
                // let address = document.querySelector('.address');
                // let linkAddress = document.createElement('a');

                // linkAddress.setAttribute('href', '#');
                // linkAddress.setAttribute('class', 'linkAddress');
                // linkAddress.innerText = address.innerText;
                // address.innerText = '';
                // address.appendChild(linkAddress);
                
                currentCoords = this._data.geoObject.geometry._coordinates;
                
                let linkAddress = document.querySelector('.linkAddress');
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

        console.log(point);
        currentCoords = point;

        if (!object.getGeoObjects) {
            createBaloon(object.geometry._coordinates, object);
        } else {
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
    let docFrag = document.createDocumentFragment();

    for (let key in obj) {
        let elem = document.createElement('div');
        elem.innerText = obj[key];
        elem.setAttribute('class', key);
        docFrag.appendChild(elem);
    }
    return docFrag;
}

function makeBaloonLayoutReview (obj) {
    let text = '<div class="review">';

    for (let key in obj) {
        text += `<div class= "${key}">`;
        text += obj[key];   
        text += '</div>'
    }
    text += '</div>';

    return text;
}

