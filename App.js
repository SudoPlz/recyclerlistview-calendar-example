/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { fromJS } from 'immutable';
import moment from 'moment';

import MiniCalendarManager from './src/MiniCalendarManager';
import LocaleAndTime from './src/LocaleFactory';
import Orientation from 'react-native-orientation';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const MIN_BTN_HEIGHT = 37.5;
const TimeFormats = {
  MINICAL_KEY_FORMAT: 'MMMM_YYYY',
  // BACKEND_DATETIME_NO_TZ: 'YYYY-MM-DDTHH:mm:ss',
  // BACKEND_DATETIME: 'YYYY-MM-DDTHH:mm:ssZZ',
}
const FirstDayOfWeek = {
  SUNDAY: 0,
  MONDAY: 1,
};

function getBtnHeight(height) {
  let btnHeight = height || screenHeight * 0.065;
  btnHeight = btnHeight < MIN_BTN_HEIGHT ? btnHeight : MIN_BTN_HEIGHT;
  return btnHeight;
}

const initCalData = {};
for (let i = -5; i <= 5; i += 1) {
  createMonthData(moment().add(i, 'months'));
}
function createMonthData(monthMom) {
  initCalData[monthMom.format(TimeFormats.MINICAL_KEY_FORMAT)] =
  {
    data: LocaleAndTime.createCalendarArray(),
    weekType: FirstDayOfWeek.SUNDAY,
  };
}


type Props = {};

function updateScreenSizesByOrientation(sizes, isPortrait) {
  const screenSizes = {};
  if (sizes.h > sizes.w) {
    screenSizes.h = isPortrait === true ? sizes.h : sizes.w;
    screenSizes.w = isPortrait === true ? sizes.w : sizes.h;
  } else {
    screenSizes.h = isPortrait === true ? sizes.w : sizes.h;
    screenSizes.w = isPortrait === true ? sizes.h : sizes.w;
  }
  return screenSizes;
}

export default class App extends Component<Props> {
  constructor(props) {
    super(props);
  
    this.state = {
      w: screenWidth,
      h: screenHeight,
      orientation: Orientation.getInitialOrientation(),
      monthTitle: '',
    };
    Orientation.addOrientationListener((orientation) => {
      console.log(`new orientation: ${orientation}`)
      this.onOrientationChange(orientation);
    });
  }

  onOrientationChange(orientation) {
    console.log(`scr w:h: ${screenWidth} ${screenHeight}`);
    const newSizes = updateScreenSizesByOrientation(
        { w: screenWidth, h: screenHeight },
        (orientation !== 'LANDSCAPE'),
      );
    console.log(`new sizes: ${JSON.stringify(newSizes)}`);
    this.setState({
      w: newSizes.w,
      h: newSizes.h,
      orientation,
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{
          fontSize: 32,
          color: 'white',
        }}>
          {this.state.monthTitle}
        </Text>
        <MiniCalendarManager
          showMonthTitles
          removeViewOnCollapse={false}
          renderLineBelowMinical
          visible
          shouldRenderMinical
          isBuildingMinicalData={false}
          isFetchingAppointments={false}
          curSelectedCalDay={moment()}
          miniCalData={fromJS(initCalData)}
          onCalendarDayTap={(dayMom) => {
            console.log(`tapped on day: ${dayMom.format('DD/MM/YY')}`);
          }}
          firstDayOfWeek={0}
          w={this.state.w}
          h={this.state.h}
          orientation={this.state.orientation}
          getBtnHeight={getBtnHeight}
          onMonthChanged={(newMonth) => {
            console.log(`new month: ${newMonth.format('MMMM YY')}`);
            this.setState({
              monthTitle: newMonth.format('MMMM YY'),
            })
          }}
        />
        <Text style={{
          fontSize: 17,
          color: 'white',
        }}>
          Try changing the device orientation and then scroll
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
