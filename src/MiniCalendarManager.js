/**
 * # MiniCalendarManager.js
 */

/* eslint max-len: 0 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  // FlatList,
  // Text,
} from 'react-native';
import { Map } from 'immutable';
import moment from 'moment';

// import {
//   RecyclerListView,
//   DataProvider,
//   LayoutProvider,
// } from 'recyclerlistview';

import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview';

// import { Bar as SpinnerBar } from 'react-native-progress';
const TimeFormats = {
  MINICAL_KEY_FORMAT: 'MMMM_YYYY',
  // BACKEND_DATETIME_NO_TZ: 'YYYY-MM-DDTHH:mm:ss',
  // BACKEND_DATETIME: 'YYYY-MM-DDTHH:mm:ssZZ',
}
const FirstDayOfWeek = {
  SUNDAY: 0,
  MONDAY: 1,
};
const Colors = {
  cardBackgroundColor: '#EFEFEF', // light grey
  primaryHighColor: '#3177CA',
}

function getMinicalMonthStr(newMonthMom) {
  if (newMonthMom) {
    const formatStr = moment().isSame(newMonthMom, 'year') ? 'MMMM' : 'MMMM YYYY';
    return newMonthMom.format(formatStr);
  }
  return moment().format('MMMM');
}

function createMomFromDateKeepingSameTz(date) {
  return moment.parseZone(date);
}


// import Text from '../AcuityText';
import MiniCalendar from './MiniCalendar';

import Collapsible from './AcuityCollapsible';
import Slidable from './AcuitySlidable';
import LocaleAndTime from './LocaleFactory';

/**
 *
 * OVERVIEW: MinicalModelGenerator generates an array of days extending to 2 years in future and past. This array
 * is used as data provider for the RecyclerListView. Initial index is determined using current time and passed to the
 * ListView and since it only draws the visible section we get a very quick load.
 *
 * Now while the list is being scrolled we track visible index to figure out current selected date which is maintained in
 * redux store.
 * On change the list simply jumps to the right index. The recycler view does the scroll optimally by itself.
 */
import MinicalModelGenerator from './Utils/MinicalModelGenerator';


const DAY_ITEM_WIDTH = 0.125;

class MiniCalendarManager extends React.Component {
  //
  constructor(props) {
    super(props);

    // create a week title array
    // we'll pass this to all our Minical components
    const weekTitleArr = LocaleAndTime.createWeekdayArray(
      (props.firstDayOfWeek === FirstDayOfWeek.SUNDAY),
    );

    const momToScrollTo = props.startScrolledToMom || moment();

    // Generates the data model for the minical
    this.minicalModelGenerator = new MinicalModelGenerator(momToScrollTo);

    this.curVisibleIndex = this.minicalModelGenerator.getCurrentDateIndex();

    // Passes the data to the minical data provider
    this.dataProvider =
      new DataProvider(() => true)
        .cloneWithRows(this.minicalModelGenerator.getModel());
    // new DataProvider((/* r1, r2 */) => {
    //   // console.log(` r1 !== r2: ${r1 !== r2} bc ${JSON.stringify(r1)} != ${JSON.stringify(r2)}`)
    //   return true;
    // })

    // this.minicalHeightPortrait = props.h * (props.showMonthTitles ? 0.4 : 0.35);
    // this.minicalHeightLandscape = props.w * (props.showMonthTitles ? 0.38 : 0.33);
    // this.minicalWidth = props.w;

    this.layoutProvider = new LayoutProvider(
      () => 0,
      // {
      // const date = this.indexToDate(index);
      // if (date) {
      //   const miniCalMonthMoment = createMomFromDateKeepingSameTz(date);
      //   if (miniCalMonthMoment) {
      //     const monthKey = miniCalMonthMoment.format(TimeFormats.MINICAL_KEY_FORMAT);
      //     if (props.miniCalData) {
      //       const dayData = props.miniCalData.getIn([monthKey, 'data']);
      //       if (dayData) {
      //         const weekCnt = Math.ceil(dayData.size / 7);
      //         if (weekCnt >= 6) {
      //           this.minicalHeightPortrait = props.h * (props.showMonthTitles ? 0.42 : 0.37);
      //           this.minicalHeightLandscape = props.w * (props.showMonthTitles ? 0.40 : 0.35);
      //           return VIEW_TYPES.LARGE_SIZE;
      //         }
      //       }
      //     }
      //   }
      // }
      //   return VIEW_TYPES.NORMAL_SIZE;
      // },

      // Providing heights and widths for given types, doing deterministic way for perf
      (type, dim, index) => {
        // switch (type) {
        //   case VIEW_TYPES.LARGE_SIZE: {
        //     // eslint-disable-next-line
        //     dim.height = props.h * (props.showMonthTitles ? 0.4 : 0.35);
        //     break;
        //   }
        //   case VIEW_TYPES.NORMAL_SIZE:
        //   default: {
        //     // eslint-disable-next-line
        //     dim.height = props.h * (props.showMonthTitles ? 0.48 : 0.42);
        //     break;
        //   }
        // }
        let weekCnt = 6;
        // // eslint-disable-next-line
        // dim.height = props.h * (props.showMonthTitles ? 0.4 : 0.35);
        // eslint-disable-next-line
        dim.width = this.props.w;

        const date = this.indexToDate(index);
        if (date) {
          const miniCalMonthMoment = createMomFromDateKeepingSameTz(date);
          if (miniCalMonthMoment) {
            const monthKey = miniCalMonthMoment.format(TimeFormats.MINICAL_KEY_FORMAT);
            if (props.miniCalData) {
              const dayData = props.miniCalData.getIn([monthKey, 'data']);
              if (dayData) {
                weekCnt = Math.ceil(dayData.size / 7);
              }
            }
          }
        }
        // eslint-disable-next-line
        dim.height = this.calculateMinicalHeight(weekCnt, this.props);
      },
    );

    console.log(`scr height minical ${props.h} ${props.w}`)
    // Initial state
    this.state = {
      // appointmentList: {},
      weekTitleArr, // the titles of the week days (either starting from Monday or Sunday)
      monthsLayoutData: this.dataProvider,
      curHeight: this.calculateMinicalHeight(6, props),
      curWidth: props.w,
    };
  }

