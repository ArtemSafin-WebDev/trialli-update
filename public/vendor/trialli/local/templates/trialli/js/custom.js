function filterSectionPage() {
    $(document).on('click', '.js-section-filter-list span', function () {
        var typeId = $(this).data('id');
        if (!$(this).hasClass('active')) {

            if (typeId != '') {
                location.href = window.location.href = location.origin + window.location.pathname + '?cat=' + typeId;
            } else {
                location.href = window.location.href = location.origin + window.location.pathname;
            }


        }
    })
}




function copyToClipboardLink(element) {
    var $temp = $("<input>");
    $("body").append($temp);

    textLink = window.location.href;
    $temp.val(textLink).select();
    document.execCommand("copy");
    $temp.remove();
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).attr('data-code')).select();
    document.execCommand("copy");
    $temp.remove();
}
var loadingStoris = false;

function getAjaxStories(loadStorDiv) {
    // var scrollPos = $(document).scrollTop();
    // if(scrollPos + allBody > offSetStor){ }
    if(!loadingStoris){
        loadingStoris = true;
        $.ajax({
            url: '/ajax/stories.php', // URL отправки запроса
            type: "GET",
            dataType: "html",
            data: {},
            success: function (response) { // Если Данные отправлены успешно
                loadStorDiv.html(response);
                initMainStories();
            },
            error: function (jqXHR, textStatus, errorThrown) { // Если ошибка, то выкладываем печаль в консоль
                console.log('Error: ' + errorThrown);
            }
        });
    }
}

