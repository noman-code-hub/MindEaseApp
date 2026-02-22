import {
  Dimensions,
  PixelRatio,
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

type RNStyle = ViewStyle | TextStyle | ImageStyle;
type NamedStyles<T> = { [P in keyof T]: RNStyle };

const FONT_KEYS = new Set(['fontSize', 'lineHeight', 'letterSpacing']);
const HORIZONTAL_KEYS = new Set([
  'width',
  'minWidth',
  'maxWidth',
  'left',
  'right',
  'marginLeft',
  'marginRight',
  'paddingLeft',
  'paddingRight',
  'paddingHorizontal',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
]);
const VERTICAL_KEYS = new Set([
  'height',
  'minHeight',
  'maxHeight',
  'top',
  'bottom',
  'marginTop',
  'marginBottom',
  'paddingTop',
  'paddingBottom',
  'paddingVertical',
]);
const MODERATE_KEYS = new Set([
  'margin',
  'marginHorizontal',
  'marginVertical',
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'borderRadius',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'gap',
  'rowGap',
  'columnGap',
]);
const NON_SCALABLE_KEYS = new Set([
  'flex',
  'flexGrow',
  'flexShrink',
  'zIndex',
  'opacity',
  'elevation',
  'fontWeight',
  'aspectRatio',
]);

const getWindowMetrics = () => {
  const { width, height } = Dimensions.get('window');
  return {
    width,
    height,
    shortSide: Math.min(width, height),
    longSide: Math.max(width, height),
  };
};

export const vw = (value: number) => (getWindowMetrics().width * value) / 100;
export const vh = (value: number) => (getWindowMetrics().height * value) / 100;

export const scale = (size: number) => (getWindowMetrics().shortSide / BASE_WIDTH) * size;
export const verticalScale = (size: number) =>
  (getWindowMetrics().longSide / BASE_HEIGHT) * size;

export const moderateScale = (size: number, factor = 0.45) =>
  size + (scale(size) - size) * factor;

export const rf = (size: number) => PixelRatio.roundToNearestPixel(moderateScale(size, 0.35));

export const isSmallDevice = () => getWindowMetrics().shortSide <= 360;
export const isTablet = () => getWindowMetrics().shortSide >= 768;

const scaleTransformValue = (key: string, value: number) => {
  if (key === 'translateX' || key === 'skewX') {
    return moderateScale(value, 0.5);
  }

  if (key === 'translateY' || key === 'skewY') {
    return moderateScale(value, 0.5);
  }

  if (key === 'scale' || key === 'scaleX' || key === 'scaleY' || key === 'rotate') {
    return value;
  }

  return moderateScale(value, 0.5);
};

const scaleNumericByKey = (key: string, value: number) => {
  if (!Number.isFinite(value) || value === 0 || NON_SCALABLE_KEYS.has(key)) {
    return value;
  }

  if (FONT_KEYS.has(key)) {
    return rf(value);
  }

  if (HORIZONTAL_KEYS.has(key)) {
    return moderateScale(value, 0.5);
  }

  if (VERTICAL_KEYS.has(key)) {
    return moderateScale(value, 0.5);
  }

  if (MODERATE_KEYS.has(key) || key.startsWith('margin') || key.startsWith('padding')) {
    return moderateScale(value, 0.5);
  }

  if (key.endsWith('Radius')) {
    return moderateScale(value, 0.5);
  }

  return value;
};

const scaleStyleValue = (key: string, value: unknown): unknown => {
  if (typeof value === 'number') {
    return scaleNumericByKey(key, value);
  }

  if (Array.isArray(value)) {
    if (key === 'transform') {
      return value.map((item) => {
        if (!item || typeof item !== 'object') {
          return item;
        }

        const nextTransform: Record<string, unknown> = {};
        Object.entries(item as Record<string, unknown>).forEach(([transformKey, transformValue]) => {
          if (typeof transformValue === 'number') {
            nextTransform[transformKey] = scaleTransformValue(transformKey, transformValue);
          } else {
            nextTransform[transformKey] = transformValue;
          }
        });
        return nextTransform;
      });
    }

    return value.map((item) => scaleStyleValue(key, item));
  }

  if (value && typeof value === 'object') {
    if (key === 'shadowOffset') {
      const shadowOffset = value as Record<string, unknown>;
      return {
        width:
          typeof shadowOffset.width === 'number'
            ? moderateScale(shadowOffset.width, 0.5)
            : shadowOffset.width,
        height:
          typeof shadowOffset.height === 'number'
            ? moderateScale(shadowOffset.height, 0.5)
            : shadowOffset.height,
      };
    }

    const scaledObject: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([nestedKey, nestedValue]) => {
      scaledObject[nestedKey] = scaleStyleValue(nestedKey, nestedValue);
    });
    return scaledObject;
  }

  return value;
};

const scaleNamedStyles = <T extends NamedStyles<T>>(styles: T): T => {
  const scaledStyles: Record<string, unknown> = {};

  Object.entries(styles).forEach(([styleName, styleDefinition]) => {
    scaledStyles[styleName] = scaleStyleValue(styleName, styleDefinition);
  });

  return scaledStyles as T;
};

export const createResponsiveStyles = <T extends NamedStyles<T>>(styles: T): T =>
  StyleSheet.create(scaleNamedStyles(styles));
