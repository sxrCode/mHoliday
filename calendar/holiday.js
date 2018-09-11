$(document).ready(function () {
    console.log('calendar ready!');

    var dataManager = new DateDataManager(); //数据管理
    var month = 8;

    var hMgr = new HolidayManager(dataManager);
    var hTypeCalculater = new TypeCalculater(dataManager);
    hTypeCalculater.setMode(1);
    $('.calendar-container').each(function (index, element) {
        var cal = new CalenderCom(element, month + index);
        cal.setTypeCalculater(hTypeCalculater);
        cal.setSelectDealler(hMgr);
        dataManager.addListener(cal);
    });

    var workMgr = new WorkDayManager(dataManager);
    var wTypeCalculater = new TypeCalculater(dataManager);
    wTypeCalculater.setMode(2);
    $('.calendar-container-work').each(function (index, element) {
        var cal = new CalenderCom(element, month + index);
        cal.setTypeCalculater(wTypeCalculater);
        cal.setSelectDealler(workMgr);
        dataManager.addListener(cal);
    });

    dataManager.hasHolidays.push(dateTools.getDateFromStr('2018-10-02'));
    dataManager.hasHolidays.push(dateTools.getDateFromStr('2018-10-01'));

    dataManager.hasShiftdays.push(dateTools.getDateFromStr('2018-09-29'));
    dataManager.hasShiftdays.push(dateTools.getDateFromStr('2018-10-28'));
    dataManager.notify();
});

/**
 * 数据管理
 */
var DateDataManager = function () {
    this.hasHolidays = []; //已设假期
    this.hasShiftdays = []; //已设调班
    this.selectedShiftdays = []; //已选调班
    this.selectedStartDate = null; //已选假期开始
    this.selectedEndDate = null; //已选假期结束

    var mListeners = [];

    this.addListener = function (listener) {
        mListeners.push(listener);
    }

    this.addHasHoliday = function (date) {
        if (date) {
            hasHolidays.push(date);
        }
        return this;
    }

    this.addHasShiftdays = function (date) {
        if (date) {
            hasShiftdays.push(date);
        }
        return this;
    }

    this.notify = function () {
        mListeners.map(function (value, index) {
            if (value.update) {
                value.update();
            }
        });
    }
}


var WorkDayManager = function (dataMgr) {
    var calendars = [];
    var workdates = [];
    var mDataManager = dataMgr;

    this.addCalendar = function (calendar) {
        if (calendar) {
            calendars.push(calendar);
        }
    };

    this.onDateSelect = function (sdate) {
        var newDate = new Date(sdate);
        var isModify = false;
        var isCancel = false;

        //是否与已设假期有冲突
        for (var i = 0; i < mDataManager.hasHolidays.length; i++) {
            var hd = mDataManager.hasHolidays[i];
            if (hd - newDate == 0) {
                alert('与已设假期有冲突');
                return;
            }
        }

        //是否与已设调班有冲突
        for (var i = 0; i < mDataManager.hasShiftdays.length; i++) {
            var hd = mDataManager.hasShiftdays[i];
            if (hd - newDate == 0) {
                alert('与已设调班有冲突');
                return;
            }
        }

        //是否与已选假期有冲突
        if (mDataManager.selectedStartDate) {
            if (mDataManager.selectedEndDate) {
                if (newDate >= mDataManager.selectedStartDate && newDate <= mDataManager.selectedEndDate) {
                    alert('与已选假期有冲突');
                    return;
                }
            } else {
                if (newDate - mDataManager.selectedStartDate == 0) {
                    alert('与已选假期有冲突');
                    return;
                }
            }
        }

        for (var i = 0; i < workdates.length; i++) {
            if (newDate - workdates[i] == 0) { //取消操作
                workdates.splice(i, 1);
                isCancel = true;
                isModify = true;
                break;
            }
        }

        if (!isCancel) {
            if (newDate.getDay() == 0 || newDate.getDay() == 6) { //是否周末
                workdates.push(newDate);
                isModify = true;
            }
        }

        if (isModify) {
            mDataManager.selectedShiftdays = workdates;
            mDataManager.notify();
        }

    }
}

