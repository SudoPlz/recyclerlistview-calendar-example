/**
 * # MiniCalendar.js
 */


import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import moment from 'moment';
import Immutable from 'immutable';

const Colors = {
  darkColor: '#192637',
  minicalDayBgColor: '#3177CA',
  primaryBtnHighlight: '#36AA7C',
  activeBorderLightColor: '#3177CA',
  primaryHighColor: '#3177CA',
}
const AcuityStyles = {
  H1: {
    textAlign: 'center',
    fontSize: 18,
    color: 'white',
  },
  H3: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.darkColor,
  },
  BODY_ITALIC: {
    fontSize: 14,
  },
}

import Text from './AcuityText';


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 5,
    flexDirection: 'column',
    // backgroundColor: 'pink',
    borderRightWidth: 1,
    borderRightColor: '#00000055',
  },
  spinnerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  spinner: {
    // justifyContent: 'center',
    // backgroundColor: 'green',
  },
  staticDataSpinnerContainer: {
    zIndex: 0,
    position: 'absolute',
    bottom: 4,
    paddingBottom: 5,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  list: {
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    // backgroundColor: 'orange',
  },
  monthTitleContainer: {
    justifyContent: 'center',
    // alignItems: 'flex-end',
    // backgroundColor: 'red',
  },
  monthTitle: { // text of the date title
    // backgroundColor: 'white',
    textAlign: 'center',
    color: Colors.darkColor,
  },
  weekContainer: {
    flexDirection: 'row',
    // backgroundColor: 'pink',
  },
  dayTitlesContainer: { // view that holds all the date titles
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    // backgroundColor: 'red',
  },
  dayTitleContainer: { // view that holds each date title
    // backgroundColor: 'pink',
    borderRadius: 3,
  },
  dayItemContainer: { // view that holds each date titles and date item
    borderRadius: 3,
    overflow: 'hidden',
  },
  dayTitle: { // text of the date title
    // backgroundColor: 'white',
    textAlign: 'left',
    color: Colors.darkColor,
  },
  dayItem: { // text of the each date no
    paddingBottom: 1,
    // backgroundColor: 'pink',
    // color: 'black',
  },
});