function modalForms() {
    $(document).on("click", ".js-popup-open", function (e) {
        e.preventDefault();
        var $button = $(e.currentTarget);
        var src = $button.attr("href");
        var type = $button.data("type") || "inline";
        var removalDelay = $button.data("effect") ? 500 : 0;
        var effect = $button.data("effect") || "";
        $.magnificPopup.open({
            items: {
                src: src,
                type: type,
                closeBtnInside: true
            },
            mainClass: effect,
            removalDelay: removalDelay
        });
    });
    $(document).on("click", ".js-popup-close", function (e) {
        e.preventDefault();
        $.magnificPopup.close();
    });
    $(".js-open-video").magnificPopup({
        type: "iframe",
        closeBtnInside: false
    });
}
function initGlobal() {
    modalForms();

    $('.l-news-item__tools-mob .tools-mob-copy').tooltip({
        title: 'Ссылка скопирована',
        trigger: 'click',
        placement: 'top',
        delay: {show: 300, hide: 1000}
    })
    $('.icon-copy-code').tooltip({
        title: 'Код товара успешно скопирован.',
        trigger: 'click',
        placement: 'top',
        delay: {show: 300, hide: 1000}
    });

    if($(document).width() < 640){
        $('.icon-copy-oem').tooltip({
            title: 'Скопировано',
            trigger: 'click',
            placement: 'top',
            delay: {show: 300, hide: 1000}
        });
    } else {
        $('.icon-copy-oem').tooltip({
            title: 'OEM номер успешно скопирован.',
            trigger: 'click',
            placement: 'top',
            delay: {show: 300, hide: 1000}
        });
    }

    $(document).on('click', '.icon-link-news', function (e) {
        e.preventDefault();
        copyToClipboardLink($(this));
        return false;
    });
    $(document).on('click', '.icon-copy-code', function (e) {
        e.preventDefault();
        copyToClipboard($(this));
        $(this).addClass('copied');
        setTimeout(()=>{$(this).removeClass('copied')},1500)
        return false;
    });
    $(document).on('click', '.icon-copy-oem', function (e) {
        e.preventDefault();
        copyToClipboard($(this));
        return false;
    });


    var loadStorDiv = $('.ajax-load-stories');

    $(document).on('click', '.tab-main-link-item:not(.weeknews)', function () {
        let tabIndex = $(this).attr('data-id');

        if($(this).hasClass('has-link')){
            let linkIndex = $(this).attr('data-url');
            window.location.href = linkIndex;
        } else {
            $('.tab-main-content-item').removeClass('active');
            $('.tab-main-link-item').removeClass('active');
            $(this).addClass('active');
            $('.tab-main-content-item[data-tab='+tabIndex+']').addClass('active');

            if(tabIndex == 'media' && !loadingStoris){
                getAjaxStories(loadStorDiv);
            }
        }
    })
    $(document).on('click', '.js-count-page span', function () {
        var perPage = $(this).text();
        if(!$(this).hasClass('active')){
            window.location.href = location.origin+window.location.pathname + "?per_page="+perPage;
        }
    })

    filterSectionPage();

    if ($('.about-history-slider').length > 0) {
        $(".about-history-slider").slick({
            // lazyLoad: 'ondemand', // ondemand progressive anticipated
            infinite: false,
            dots: true,
            arrows: true,
            slidesToShow: 3,
            slidesToScroll: 1,
            adaptiveHeight: true,
            centerMode: false,
            focusOnSelect: true,
            draggable: true,
            swipeToSlide: true,
            // dotsClass: 'my-dots',
            // prevArrow: $('.about-slider-arrow .about-slider-arrow-prev'),
            // nextArrow: $('.about-slider-arrow .about-slider-arrow-next'),
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                        // infinite: true,
                        dots: true
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: false,
                        arrows: false,
                        centerMode: false,
                        infinite: true,
                        //variableWidth: true
                        //centerPadding: '40px',
                    }
                }
            ],
            autoplay: true,
            autoplaySpeed: 555000,
        });
    }
    if ($('.about-product-slider').length > 0) {
        $(".about-product-slider").slick({
            // lazyLoad: 'ondemand', // ondemand progressive anticipated
            infinite: true,
            dots: false,
            arrows: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            // dotsClass: 'my-dots',
            prevArrow: $('.about-slider-arrow .about-slider-arrow-prev'),
            nextArrow: $('.about-slider-arrow .about-slider-arrow-next'),
            responsive: [
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        infinite: true,
                        dots: false
                    }
                },
                {
                    breakpoint: 600,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        dots: false,
                        arrows: false,
                        centerMode: false,
                        infinite: true,
                        //variableWidth: true
                        //centerPadding: '40px',
                    }
                }
            ],
            autoplay: true,
            autoplaySpeed: 5000,
        });
    }


    if (window.location.hash == '#form') {
        $('.js-contacts-toggle-form').click();
    }


    /* слайдер фоток */
    function setImgSlider(kol, imgList, elm) {
        elm.find('picture img').attr('src', imgList[kol]);
        elm.find('source').attr('srcset', imgList[kol]);
        startLineMouse = 0;
        IntervalLineMouse = 0;
        elm.find('.slider-points .slider-point').removeClass('active');
        elm.find('.slider-points .slider-point:nth-child(' + (kol + 1) + ')').addClass('active');
    }

    var startLineMouse = 0;
    var IntervalLineMouse = 0;
    var currentImgMouse = 0;
    $(document).on('click', '.js-img-slider-prew .slider-point', function (e) {
        e.preventDefault();
        var currentPoint = $(this).index();
        if (currentPoint != currentImgMouse) {
            currentImgMouse = currentPoint;
            var mainBlock = $(this).parents('.js-img-slider-prew');
            var idImg = mainBlock.attr('data-id');
            var MasImg = window[`${idImg}`];
            setImgSlider(currentImgMouse, MasImg, mainBlock);
        }
    })
    // $(document).on('mouseout', '.js-img-slider-prew', function (e) {
    //     var idImg = $(this).attr('data-id');
    //     var MasImg = window[`${idImg}`];
    //
    //     setImgSlider(0, MasImg, $(this));
    //     currentImgMouse = 0;
    // })
    $(document).on('mousemove', '.js-img-slider-prew', function (pos) {

        var $target = $(pos.target);

        if ($target.is(".slider-points") ||$target.is(".slider-point") || $target.is(".slider-point img")) {
            // return true;
        }
        var idImg = $(this).attr('data-id');
        var MasImg = window[`${idImg}`];
        if ($target.is(".slider-point") || $target.is(".slider-point img")) {
            var point = $target;
            if($target.is(".slider-point img")){
                point = $target.parent();
            }
            var newSect = point.parent().find('.slider-point').index(point);
        }
        else {

            var allCount = MasImg.length;

            var width = $(this).width();
            var sectWidth = width / allCount;

            var newSect = (Math.ceil(pos.offsetX / sectWidth)) - 1;
        }

        if (currentImgMouse != newSect) {
            currentImgMouse = newSect;
            setImgSlider(currentImgMouse, MasImg, $(this))
        }

        // if(startLineMouse == 0){
        //     startLineMouse = pos.offsetX;
        // }
        // IntervalLineMouse = pos.offsetX - startLineMouse;
        // var CheckInterVal = IntervalLineMouse;
        // // var CheckInterVal = Math.abs(IntervalLineMouse);
        // if(CheckInterVal > 40 || CheckInterVal < -40) {
        //     if(CheckInterVal > 40){
        //         currentImgMouse++;
        //     }
        //     if(CheckInterVal < -40 && currentImgMouse != 0){
        //         currentImgMouse--;
        //     }
        //     if((currentImgMouse+1) > allCount){
        //         currentImgMouse = allCount-1;
        //     }
        //     setImgSlider(currentImgMouse, MasImg, $(this))
        // }
    });
    // свайпы на мобиле
    var xDown = null;
    var yDown = null;
    var swipe_id = 1;
    $(document).on('touchstart', '.js-img-slider-prew', function (evt) {
        xDown = evt.touches[0].clientX;
        yDown = evt.touches[0].clientY;
    });
    $(document).on('touchmove', '.js-img-slider-prew', function (evt) {
        if (!xDown || !yDown) {
            return;
        }
        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;

        var xDiff = xDown - xUp;
        var yDiff = yDown - yUp;

        var swipe_yes = 0;
        // Меняем изображение
        currentImgMouse = $(this).find('.slider-points .slider-point.active').index();
        var maxImgMouse = $(this).find('.slider-points .slider-point').length;

        if ((Math.abs(xDiff) > Math.abs(yDiff))) {/*most significant*/
            if (xDiff > 0) {
                currentImgMouse = currentImgMouse + 1;
                if (maxImgMouse == currentImgMouse) {
                    currentImgMouse = 0;
                }
            } else {
                currentImgMouse = currentImgMouse - 1;
                if (currentImgMouse == -1) {
                    currentImgMouse = maxImgMouse - 1;
                }
            }
        }

        var idImg = $(this).attr('data-id');
        var MasImg = window[`${idImg}`];
        setImgSlider(currentImgMouse, MasImg, $(this));

        /* reset values */
        xDown = null;
        yDown = null;
    });
    /* слайдер фоток */




    $(document).on('click', '.js-find-top', function (e) {
        var mainSearchBlock = $('.main-search-panel__dropdown');
        if (mainSearchBlock.length > 0) {
            $(this).parents('.header__center').toggleClass('active');
        } else {
            if ($('.l-index__main__center .form-search').length > 0) {

                $('html, body').animate({
                    scrollTop: $('.l-index__main__center .form-search').offset().top // класс объекта к которому приезжаем
                }, 500); // Скорость прокрутки
            }
        }

        return false;
    })


    $(document).on('click', 'a .slider-preview__tape', function (e) {
        return false;
    })

    $(document).on('click', '.event-select-sect', function (e) {
        e.preventDefault();
        var idSect = $(this).attr('data-id');
        var linkData = $(this).attr('data-href');

        if ($('.l-catalog__main__right').is(':hidden') && typeof linkData !== "undefined") {
            window.location.href = linkData;
            return false;
        }

        $('.custom-layer-catalog').removeClass('active');
        $('.custom-layer-catalog[data-id="' + idSect + '"]').addClass('active');

        $('.event-select-sect').removeClass('active');
        $(this).addClass('active');

        $('html, body').animate({
            scrollTop: $('body').offset().top // класс объекта к которому приезжаем
        }, 1000); // Скорость прокрутки

        return false;
    });

    $(document).on('shown.bs.tooltip', function (e) {
        setTimeout(function () {
            $(e.target).tooltip('hide');
        }, 1000);
    });
    $(document).on('click', '.js-show-prop-filter', function (event) {
        event.preventDefault();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active').text('Показать все');
            $(this).parents('.panel-filter__checks').removeClass('show_all');
        } else {
            $(this).addClass('active').text('Скрыть');
            $(this).parents('.panel-filter__checks').addClass('show_all');
        }
    })


}


