$(".main-about-block-content").each(function () {
    var sliderEl = $(this).find(".slider-main-about__slider")[0];
    new Swiper(sliderEl, {
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        slidesPerView: "auto",
        spaceBetween: 50,
        autoHeight: true,
        breakpoints: {
            600: {
                autoHeight: false
            }
        }
    });
});