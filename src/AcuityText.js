/**
 * # AcuityText.js
 */


import React from 'react';
import PropTypes from 'prop-types';
import { Text, View, TouchableHighlight } from 'react-native';
import _ from 'underscore';

const BUTTON_THROTTLE_DURATION = 200;
const Colors = {
  primaryHighColor: '#3177CA',
}



class AcuityText extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onTextPressThrottledTap = _.throttle(
      this.onTextPressThrottledTap.bind(this),
      BUTTON_THROTTLE_DURATION,
    );
    this.state = {
      currentlyTouched: false,
    };
  }

  componentWillUnmount() {
    this.root = null;
  }

  onTextPressThrottledTap() {
    if (this.props.onPress) {
      this.props.onPress();
    }
  }

  setNativeProps(nativeProps) {
    if (this.root) {
      this.root.setNativeProps(nativeProps);
    }
  }

  render() {
    // console.log(`children: ${this.props.children}`);
    let ParView;
    let onShowOverlayCb = null;
    let onHideUnderlay = null;
    if (this.props.onPress != null) {
      ParView = TouchableHighlight;
      onShowOverlayCb = () => {
        this.setState({ currentlyTouched: true });
      };
      onHideUnderlay = () => {
        this.setState({ currentlyTouched: false });
      };
    } else {
      ParView = View;
    }

    return (
      <ParView
        onShowUnderlay={onShowOverlayCb}
        onHideUnderlay={onHideUnderlay}
        underlayColor={this.props.highlightBgColor}
        style={this.props.style}
        onPress={this.onTextPressThrottledTap}
        disabled={this.props.btnDisabled}
        onLayout={this.props.onLayout}
        ref={(c) => { this.root = c; }}
      >
        <Text
          {...this.props.textProps}
          allowFontScaling={this.props.allowFontScaling}
          style={[
            this.props.textStyle,
            this.state.currentlyTouched === true ? { color: this.props.highlightTextColor } : {},
          ]}
        >
          {this.props.children}
        </Text>
      </ParView>);
  }
}

AcuityText.defaultProps = {
  highlightTextColor: 'white',
  highlightBgColor: Colors.primaryHighColor,
  btnDisabled: false,
};
AcuityText.propTypes = {
  onPress: PropTypes.func,
  btnDisabled: PropTypes.bool,
  allowFontScaling: PropTypes.bool,
  onLayout: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.number,
  ]),
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
  highlightTextColor: PropTypes.string,
  highlightBgColor: PropTypes.string,
  textProps: PropTypes.object,
  textStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
};
export default AcuityText;