  componentWillMount() {
    // no need to fetch any data, we've been given our data via props.miniCalData

    // this.firstCallbackSkipped = false;
    // this.rebasePromise = null;
    // this.isCurrentlyBeingRebased = false;

    this.lastMonthStrDispatched = null;

    // this will keep a timestamp (milis) of the last time the user tapped on the scroll view
    this.timestampOfLastInteraction = new Date().getTime();

    // this will keep a map of timestamps and wether they have caused a dispatch or not
    // this.dispatchMap = {};

    // the last moment we dispatched on began
    // this.lastDispatchedCbMoment = null;

    // the last moment we dispatched on settle
    // this.lastDispatchedCbMomentSettled = null;
  }

  componentDidMount() {
  }


  // TODO WHEN THE USER SCROLLS 2 years ahead, make sure we (minical model generator).ensureYear()
  componentWillReceiveProps(nextProps) {
    if (nextProps.orientation !== this.props.orientation) {
      this.setState({
        curHeight: this.calculateMinicalHeight(6, nextProps),
        curWidth: nextProps.w,
      });
    }
  //   // if that's the first time the user opened the minical, mark the skipped flag as true
  //   if (nextProps.visible !== this.props.visible) {
  //     if (this.firstCallbackSkipped === false) {
  //       this.firstCallbackSkipped = true;
  //     }
  //   }
  //   if (nextProps.firstDayOfWeek !== this.props.firstDayOfWeek) {
  //     // if the first week of the day changes
  //     const isSunday = (nextProps.firstDayOfWeek === FirstDayOfWeek.SUNDAY);
  //     // create a new weekday array, and set it to our state
  //     this.setState({
  //       weekTitleArr: LocaleAndTime.createWeekdayArray(isSunday),
  //     });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.curWidth !== this.state.curWidth
      ||
      nextState.curHeight !== this.state.curHeight
      ||
      nextProps.shouldRenderMinical !== this.props.shouldRenderMinical
      ||
      nextProps.slidesIn !== this.props.slidesIn
      ||
      nextProps.renderLineBelowMinical !== this.props.renderLineBelowMinical
      ||
      nextProps.mode !== this.props.mode
      ||
      nextProps.isFetchingAvailableDates !== this.props.isFetchingAvailableDates
      ||
      nextProps.isBuildingMinicalData !== this.props.isBuildingMinicalData
      ||
      nextProps.isFetchingAppointments !== this.props.isFetchingAppointments
      ||
      nextProps.h !== this.props.h
      ||
      nextProps.w !== this.props.w
      ||
      nextProps.orientation !== this.props.orientation
      ||
      nextProps.showMonthTitles !== this.props.showMonthTitles
      ||
      nextProps.firstDayOfWeek !== this.props.firstDayOfWeek
      ||
      nextProps.scrollEnabled !== this.props.scrollEnabled
      ||
      nextProps.visible !== this.props.visible
      ||
      nextProps.style !== this.props.style
      ||
      nextProps.miniCalData !== this.props.miniCalData
      ||
      nextProps.curSelectedCalDay !== this.props.curSelectedCalDay
      ||
      nextState.weekTitleArr !== this.state.weekTitleArr
      ||
      nextState.monthsLayoutData !== this.state.monthsLayoutData
    );
  }


  componentWillUnmount() {
    if (this.monthSettledTimeout) {
      clearTimeout(this.monthSettledTimeout);
      this.monthSettledTimeout = null;
    }

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }


    //   // this flag will force a settle event to be dispatched
    //   this.forceSettledDispatchForMoment = null;

    //   this.firstCallbackSkipped = null;
    //   this.viewabilityConfig = null;
    //   this.rebasePromise = null;
    //   this.isCurrentlyBeingRebased = null;
    this.lastMonthStrDispatched = null;

    // this will keep a timestamp (milis) of the last time the user tapped on the scroll view
    this.timestampOfLastInteraction = null;

    // this will keep a map of timestamps and wether they have caused a dispatch or not
    // this.dispatchMap = null;

    // the last moment we dispatched on began
    // this.lastDispatchedCbMoment = null;

    // the last moment we dispatched on settle
    // this.lastDispatchedCbMomentSettled = null;

  //   this.curVisible = null;
  }


  // Data

  // getMomRangeArrayForMonth(currentMonth, nextProps) {
  //   const curMonth = currentMonth || moment();
  //   if (this.props.scrollEnabled) {
  //     const res = [];
  //     for (let i = -EXTRA_MINICALS_PER_SIDE;
  //       i <= EXTRA_MINICALS_PER_SIDE;
  //       i += 1) {
  //       const miniCalMonthMoment = curMonth.clone().add(i, 'month');
  //       res.push(this.formMinicalObjectForMom(miniCalMonthMoment, nextProps));
  //     }
  //     return res;
  //   }

  //   const miniCalMonthMoment = curMonth.clone();
  //   return [this.formMinicalObjectForMom(miniCalMonthMoment, nextProps)];
  // }


  // getScrollClearance() {
  //   return (this.rebasePromise == null) ? true : this.rebasePromise;
  // }


  // formMinicalObjectForMom(curMom, propsToUse) {
  //   // we only want to mark the day as selected if we're on the same month
  //   const isSelected = curMom.isSame(propsToUse.curSelectedCalDay, 'month') ?
  //     propsToUse.curSelectedCalDay
  //     : null;

  //   const minicalDataForMonth = propsToUse.miniCalData.getIn([
  //     curMom.format(TimeFormats.MINICAL_KEY_FORMAT),
  //     'data']);
  //   return Map({
  //     moment: curMom,
  //     data: minicalDataForMonth,
  //     isSelected,
  //     // isBuildingMinicalData: nextProps.isBuildingMinicalData,
  //     // isFetchingAvailableDates: nextProps.isFetchingAvailableDates,
  //   });
  // }

  // rebaseMonthRangeArrayForIndex(newIndex) {
  //   if (this.props.scrollEnabled && newIndex !== EXTRA_MINICALS_PER_SIDE) {
  //     const res = this.state.calendarMonths;

  //     if (newIndex > EXTRA_MINICALS_PER_SIDE) { // if the new index is after the center item
  //       // get the index cnt difference from the center;
  //       const diffFromCenterItem = newIndex - EXTRA_MINICALS_PER_SIDE;

  //       // get the last element iterator of our results array
  //       const lastElementIter = res.length - 1;

  //       // get the moment of the last element
  //       const lastElementMoment = res[lastElementIter].get('moment');


  //       for (let i = 1; i <= diffFromCenterItem; i += 1) {
  //         // add one month from the moment of the last element
  //         const miniCalMonthMoment = lastElementMoment.clone().add(i, 'month');

  //         // delete the first item of the array
  //         res.shift();

  //         // and push the new minical obj to the end of the array
  //         res.push(this.formMinicalObjectForMom(miniCalMonthMoment, this.props));
  //       }
  //     } else if (newIndex < EXTRA_MINICALS_PER_SIDE) {
  //       // else if the new index is before the center item

  //       // get the index cnt difference from the center;
  //       const diffFromCenterItem = EXTRA_MINICALS_PER_SIDE - newIndex;

  //       // get the first element iterator of our results array
  //       const firstElementIter = 0;

  //       // get the moment of the first element
  //       const firstElementMoment = res[firstElementIter].get('moment');


  //       for (let i = 1; i <= diffFromCenterItem; i += 1) {
  //         // subtract one month from the moment of the first element
  //         const miniCalMonthMoment = firstElementMoment.clone().subtract(i, 'month');

  //         // delete the first item of the array
  //         res.pop();

  //         // push it to the beggining of the array
  //         res.unshift(this.formMinicalObjectForMom(miniCalMonthMoment, this.props));
  //       }
  //     }

  //     return res;
  //   }
  //   // else
  //   // if the new index is already the center item
  //   // or the minical is non scrollable
  //   // just return the current array
  //   return this.state.calendarMonths;
  // }

  // shouldDispatchNewMonthStr(newMonthStr) {
  //   const curTimeStamp = new Date().getTime();
  //   if (this.timestampOfLastInteraction != null
  //     && curTimeStamp > this.timestampOfLastInteraction // don't enter if that event is older than the latest
  //     && this.dispatchMap[this.timestampOfLastInteraction] !== true  // only enter if we haven't dispatched an event for that timestamp
  //     && newMonthStr !== this.lastMonthStrDispatched) { // only enter if we haven't already dispatched an event for that month
  //     this.lastMonthStrDispatched = newMonthStr;
  //     this.dispatchMap[this.timestampOfLastInteraction] = true;
  //     // console.log(`@@ dispatching ${newMonthStr} str that took place at: ${curTimeStamp} - settled? ${settled}`);
  //     return true;
  //   }
  //   return false;
  // }

  // updateCalMonthsIfNeeded(nextProps) {
  //   const newCurSelDay = (
  //     nextProps.curSelectedCalDay != null
  //     &&
  //     (
  //       (this.props.curSelectedCalDay != null && nextProps.curSelectedCalDay.format() !== this.props.curSelectedCalDay.format())
  //       ||
  //       this.props.curSelectedCalDay == null
  //     )
  //   );
  //   const calMonthsShouldpdate = (
  //     // (nextProps.isFetchingAvailableDates !== this.props.isFetchingAvailableDates)
  //     // ||
  //     // (nextProps.isBuildingMinicalData !== this.props.isBuildingMinicalData)
  //     // ||
  //     newCurSelDay
  //     ||
  //     (nextProps.miniCalData !== this.props.miniCalData)
  //   );

  //   if (calMonthsShouldpdate === true) {
  //     let { calendarMonths } = this.state;
  //     if (newCurSelDay) {
  //       calendarMonths = this.updateMomRangeArrayIsCurSelDay(nextProps, calendarMonths);
  //     }

  //     if (nextProps.miniCalData && nextProps.miniCalData !== this.props.miniCalData) {
  //       calendarMonths = this.updateMomRangeArrayData(nextProps, calendarMonths);
  //     }

  //     this.setState({
  //       calendarMonths,
  //     });
  //   }
  // }

  // updateMomRangeArrayIsCurSelDay(nextProps, calMonths) {
  //   if (calMonths) {
  //     const newCalMonthsArray = calMonths;
  //     if (nextProps.scrollEnabled) {
  //       for (let i = 0, len = calMonths.length; i < len; i += 1) {
  //         const curMonthMap = calMonths[i]; // get the cur month of the iteration
  //         const curMonthMom = curMonthMap.get('moment');

  //         // we only want to mark the day as selected if we're on the same month
  //         const isSelected = curMonthMom.isSame(nextProps.curSelectedCalDay, 'month') ?
  //           nextProps.curSelectedCalDay
  //           : null;
  //         newCalMonthsArray[i] = curMonthMap.set('isSelected', isSelected);
  //       }
  //     } else {
  //       const curMonthMap = calMonths[0]; // get the cur month of the iteration
  //       const curMonthMom = curMonthMap.get('moment');

  //       // we only want to mark the day as selected if we're on the same month
  //       const isSelected = curMonthMom.isSame(nextProps.curSelectedCalDay, 'month') ?
  //         nextProps.curSelectedCalDay
  //         : null;
  //       newCalMonthsArray[0] = curMonthMap.set('isSelected', isSelected);
  //     }
  //     return newCalMonthsArray;
  //   }
  //   return calMonths;
  // }


  // updateMomRangeArrayIsFetchingFlags(nextProps, calMonths) {
  //   if (calMonths) {
  //     const newCalMonthsArray = calMonths;
  //     if (nextProps.scrollEnabled) {
  //       for (let i = 0, len = calMonths.length; i < len; i += 1) {
  //         const curMonthMap = calMonths[i]; // get the cur month of the iteration

  //         newCalMonthsArray[i] = curMonthMap
  //           .set('isBuildingMinicalData', nextProps.isBuildingMinicalData)
  //           .set('isFetchingAvailableDates', nextProps.isFetchingAvailableDates);
  //       }
  //     } else {
  //       const curMonthMap = calMonths[0]; // get the cur month of the iteration
  //       newCalMonthsArray[0] = curMonthMap
  //         .set('isBuildingMinicalData', nextProps.isBuildingMinicalData)
  //         .set('isFetchingAvailableDates', nextProps.isFetchingAvailableDates);
  //     }
  //     return newCalMonthsArray;
  //   }
  //   return calMonths;
  // }


  // updateMomRangeArrayData(nextProps, calMonths) {
  //   if (calMonths) {
  //     const newCalMonthsArray = calMonths;
  //     if (nextProps.scrollEnabled) {
  //       for (let i = 0, len = calMonths.length; i < len; i += 1) {
  //         const curMonthMap = calMonths[i]; // get the cur month of the iteration

  //         // get a reference to it's moment
  //         const curMonthMom = curMonthMap.get('moment');

  //         const minicalDataForMonth = nextProps.miniCalData.getIn([
  //           curMonthMom.format(TimeFormats.MINICAL_KEY_FORMAT),
  //           'data']);
  //         newCalMonthsArray[i] = curMonthMap.set('data', minicalDataForMonth);
  //       }
  //     } else {
  //       const curMonthMom = calMonths[0].get('moment');
  //       newCalMonthsArray[0] = calMonths[0].set(
  //         'data',
  //         nextProps.miniCalData.getIn([
  //           curMonthMom.format(TimeFormats.MINICAL_KEY_FORMAT),
  //           'data',
  //         ]),
  //       );
  //     }
  //     return newCalMonthsArray;
  //   }
  //   return calMonths;
  // }


  // // minical UI


  // rebaseMinicalToMoment(toMoment, animate = false) {
  //   const monthsRange = this.getMomRangeArrayForMonth(toMoment, this.props);
  //   return this.rebaseMinical(monthsRange, animate);
  // }

  // rebaseMinicalToIndex(newIndex, animate = false) {
  //   this.isCurrentlyBeingRebased = true;
  //   const monthsRange = this.rebaseMonthRangeArrayForIndex(newIndex);
  //   return this.rebaseMinical(monthsRange, animate);
  // }

  calculateItemSize() {
    const {
      getBtnHeight,
      h,
      w,
    } = this.props;

    // calculate item height
    const btnHeight = getBtnHeight() * 0.80;
    let itemHeight = h * 0.045;
    itemHeight = itemHeight > btnHeight ? itemHeight : btnHeight;

    const itemWidth = w * DAY_ITEM_WIDTH;
    const totalMarginAvailable = (w - (itemWidth * 7));
    /* itemMargin
      The margin below is the total unocupied space / 8 spaces between day items * 0.5
      (0.5 because every element will have half margin on one side half on the other)
    */
    let itemMargin = ((totalMarginAvailable / w) / 16) * w;

    if (h <= 320) {
      itemMargin *= 0.8;
    }

    return {
      itemHeight,
      itemWidth,
      itemMargin,
    };
  }

  calculateMinicalHeight(weekCnt = 6, propsToUse) {
    const {
      itemHeight,
      itemMargin,
    } = this.calculateItemSize();

    const {
      h,
      showMonthTitles,
    } = propsToUse;

    // calculate the month (text) title size
    // it's equivalent to the margin height (0.009) plus the actual height (estimate)
    const monthTitleSize = showMonthTitles ? ((h * 0.009) + (h * 0.02)) : 0;

    // calculate the total minical height
    /* it's equivalent to the
      month title size
      +
      number of weeks * (item height + vertical margin of each item)
      (weekCnt + 1 because we also have 1 line of day titles)
    */
    return (monthTitleSize + ((itemHeight + (2 * itemMargin)) * (weekCnt + 1)));
  }

  dispatchMinicalMonth(newMoment) {
    if (this.props.onMonthChanged) {
      const newMonthStr = getMinicalMonthStr(newMoment);
      if (newMonthStr !== this.lastMonthStrDispatched) { // only enter if we haven't already dispatched an event for that month
        this.props.onMonthChanged(newMoment, newMonthStr);
        this.lastMonthStrDispatched = newMonthStr;
      }
    }
  }

  indexToDate(index) {
    const data = this.dataProvider.getDataForIndex(index);
    if (data && data.date) {
      return data.date;
    }
    return null;
  }

  scrollToMoment(momentToScrollTo, animated = true) {
    if (momentToScrollTo) { // if we were given a new moment
      const currentDate = this.indexToDate(this.curVisibleIndex);
      if (currentDate) {
        let monthDiff = momentToScrollTo.diff(createMomFromDateKeepingSameTz(currentDate), 'months', true);
        if (monthDiff >= 0) {
          monthDiff = Math.ceil(monthDiff);
        } else {
          monthDiff = Math.floor(monthDiff);
        }
        this.scrollToIndex(this.curVisibleIndex + monthDiff,
          animated);  // navigate minical to the next month
      }
    }
  }

  scrollToInitialMonth(animated = false) {
    this.scrollToIndex(this.minicalModelGenerator.getCurrentDateIndex(), animated);  // navigate minical to the current month
  }

  scrollToFutureMonth(monthsToScroll = 1, animated = false) {
    this.scrollToIndex(this.curVisibleIndex + monthsToScroll,
      animated);  // navigate minical to the next month
  }

  scrollToPastMonth(monthsToScroll = 1, animated = false) {
    this.scrollToIndex(this.curVisibleIndex - monthsToScroll,
      animated); // navigate minical to the previous month
  }


  scrollToOffset(offset, animated, delay) {
    if (delay != null) {
      this.scrollTimer = setTimeout(() => {
        if (this.recyclerRef) {
          this.recyclerRef.scrollToOffset({
            animated: false,
            offset,
          });
        }
      }, delay);
    } else if (this.recyclerRef) {
      this.recyclerRef.scrollToOffset({
        animated,
        offset,
      });
    }
  }

  scrollToIndex(index, animate) {
    // Scrolling a pixel more to avoid triggering incorrect scroll. Not using scrollToIndex directly for
    // the same reason
    if (this.recyclerRef) {
      this.recyclerRef.scrollToIndex(index, animate);
    }
  }