class MiniCalendar extends React.Component {
  //
  constructor(props) {
    super(props);

    const miniDt =
      this.convertCalDataToWeekArrayAndFindMax(props.monthData);
    this.state = {
      weeksArray: miniDt.weeks, // an array that contains the weeks of the month (with their data)
      maxDailyApptNo: // the max number of (appts per 1 day) for that month
        miniDt.maxNoOfAppointments || 0,
      initialBlankDayCnt: // the number of blank days this month has
        miniDt.initialBlankDayCnt || 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.monthData && nextProps.monthData !== this.props.monthData) {
      // console.log(`@@@ CHANGING month DATA: ${nextProps.monthData}`);

      const miniDt =
        this.convertCalDataToWeekArrayAndFindMax(nextProps.monthData);

      this.setState({
        weeksArray: miniDt.weeks, // an array that contains the weeks of the month (with their data)
        maxDailyApptNo: // the max number of (appts per 1 day) for that month
          miniDt.maxNoOfAppointments || 0,
        initialBlankDayCnt: // the number of blank days this month has
          miniDt.initialBlankDayCnt || 0,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.log(`month data UPDATE, ${nextProps.monthData !== this.props.monthData}
    // for month ${moment().month(this.props.month).format('MMM')}`);
    return (
      nextProps.isLoading !== this.props.isLoading
      ||
      nextProps.h !== this.props.h
      ||
      nextProps.w !== this.props.w
      ||
      nextProps.monthData !== this.props.monthData
      ||
      nextProps.curSelectedCalDay !== this.props.curSelectedCalDay
      ||
      nextProps.year !== this.props.year
      ||
      nextProps.month !== this.props.month
      ||
      nextState.weeksArray !== this.state.weeksArray
      ||
      nextState.initialBlankDayCnt !== this.state.initialBlankDayCnt
      ||
      nextState.maxDailyApptNo !== this.state.maxDailyApptNo
      ||
      nextProps.mode !== this.props.mode
      ||
      nextProps.showMonthTitle !== this.props.showMonthTitle
      ||
      nextProps.weekTitleArr !== this.props.weekTitleArr
    );
  }


  // // calculate the number of weeks (including the blank days)
  // const weekCnt = Math.ceil(minicalData.size / 7);


  getApCountColorOverviewMode(count, isToday = false, isSelected = false) {
    // if (this.state.maxDailyApptNo === 0) {
    //   return '#c00';
    // }

    if (isSelected) {
      return Colors.darkColor;
    }

    if (isToday) {
      return 'white';
    }

    // if count equals the max cnt of appointments during that month
    if (count === this.state.maxDailyApptNo) {
      // it's color will be the darkerst
      return Colors.minicalDayBgColor;
    } else if (count <= 0) { // if no appointments during that day
      // it's color will be transparent
      return 'transparent';
    }

    // find the percentage of opacity
    let alpha = count / this.state.maxDailyApptNo;  // according to the total cnt of appts

    const alphaEnhancer = 0.07;  // we'll add this to the alpha percentage

    // if possible, add alphaEnhancer to the percentage of opacity
    alpha = (alpha + alphaEnhancer > 1) ? 1 : alpha + alphaEnhancer;  // to increase the alpha
    // but only if it's less than 1 (bc the value should have a ceiling of 1)

    // console.log(`alpha: ${count}/${this.state.maxDailyApptNo}=${alpha}`);
    let opacityHex = Math.floor(alpha * 255).toString(16);
    if (opacityHex.length < 2) {  // i.e if it's 'f' (a.k.a 15)
      opacityHex = `0${opacityHex}`;  // convert it to 0f
    }
    return `${Colors.minicalDayBgColor}${opacityHex}`;
  }

  getApCountColorScheduleMode(isAvailable = false, isToday, isSelected = false) {
    // if (this.state.maxDailyApptNo === 0) {
    //   return '#c00';
    // }

    if (isSelected) {
      return Colors.darkColor;
    }

    if (isAvailable) {
      return 'white';
    }

    return null;
  }

  // convertCalDataToWeekArrayAndFindMax does 3 things.
  // first it splits the data into week arrays
  // second it finds the maximum number of appointments per day in the month
  // third, it finds the initial count of blank days per month
  convertCalDataToWeekArrayAndFindMax(minicalData) {
    if (minicalData == null || (minicalData && minicalData.size === 0)) {
      return {};
    }
    const weeks = [];
    let maxNoOfAppointments = 0;
    let initialBlankDayCnt = 0;

    for (let i = 0, len = minicalData.size; i < len; i += 1) {
      const weekOfMonth = Math.floor(i / 7);
      if (weeks[weekOfMonth] == null) { // if the current week doesn't exist
        weeks[weekOfMonth] = [];  // create it
      }
      const dayData = minicalData.get(i);

      // 1) splits the data into week arrays
      weeks[weekOfMonth][i % 7] // weeks[weekNo][dayOfWeekNo]
        = dayData; // so insert the current minical day into that weekday

      // 2) finds the maximum number of appointments per day in the month
      if (dayData > maxNoOfAppointments) {  // if that day appt cnt is more than our max
        maxNoOfAppointments = dayData;  // set that day as the max
      }

      // 3) finds the initial count of blank days per month
      if (weekOfMonth === 0 // if it's the first week
        && dayData < 0) { // and the data of the day is negative
        initialBlankDayCnt += 1;  // that means we got another blank day (++ the cnter)
      }
    }
    return { weeks, maxNoOfAppointments, initialBlankDayCnt };
  }


  renderTitle() {
    if (this.props.showMonthTitle === true) {
      const monthMoment = moment()
        .year(this.props.year)
        .month(this.props.month);
      const titleStr = moment().isSame(monthMoment, 'year') ?
        monthMoment.format('MMMM')
        :
        monthMoment.format('MMMM YYYY');
      return (
        <View
          key={`monthTitle_${monthMoment.format('MMM-YY')}`}
          style={[styles.dayTitlesContainer, { width: this.props.w }]}
        >
          <Text
            style={[
              styles.monthTitleContainer,
              {
                // width: headerProps.itemWidth,
                // margin: headerProps.itemMargin,
                paddingHorizontal: this.props.w * 0.015,
                paddingVertical: this.props.h * 0.0045,
              },
            ]}
            textStyle={[AcuityStyles.H1, styles.monthTitle]}
          >
            {titleStr}
          </Text>
        </View>);
    }
    return null;
  }


  renderHeader(headerProps) {
    if (this.props.weekTitleArr == null) {
      return null;
    }
    return (
      <View
        key="day_titles"
        style={[styles.dayTitlesContainer, { width: this.props.w }]}
      >
        {this.props.weekTitleArr.map(
          (name, id) => (
            <Text
              // eslint-disable-next-line
              key={`dayTitle_${id}`}
              style={[
                styles.dayTitleContainer,
                {
                  width: headerProps.itemWidth,
                  margin: headerProps.itemMargin,
                  paddingHorizontal: this.props.w * 0.015,
                  paddingTop: this.props.h * 0.0045,
                },
              ]}
              textStyle={[AcuityStyles.H3, styles.dayTitle]}
            >
              {name}
            </Text>),
        )}
      </View>
    );
  }

  renderDayOverView(dayProps) {
    let colStr = ' ';
    let isToday = false;
    let isSelected = false;
    let shouldChangeBgColor = false;
    // console.log(`renderDay: ${JSON.stringify(dayProps)}`)
    let onCalendarDayTap;
    if (dayProps.rowData >= 0) {
      colStr = ( // the number of each day in the calendar
        dayProps.rowID
        - this.state.initialBlankDayCnt)
        + 1;
      isToday = (
        this.props.year === dayProps.currentYear
        &&
        this.props.month === dayProps.currentMonth
        &&
        moment().date() === colStr
      );
      isSelected = (
        this.props.curSelectedCalDay != null
        &&
        this.props.curSelectedCalDay.date() === colStr
      );
      // only change the bg color if it's today or if we have more than 0 appointments
      shouldChangeBgColor = (isToday === true || isSelected === true || dayProps.rowData > 0);
      onCalendarDayTap = () => {
        const dateTapped = moment()
          .year(this.props.year)
          .month(this.props.month)
          .date(colStr)
          .startOf('day');
        this.props.onCalendarDayTap(dateTapped, dayProps.rowID, isToday, isSelected);
      };
    }
    return (
      <Text
        key={`dayData_${dayProps.rowID}`}
        highlightTextColor={Colors.darkColor}
        highlightBgColor={Colors.primaryBtnHighlight}
        onPress={onCalendarDayTap}
        style={[
          styles.dayItemContainer,
          {
            width: dayProps.itemWidth,
            height: dayProps.itemHeight,
            marginHorizontal: dayProps.itemMargin,
            marginVertical: dayProps.itemMargin,
            backgroundColor: shouldChangeBgColor ?
              this.getApCountColorOverviewMode(dayProps.rowData, isToday, isSelected)
              :
              null,
            borderWidth: isToday ? 1 : null,
            borderColor: isToday ? Colors.activeBorderLightColor : null,
          },
        ]}
        textStyle={[
          AcuityStyles.BODY_ITALIC,
          styles.dayItem,
          {
            paddingHorizontal: this.props.w * 0.015,
            paddingTop: this.props.h * 0.0045,
            color: isSelected ? 'white' : Colors.darkColor,
          }]}
      >
        {colStr}
      </Text>);
  }

  renderDaySchedule(dayProps) {
    let colStr = ' ';
    let isToday = false;
    let isSelected = false;
    let isAvailable = false;
    // let shouldChangeBgColor = false;
    // console.log(`renderDay: ${JSON.stringify(dayProps)}`)
    let onCalendarDayTap;
    if (dayProps.rowData >= 0) {
      colStr = ( // the number of each day in the calendar
        dayProps.rowID
        - this.state.initialBlankDayCnt)
        + 1;
      isToday = (
        this.props.year === dayProps.currentYear
        &&
        this.props.month === dayProps.currentMonth
        &&
        moment().date() === colStr
      );
      isSelected = (
        this.props.curSelectedCalDay != null
        &&
        this.props.curSelectedCalDay.date() === colStr
      );

      isAvailable = dayProps.rowData >= 1;
      // only change the bg color if it's today or if we have more than 0 appointments
      // shouldChangeBgColor = (isToday === true || isSelected === true || isAvailable === true);
      onCalendarDayTap = () => {
        const dateTapped = moment()
          .year(this.props.year)
          .month(this.props.month)
          .date(colStr);
        this.props.onCalendarDayTap(dateTapped, dayProps.rowID, isToday, isSelected);
      };
    }
    return (
      <Text
        key={`dayData_${dayProps.rowID}`}
        highlightTextColor={Colors.darkColor}
        highlightBgColor={Colors.primaryBtnHighlight}
        onPress={onCalendarDayTap}
        style={[
          styles.dayItemContainer,
          {
            width: dayProps.itemWidth,
            height: dayProps.itemHeight,
            marginHorizontal: dayProps.itemMargin,
            marginVertical: this.props.h > 320 ? dayProps.itemMargin : dayProps.itemMargin * 0.8,
            backgroundColor: this.getApCountColorScheduleMode(isAvailable, isToday, isSelected),
            borderWidth: isToday ? 1 : null,
            borderColor: isToday ? Colors.activeBorderLightColor : null,
          },
        ]}
        textStyle={[
          AcuityStyles.BODY_ITALIC,
          styles.dayItem,
          {
            paddingHorizontal: this.props.w * 0.015,
            paddingTop: this.props.h * 0.0045,
            color: isSelected ? 'white' : Colors.darkColor,
          }]}
      >
        {colStr}
      </Text>);
  }

  renderWeekRow(week, weekNo, { itemWidth, itemMargin, itemHeight }) {
    const curMoment = moment();
    const currentYear = curMoment.year();
    const currentMonth = curMoment.month();
    /* totalMarginAvailable
     the space that is left (after day items occupy most of it)
    */
    const {
      mode,
    } = this.props;

    const renderDayMethod = mode === 'overview' ?
      this.renderDayOverView.bind(this) : this.renderDaySchedule.bind(this);

    const weekdayInit = (weekNo * 7);
    return (
      <View key={`week_${weekdayInit}`} style={styles.weekContainer}>
        {week.map((data, id) => renderDayMethod({
          rowData: data,
          rowID: weekdayInit + id,
          itemHeight,
          itemWidth,
          itemMargin,
          currentYear,
          currentMonth,
        }))}
      </View>
    );
  }

  renderMinical(itemProps) {
    return (
      <View style={[styles.list, { width: this.props.w }]}>
        {this.state.weeksArray.map((week, weekNo) => this.renderWeekRow(week, weekNo, itemProps))}
      </View>
    );
  }
  renderSpinner() {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          style={styles.spinner}
          color={Colors.primaryHighColor}
          size="large"
          animating
        />
      </View>
    );
  }
  render() {
    // console.log(`Re rendering mini calendar for cur sel day: ${this.props.curSelectedCalDay}.`);
    const {
      itemSize,
      w,
      // h,
      style,
      isLoading,
    } = this.props;

    return (
      <View
        style={[
          styles.container,
          style,
          { width: w },
        ]}
        pointerEvents={isLoading === true ? 'none' : null}
      >
        {this.renderTitle()}
        {this.renderHeader(itemSize)}
        {this.state.weeksArray != null ?
          this.renderMinical(itemSize)
          :
          this.renderSpinner()
        }
      </View>
    );
  }
}
MiniCalendar.defaultProps = {
  month: moment().month(),  // CAUTION: zero based (because of moment)
  year: moment().year(),
  curSelectedCalDay: moment(),
  mode: 'overview',
  showMonthTitle: false,
  isLoading: false,
};
MiniCalendar.propTypes = {
  weekTitleArr: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  mode: PropTypes.oneOf(['overview', 'schedule']),
  showMonthTitle: PropTypes.bool,
  h: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
  monthData: PropTypes.instanceOf(Immutable.List),
  curSelectedCalDay: PropTypes.instanceOf(moment),
  month: PropTypes.number,
  year: PropTypes.number,
  itemSize: PropTypes.object.isRequired,
  onCalendarDayTap: PropTypes.func.isRequired,
};
export default MiniCalendar;
