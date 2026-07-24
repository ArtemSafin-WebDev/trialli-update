$(document).ready(function (){
    $(document).on('click','.header__burger .js-nav-burger-btn',function (){
        $(this).toggleClass('active');
        $('.mobile_menu').toggleClass('active');
        $('body').toggleClass('menu')
    })
})