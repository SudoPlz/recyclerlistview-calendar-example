/**
 * # AcuityCollapsible.js
 */

import Collapsible from 'react-native-collapsible';
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
// import {Colors } from '../../config';


class AcuityCollapsible extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      forceUpdateKey: 1,
    };
  }
  componentWillMount() {
    this.userTappedBeforeLoadingEnded = false;
    this.maxHeightCalculated = false;
  }


  componentDidMount() {
    if (this.userTappedBeforeLoadingEnded === false
      && this.props.isLoading === false) {
      this.maxHeightCalculated = true;
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.maxHeightCalculated === false
    && nextProps.isLoading === true  // if the component is still loading
    && nextProps.collapsed !== this.props.collapsed) {  // and the user expands it
      this.userTappedBeforeLoadingEnded = true; // mark this flag as true
    }

    if (nextProps.isLoading === false // if the component stopped loading
    && this.userTappedBeforeLoadingEnded === true) { // and this flag is true
      this.maxHeightCalculated = true;
      this.setState({
        forceUpdateKey: this.state.forceUpdateKey,  // force the component to redraw
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.isLoading !== this.props.isLoading
      ||
      nextProps.collapsed !== this.props.collapsed
      ||
      nextProps.children !== this.props.children
      ||
      nextProps.header !== this.props.header
      ||
      nextProps.underlayColor !== this.props.underlayColor
      ||
      nextProps.style !== this.props.style
      ||
      nextProps.minHeight !== this.props.minHeight
      ||
      nextState.forceUpdateKey !== this.state.forceUpdateKey
    );
  }

  componentWillUnmount() {
    this.maxHeightCalculated = null;
    this.userTappedBeforeLoadingEnded = null;
  }

  renderRemovableView() {
    const {
      ref,
      header,
      collapsed,
      style,
      children,
      minHeight,
    } = this.props;

    if (collapsed) {
      return null;
    }

    return (<View
      key={this.state.forceUpdateKey}
      ref={ref}
      style={[{
          flexDirection: 'column',
          minHeight,
        },
        style,
      ]}
    >
      {header}
      {children}
    </View>);
  }

  render() {
    const {
      removeViewOnCollapse,
      ref,
      header,
      easing,
      collapsed,
      underlayColor,
      style,
      children,
      minHeight,
    } = this.props;

    if (removeViewOnCollapse) {
      return this.renderRemovableView();
    }

    return (<Collapsible
      key={this.state.forceUpdateKey}
      ref={ref}
      renderHeader={() => header}
      easing={easing}
      collapsed={collapsed}
      underlayColor={underlayColor}
      style={[{
          minHeight,
        },
        style,
      ]}
    >
      {children}
    </Collapsible>);
  }
}


AcuityCollapsible.defaultProps = {
  collapsed: true,
  // children: (<View />),
  isLoading: false,
  removeViewOnCollapse: false,
};
AcuityCollapsible.propTypes = {
  isLoading: PropTypes.bool,
  collapsed: PropTypes.bool,
  removeViewOnCollapse: PropTypes.bool,
  minHeight: PropTypes.number,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
    PropTypes.object,
  ]),
  header: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
    PropTypes.object,
  ]),
  easing: PropTypes.string,
  ref: PropTypes.func,
  underlayColor: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number,
  ]),
};
export default AcuityCollapsible;
