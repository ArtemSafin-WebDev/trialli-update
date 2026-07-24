$(document).ready(function (){
    //cart

    $('.header .header__star').tooltip({
        title : 'Товар добавлен в корзину',
        trigger: 'manual',
        placement: 'bottom',
        delay: { show: 300, hide: 3000 }
    })

    $(document).on('click', '.to_cart', function (e) {
        e.preventDefault();
        var btn = $(this);
        var id = $(this).data('id');
        $.ajax({
            url: '/ajax/addToCart.php',
            type: 'post',
            data: {
                id: id,
            },
            success: function(data) {
                json = JSON.parse(data)
                if(json.status=='success'){

                    if (typeof yaCounter15611848 !== 'undefined') {
                        yaCounter15611848.reachGoal('add to cart');
                    }

                    if(json.cnt===0){
                        json.cnt='';
                    }
                    $('.header .header__star  .cart__counter').html(json.cnt);
                    $('.added__banner.success').show();
                    setTimeout(()=>{$('.added__banner.success').hide()},3000)
                    var sbl = btn.siblings('.cart_items_item');
                    if(sbl.length>0){
                        sbl.show();
                        btn.hide();
                    }
                }
                else{
                    $('.added__banner.error .error-txt').html(json.error);
                    $('.added__banner.error').show();
                    setTimeout(()=>{$('.added__banner.error').hide()},3000)
                }
            }
        });
    });

    $(document).on('click', '.delete__from_cart', function (e) {
        e.preventDefault();
        var id = $(this).data('id');
        var delRes = removeFromCart(id);
        if(delRes){
            var row = $(this).parents('.cart_items_item');
            row.remove();
            var rows = $('.cart__wrapper .cart_items_item');
            if (rows.length == 0) {
                $('.cart__wrapper').empty();
                $('.cart__wrapper').html('<div class="empty_cart">\n' +
                    '                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                    '                            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 50.6673C21.0609 50.6673 22.0783 51.0887 22.8285 51.8389C23.5786 52.589 24 53.6065 24 54.6673C24 55.7282 23.5786 56.7456 22.8285 57.4957C22.0783 58.2459 21.0609 58.6673 20 58.6673C18.9392 58.6673 17.9218 58.2459 17.1716 57.4957C16.4215 56.7456 16 55.7282 16 54.6673C16 53.6065 16.4215 52.589 17.1716 51.8389C17.9218 51.0887 18.9392 50.6673 20 50.6673ZM46.6667 50.6673C47.7276 50.6673 48.745 51.0887 49.4951 51.8389C50.2453 52.589 50.6667 53.6065 50.6667 54.6673C50.6667 55.7282 50.2453 56.7456 49.4951 57.4957C48.745 58.2459 47.7276 58.6673 46.6667 58.6673C45.6058 58.6673 44.5884 58.2459 43.8383 57.4957C43.0881 56.7456 42.6667 55.7282 42.6667 54.6673C42.6667 53.6065 43.0881 52.589 43.8383 51.8389C44.5884 51.0887 45.6058 50.6673 46.6667 50.6673ZM8.36804 5.33398C10.3908 5.33423 12.3384 6.10072 13.8188 7.47917C15.2992 8.85762 16.2024 10.7457 16.3467 12.7633L16.3867 13.334H52.8054C53.5867 13.3339 54.3585 13.5054 55.0662 13.8365C55.7739 14.1676 56.4002 14.6501 56.9008 15.2499C57.4014 15.8498 57.7642 16.5523 57.9633 17.3078C58.1625 18.0633 58.1932 18.8533 58.0534 19.622L53.688 43.622C53.4645 44.8508 52.8167 45.9623 51.8576 46.7625C50.8986 47.5626 49.6891 48.0008 48.44 48.0007H18.4827C17.1337 48.0007 15.8349 47.4895 14.8477 46.5702C13.8606 45.6508 13.2585 44.3915 13.1627 43.046L11.0294 13.1447C10.9814 12.4712 10.6798 11.841 10.1854 11.3812C9.69097 10.9214 9.04054 10.6663 8.36537 10.6673H8.00004C7.2928 10.6673 6.61452 10.3864 6.11442 9.88627C5.61433 9.38617 5.33337 8.7079 5.33337 8.00065C5.33337 7.29341 5.61433 6.61513 6.11442 6.11503C6.61452 5.61494 7.2928 5.33398 8.00004 5.33398H8.36804ZM52.8054 18.6673H16.768L18.4827 42.6673H48.44L52.8054 18.6673Z" fill="#BED600" fill-opacity="0.7"/>\n' +
                    '                        </svg>\n' +
                    '                        <h2>В корзине пока пусто</h2>\n' +
                    '                        <p>Добавьте товары из каталога или воспользуйтесь поиском для быстрого подбора</p>\n' +
                    '                        <a href="/catalogue/">Перейти в каталог</a>\n' +
                    '                    </div>');
            }
            else {
                recalcCart();
            }
        }
        $.ajax({
            url: '/ajax/deleteFromCart.php',
            type: 'post',
            data: {
                id: id,
            },
            success: function(data) {
                json = JSON.parse(data)
                if(json.status=='success'){

                    if(json.cnt===0){
                        json.cnt='';
                    }
                    $('.header .header__star  .cart__counter').html(json.cnt);
                    row.remove();
                    var rows = $('.cart__wrapper .cart_items_item');
                    if(rows.length==0){
                        $('.cart__wrapper').empty();
                        $('.cart__wrapper').html('<div class="empty_cart">\n' +
                            '                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                            '                            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 50.6673C21.0609 50.6673 22.0783 51.0887 22.8285 51.8389C23.5786 52.589 24 53.6065 24 54.6673C24 55.7282 23.5786 56.7456 22.8285 57.4957C22.0783 58.2459 21.0609 58.6673 20 58.6673C18.9392 58.6673 17.9218 58.2459 17.1716 57.4957C16.4215 56.7456 16 55.7282 16 54.6673C16 53.6065 16.4215 52.589 17.1716 51.8389C17.9218 51.0887 18.9392 50.6673 20 50.6673ZM46.6667 50.6673C47.7276 50.6673 48.745 51.0887 49.4951 51.8389C50.2453 52.589 50.6667 53.6065 50.6667 54.6673C50.6667 55.7282 50.2453 56.7456 49.4951 57.4957C48.745 58.2459 47.7276 58.6673 46.6667 58.6673C45.6058 58.6673 44.5884 58.2459 43.8383 57.4957C43.0881 56.7456 42.6667 55.7282 42.6667 54.6673C42.6667 53.6065 43.0881 52.589 43.8383 51.8389C44.5884 51.0887 45.6058 50.6673 46.6667 50.6673ZM8.36804 5.33398C10.3908 5.33423 12.3384 6.10072 13.8188 7.47917C15.2992 8.85762 16.2024 10.7457 16.3467 12.7633L16.3867 13.334H52.8054C53.5867 13.3339 54.3585 13.5054 55.0662 13.8365C55.7739 14.1676 56.4002 14.6501 56.9008 15.2499C57.4014 15.8498 57.7642 16.5523 57.9633 17.3078C58.1625 18.0633 58.1932 18.8533 58.0534 19.622L53.688 43.622C53.4645 44.8508 52.8167 45.9623 51.8576 46.7625C50.8986 47.5626 49.6891 48.0008 48.44 48.0007H18.4827C17.1337 48.0007 15.8349 47.4895 14.8477 46.5702C13.8606 45.6508 13.2585 44.3915 13.1627 43.046L11.0294 13.1447C10.9814 12.4712 10.6798 11.841 10.1854 11.3812C9.69097 10.9214 9.04054 10.6663 8.36537 10.6673H8.00004C7.2928 10.6673 6.61452 10.3864 6.11442 9.88627C5.61433 9.38617 5.33337 8.7079 5.33337 8.00065C5.33337 7.29341 5.61433 6.61513 6.11442 6.11503C6.61452 5.61494 7.2928 5.33398 8.00004 5.33398H8.36804ZM52.8054 18.6673H16.768L18.4827 42.6673H48.44L52.8054 18.6673Z" fill="#BED600" fill-opacity="0.7"/>\n' +
                            '                        </svg>\n' +
                            '                        <h2>В корзине пока пусто</h2>\n' +
                            '                        <p>Добавьте товары из каталога или воспользуйтесь поиском для быстрого подбора</p>\n' +
                            '                        <a href="/catalogue/">Перейти в каталог</a>\n' +
                            '                    </div>');
                    }
                    recalcCart();
                }
            }
        });
    });

    function removeFromCart(id) {
        var success = false;
        $.ajax({
            url: '/ajax/deleteFromCart.php',
            type: 'post',
            async: false,
            data: {
                id: id,
            },
            success: function (data) {
                json = JSON.parse(data)
                if (json.status == 'success') {

                    if(json.cnt===0){
                        json.cnt='';
                    }
                    $('.header .header__star  .cart__counter').html(json.cnt);
                    success = true;
                }
            }
        });

        return success;
    }

    $(document).on('click', '.clear__cart', function (e) {
        e.preventDefault();
        var rows = $('.cart__wrapper .cart_items_item');
        $.ajax({
            url: '/ajax/clearCart.php',
            type: 'post',
            success: function(data) {
                json = JSON.parse(data)
                if(json.status=='success'){

                    if(json.cnt===0){
                        json.cnt='';
                    }
                    $('.header .header__star  .cart__counter').html(json.cnt);
                    // $('.cart__wrapper .unavailable').remove();
                    $('.items__count').remove();
                    $('.cart__wrapper').empty();
                    $('.cart__wrapper').html('<div class="empty_cart">\n' +
                        '                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                        '                            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 50.6673C21.0609 50.6673 22.0783 51.0887 22.8285 51.8389C23.5786 52.589 24 53.6065 24 54.6673C24 55.7282 23.5786 56.7456 22.8285 57.4957C22.0783 58.2459 21.0609 58.6673 20 58.6673C18.9392 58.6673 17.9218 58.2459 17.1716 57.4957C16.4215 56.7456 16 55.7282 16 54.6673C16 53.6065 16.4215 52.589 17.1716 51.8389C17.9218 51.0887 18.9392 50.6673 20 50.6673ZM46.6667 50.6673C47.7276 50.6673 48.745 51.0887 49.4951 51.8389C50.2453 52.589 50.6667 53.6065 50.6667 54.6673C50.6667 55.7282 50.2453 56.7456 49.4951 57.4957C48.745 58.2459 47.7276 58.6673 46.6667 58.6673C45.6058 58.6673 44.5884 58.2459 43.8383 57.4957C43.0881 56.7456 42.6667 55.7282 42.6667 54.6673C42.6667 53.6065 43.0881 52.589 43.8383 51.8389C44.5884 51.0887 45.6058 50.6673 46.6667 50.6673ZM8.36804 5.33398C10.3908 5.33423 12.3384 6.10072 13.8188 7.47917C15.2992 8.85762 16.2024 10.7457 16.3467 12.7633L16.3867 13.334H52.8054C53.5867 13.3339 54.3585 13.5054 55.0662 13.8365C55.7739 14.1676 56.4002 14.6501 56.9008 15.2499C57.4014 15.8498 57.7642 16.5523 57.9633 17.3078C58.1625 18.0633 58.1932 18.8533 58.0534 19.622L53.688 43.622C53.4645 44.8508 52.8167 45.9623 51.8576 46.7625C50.8986 47.5626 49.6891 48.0008 48.44 48.0007H18.4827C17.1337 48.0007 15.8349 47.4895 14.8477 46.5702C13.8606 45.6508 13.2585 44.3915 13.1627 43.046L11.0294 13.1447C10.9814 12.4712 10.6798 11.841 10.1854 11.3812C9.69097 10.9214 9.04054 10.6663 8.36537 10.6673H8.00004C7.2928 10.6673 6.61452 10.3864 6.11442 9.88627C5.61433 9.38617 5.33337 8.7079 5.33337 8.00065C5.33337 7.29341 5.61433 6.61513 6.11442 6.11503C6.61452 5.61494 7.2928 5.33398 8.00004 5.33398H8.36804ZM52.8054 18.6673H16.768L18.4827 42.6673H48.44L52.8054 18.6673Z" fill="#BED600" fill-opacity="0.7"/>\n' +
                        '                        </svg>\n' +
                        '                        <h2>В корзине пока пусто</h2>\n' +
                        '                        <p>Добавьте товары из каталога или воспользуйтесь поиском для быстрого подбора</p>\n' +
                        '                        <a href="/catalogue/">Перейти в каталог</a>\n' +
                        '                    </div>');
                    rows.remove();
                }
            }
        });
    });

    $(document).on('click','.item_cart_counter .minus',function (){
        var inp = $(this).parents('.item_cart_counter').find('input.counter')
        var id = inp.data('id');
        var cur = parseInt(inp.val());
        var max = parseInt(inp.data('max'));
        var norma = parseInt(inp.data('norma'));
        var newcnt = cur - norma;
        if(newcnt>=norma){
            $.ajax({
                url: '/ajax/changeCart.php',
                type: 'post',
                data: {
                    id: id,
                    cnt: newcnt,
                },
                success: function(data) {
                    json = JSON.parse(data)
                    if(json.status=='success'){

                        if(json.cnt===0){
                            json.cnt='';
                        }
                        $('.header .header__star  .cart__counter').html(json.cnt);
                        inp.val(newcnt)
                        inp.data('val',newcnt)
                        recalcCart();
                    }
                }
            });
        }
        else{
            var delRes = removeFromCart(id)
            if(delRes) {
                var bl = inp.parents('.cart_items_item');
                var sbl = bl.siblings('.to_cart');
                if (sbl.length > 0) {
                    sbl.show();
                    bl.hide();
                }
                else{
                    var row = $(this).parents('.cart_items_item');
                    row.remove();
                    var rows = $('.cart__wrapper .cart_items_item');
                    if (rows.length == 0) {
                        $('.items__count').remove();
                        $('.cart__wrapper').empty();
                        $('.cart__wrapper').html('<div class="empty_cart">\n' +
                            '                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                            '                            <path fill-rule="evenodd" clip-rule="evenodd" d="M20 50.6673C21.0609 50.6673 22.0783 51.0887 22.8285 51.8389C23.5786 52.589 24 53.6065 24 54.6673C24 55.7282 23.5786 56.7456 22.8285 57.4957C22.0783 58.2459 21.0609 58.6673 20 58.6673C18.9392 58.6673 17.9218 58.2459 17.1716 57.4957C16.4215 56.7456 16 55.7282 16 54.6673C16 53.6065 16.4215 52.589 17.1716 51.8389C17.9218 51.0887 18.9392 50.6673 20 50.6673ZM46.6667 50.6673C47.7276 50.6673 48.745 51.0887 49.4951 51.8389C50.2453 52.589 50.6667 53.6065 50.6667 54.6673C50.6667 55.7282 50.2453 56.7456 49.4951 57.4957C48.745 58.2459 47.7276 58.6673 46.6667 58.6673C45.6058 58.6673 44.5884 58.2459 43.8383 57.4957C43.0881 56.7456 42.6667 55.7282 42.6667 54.6673C42.6667 53.6065 43.0881 52.589 43.8383 51.8389C44.5884 51.0887 45.6058 50.6673 46.6667 50.6673ZM8.36804 5.33398C10.3908 5.33423 12.3384 6.10072 13.8188 7.47917C15.2992 8.85762 16.2024 10.7457 16.3467 12.7633L16.3867 13.334H52.8054C53.5867 13.3339 54.3585 13.5054 55.0662 13.8365C55.7739 14.1676 56.4002 14.6501 56.9008 15.2499C57.4014 15.8498 57.7642 16.5523 57.9633 17.3078C58.1625 18.0633 58.1932 18.8533 58.0534 19.622L53.688 43.622C53.4645 44.8508 52.8167 45.9623 51.8576 46.7625C50.8986 47.5626 49.6891 48.0008 48.44 48.0007H18.4827C17.1337 48.0007 15.8349 47.4895 14.8477 46.5702C13.8606 45.6508 13.2585 44.3915 13.1627 43.046L11.0294 13.1447C10.9814 12.4712 10.6798 11.841 10.1854 11.3812C9.69097 10.9214 9.04054 10.6663 8.36537 10.6673H8.00004C7.2928 10.6673 6.61452 10.3864 6.11442 9.88627C5.61433 9.38617 5.33337 8.7079 5.33337 8.00065C5.33337 7.29341 5.61433 6.61513 6.11442 6.11503C6.61452 5.61494 7.2928 5.33398 8.00004 5.33398H8.36804ZM52.8054 18.6673H16.768L18.4827 42.6673H48.44L52.8054 18.6673Z" fill="#BED600" fill-opacity="0.7"/>\n' +
                            '                        </svg>\n' +
                            '                        <h2>В корзине пока пусто</h2>\n' +
                            '                        <p>Добавьте товары из каталога или воспользуйтесь поиском для быстрого подбора</p>\n' +
                            '                        <a href="/catalogue/">Перейти в каталог</a>\n' +
                            '                    </div>');
                    }
                    else {
                        recalcCart();
                    }
                }
            }
        }
    })

    $(document).on('click','.item_cart_counter .plus',function (){
        var inp = $(this).parents('.item_cart_counter').find('input.counter')
        var id = inp.data('id');
        var cur = parseInt(inp.val());
        var max = parseInt(inp.data('max'));
        var norma = parseInt(inp.data('norma'));
        var newcnt = cur + norma;
        if(newcnt<=max){
            $.ajax({
                url: '/ajax/changeCart.php',
                type: 'post',
                data: {
                    id: id,
                    cnt: newcnt,
                },
                success: function(data) {
                    json = JSON.parse(data)
                    if(json.status=='success'){

                        if(json.cnt===0){
                            json.cnt='';
                        }
                        $('.header .header__star  .cart__counter').html(json.cnt);
                        inp.val(newcnt)
                        inp.data('val',newcnt)
                        recalcCart();
                    }
                }
            });
        }
    })

    function checkCart(){
        var blocks = $('.item_cart_block');

        $.ajax({
            url: '/ajax/getCart.php',
            type: 'post',
            success: function(data) {
                var json = JSON.parse(data)

                // Пишим сколько всего в корзине

                if(json.cnt===0){
                    json.cnt='';
                }
                $('.header .header__star  .cart__counter').html(json.cnt);

                if(blocks.length>0){
                    var cart = json.cart;
                    blocks.each(function (i,e){
                        var id = $(e).data('id')
                        if(cart!=null && cart[id]>0){
                            $(e).find('.cart_items_item').show();
                            var inp = $(e).find('.cart_items_item input.counter')
                            inp.val(cart[id]);
                        }
                        else{
                            $(e).find('.to_cart').show();
                            var inp = $(e).find('.cart_items_item input.counter')
                        }
                    })
                }
            }
        });


    }
    checkCart();

    $(document).on('change','.item_cart_counter input.counter',function (e){
        var inp = $(this);
        var id = inp.data('id');
        var cur = parseInt(inp.val());
        var max = parseInt(inp.data('max'));
        var norma = parseInt(inp.data('norma'));
        var newcnt = Math.floor(cur/norma)*norma;
        if(newcnt<=max && newcnt>=norma){
            $.ajax({
                url: '/ajax/changeCart.php',
                type: 'post',
                data: {
                    id: id,
                    cnt: newcnt,
                },
                success: function(data) {
                    json = JSON.parse(data)
                    if(json.status=='success'){

                        if(json.cnt===0){
                            json.cnt='';
                        }
                        $('.header .header__star  .cart__counter').html(json.cnt);
                        inp.val(newcnt)
                        inp.data('val',newcnt)
                        recalcCart();
                    }
                }
            });
        }
        else{
            $(this).val($(this).data('val'));
        }
    })

    function recalcCart(){
        var base = 0;
        var rrc = 0;
        var cntAll = 0;
        $('.available .cart_items_item').each(function (i,e){
            var inp = $(e).find('input.counter')
            var oldBl = $(e).find('.item__prices_old')
            var actBl = $(e).find('.item__prices_actual')
            var cur = parseInt(inp.val()),old1=parseInt(oldBl.data('one')),act1=parseInt(actBl.data('one'));
            var old = cur*old1,act=act1*cur;
            oldBl.html(Intl.NumberFormat("ru").format(old)+rubleSymb());
            actBl.html(Intl.NumberFormat("ru").format(act)+rubleSymb());
            base+=act;
            rrc+=old;
            cntAll+=cur;
        })
        $('.summary__info_amount').html(Intl.NumberFormat("ru").format(rrc)+rubleSymb());
        $('.discount_amount').html(Intl.NumberFormat("ru").format(rrc-base)+rubleSymb());
        $('.summary__total_amount').html(Intl.NumberFormat("ru").format(base)+rubleSymb());
        $('.allcartcnt').html(cntAll);
    }//

    function rubleSymb(){
        return '<svg width="12" height="15" viewBox="0 0 12 15" xmlns="http://www.w3.org/2000/svg">\n' +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M6.5625 0.523438C8.83652 0.523936 10.8677 2.22747 10.8679 4.50171C10.8681 6.77598 9.46726 8.4859 6.5625 8.48608H3.98193V9.67505H7.40234L7.11792 10.9946C7.04967 11.3112 6.76918 11.5378 6.44531 11.5378H3.98193V14.9998H1.82373V11.5378H0.437012C0.195496 11.5377 0 11.3412 0 11.0996V9.67505H1.82373V8.48608H0.439453C0.197991 8.48608 0.00148416 8.29047 0.0012207 8.04907V6.62085H1.82373V0.523438H6.5625ZM3.88916 2.39233C3.89163 2.41485 3.98193 3.24129 3.98193 3.77539V6.62085H6.5625C7.96906 6.62065 8.58887 5.71141 8.58887 4.50171C8.58887 3.29201 7.98306 2.39253 6.5625 2.39233H3.88916Z"/>\n' +
            '</svg>';
    }

    $(document).on('click','.order__btn',function (){
        var bask = [];
        $('.available .cart_items_item').each(function (i,e){
            var inp = $(e).find('input.counter')
            var cur = inp.val(),code=inp.data('code');
            bask.push({code:code,cnt:cur});
        })
        $.ajax({
            // url: 'https://carvilleshop.ru/ajax/createTmpBasket.php', //CORS
            url: '/ajax/createTmpBasketCSH.php',
            type: 'post',
            // async: false,
            data: {
                items: bask,
            },
            success: function(data) {
                json = JSON.parse(data)
                if(json.status=='success'){
                    var hash = json.hash;
                    var codes = json.codes;
                    if (typeof yaCounter15611848 !== 'undefined') {
                        yaCounter15611848.reachGoal('go to shop');
                    }
                    var other_utm = '';
                    // other_utm
                    //utm_source=источник трафика (органика, реклама и тд)
                    // utm_medium=сpc
                    // utm_campaign=рекламная кампания

                    if(json.utm){
                        other_utm = json.utm;
                    }

                    var LinkFinal = 'https://carvilleshop.ru/basket/?hash_basket='+hash+'&'+other_utm;
                    //help-linkshop
                    $('#popup-order .help-linkshop').attr('href', LinkFinal);
                    // window.open(LinkFinal, '_blank');
                    $('#popup-order .help-linkshop')[0].click();
                    setTimeout(function () {
                        $.magnificPopup.close();
                        // $(e.target).tooltip('hide');
                    }, 30000);
                }
            }
        });
    })

    $(document).on('click','.card-catalog__footer .item_cart_block',function (e){
        e.preventDefault();
    })
})