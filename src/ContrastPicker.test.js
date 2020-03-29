import React from 'react';
import { mount, shallow } from 'enzyme';

import ContrastPicker from './ContrastPicker';

describe('ContrastPicker', function () {
  it('should render with default props', function () {
    const wrapper = shallow(<ContrastPicker />);
    expect(wrapper.is('.rcp-picker')).toBe(true);
    expect(wrapper.find('.rcp-picker__area')).toHaveLength(1);
    expect(wrapper.find('.rcp-picker__hue-slider')).toHaveLength(1);
  });

  it('should render with initial background color', function () {
    const wrapper = mount(<ContrastPicker initialColor="#ff0000" />);
    expect(wrapper.find('.rcp-picker__area').first().prop('style').backgroundColor).toMatch('hsl(0,');
    wrapper.unmount();
  });

  it('should react to hue slider changes', function () {
    const wrapper = mount(<ContrastPicker />);
    const slider = wrapper.find('input[type="range"]').first();

    slider.simulate('change', { target: { value: 180 } });
    expect(wrapper.find('.rcp-picker__area').first().prop('style').backgroundColor).toMatch('hsl(180,');

    slider.simulate('change', { target: { value: 256 } });
    expect(wrapper.find('.rcp-picker__area').first().prop('style').backgroundColor).toMatch('hsl(256,');

    wrapper.unmount();
  });
});