function initMainStories() {
    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            enumerableOnly && (symbols = symbols.filter(function (sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            })), keys.push.apply(keys, symbols);
        }
        return keys;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = null != arguments[i] ? arguments[i] : {};
            i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
                _defineProperty(target, key, source[key]);
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
        return target;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {value: value, enumerable: true, configurable: true, writable: true});
        } else {
            obj[key] = value;
        }
        return obj;
    }

    var zIndex = 100;
    var $popup = null;
    var slider = null;
    var lastVideo = null;
    var muted = false;

    function closePopup() {
        stopLastVideo();
        $popup.removeClass("active");
    }

    function stopLastVideo() {
        if (lastVideo) lastVideo.pause();
    }

    function playVideoByIndex(index) {
        var video = $popup.find(".swiper-slide").eq(index).find("video")[0];
        video.play();
        lastVideo = video;
    }

    function handleItemClick(e) {
        e.preventDefault();
        var index = $(this).data("index");
        slider.slideTo(index, 0);
        $popup.addClass("active");
        playVideoByIndex(index);
    }

    function handleCloseBtn() {
        closePopup();
    }

    function handleInBodyEnter() {
        var offset = $(this).offset();
        var $clone = $(this).clone();
        $clone.appendTo($("body")).css(_objectSpread(_objectSpread({
            position: "absolute",
            width: $(this).width(),
            height: $(this).height()
        }, offset), {}, {
            zIndex: ++zIndex
        }));
        var video = $clone.find("video")[0];
        video.play();
    }

    function handleInBodyLeave() {
        var _this = this;

        setTimeout(function () {
            $(_this).remove();
        }, 200);
    }

    function handleMuteClick() {
        muted = !muted;
        $(this).toggleClass("active");
        $popup.find("video").each(function () {
            $(this)[0].muted = muted;
        });
    }

    function handleEscapeKey(e) {
        if (e.key == "Escape") {
            closePopup();
        }
    }

    function handleInPlaceEnter() {
        var video = $(this).find("video")[0];
        video.play();
    }

    function handleInPlaceLeave() {
        var video = $(this).find("video")[0];
        video.pause();
    }


    $(function () {
        $popup = $("#popup-stories");
        if ($popup.length === 0) return;
        slider = new Swiper($popup.find(".swiper")[0], {
            direction: "vertical",
            mousewheelControl: true,
            navigation: {
                nextEl: $popup.find(".popup-stories__btn-next")[0],
                prevEl: $popup.find(".popup-stories__btn-prev")[0]
            }
        });
        slider.on("slideChange", function () {
            stopLastVideo();
            playVideoByIndex(slider.activeIndex);
        });
        $(document).on("click", ".popup-stories__overlay, .popup-stories__btn-close", handleCloseBtn);
        $(document).on("click", ".slider-stories__image", handleItemClick);

        if (!Modernizr.touchevents) {
            $(document).on("mouseenter", "div > .slider-stories__image--in-body", handleInBodyEnter);
            $(document).on("mouseleave", "body > .slider-stories__image--in-body", handleInBodyLeave);
        }

        $(document).on("mouseenter", ".slider-stories__image--in-place", handleInPlaceEnter);
        $(document).on("mouseleave", ".slider-stories__image--in-place", handleInPlaceLeave);
        $(document).on("click", ".popup-stories__btn-mute", handleMuteClick);
        $(document).on("keyup", handleEscapeKey);
    });

    var popup_stories = ({
        removeBodyItems: function removeBodyItems() {
            $("body > .slider-stories__image").remove();
        }
    });

    $(function () {
        $(".slider-stories").each(function () {
            var sliderEl = $(this).find(".slider-stories__slider")[0];
            new Swiper(sliderEl, {
                slidesPerView: "auto",
                navigation: {
                    nextEl: $(this).find(".arrows__btn-next")[0],
                    prevEl: $(this).find(".arrows__btn-prev")[0]
                },
                on: {
                    transitionStart: function transitionStart() {
                        popup_stories.removeBodyItems();
                    }
                }
            });
        });
    });
}

