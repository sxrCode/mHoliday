$(document).ready(function() {
    console.log('calendar ready!');

    var month = 8;
    $('.calendar-container').each(function(index, element) {
        var cal = new CalenderCom(element, month + index);
    });
});

var CalenderCom = function(calEleContainer, month) {
    var _this = this;
    var _calEle = calEleContainer; //日历容器
    var _month = month; //当前月份

    var mdate = new Date();
    mdate.setMonth(_month);
    mdate.setDate(1);
    var initDay = mdate.getDay(); //星期几

    var calendarTmp = template('calendar-table', {});
    var calendarTable = $(calendarTmp);
    $(_calEle).append(calendarTable);
    render();

    function render() {

        var dates = [];
        for (var i = 0; i < initDay; i++) {
            dates.push({
                type: 0, //0-空 1-工作日 2-假日
                num: 0,
            });
        }

        var monthDays = mGetDate(mdate.getFullYear(), mdate.getMonth() + 1);

        for (var i = 1; i <= monthDays; i++) {

            var mDate = new Date(mdate.getFullYear(), mdate.getMonth(), i);
            var type = (mDate.getDay() == 0 || mDate.getDay() == 6) ? 2 : 1;
            dates.push({
                type: type,
                num: i,
                date: mDate
            });
        }

        for (var i = 0; i < (42 - monthDays - initDay); i++) {
            dates.push({
                type: 0, //0-空 1-工作日 2-假日
                date: 0,
            });
        }

        var trs = $('.calendar-tr', calendarTable);
        for (var i = 0; i < dates.length; i++) {
            var cellData = dates[i];
            var row = parseInt(i / 7);
            var calendartr = trs[row];
            var dateCell = new DateCell(cellData, calendartr);

        }
    }

};

var DateCell = function(dateData, trEle) {
    var tdEle = $(template('calendar-cell', {}));
    var cellBody = $('div.hol-date-cell-body', tdEle)[0];
    var mData = dateData;

    switch (mData.type) {
        case 1:
            $(cellBody).append($('<div>' + mData.num + '</div>'));
            break;
        case 2:
            $(cellBody).append($('<div class="hol-body-holiday-num">' + mData.num + '</div>'));
            break;
    }

    $(cellBody).addClass('date-selectable');

    if (trEle != null) {
        $(trEle).append(tdEle);
    }
}

function mGetDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}