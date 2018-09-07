$(document).ready(function () {
    var holidayApp = new HolidayApp();

    $('#hol-left').bind('click', function () {
        holidayApp.downMonth();
    });

    $('#hol-right').bind('click', function () {
        holidayApp.upMonth();
    });

});

var HolidayApp = function () {
    var _this = this;
    var mdate = new Date();

    mdate.setDate(1);
    var initDay = mdate.getDay(); //星期几


    render();

    this.setDate = function (newDate) {
        mdate = newDate;
    }

    /**
     * 月份增加
     */
    this.upMonth = function () {
        mdate.setMonth(mdate.getMonth() + 1);
        initDay = mdate.getDay(); //星期几
        mdate.setDate(1);

        render();
    }

    /**
     * 月份减少
     */
    this.downMonth = function () {
        mdate.setMonth(mdate.getMonth() - 1);
        initDay = mdate.getDay(); //星期几
        mdate.setDate(1);

        render();
    }

    function render() {
        var dateDatas = [];

        for (var i = 0; i < initDay; i++) {
            dateDatas.push({
                type: 0, //0-空 1-工作日 2-假日
                date: 0,
            });
        }

        var monthDays = mGetDate(mdate.getFullYear(), mdate.getMonth() + 1);

        for (var i = 1; i <= monthDays; i++) {

            var mDate = new Date(mdate.getFullYear(), mdate.getMonth(), i);
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

        var trs = $('#holidy-container .hol-date-tr');

        /**
         * 清空
         */
        $(trs).each(function (index, ele) {
            $(ele).html('');
        });


        /**
         * 渲染页面
         */

        for (var i = 0; i < dateDatas.length; i++) {
            var cellData = dateDatas[i];
            var row = parseInt(i / 7);

            if (cellData.type == 2) {
                var cell = $('<div class="hol-date-cell unselect holidy-cell">' + '<p>' + cellData.num + '</p>' + '</div>');
                $(trs[row]).append(cell);
                var dateCell = new DateCell(cellData.date, cellData.type, cell);

            } else if (cellData.type == 1) {
                $(trs[row]).append('<div class="hol-date-cell unselect workday-cell">' + '<p>' + cellData.num + '</p>' + '</div>');
            } else {
                $(trs[row]).append('<div class="hol-date-cell "></div>');
            }

        }

        $('#hol-month').html(mdate.getFullYear() + '年' + (mdate.getMonth() + 1) + '月');
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
        if (!isSelect) {
            $(mele).addClass('hol-cell-selected');
        } else {
            $(mele).removeClass('hol-cell-selected');
        }
        isSelect = !isSelect;

    };

    $(mele).bind('click', _this.onSelect);

}