/* Избранное */
$(document).ready(function () {
    initGlobal();
    setActiveFav();


});

function openFindPanel(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

$(document).on('click', '.favorites__close', function () {
    var favorID = $(this).parent().find('a.favor').attr('data-item');
    if ($(this).hasClass('active'))
        var doAction = 'delete';
    else
        var doAction = 'add';

    addFavorite(favorID, doAction);

    delFavList($(this));
});

// Функция удаления товара со страницы Избранного
function delFavList(elementDel) {
    elementDel.closest('.favorites__item').fadeOut(200, 'swing', function () {
        $(this).remove();
    });
}

$(document).on('click', '.js-add-favor', function (e) {
    e.preventDefault();
    var favorID = $(this).attr('data-id');
    if ($(this).hasClass('active')) {
        var doAction = 'delete';
        $(this).removeClass('active');
    } else {
        $(this).addClass('active');
        var doAction = 'add';
    }
    addFavorite(favorID, doAction, $(this));
    // if ($(this).parents('.catalog__item').find('.favorites__close')) {
    //     delFavList($(this).parents('.catalog__item').find('.favorites__close'));
    // }
    return false;
});

function addFavorite(id, action, elementCur) {
    // var count = $('.js-set-all-fav span');
    // var text = $('.favor-panel .header__link_text');
    // var nowKol = count.text();

    var nowKol = 1;
    var param = 'id=' + id + "&action=" + action + "&now_kol=" + nowKol;
    $.ajax({
        url: '/ajax/favorites.php', // URL отправки запроса
        type: "GET",
        dataType: "html",
        data: param,
        success: function (response) { // Если Данные отправлены успешно
            var result = $.parseJSON(response);
            if (result.action == 1) {

                // if($(document).width() < 640){
                //     elementCur.tooltip({
                //         title : 'Товар добавлен в избранное',
                //         trigger: 'manual',
                //         placement: 'left',
                //         delay: { show: 300, hide: 1000 }
                //     }).tooltip('show');
                // } else {}
                elementCur.tooltip({
                    title: 'Товар добавлен в избранное',
                    trigger: 'manual',
                    placement: 'top',
                    delay: {show: 300, hide: 1000}
                }).tooltip('show');


                $($('.js-add-favor[data-id="' + id + '"]')).each(function (indx, element) {
                    $(element).addClass('active');

                    // if($(document).width() < 640){
                    //     $(element).tooltip({
                    //         title : 'Товар добавлен в избранное',
                    //         trigger: 'manual',
                    //         placement: 'left',
                    //         delay: { show: 300, hide: 1000 }
                    //     }).tooltip('show');
                    // } else {
                    //     // $(element).tooltip({
                    //     //     title : 'Товар добавлен в избранное',
                    //     //     trigger: 'manual',
                    //     //     placement: 'top',
                    //     //     delay: { show: 300, hide: 1000 }
                    //     // }).tooltip('show');
                    // }

                })
                // var wishCount = parseInt(nowKol) + 1;
                // count.text(wishCount);

            }
            if (result.action == 2) {
                $($('.js-add-favor[data-id="' + id + '"]')).each(function (indx, element) {
                    $(element).removeClass('active');
                });
                // var wishCount = parseInt(nowKol) - 1;
                // count.text(wishCount);
            }
            // text.html(result.text);
        },
        error: function (jqXHR, textStatus, errorThrown) { // Если ошибка, то выкладываем печаль в консоль
            console.log('Error: ' + errorThrown);
        }
    });
}

// Выставляем статус активности
function setActiveFav() {
    if (typeof dataFavorites !== "undefined") {
        for (var i = 0; i < dataFavorites.length; i++) {
            if ($('.js-add-favor[data-id="' + dataFavorites[i] + '"]')) {
                $('.js-add-favor[data-id="' + dataFavorites[i] + '"]').addClass('active');
            }
        }
        // $('.js-set-all-fav span').text(dataFavorites.length);
    } else {
        // $('.js-set-all-fav span').text('0');
    }

}

/** Избранное */



document.addEventListener('DOMContentLoaded', function () {
    init_link_navigator();
});

function init_link_navigator() {

    var isMobileFlag = localStorage.getItem('isMobileFlag9');

    if (isMobileFlag === null) {
        isMobileFlag = isMobile();
        localStorage.setItem('isMobileFlag9', isMobileFlag)
    }
    $('a.js-link-navigator').each(function (index, element) {
        // var link = $(this).find('a');
        var link = $(this);
        var city = link.attr('data-city');

        switch (city) {
            case 'spb':
                if (isMobileFlag === true) {
                    link.attr('href', 'yandexnavi://build_route_on_map?lat_to=59.779173&lon_to=30.459661');
                } else {
                    link.attr('href', 'https://maps.yandex.ru/?rtext=~59.779173,30.459661&rtt=auto').attr('target', '_blank');
                }
                break;
            case 'msk':
                if (isMobileFlag === true) {
                    link.attr('href', 'yandexnavi://build_route_on_map?lat_to=55.329441&lon_to=37.813892');
                } else {
                    link.attr('href', 'https://maps.yandex.ru/?rtext=~55.329441,37.813892&rtt=auto').attr('target', '_blank');
                }
                break;
        }

    });

}

function isMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return true;
    }
    return false;
}