// Since we only have one type of view, returning it directly
rowRenderer = (type, { date }/* , index */) => {
  const {
    miniCalData,
    showMonthTitles,
    onCalendarDayTap,
    h,
    w,
    mode,
    curSelectedCalDay,
    isFetchingAvailableDates,
    isBuildingMinicalData,
  } = this.props;

  // const events = this.props.eventsList[date.getTime()];
  const miniCalMonthMoment = createMomFromDateKeepingSameTz(date);
  let thatMonth;
  let dayData;
  let monthKey;
  let thatYear;
  let curSelectedCalDayMom;

  if (miniCalMonthMoment) {
    monthKey = miniCalMonthMoment.format(TimeFormats.MINICAL_KEY_FORMAT);
    thatMonth = miniCalMonthMoment.month();
    thatYear = miniCalMonthMoment.year();
    curSelectedCalDayMom  =
      miniCalMonthMoment.isSame(curSelectedCalDay, 'month') ?
        curSelectedCalDay
        :
        null;
  }
  if (miniCalData) {
    dayData = miniCalData.getIn([monthKey, 'data']);
  }


  return (<MiniCalendar
    key={monthKey}
    mode={mode}
    monthData={dayData}
    weekTitleArr={this.state.weekTitleArr}
    month={thatMonth}
    year={thatYear}
    showMonthTitle={showMonthTitles}
    curSelectedCalDay={curSelectedCalDayMom}
    onCalendarDayTap={onCalendarDayTap}
    w={w}
    h={h}
    itemSize={this.calculateItemSize()}
    isLoading={isFetchingAvailableDates || isBuildingMinicalData}
  />);
};

