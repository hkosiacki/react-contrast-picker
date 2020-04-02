import React, { Component } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';

import {
  clampPercent,
  roundPercent,
  hex2hsv,
  hsv2hex,
  relativeLuminance,
  getLuminanceFromRatio,
  generateSVGPath
} from './utils';

import './ContrastPicker.scss';

class ContrastPicker extends Component {
  constructor(props) {
    super(props);

    const { initialColor } = props;

    this.state = {
      color: hex2hsv(initialColor),
      contrastCurves: [],
      dragging: false
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleHueChange = this.handleHueChange.bind(this);

    this.updateContrastCurvesThrottled = throttle(this.updateContrastCurves, 100).bind(this);
  }

  componentDidMount() {
    this.updateContrastCurvesThrottled();
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

    const color = {
      ...this.state.color,
      s: clampPercent(roundPercent(event.nativeEvent.offsetX / event.target.clientWidth)),
      v: 100 - clampPercent(roundPercent(event.nativeEvent.offsetY / event.target.clientHeight))
    };

    this.updateColor(color);
  }

  handleKeyDown(event) {
    const color = { ...this.state.color };
    switch (event.key) {
      case 'ArrowLeft':
        color.s = Math.max(0, color.s - 1);
        break;
      case 'ArrowRight':
        color.s = Math.min(100, color.s + 1);
        break;
      case 'ArrowDown':
        color.v = Math.max(0, color.v - 1);
        break;
      case 'ArrowUp':
        color.v = Math.min(100, color.v + 1);
        break;
      default:
        return;
    }

    this.updateColor(color);
  }

  handleHueChange(event) {
    const color = {
      ...this.state.color,
      h: event.target.value
    };

    this.updateColor(color);

    this.updateContrastCurvesThrottled();
  }

  updateColor(color) {
    if (this.props.onChange) {
      this.props.onChange(hsv2hex(color));
    }

    this.setState({ color });
  }

  updateContrastCurves() {
    const { compareWith, ratio } = this.props;

    if (!Array.isArray(compareWith) || !Number.isFinite(ratio)) {
      return;
    }

    const epsilon = 0.001;
    const { h } = this.state.color;
    const curves = [];

    for (const otherColor of compareWith) {
      const curve = [];
      const otherColorLuminance = relativeLuminance(hex2hsv(otherColor));
      const desiredLuminance = getLuminanceFromRatio(ratio, otherColorLuminance);
      if (desiredLuminance === undefined) {
        continue;
      }

      for (let s = 0; s <= 100; ++s) {
        let v = 0;
        let multiplier = 100;
        let deltaLuminance = desiredLuminance - relativeLuminance({ h, s, v });
        let previousSign = Math.sign(deltaLuminance);

        for (let i = 0; i < 50; ++i) {
          if (Math.abs(deltaLuminance) < epsilon) {
            curve.push([s, 100 - v]);
            break;
          }

          const sign = Math.sign(deltaLuminance);
          if (sign !== previousSign) {
            multiplier /= 2;
            previousSign = sign;
          } else if (v < 0 || v > 100) {
            curve.push([s, null]);
            break;
          }

          v += multiplier * deltaLuminance;
          deltaLuminance = desiredLuminance - relativeLuminance({ h, s, v: clampPercent(v) });
        }
      }

      curves.push(generateSVGPath(curve));
    }

    this.setState({ contrastCurves: curves });
  }

  render() {
    const { height, compareWith = [] } = this.props;
    const { color, contrastCurves, dragging } = this.state;
    const drawCurves = compareWith.length && contrastCurves.length === compareWith.length;

    return (
      <div className="rcp-picker" style={{ height }}>
        <div
          className="rcp-picker__area"
          style={{ backgroundColor: `hsl(${color.h}, 100%, 50%)` }}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove}
        >
          {drawCurves && (
            <svg className="rcp-picker__overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
              {compareWith.map((otherColor, idx) => (
                <path key={otherColor} d={contrastCurves[idx]} vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
          )}
          <div
            className={`rcp-picker__handle ${dragging ? 'rcp-picker__handle--dragging' : ''}`}
            tabIndex="0"
            style={{
              top: 100 - color.v + '%',
              left: color.s + '%',
              backgroundColor: hsv2hex(color),
              color: hsv2hex({ h: 0, s: 0, v: color.v < 80 ? 100 : 0 })
            }}
            onKeyDown={this.handleKeyDown}
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
  compareWith: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.string,
  initialColor: PropTypes.string,
  onChange: PropTypes.func,
  ratio: PropTypes.number
};

ContrastPicker.defaultProps = {
  initialColor: '#5f7f3f',
  ratio: 4.5
};

export default ContrastPicker;