$(document).ready(function (){
    $('.auto_filter_select_container select[name="mark"]').change(function (){
        var mark = $(this).val();

        $.ajax({
            url: '/ajax/getModels.php',
            type: "POST",
            data: {mark:mark},
            success: function (response) {
                $('.model_filter select').html(response)
                if(response!='') {
                    $(".model_filter select").customSelect('reset');
                    $('.model_filter').addClass('shown_filter')
                }
                else{
                    $('.model_filter').removeClass('shown_filter')
                }
            },
            error: function (jqXHR, textStatus, errorThrown) { // Если ошибка, то выкладываем печаль в консоль
                console.log('Error: ' + errorThrown);
            }
        });
    })

    $('.auto_filter_select_container select[name="model"]').change(function (){
        var model = $(this).val();

        $.ajax({
            url: '/ajax/getModifies.php',
            type: "POST",
            data: {model:model},
            success: function (response) {
                $('.modify_filter select').html(response)
                if(response!='') {
                    $(".modify_filter select").customSelect('reset');
                    $('.modify_filter').addClass('shown_filter')
                }
                else{
                    $('.modify_filter').removeClass('shown_filter')
                }
            },
            error: function (jqXHR, textStatus, errorThrown) { // Если ошибка, то выкладываем печаль в консоль
                console.log('Error: ' + errorThrown);
            }
        });
    })

    $('.auto_filter_find').click(function (){
        var form = $(this).parents('.auto_filter');
        var url = form.data('url');
        var new_url = url;
        $.each(form.find('select'),function(index,elem){
            var value = $(elem).val()
            var name = $(elem).attr('name');
            if(name != '' && value!='none' && value!='' && value!=null){
                if(name == 'mark' || name == 'model') {
                    new_url += value+ '/';
                }
                if(name == 'modification' ) {
                    new_url += '?engine=' + value;
                }
            }
        })

        if(new_url != '' && new_url!=url){
            window.location.href = new_url;
        }
    })

    function handleBtnClick(e) {
        var isActive = $(this).hasClass("opened");
        var target = $(this).data("target");
        var desktopOff = $(this).data("desktop-off");
        var isDesktop = $(window).width() >= 1300;
        var isCollapsing = $(target).hasClass("collapsing");

        if (isDesktop && desktopOff) {
            return;
        }

        if (isCollapsing) return;
        e.preventDefault();

// скрываем все
//         $('.js-collapse-btn.opened').removeClass('opened');
//         $('.collapse.show').removeClass('show');
//         $('.collapse.in').removeClass('in');
        $(this).toggleClass("opened", !isActive);
        $(target).collapse(isActive ? "hide" : "show");
    }

    $(function () {
        $(document).on("click", ".js-collapse-btn", handleBtnClick);
    });

    $(document).on('click','.map_info_switch',function (){
        $(this).parent().toggleClass('open')
    })

    $(document).on('click','.toggle_sects:not(.not_toggle)',function (){
        let targ1 = $(this).siblings('.l-catalog-filter__categories');
        let targ2 = targ1.find('.to_hide');
        if(targ1.hasClass('hide')){
            $.ajax({
                url: '/ajax/setSubsectStat.php',
                type: "POST",
                data: {subsect_mode:'Y'},
                success: function (response) {
                },
            });
            targ2.show(500);
            targ1.removeClass('hide')
            $(this).removeClass('hide')
        }
        else{
            $.ajax({
                url: '/ajax/setSubsectStat.php',
                type: "POST",
                data: {subsect_mode:'N'},
                success: function (response) {
                },
            });
            targ2.hide(500);
            targ1.addClass('hide')
            $(this).addClass('hide')
        }

    })

})