var HolidayManager = function (dataMgr) { 
    var mStartDate; //假日开始
    var mEndDate; //假日结束
    var mState = 0; //0-尚未选择 1-已选开始日期 2-已选结束日期 
    var mDataManager = dataMgr;

    this.onDateSelect = function (sdate) {
        var newDate = new Date(sdate);

        var startDate;
        var endDate;
        var state = mState;

        if (mStartDate) {
            startDate = new Date(mStartDate);
        }

        if (mEndDate) {
            endDate = new Date(mEndDate);
        }

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

        //console.log('startDate: ' + dateTools.getStrFromDate(startDate) + '; endDate: ' + dateTools.getStrFromDate(endDate));

        //是否与已设假期有冲突
        if (startDate) {
            if (endDate) {
                for (var i = 0; i < mDataManager.hasHolidays.length; i++) {
                    var hd = mDataManager.hasHolidays[i];
                    if (hd >= startDate && hd <= endDate) {
                        alert('与已设假期有冲突');
                        return;
                    }
                }
            } else {
                for (var i = 0; i < mDataManager.hasHolidays.length; i++) {
                    var hd = mDataManager.hasHolidays[i];
                    if (hd - startDate == 0) {
                        alert('与已设假期有冲突');
                        return;
                    }
                }
            }
        }

        //是否与已设调班有冲突
        if (startDate) {
            if (endDate) {
                for (var i = 0; i < mDataManager.hasShiftdays.length; i++) {
                    var hd = mDataManager.hasShiftdays[i];
                    if (hd >= startDate && hd <= endDate) {
                        alert('与已设调班有冲突');
                        return;
                    }
                }
            } else {
                for (var i = 0; i < mDataManager.hasShiftdays.length; i++) {
                    var hd = mDataManager.hasShiftdays[i];
                    if (hd - startDate == 0) {
                        alert('与已设调班有冲突');
                        return;
                    }
                }
            }
        }

        //是否与已选调班有冲突
        if (startDate) {
            if (endDate) {
                for (var i = 0; i < mDataManager.selectedShiftdays.length; i++) {
                    var hd = mDataManager.selectedShiftdays[i];
                    if (hd >= startDate && hd <= endDate) {
                        alert('与已选调班有冲突');
                        return;
                    }
                }
            } else {
                for (var i = 0; i < mDataManager.selectedShiftdays.length; i++) {
                    var hd = mDataManager.selectedShiftdays[i];
                    if (hd - startDate == 0) {
                        alert('与已选调班有冲突');
                        return;
                    }
                }
            }
        }

        var sd = startDate;
        var ed = endDate;
        switch (state) {
            case 1:
                ed = startDate;
                break;
            case 0:
                sd = null;
                ed = null;
                break;
            default:
                break;
        }

        mStartDate = startDate;
        mEndDate = endDate;
        mState = state;

        mDataManager.selectedStartDate = sd;
        mDataManager.selectedEndDate = ed;
        mDataManager.notify();
    }
}

var TypeCalculater = function (dataMgr) {
    var mMode = 1; //1-假期模式 2- 调班模式
    var mDataManager = dataMgr;

    this.setMode = function (mode) {
        mMode = mode;
    };

    this.calculateType = function (dataDate) {
        if (mDataManager == null) {
            return 0;
        }

        var type = 0;
        if (mMode == 1) {
            type = (dataDate.getDay() == 0 || dataDate.getDay() == 6) ? 2 : 1;

            if (mDataManager.selectedShiftdays.some(function (value, index) {
                if (value - dataDate == 0) { //已选调班
                    return true;
                }
                return false;
            })) {
                type = 3;
            }

            if (checkStartAndEndRule(dataDate)) { //已选假期
                type = 4;
            }

        } else {
            type = (dataDate.getDay() == 0 || dataDate.getDay() == 6) ? 6 : 5;

            if (mDataManager.selectedShiftdays.some(function (value) {
                if (value - dataDate == 0) {
                    return true;
                }
                return false;
            })) {
                type = 7;
            }

            if (checkStartAndEndRule(dataDate)) {
                type = 8;
            }
        }

        if (mDataManager.hasShiftdays.some(function (value, index) {
            if (value - dataDate == 0) { //已设假期
                return true;
            }
            return false;
        })) {
            type = 9;
        }

        if (mDataManager.hasHolidays.some(function (value, index) {
            if (value - dataDate == 0) { //已设假期
                return true;
            }
            return false;
        })) {
            type = 10;
        }

        return type;
    }


    function checkStartAndEndRule(dateDate) {
        if (mDataManager.selectedStartDate != null && mDataManager.selectedEndDate != null) {
            if (dateDate >= mDataManager.selectedStartDate && dateDate <= mDataManager.selectedEndDate) {
                return true;
            }
        } else if (mDataManager.selectedStartDate != null && (mDataManager.selectedStartDate - dateDate == 0)) {
            return true;
        }
        return false;
    }

}

