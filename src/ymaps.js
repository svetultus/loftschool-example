/* eslint-disable no-unused-vars */
var reviews = [];
var currentCoords;
var balloon;
var point;
var address;
var myMap;
var count = 0;
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
            '{% if !properties.review %}' +
                '<div class="mapReviewHeader">'+
                    '{{ address }} '+
                '</div>' +
                '<div class="mapReviewEmpty">Отзывов пока нет...</div>' +
            '{% else %}'+
                '<div class="mapReviewHeader">'+
                '{{ properties.balloonContentHeader|raw }}'+
                '</div>' +
            '{% endif %}'+
            '<div class="mapReviewItems">' +
                '<div class="mapReviewItem">' +
                    '<div>' +
                        '<span class="userName">{{ properties.review.userName|raw }}</span>' +
                        '<span class="orgName">{{ properties.review.orgName|raw }}</span>' +
                        '<span class="time">{{ properties.review.time|raw }}</span>' +
                    '</div>' +
                    '<div>' +
                        '{{ properties.review.reviewText|raw }}' +
                    '</div>' +
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
            '<div class="mapReviewClusterItem">' +
                '<div class="orgName">' +
                    '{{ properties.review.orgName|raw }}' +
                '</div>' +
                '<div class="address">' +
                    '<a href="#" class="linkAddress">' +
                        '{{ properties.review.address|raw }}' +
                    '</a>' +
                '</div>' +
                '<div class="reviewText">' +
                    '{{ properties.review.reviewText|raw }}' +
                '</div>' +
                '<div class="time">' +
                    '{{ properties.review.time|raw }}' +
                '</div>' +
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

                let reviewItems = document.querySelector('.mapReviewItems');
                let reviewItem = document.querySelector('.mapReviewItems .mapReviewItem');
                let reviewItemsEmpty = document.querySelector('.mapReviewEmpty');
                let date = (new Date()).toLocaleDateString("ru", dateOptions);

                let review = {
                    userName: this.userName.value,
                    orgName: this.orgName.value,
                    time: date,
                    reviewText: this.reviewText.value,
                    address: address,
                    coords: currentCoords
                };
                
                // Object.defineProperty(review, "coords", {enumerable: false});
                // Object.defineProperty(review, "address", {enumerable: false});

                reviewItems.insertBefore(makeHtmlReview(review), reviewItem);
                if (reviewItemsEmpty) {
                    document.querySelector(".mapReviewWrapper").removeChild(reviewItemsEmpty);
                }
                
                let Placemark = new ymaps.Placemark(currentCoords, {
                    balloonContentHeader: address,
                    review: review,
                }, {
                    balloonContentBodyLayout: customItemContentLayout,
                    balloonPanelMaxMapArea: 0,
                    hasBalloon: false,
                    preset: 'islands#violetIcon'
                });
                reviews[count++] = review;
                saveInStorage(review);

                this.userName.value = '';
                this.orgName.value = '';
                this.reviewText.value = '';

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

    initData();

    myMap.geoObjects.add(clusterer);

    // так посмотрим куда мы кликнули 
    clusterer.events.add('click', function (e) {
        var object = e.get('target');
        currentCoords = e.get('coords');

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
        currentCoords = e.get('coords');

        createBaloon(currentCoords);
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
                address =  await res.geoObjects.get(0).properties.get('text');
                
                window.balloon = new ymaps.Balloon(myMap, {
                    contentLayout: customItemContentLayout
                });

                if (object) {
                    window.balloon.setData(object);
                    window.balloon.options.setParent(myMap.options);
                    window.balloon.open(coords);
                } else {
                    window.balloon.setData({
                        balloonContentHeader: address
                    });
                    window.balloon.options.setParent(myMap.options);
                    window.balloon.open(coords, {address});
                }
                
                
            });
    }

    function initData () {
        console.log(reviews);

        reviews = getFromStorage();

        console.log(reviews);

        reviews.forEach(element => {
            let review = {
                userName: element.userName,
                orgName: element.orgName,
                time: element.time,
                reviewText: element.reviewText,
                address: element.address,
                coords: element.coords
            };
            let Placemark = new ymaps.Placemark(element.coords, {
                balloonContentHeader: element.address,
                review: review,
            }, {
                balloonContentBodyLayout: customItemContentLayout,
                balloonPanelMaxMapArea: 0,
                hasBalloon: false,
                preset: 'islands#violetIcon'
            });
            window.clusterer.add(Placemark);
        });
    }
})

function makeHtmlReview (obj) {
    let wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'mapReviewItem');

    for (let key in obj) {
        if (!(key === 'coords' || key === 'address')) {
            let elem = document.createElement('span');
            elem.innerText = obj[key];
            elem.setAttribute('class', key);
            wrapper.appendChild(elem);
        }  
    }
    return wrapper;
}

function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

function saveInStorage (newReview) {
    if (storageAvailable('localStorage')) {
        let storage = localStorage;

        let reviews = JSON.parse(storage.getItem('reviews'));

        if (reviews === null) {
            reviews = [];
        };
        reviews.push(newReview);
        
        storage['reviews'] = JSON.stringify(reviews);

    }
}

function getFromStorage () {
    if (storageAvailable('localStorage')) {
        let storage = localStorage;
        let reviews = JSON.parse(storage.getItem('reviews'));

        if (reviews === null) {
            reviews = [];
        };

        return reviews;
    }
}


