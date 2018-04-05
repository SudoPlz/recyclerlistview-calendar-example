import { Platform } from 'react-native';
import moment from 'moment-timezone';

module.exports = {

  weekdayArr: null,


getNullDaysBegginingOfMonth(monthOfYearNo, year, firstDayOfWeekSunday) {
    let firstDayOfWeekIsSunday = firstDayOfWeekSunday;
    if (firstDayOfWeekIsSunday == null) {
      firstDayOfWeekIsSunday = true;
    }
    const y = year || moment().year();
    let m = monthOfYearNo;
    if (m == null) {  // if no month
      m = moment().month(); // we assume cur month
    }
    const firstDayOfMonth = moment().month(m).year(y).date(1);
    const firstDayOfWeek = firstDayOfMonth.clone().startOf(firstDayOfWeekIsSunday === true ? 'week' : 'isoWeek');
    // console.log(`First day of month: ${firstDayOfMonth.format('dddd, MMMM Do YYYY')}`);
    // console.log(`First day of month: ${firstDayOfWeek.format('dddd, MMMM Do YYYY')}`);
    return firstDayOfMonth.diff(firstDayOfWeek, 'days');
  },

  getNullDaysEndOfMonth(monthOfYearNo, year, firstDayOfWeekSunday) {
    let firstDayOfWeekIsSunday = firstDayOfWeekSunday;
    if (firstDayOfWeekIsSunday == null) {
      firstDayOfWeekIsSunday = true;
    }
    const y = year || moment().year();
    let m = monthOfYearNo;
    if (m == null) {  // if no month
      m = moment().month(); // we assume cur month
    }
    const thatMonthAndYear = moment().month(m).year(y);
    const lastDayOfThatMoment = thatMonthAndYear.date(thatMonthAndYear.daysInMonth());
    const lastDayOfWeek = lastDayOfThatMoment.clone().endOf(firstDayOfWeekIsSunday === true ? 'week' : 'isoWeek');
    // console.log(`Last day of month: ${lastDayOfThatMoment.format('dddd, MMMM Do YYYY')}`);
    // console.log(`Last day of month: ${lastDayOfWeek.format('dddd, MMMM Do YYYY')}`);
    return lastDayOfWeek.diff(lastDayOfThatMoment, 'days');
  },

  createCalendarArray(monthOfYearNo, year, firstDayOfWeekSunday) {
    let firstDayOfWeekIsSunday = firstDayOfWeekSunday;
    if (firstDayOfWeekIsSunday == null) {
      firstDayOfWeekIsSunday = true;
    }
    const y = year || moment().year();
    let m = monthOfYearNo;
    if (m == null) {  // if no month
      m = moment().month(); // we assume cur month
    }

    const initialNullDays = this.getNullDaysBegginingOfMonth(m, y, firstDayOfWeekIsSunday);
    const daysInMonth = moment().month(m).year(y).daysInMonth();
    const finalNullDays = this.getNullDaysEndOfMonth(m, y, firstDayOfWeekIsSunday);
    const calendarArray = [];
    let i = 0;
    for (i = 0; i < initialNullDays; i += 1) { calendarArray.push(-1); }
    for (i = 0; i < daysInMonth; i += 1) { calendarArray.push(0); }
    for (i = 0; i < finalNullDays; i += 1) { calendarArray.push(-1); }
    return calendarArray;
  },
  /*
    @params firstDayOfWeekSunday:
      wether to use sunday or monday as the first day of the week
    @returns
    [M, T, W, T, F, S, S]
    or
    [S, M, T, W, T, F, S]
  */
  createWeekdayArray(firstDayOfWeekSunday) {
    let firstDayOfWeekIsSunday = firstDayOfWeekSunday;
    if (firstDayOfWeekIsSunday == null) {
      firstDayOfWeekIsSunday = true;
    }
    if (
      this.weekdayArr // if the cached weekday array exists
      &&
      // and if it agrees with the current firstDayOfWeekIsSunday flag
      (this.weekdayArr[0] === 'S') === firstDayOfWeekIsSunday
    ) {
      // console.log(`First day of array is sunday? ${
      // (this.weekdayArr[0] === 'S')}. Var is sunday: ${firstDayOfWeekIsSunday}`);
      return this.weekdayArr;
    }
    this.weekdayArr = [];
    if (firstDayOfWeekIsSunday === true) {
      this.weekdayArr.push('S');
    }
    this.weekdayArr.push('M');
    this.weekdayArr.push('T');
    this.weekdayArr.push('W');
    this.weekdayArr.push('TH');
    this.weekdayArr.push('F');
    this.weekdayArr.push('S');
    if (firstDayOfWeekIsSunday === false) {
      this.weekdayArr.push('S');
    }
    return this.weekdayArr;
  },

};
