import React, { Component } from 'react';
import PropTypes from 'prop-types';
import convert from 'color-convert';

import './ContrastPicker.scss';

const hex2hsv = (hex) => {
  const [h, s, v] = convert.hex.hsv(hex);
  return { h, s, v };
};

const hsv2hex = ({ h, s, v }) => {
  return '#' + convert.hsv.hex([h, s, v]);
};

const round = (v) => Math.round(v * 1000) / 10;
const clamp = (v) => Math.max(0, Math.min(v, 100));

class ContrastPicker extends Component {
  constructor(props) {
    super(props);

    const { initialColor } = props;

    this.state = {
      color: hex2hsv(initialColor),
      dragging: false
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleHueChange = this.handleHueChange.bind(this);
  }

  handleMouseDown(event) {
    if (event.button !== 0) {
      return;
    }

    event.persist();

    this.setState({ dragging: true }, () => this.handleMouseMove(event));
  }

  handleMouseUp() {
    this.setState({ dragging: false });
  }

  handleMouseMove(event) {
    if (!this.state.dragging) {
      return;
    }

    const newColor = {
      ...this.state.color,
      s: clamp(round(event.nativeEvent.offsetX / event.target.clientWidth)),
      v: 100 - clamp(round(event.nativeEvent.offsetY / event.target.clientHeight))
    };

    if (this.props.onChange) {
      this.props.onChange(hsv2hex(newColor));
    }

    this.setState({
      color: newColor
    });
  }

  handleHueChange(event) {
    const newColor = {
      ...this.state.color,
      h: event.target.value
    };

    if (this.props.onChange) {
      this.props.onChange(hsv2hex(newColor));
    }

    this.setState({
      color: newColor
    });
  }

  render() {
    const { height } = this.props;
    const { color, dragging } = this.state;

    return (
      <div className="rcp-picker" style={{ height }}>
        <div
          className="rcp-picker__area"
          style={{ backgroundColor: `hsl(${color.h}, 100%, 50%)` }}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
        >
          <div
            className={`rcp-picker__handle ${dragging ? 'rcp-picker__handle--dragging' : ''}`}
            style={{
              top: 100 - color.v + '%',
              left: color.s + '%',
              backgroundColor: hsv2hex(color)
            }}
          />
        </div>
        <input
          className="rcp-picker__hue-slider"
          type="range"
          min="0"
          max="359"
          step="1"
          value={color.h}
          onChange={this.handleHueChange}
        />
      </div>
    );
  }
}

ContrastPicker.propTypes = {
  height: PropTypes.string,
  initialColor: PropTypes.string,
  onChange: PropTypes.func
};

ContrastPicker.defaultProps = {
  initialColor: '#5f7f3f'
};

export default ContrastPicker;
