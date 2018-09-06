
var date = new Date();

$(document).ready(function () {

    /** 获取数据 */
    date.setDate(1);
    var initDay = date.getDay(); //星期几
    var dateDatas = [];

    for (var i = 0; i < initDay; i++) {
        dateDatas.push({
            type: 0, //0-空 1-工作日 2-假日
            date: 0,
        });
    }

    var monthDays = mGetDate(date.getFullYear(), date.getMonth() + 1);

    for (var i = 1; i <= monthDays; i++) {

        var mDate = new Date(date.getFullYear(), date.getMonth(), i);
        var type = (mDate.getDay() == 0 || mDate.getDay() == 6) ? 2 : 1;
        dateDatas.push({
            type: type,
            num: i,
            date: mDate
        });
    }

    for (var i = 0; i < (42 - monthDays - initDay); i++) {
        dateDatas.push({
            type: 0, //0-空 1-工作日 2-假日
            date: 0,
        });
    }


    /**
     * 渲染页面
     */
    var trs = $('#holidy-container .hol-date-tr');
    for (var i = 0; i < dateDatas.length; i++) {
        var cellData = dateDatas[i];
        var row = parseInt(i / 7);

        if (cellData.type == 2) {
            var cell = $('<div class="hol-date-cell unselect holidy-cell">' + '<p>' + cellData.num + '</p>' + '</div>');
            $(trs[row]).append(cell);
            var dateCell = new DateCell(cellData.date, cellData.type, cell);

        } else if (cellData.type == 1) {
            $(trs[row]).append('<div class="hol-date-cell unselect workday-cell">' + '<p>' + cellData.num + '</p>'  +  '</div>');
        } else {
            $(trs[row]).append('<div class="hol-date-cell "></div>');
        }

    }

    $('#hol-month').html(date.getFullYear() + '年' + (date.getMonth() + 1) + '月');

    $('#hol-left').bind('click', function () {
        /* TODO
         * 1. 重新计算数据
         * 2. 重新渲染页面
         */
    });
});

var HolidayApp = function () {
    var _this = this;
    var mdate = new Date();

    this.setDate = function (newDate) {
        mdate = newDate;
    }

    /**
     * 月份增加
     */
    this.upMonth = function () {

    }

    /**
     * 月份减少
     */
    this.downMonth = function () {

    }

    function render() {

    }

    function calculate() {

    }
}

function dealDateRow(initPos, dateNum) {
    var fakePos = initPos + dateNum + 1;
    var row = fakePos / 7;
    return row;
}

function mGetDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}

var DateCell = function (d, type, ele) {

    var mdate = d;
    var mtype = type;
    var mele = ele;
    var isSelect = false;
    var _this = this;

    this.onSelect = function () {
        console.log('type onSelect!');        
        if(!isSelect) {
            $(mele).addClass('hol-cell-selected');
        } else {
            $(mele).removeClass('hol-cell-selected');
        }
        isSelect = !isSelect;
        
    };

    $(mele).bind('click', _this.onSelect);

}