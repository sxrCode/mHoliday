$(document).ready(function () {
    var b = $('div.button')[0];
    $(b).bind('click', function () {
        $('#date-con').append($('<span class="date-span">13512345</span>'));
    });
});