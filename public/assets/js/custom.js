

$(document).ready(function () {
    if ($('.filter-title').length) {
        $('.filter-title').on('click', function () {
            $(this).next('.filter-content-wrapper').slideToggle();
            $(this).find('.fa').toggleClass('fa-plus fa-minus');
        })
    }

})