document.addEventListener("DOMContentLoaded", function () {
    const backToTop = document.getElementById("back-to-top");

    // Показать/скрыть кнопку при прокрутке страницы
    window.addEventListener("scroll", function () {
        if (window.pageYOffset > 300) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    });

    // Плавная прокрутка при клике на кнопку
    backToTop.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $(document).on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        if(window.screen.width>1299) {
            const bodyHeight = document.body.scrollHeight;

            var check1 = $('.non_filter_bg');
            if (check1.length > 0 && bodyHeight > 3000) {
                var checkTop = check1.length * 3000;
                console.log('checkTop'+checkTop);

                if (scrollTop > checkTop - 1500) {
                    var newCont = $('<div class="page_bg_nonfixed non_filter_bg dop_filter_bg">\n' +
                        '            <div class="light light1">\n' +
                        '            </div>\n' +
                        '            <div class="light light2">\n' +
                        '            </div>\n' +
                        '            <div class="light light3">\n' +
                        '            </div>\n' +
                        '            <div class="light blue1">\n' +
                        '            </div>\n' +
                        '            <div class="light blue2">\n' +
                        '            </div>\n' +
                        '        </div>');
                    newCont.css('top', checkTop);
                    newCont.css('height', 1);
                    $('.page').append(newCont);
                }
            }
        }
        else{
            var check1 = $('.mobile_page_bg');
            if (check1.length > 0) {
                var checkTop = check1.length * 2000;
                // if (scrollTop > checkTop - 1000) {
                //     var newCont = $('<div class="mobile_page_bg">\n' +
                //         '    <div class="left_down_light">\n' +
                //         '    </div>\n' +
                //         '    <div class="right_up_light">\n' +
                //         '    </div>\n' +
                //         '</div>');
                //     newCont.css('top', checkTop)
                //     $('.page').append(newCont);
                // }
            }
        }
    });

});

