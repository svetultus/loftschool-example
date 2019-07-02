var BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="form">' +
            '<div class="header">'+ points +'</div>' + 
                '<div class="body">' + 
                
                '</div>' +
                '<p class="title">Ваш отзыв</p>' +
            '<form>' +
                '<div><input id="name" type="text" placeholder="Ваше имя"/></div>' +
                '<div><input id="point" type="text" placeholder="Укажите место" /></div>' +
                '<div>' +
                    '<textarea id="message" placeholder="Поделись впечатлениями">' +
                    ' </textarea></div>' +
                '<div class="button">' +
                '<button id="btn">Отправить</button>' +
                '</div>' +
            '</form>' +
        '</div>', {
        build: function () {
            BalloonContentLayout.superclass.build.call(this);
            var that = this;
            if (date.length > 0) {
                for (const key in date) {
                    if (date.hasOwnProperty(key)) {
                        const body = document.querySelector('.body');
                        const div = document.createElement('div');
                        div.innerHTML = date[key].message;
                        body.appendChild(div);
                    }
                }
            }
            document.getElementById('btn').addEventListener('click', function(e){
                e.preventDefault();
                const name = document.getElementById('name').value;
                const point = document.getElementById('point').value;
                const message = document.getElementById('message').value;
                const body = document.querySelector('.body');
                const div = document.createElement('div');
                div.innerHTML = <div id="review"><b>${name}</b> <span>${point}</span><span class="data">${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}.${d.getMinutes()}</span><p>${message}</p></div>;
                body.appendChild(div);
                that.onContent(name, point, message);
            })
        },

        clear: function () {
            // Выполняем действия в обратном порядке - сначала снимаем слушателя,
            // а потом вызываем метод clear родительского класса.
            BalloonContentLayout.superclass.clear.call(this);
        },

        onContent: function (name, point, message) {
            
            objMap[count++] = {coords:coords, name: name,date:d.toString(),message: <div id="review"><b>${name}</b> <span>${point}</span><span class="data">${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}.${d.getMinutes()}</span><p>${message}</p></div>};

            var Placemark = new ymaps.Placemark(coords, {
                balloonContentHeader: <b>${point}</b>,
                balloonContentBody: <div id="review"><a class="linckCoords" href="javascript:void(0);" data-coords="${coords}">${points}</a> <p>${message}</p></div>,
                balloonContentFooter: ${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}.${d.getMinutes()},
            },{
                balloonContentBodyLayout: BalloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hasBalloon: false
            });
            
            window.clusterer.add(Placemark);
 
            // clusterer.geoObjects.add(objMap.coords);
            // buildObj(objMap);
        }
    });