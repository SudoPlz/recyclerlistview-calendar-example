/**
 * # AcuitySlidable.js
 */

import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Animated, Easing } from 'react-native';
const IS_IPHONE_X = false;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2,  /* 2 because we need it to be:
       - above the AcuitySwipeView @ src/components/Main/MainRender:509
       - below the ActionButton @ src/components/Main/MainRender:446
     */

    // justifyContent: 'center',
    // alignItems: 'center',
  },
});


class AcuitySlidable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.isHidden = false;
    this.collapsedYValue = IS_IPHONE_X ? -this.props.h * 2 : -this.props.h;
    this.expandedYValue = this.props.yOffset;
    this.state = {
      // This is the initial position of the subview
      bounceValue: new Animated.Value(props.collapsed ? this.collapsedYValue : this.expandedYValue),
    };
  }

  componentWillMount() {
    this.isHidden = false;
    this.collapsedYValue = IS_IPHONE_X ? -this.props.h * 2 : -this.props.h;
    this.expandedYValue = this.props.yOffset;
  }
  // componentDidMount() {
  // }

  componentWillReceiveProps(nextProps) {
    const newCollapsedValue = nextProps.collapsed;
    if (newCollapsedValue !== this.props.collapsed) {
      if (newCollapsedValue === true) {
        this.collapseSubview();
      } else {
        this.expandSubview();
      }
    }
  }

  componentWillUnmount() {
    this.isHidden = null;
    this.collapsedYValue = null;
    this.expandedYValue = null;
  }

  collapseSubview() {
    this.animateTo(this.collapsedYValue);
    this.isHidden = true;
  }

  expandSubview() {
    this.animateTo(this.expandedYValue);
    this.isHidden = false;
  }

  toggleSubview() {
    let toValue = this.expandedYValue;
    if (this.isHidden === true) {
      toValue = this.collapsedYValue;
    }
    this.animateTo(toValue);
    this.isHidden = !this.isHidden;
  }

  animateTo(y) {
    // This will animate the transalteY of the subview
    // 100 comes from the style below, which is the height of the subview.
    Animated.timing(
      this.state.bounceValue,
      {
        toValue: y,
        duration: 450,
        easing: this.props.easing || Easing.out(Easing.circle),
      },
    ).start();
  }

  render() {
    return (<Animated.View
      ref={this.props.ref}
      onLayout={(event) => {
        const newHeight = event.nativeEvent.layout.height;
        if (newHeight) {
          this.collapsedYValue = IS_IPHONE_X ? -newHeight * 2 : -newHeight;
        }
      }}
      style={[
        styles.container,
        {
          transform: [{ translateY: this.state.bounceValue }],
          backgroundColor:
            this.props.backdrop === true ? this.state.bounceValue.interpolate({
              inputRange: [this.collapsedYValue * 0.6, this.expandedYValue],
              outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)'],
            })
          :
          'transparent',
          height: this.props.backdrop === true ? this.props.h : null,
        },
        this.props.style,
      ]}
    >
      {this.props.children}
    </Animated.View>);
  }
}

// : '#00000055',
AcuitySlidable.defaultProps = {
  collapsed: true,
  backdrop: false,
  yOffset: 0,
};
AcuitySlidable.propTypes = {
  yOffset: PropTypes.number,
  h: PropTypes.number.isRequired,
  // w: PropTypes.number.isRequired,
  collapsed: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
    PropTypes.object,
  ]),
  backdrop: PropTypes.bool,
  easing: PropTypes.string,
  ref: PropTypes.func,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
};
export default AcuitySlidable;
