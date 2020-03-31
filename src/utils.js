import convert from 'color-convert';

export function roundPercent(x) {
  return Math.round(x * 1000) / 10;
}

export function clampPercent(x) {
  return Math.max(0, Math.min(x, 100));
}

export function hex2hsv(hex) {
  const [h, s, v] = convert.hex.hsv.raw(hex).map((x) => Math.round(x * 10) / 10);
  return { h, s, v };
}

export function hsv2hex({ h, s, v }) {
  return '#' + convert.hsv.hex([h, s, v]);
}

export function relativeLuminance({ h, s, v }) {
  const [R, G, B] = convert.hsv.rgb.raw([h, s, v]).map((x) => {
    x /= 255;

    if (x <= 0.03928) {
      return x / 12.92;
    }

    return ((x + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getLuminanceFromRatio(ratio, otherLuminance) {
  const l1 = ratio * (otherLuminance + 0.05) - 0.05;
  const l2 = (otherLuminance + 0.05) / ratio - 0.05;

  if (l1 <= 1) {
    return l1;
  }

  if (l2 > 0) {
    return l2;
  }

  return undefined;
}

export function generateSVGPath(points) {
  if (!points) {
    return '';
  }

  let path = '';
  let lastPointNull = true;

  for (const point of points) {
    if (point[1] === null) {
      lastPointNull = true;
      continue;
    }

    if (lastPointNull) {
      path += ` M ${point[0]} ${point[1]}`;
    } else {
      path += ` L ${point[0]} ${point[1]}`;
    }

    lastPointNull = false;
  }

  return path.trim();
}