// RecyclerListView provides a visible indexes changed callback
handleVisibleIndexChanges = (all/* , now */) => {
  const relevantIndex = Math.floor(all.length / 2);
  // console.log(`#### all.length: ${all.length} relevant index: ${relevantIndex}`)
  this.curVisibleIndex = all[relevantIndex];
  const data = this.dataProvider.getDataForIndex(this.curVisibleIndex);
  const dateMom = data && data.date ? createMomFromDateKeepingSameTz(data.date) : null;
  // console.log(`@@@@@@ now:${now} --> curVisibleIndex: ${all[relevantIndex]} = ${dateMom.format(TimeFormats.MINICAL_KEY_FORMAT)}, all ${all}`)
  this.dispatchMinicalMonth(dateMom);

  // const newMonth = CalenderHelper.getMonthName(data.date);
  // const yearText = new Date().getFullYear() !== data.date.getFullYear() ? `, ${data.date.getFullYear()}` : '';

  // // if moth has changed updating the text on overlay
  // if (newMonth !== this.state.monthName) {
  //   this.setState({ monthName: newMonth + yearText });
  // }
};


// Hiding the overlay using animation after scroll ends even the momentum one.
// Will only be hiding overlay 300ms after the end, if the user scroll again in the meanwhile this will get cancelled
handleScrollEnd = () => {
  this.isScrolling = false;
  // setTimeout(() => {
  //   if (!this.isScrolling) {
  // Skipping snap scrolling for now
  // const distanceFromSnapInterval = Math.ceil(this.lastYOffset) % Math.ceil(cellSideLength);
  // if (distanceFromSnapInterval > 0) {
  //     if (this.lastScrollDirection === "UP") {
  //         this.recyclerRef.scrollToOffset(0, Math.ceil(this.lastYOffset) + Math.ceil(cellSideLength) - distanceFromSnapInterval, true);
  //     }
  //     else {
  //         this.recyclerRef.scrollToOffset(0, Math.ceil(this.lastYOffset) -  distanceFromSnapInterval, true);
  //     }
  //     return;
  // }
  //   }
  // }, 300);
};

