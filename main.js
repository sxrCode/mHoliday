$(document).ready(function() {
    console.log('calendar ready!');

    var month = 8;
    var hMgr = new HolidayManager();
    $('.calendar-container').each(function(index, element) {
        var cal = new CalenderCom(element, month + index, hMgr);
        hMgr.addCalendar(cal);
    });
});


var HolidayManager = function() { //业务逻辑
    var startDate; //假日开始
    var endDate; //假日结束
    var mode = 1; //1-假期选择模式 2-调班选择模式
    var state = 0; //0-尚未选择 1-已选开始日期 2-已选结束日期 
    var calendars = [];

    this.addCalendar = function(calendar) {
        if (calendar) {
            calendars.push(calendar);
        }
    };

    this.onDateSelect = function(sdate) {
        var newDate = new Date(sdate);

        switch (state) {
            case 0:
                startDate = newDate;
                state = 1;
                //通知视图做出更改
                break;
            case 1:
                if (startDate > newDate) {
                    endDate = startDate;
                    startDate = newDate;
                    state = 2;

                } else if (startDate < newDate) {
                    endDate = newDate;
                    state = 2;

                } else { //取消操作
                    state = 0;
                }
                break;
            case 2:
                if (newDate < startDate) {
                    startDate = newDate;

                } else if ((newDate - startDate) == 0) { //取消操作
                    newDate.setDate(newDate.getDate() + 1);
                    startDate = newDate;

                    if ((startDate - endDate) == 0) {
                        state = 1;
                    }

                } else if (newDate < endDate) {
                    endDate = newDate;

                } else if ((newDate - endDate) == 0) { //取消操作
                    newDate.setDate(newDate.getDate() - 1);
                    endDate = newDate;
                    if ((startDate - endDate) == 0) {
                        state = 1;
                    }

                } else {
                    endDate = newDate;
                }
                break;
        }

        console.log('startDate: ' + dateTools.getStrFromDate(startDate) + '; endDate: ' + dateTools.getStrFromDate(endDate));

        var sd = startDate;
        var ed = endDate;
        switch (state) {
            case 1:
                ed = startDate;
                //更新开始日期
                break;
            case 0:
                sd = null;
                ed = null;
                break;
            default:
                break;
        }

        for (var i = 0; i < calendars.length; i++) {
            calendars[i].updateHolRange(sd, ed);
        }
    }
}

var CalenderCom = function(calEleContainer, month, dealler) {
    var _this = this;
    var _calEle = calEleContainer; //日历容器
    var _month = month; //当前月份

    var calendarTmp = template('calendar-table', {});
    var calendarTable = $(calendarTmp);

    var dates = []; //dateCellData数据集合
    var dateCells = {}; //cells集合
    var mStartDate;
    var mEndDate;

    var selectDealler = dealler;

    this.setSelectDealler = function(dealler) {
        if (dealler) {
            selectDealler = dealler;
        }
    };

    this.updateHolRange = function(startDate, endDate) {
        mStartDate = startDate;
        mEndDate = endDate;
        calculate();
        render();
    };

    $(_calEle).append(calendarTable);
    calculate();
    render();

    function calculate() {
        var mdate = new Date();
        mdate.setMonth(_month);
        mdate.setDate(1);
        var initDay = mdate.getDay(); //星期几

        dates = [];
        for (var i = 0; i < initDay; i++) { //空日期
            dates.push({
                type: 0, //0-空 1-工作日 2-假日
                num: 0,
            });
        }

        var monthDays = mGetDate(mdate.getFullYear(), mdate.getMonth() + 1);

        for (var i = 1; i <= monthDays; i++) {

            var dateDate = new Date(mdate.getFullYear(), mdate.getMonth(), i);
            var type = (dateDate.getDay() == 0 || dateDate.getDay() == 6) ? 2 : 1;
            if (checkStartAndEndRule(dateDate)) {
                type = 4;
            }

            dates.push({
                type: type,
                num: i,
                date: dateDate
            });
        }

        for (var i = 0; i < (42 - monthDays - initDay); i++) { //空日期
            dates.push({
                type: 0, //0-空 1-工作日 2-假日
                date: 0,
            });
        }
    }


    function checkStartAndEndRule(dateDate) {
        if (mStartDate != null && mEndDate != null) {
            if (dateDate >= mStartDate && dateDate <= mEndDate) {
                return true;
            }
        } else if (mStartDate != null && (mStartDate - dateDate == 0)) {
            return true;
        }

        return false;
    }

    function render() {
        dateCells = {};

        var trs = $('.calendar-tr', calendarTable);
        for (var i = 0; i < trs.length; i++) {
            $(trs[i]).html('');
        }

        for (var i = 0; i < dates.length; i++) {
            var cellData = dates[i];
            var row = parseInt(i / 7);
            var calendartr = trs[row];
            var dateCell = new DateCell(cellData, calendartr);

            if (cellData.date != 0) {
                dateCells[dateTools.getStrFromDate(cellData.date)] = dateCell;
                dateCell.setDealler(selectDealler);
            }

        }
    }
};




