import React, { Component } from 'react';
import PropTypes from 'prop-types';
import convert from 'color-convert';

import './ContrastPicker.scss';

const hex2hsv = (hex) => {
  const [h, s, v] = convert.hex.hsv(hex);
  return { h, s, v };
};

class ContrastPicker extends Component {
  constructor(props) {
    super(props);

    const { initialColor } = props;

    this.state = {
      color: hex2hsv(initialColor)
    };
  }

  handleHueChange(event) {
    this.setState({
      color: {
        ...this.state.color,
        h: event.target.value
      }
    });
  }

  render() {
    const { height } = this.props;
    const { color } = this.state;

    return (
      <div className="rcp-picker" style={{ height }}>
        <div className="rcp-picker__area" style={{ backgroundColor: `hsl(${color.h}, 100%, 50%)` }} />
        <input
          className="rcp-picker__hue-slider"
          type="range"
          min="0"
          max="359"
          step="1"
          value={color.h}
          onChange={(e) => this.handleHueChange(e)}
        />
      </div>
    );
  }
}

ContrastPicker.propTypes = {
  height: PropTypes.string,
  initialColor: PropTypes.string
};

ContrastPicker.defaultProps = {
  initialColor: '#5f7f3f'
};

export default ContrastPicker;