$(document).ready(function (){
    $(document).on('click','.new_prods_ctrl .btn_left',function (){
        var list = $(this).parents('.new_prods_sect').find('.new_prods_cont');
        var cur = list.data('scroll');
        if(!cur){
            cur = 0;
        }
        var cards = list.find('.new_prods_cont_sect');
        var cnt = cards.length;
        var elem = list[0];
        var newScroll = 0;
        $('.new_prods_ctrl .btn_right').removeClass('deactive');
        if(cur - 4 > 0){
            newScroll = cur - 4;
            $(this).removeClass('deactive');
        }
        else{
            newScroll = 0;
            $(this).addClass('deactive');
        }
        list.data('scroll',newScroll)
        elem.scroll({ left: cards[newScroll].offsetLeft, behavior: 'smooth' });
    })
    $(document).on('click','.new_prods_ctrl .btn_right',function (){
        var list = $(this).parents('.new_prods_sect').find('.new_prods_cont');
        var cur = list.data('scroll');
        if(!cur){
            cur = 0;
        }
        var cards = list.find('.new_prods_cont_sect');
        var cnt = cards.length;
        var elem = list[0];
        var newScroll = 0;
        var step = 4;
        if(window.innerWidth<1299){
            step=1;
        }
        $('.new_prods_ctrl .btn_left').removeClass('deactive');
        if(cur + step <= cnt-step){
            newScroll = cur + step;
            $(this).removeClass('deactive');
        }
        else{
            newScroll = cnt-step;
            $(this).addClass('deactive');
        }
        list.data('scroll',newScroll)
        elem.scroll({ left: cards[newScroll].offsetLeft, behavior: 'smooth' });
    })
})


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('click', async function (e) {
    if (e.target.closest('.select-default__option--value')) {
        var elem = e.target;
        if(!document.syns){
            await fetch('/ajax/get_syns.php', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Error response');
                    return response.json();
                })
                .then(data => {
                    document.syns = data;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
        if(!elem.dataset.syn) {
            let par = elem.closest('.select-default');
            let labels = par.querySelectorAll('.select-default__dropdown .select-default__option-wrap .select-default__option');
            labels.forEach(function (item) {
                let key = item.innerText.trim().toUpperCase()
                if(key.length>0) {
                    if (document.syns[key]) {
                        let syn = document.syns[key];
                        // item.querySelector('span').innerText =syn.join('|');
                        item.setAttribute('data-label-find', syn.join('|'));
                    }
                }
            });
            elem.setAttribute('data-syn', 1);
        }
    }
});