var CalenderCom = function (calEleContainer, month) {
    var _this = this;

    var _month = month; //当前月份

    var _calEle = calEleContainer; //日历容器
    var calendarTmp = template('calendar-table', {});
    var calendarTable = $(calendarTmp);

    var dates = []; //dateCellData数据集合
    var dateCells = {}; //cells集合

    var selectDealler;
    var mTypeCalculater;

    this.setSelectDealler = function (dealler) {
        if (dealler) {
            selectDealler = dealler;
        }
    };

    this.setTypeCalculater = function (calculater) {
        mTypeCalculater = calculater;
    }

    this.update = function () {
        calculate();
        render();
    }

    $(_calEle).append(calendarTable);

    /**
     * cell数据计算
     */
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
            if (mTypeCalculater) {
                type = mTypeCalculater.calculateType(dateDate);
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


var DateCell = function (dateData, trEle) {
    var _this = this;
    this.mData;

    var tdEle = $(template('calendar-cell', {}));
    var cellDiv = $('div.hol-date-cell', tdEle)[0];
    var cellHeader = $('div.hol-date-cell-header', tdEle)[0];
    var cellBody = $('div.hol-date-cell-body', tdEle)[0];
    var numDiv = $('<div></div>');

    var stateDel;
    this.mDealler;

    /**
     * cell主要有两部分功能，一个是消息处理，一个是视图展示
     * 所以要更换的话也要更换两部分，消息处理机制和视图
     */

    this.setDealler = function (dealler) {
        this.mDealler = dealler;
    }

    this.setStateDelegate = function (stateDelegate) {
        stateDel = stateDelegate;
    };

    this.getTdEle = function () {
        return tdEle;
    }

    this.getCellBody = function () {
        return cellBody;
    }

    this.getNumDiv = function () {
        return numDiv;
    }

    this.setDateData = function (dateData) {
        this.mData = dateData;
        transferTo(this.mData.type);
    }

    $(tdEle)
        .bind('mouseout', function () {
            if (stateDel) {
                stateDel.onMouseout();
            }
        })
        .bind('mouseover', function () {
            if (stateDel) {
                stateDel.onMouseover();
            }
        })
        .bind('click', function () {
            if (stateDel) {
                stateDel.onClick();
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
        reset();

        if (stateType == 1) { //假期模式-工作日
            $(numDiv).addClass('hol-body-work-num').html(_this.mData.num);
            _this.setStateDelegate(new StateDelegate(_this));

        } else if (stateType == 2) { //假期模式-周末
            $(numDiv).addClass('hol-body-holiday-num').html(_this.mData.num);
            _this.setStateDelegate(new StateDelegate(_this));

        } else if (stateType == 4) { //假期模式-已选假期
            $(numDiv).addClass('holiday-selected-holiday').html(_this.mData.num);
            _this.setStateDelegate(new State2Selegate(_this));

        } else if (stateType == 3) { //假期模式-已选调班
            $(cellBody).removeClass('date-selectable');
            $(cellDiv).addClass('hol-cell-set-shiftday');
            $(numDiv).addClass('hol-body-work-num').html(_this.mData.num);
            _this.setStateDelegate(new State0Delegate(_this));

        } else if (stateType == 0) { //空
            $(cellBody).removeClass('date-selectable');
            _this.setStateDelegate(new State0Delegate(_this));

        } else if (stateType == 5) { //调班模式-工作日
            $(cellBody).removeClass('date-selectable');
            $(numDiv).addClass('work-body-work-num').html(_this.mData.num);

        } else if (stateType == 6) { //调班模式-周末
            _this.setStateDelegate(new State6Delegate(_this));
            $(numDiv).addClass('hol-body-holiday-num').html(_this.mData.num);

        } else if (stateType == 7) { //调班模式-已选调班
            $(numDiv).addClass('holiday-selected-work').html(_this.mData.num);
            _this.setStateDelegate(new State2Selegate(_this));

        } else if (stateType == 8) { //调班模式-已选假期
            $(cellBody).removeClass('date-selectable');
            $(numDiv).addClass('hol-body-work-num').html(_this.mData.num);
            $(cellDiv).addClass('hol-cell-set-holiay');
            _this.setStateDelegate(new State0Delegate(_this));

        } else if (stateType == 9) { //已设调班
            $(cellBody).removeClass('date-selectable');
            $(cellHeader).html('<div class="hol-tip hol-tip-work">班</div>');
            $(cellDiv).addClass('hol-cell-set-shiftday');
            $(numDiv).addClass('hol-body-work-num').html(_this.mData.num);
            _this.setStateDelegate(new State0Delegate(_this));

        } else if (stateType == 10) { //已设假期
            $(cellBody).removeClass('date-selectable');
            $(cellHeader).html('<div class="hol-tip hol-tip-holiday">假</div>');
            $(cellDiv).addClass('hol-cell-set-holiay');
            $(numDiv).addClass('hol-body-holiday-num').html(_this.mData.num);
            _this.setStateDelegate(new State0Delegate(_this));

        }
    }

    function reset() {
        $(numDiv).removeClass();
        $(cellBody).addClass('date-selectable');
        $(cellHeader).html('');
    }

}

var StateDelegate = function (dateCell) { //未选 controller
    var mDateCell = dateCell;

    this.onMouseover = function () {
        $(mDateCell.getNumDiv()).addClass('holiday-selectable-holiday');
    }

    this.onMouseout = function () {
        $(mDateCell.getNumDiv()).removeClass('holiday-selectable-holiday');
    }

    this.onClick = function () {
        if (mDateCell.mDealler && mDateCell.mDealler.onDateSelect) {
            mDateCell.mDealler.onDateSelect(mDateCell.mData.date);
        }
    }
};

var State2Selegate = function (dateCell) { //已选
    var mDateCell = dateCell;

    this.onMouseover = function () { }

    this.onMouseout = function () { }

    this.onClick = function () {
        if (mDateCell.mDealler && mDateCell.mDealler.onDateSelect) {
            mDateCell.mDealler.onDateSelect(mDateCell.mData.date);
        }
    }
}

var State0Delegate = function (dateCell) { //不可选

    this.onMouseover = function () { }

    this.onMouseout = function () { }

    this.onClick = function () { }
}

var State6Delegate = function (dateCell) {
    var mDateCell = dateCell;

    this.onMouseover = function () {
        $(mDateCell.getNumDiv()).addClass('holiday-selectable-work');
    }

    this.onMouseout = function () {
        $(mDateCell.getNumDiv()).removeClass('holiday-selectable-work');
    }

    this.onClick = function () {
        if (mDateCell.mDealler && mDateCell.mDealler.onDateSelect) {
            mDateCell.mDealler.onDateSelect(mDateCell.mData.date);
        }
    }
}



function mGetDate(year, month) {
    var d = new Date(year, month, 0);
    return d.getDate();
}

var dateTools = {};
dateTools.getDateFromStr = function (dateString) { //2018-01-02
    if (dateString) {
        var date = new Date(dateString.replace(/-/, "/"))
        return date;
    }
}

dateTools.getStrFromDate = function (date) {
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