// Showing month overlay using animation, also using a boolean to track scrolling
handleScrollStart = () => {
  if (!this.isScrolling) {
    this.isScrolling = true;
  }
  // when the user first tapped their finger from the minical
  this.timestampOfLastInteraction = new Date().getTime(); // get the timestamp
};

renderSpinner(shouldAnimate, containerStyle) {
  return (
    <View
      style={[{
          bottom: null,
          top: this.props.h * 0.18,
          position: 'absolute',
          width: this.props.w,
        },
        containerStyle,
      ]}
    >
      <ActivityIndicator
        animating={shouldAnimate}
        color={Colors.primaryHighColor}
        size="large"
      />
    </View>
  );
}

renderBarSpinner(shouldAnimate) {
  return null;
}

render() {
  // const MONTHS = this.state.calendarMonths;
  // console.log(`MONTHS ${JSON.stringify(MONTHS)}`);
  const {
    orientation,
    w,
    h,
    scrollEnabled,
    isBuildingMinicalData,
    style,
    renderLineBelowMinical,
    slidesIn,
    visible,
    removeViewOnCollapse,
    shouldRenderMinical,
    shouldShowSpinners,
    isFetchingAppointments,
    isFetchingAvailableDates,
  } = this.props;

  // const curHeight = orientation !== Orientation.PORTRAIT ?
  //   this.minicalHeightLandscape
  //   :
  //   this.minicalHeightPortrait;

  console.log(`\n@@@@@@@@ cur height: ${this.state.curHeight}, cur width: ${this.state.curWidth}`)
  const minicalManager = (
    <View
      style={[
        {
          // backgroundColor: '#f7f7f7',
          minHeight: this.state.curHeight,
          width: this.state.curWidth,
          backgroundColor: Colors.cardBackgroundColor,
        },
          style,
          renderLineBelowMinical && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: '#192637',
          },
        ]}
    >
      {this.renderBarSpinner(
        shouldShowSpinners
        &&
          (
            isFetchingAppointments === true
            || isBuildingMinicalData === true
            || isFetchingAvailableDates === true
        ),
      )}
      <RecyclerListView
        isHorizontal
        layoutProvider={this.layoutProvider}
        dataProvider={this.state.monthsLayoutData}
        rowRenderer={this.rowRenderer}
        ref={(ref) => {
          this.recyclerRef = ref;
        }}
        style={{
          flex: 1,
        }}
        scrollEnabled={
          scrollEnabled
          &&
          isBuildingMinicalData === false
        }
        horizontal
        pageSize={1}
        pagingEnabled
        renderAheadOffset={300}
        initialRenderIndex={this.minicalModelGenerator.getCurrentDateIndex()}
        showsVerticalScrollIndicator={false}
        onVisibleIndexesChanged={this.handleVisibleIndexChanges}
        onScrollBeginDrag={this.handleScrollStart}
        onScrollEndDrag={this.handleScrollEnd}
        onMomentumScrollBegin={this.handleScrollStart}
        onMomentumScrollEnd={this.handleScrollEnd}
      />

    </View>
  );
  const AnimatedElement = slidesIn ? Slidable : Collapsible;
  return (
    <AnimatedElement
      isLoading={isBuildingMinicalData}
      collapsed={!visible}
      removeViewOnCollapse={removeViewOnCollapse}
      h={h}
      w={w}
      minHeight={this.state.curHeight}
      style={{
        backgroundColor: Colors.cardBackgroundColor,
      }}
    >
      {shouldRenderMinical ?
          minicalManager
          :
          this.renderSpinner(!shouldRenderMinical, {
            bottom: null,
            top: null,
            position: null,
            width: w,
            backgroundColor: Colors.cardBackgroundColor,
            height: h * 0.39,
            justifyContent: 'center',
          })
        }
    </AnimatedElement>
  );
}
}