var DateCell = function(dateData, trEle) {
    var _this = this;
    var mDealler;
    var tdEle = $(template('calendar-cell', {}));
    var cellBody = $('div.hol-date-cell-body', tdEle)[0];
    var mData;
    var numDiv = $('<div></div>');
    var state = 0; //0-空 2-可选周末 1-可选工作日 4-已选假期 3-已选调班
    var stateDel = new StateDelegate(_this);

    /**
     * cell主要有两部分功能，一个是消息处理，一个是视图展示
     * 所以要更换的话也要更换两部分，消息处理机制和视图
     */

    this.setDealler = function(dealler) {
        mDealler = dealler;
    }

    this.setStateDelegate = function(stateDelegate) {
        stateDel = stateDelegate;
    };

    this.getTdEle = function() {
        return tdEle;
    }

    this.getCellBody = function() {
        return cellBody;
    }

    this.getNumDiv = function() {
        return numDiv;
    }

    this.setDateData = function(dateData) {
        mData = dateData;
        transferTo(mData.type);
    }

    $(tdEle)
        .bind('mouseout', function() {
            stateDel.onMouseout();
        })
        .bind('mouseover', function() {
            stateDel.onMouseover();
        })
        .bind('click', function() {
            stateDel.onClick();
            if (mDealler && mDealler.onDateSelect) {
                console.log('mDealler.onDateSelect');
                mDealler.onDateSelect(mData.date);
            }
        });

    $(cellBody).append(numDiv);
    if (trEle != null) {
        $(trEle).append(tdEle);
    }

    if (dateData) {
        _this.setDateData(dateData);
    }

    function transferTo(stateType) {
        //当发生类型转换时，需要重置

        $(numDiv).removeClass();
        $(cellBody).addClass('date-selectable');

        if (stateType == 1) { //工作日
            $(numDiv).addClass('hol-body-work-num').html(mData.num);

        } else if (stateType == 2) { //周末
            $(numDiv).addClass('hol-body-holiday-num').html(mData.num);

        } else if (stateType == 4) { //4-已选假期
            $(numDiv).addClass('holiday-selected-holiday').html(mData.num);
            _this.setStateDelegate(new State2Selegate(_this));

        } else if (stateType == 0) {
            $(cellBody).removeClass('date-selectable');
            _this.setStateDelegate(new State0Delegate(_this));
        }
    };

}

var StateDelegate = function(dateCell) { //未选 controller
    var mDateCell = dateCell;

    this.onMouseover = function() {
        $(mDateCell.getNumDiv()).addClass('holiday-selectable-holiday');
    }

    this.onMouseout = function() {
        $(mDateCell.getNumDiv()).removeClass('holiday-selectable-work holiday-selectable-holiday');
    }

    this.onClick = function() { //变为已选中
        $(mDateCell.getNumDiv()).addClass('holiday-selected-holiday');
        mDateCell.setStateDelegate(new State2Selegate(mDateCell));
    }
};

var State2Selegate = function(dateCell) { //已选
    var mDateCell = dateCell;

    this.onMouseover = function() {

    }

    this.onMouseout = function() {

    }


    this.onClick = function() {
        $(mDateCell.getNumDiv()).removeClass('holiday-selected-holiday');
        mDateCell.setStateDelegate(new StateDelegate(mDateCell));
    }
}

var State0Delegate = function(dateCell) { //空
    var mDateCell = dateCell;

    this.onMouseover = function() {

    }

    this.onMouseout = function() {

    }


    this.onClick = function() {}
}



function mGetDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}

var dateTools = {};
dateTools.getDateFromStr = function(dateString) { //2018-01-02
    if (dateString) {
        var date = new Date(dateString.replace(/-/, "/"))
        return date;
    }
}

dateTools.getStrFromDate = function(date) {
    if (date) {
        var month = date.getMonth() + 1;

        if ((date.getMonth() + 1) < 10) {
            month = "0" + month;
        }

        var day = date.getDate();
        if (date.getDate() < 10) {
            day = '0' + day;
        }

        return date.getFullYear() + '-' + month + '-' + day;
    }
}