MiniCalendarManager.defaultProps = {
  renderLineBelowMinical: false,
  visible: false,
  slidesIn: false,
  scrollEnabled: true,
  showMonthTitles: false,
  isFetchingAppointments: false,
  shouldRenderMinical: true,
  removeViewOnCollapse: false,
  shouldShowSpinners: false,
};

MiniCalendarManager.propTypes = {
  shouldRenderMinical: PropTypes.bool,
  slidesIn: PropTypes.bool,
  shouldShowSpinners: PropTypes.bool,
  renderLineBelowMinical: PropTypes.bool,
  removeViewOnCollapse: PropTypes.bool,
  mode: PropTypes.oneOf(['overview', 'schedule']),
  isFetchingAvailableDates: PropTypes.bool,
  isBuildingMinicalData: PropTypes.bool.isRequired,
  isFetchingAppointments: PropTypes.bool,
  h: PropTypes.number.isRequired,
  w: PropTypes.number.isRequired,
  orientation: PropTypes.string.isRequired,
  showMonthTitles: PropTypes.bool,
  firstDayOfWeek: PropTypes.oneOf([FirstDayOfWeek.SUNDAY, FirstDayOfWeek.MONDAY]),
  scrollEnabled: PropTypes.bool,
  visible: PropTypes.bool,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
  miniCalData: PropTypes.oneOfType([
    // PropTypes.object,
    // PropTypes.array,
    PropTypes.instanceOf(Map),
  ]),
  startScrolledToMom: PropTypes.instanceOf(moment),
  curSelectedCalDay: PropTypes.instanceOf(moment),
  getBtnHeight: PropTypes.func.isRequired,
  onCalendarDayTap: PropTypes.func.isRequired,
  // onMinicalMonthSettled: PropTypes.func,
  // onMinicalRebase: PropTypes.func,
  // onSwipeToPreviousMonthBegan: PropTypes.func,
  // onSwipeToNextMonthBegan: PropTypes.func,
  onMonthChanged: PropTypes.func,
};
export default MiniCalendarManager;
