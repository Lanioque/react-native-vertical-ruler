import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, PanResponder, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  SharedValue,
  withTiming,
  Easing 
} from 'react-native-reanimated';

export interface UnitConfig {
  label: string;
  symbol: string;
  convertTo?: (value: number, targetUnit: UnitConfig) => number;
}

export interface VerticalRulerConfig {
  // Value configuration
  minValue?: number;
  maxValue?: number;
  step?: number;
  
  // Display configuration
  unit?: string;
  units?: UnitConfig[];
  defaultUnitIndex?: number;
  showUnitSwitcher?: boolean;
  title?: string;
  showDate?: boolean;
  dateFormat?: Intl.DateTimeFormatOptions;
  enableButtons?: boolean;
  
  // Ruler configuration
  rulerHeight?: number;
  rulerWidth?: number;
  tickInterval?: number;
  
  // Magnification configuration
  magnificationRadius?: number;
  maxScale?: number;
  enableMagnification?: boolean;
  
  // Styling
  colors?: {
    primary?: string;
    primaryLight?: string;
    accent?: string;
    warning?: string;
    background?: string;
    textPrimary?: string;
    textSecondary?: string;
    white?: string;
  };
  
  spacing?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    xxl?: number;
  };
  
  fontSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  borderRadius?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  // Cursor configuration
  cursorProps?: {
    height?: number;
    width?: string | number;
    marginTop?: number;
    paddingLeft?: number;
    borderRadius?: number;
  };
  
  // Callbacks
  onValueChange?: (value: number) => void;
  onUnitChange?: (unit: UnitConfig, unitIndex: number) => void;
}

export interface VerticalRulerHandle {
  increment: () => void;
  decrement: () => void;
  setValue: (value: number) => void;
  getValue: () => number;
  switchUnit: (index: number) => void;
  getCurrentUnit: () => UnitConfig | string;
}

interface VerticalRulerProps extends VerticalRulerConfig {}

interface TickInfo {
  value: number;
  position: number;
}

const DEFAULT_CONFIG: Required<VerticalRulerConfig> = {
  minValue: 150,
  maxValue: 220,
  step: 1,
  unit: 'cm',
  units: [
    {
      label: 'Centimeters',
      symbol: 'cm',
      convertTo: (value, targetUnit) => {
        if (targetUnit.symbol === 'in') return value / 2.54;
        if (targetUnit.symbol === 'ft') return value / 30.48;
        return value;
      },
    },
    {
      label: 'Inches',
      symbol: 'in',
      convertTo: (value, targetUnit) => {
        if (targetUnit.symbol === 'cm') return value * 2.54;
        if (targetUnit.symbol === 'ft') return value / 12;
        return value;
      },
    },
    {
      label: 'Feet',
      symbol: 'ft',
      convertTo: (value, targetUnit) => {
        if (targetUnit.symbol === 'cm') return value * 30.48;
        if (targetUnit.symbol === 'in') return value * 12;
        return value;
      },
    },
  ],
  defaultUnitIndex: 0,
  showUnitSwitcher: false,
  title: 'Enter Your Height',
  showDate: true,
  dateFormat: { month: 'short', day: '2-digit', year: 'numeric' },
  enableButtons: true,
  rulerHeight: 400,
  rulerWidth: 80,
  tickInterval: 5,
  magnificationRadius: 80,
  maxScale: 1.5,
  enableMagnification: true,
  colors: {
    primary: '#8F917C',
    primaryLight: '#EBDBD3',
    accent: '#D0BEA3',
    warning: '#F59E0B',
    background: '#F5F4F7',
    textPrimary: '#1A1A1A',
    textSecondary: '#8F917C',
    white: '#FFFFFF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
  },
  cursorProps: {
    height: 4,
    width: '100%',
    marginTop: -2,
    paddingLeft: 8,
    borderRadius: 6,
  },
  onValueChange: (() => {}) as any,
  onUnitChange: (() => {}) as any,
};

const VerticalRulerComponent: React.ForwardRefRenderFunction<VerticalRulerHandle, VerticalRulerProps> = (props, ref) => {
  // Merge config with defaults
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    colors: { ...DEFAULT_CONFIG.colors, ...props.colors },
    spacing: { ...DEFAULT_CONFIG.spacing, ...props.spacing },
    fontSize: { ...DEFAULT_CONFIG.fontSize, ...props.fontSize },
    borderRadius: { ...DEFAULT_CONFIG.borderRadius, ...props.borderRadius },
    cursorProps: { ...DEFAULT_CONFIG.cursorProps, ...props.cursorProps },
    ...props,
  }), [props]);

  const {
    minValue,
    maxValue,
    step,
    unit,
    units,
    defaultUnitIndex,
    showUnitSwitcher,
    title,
    showDate,
    dateFormat,
    enableButtons,
    rulerHeight: RULER_HEIGHT,
    rulerWidth: RULER_WIDTH,
    tickInterval,
    magnificationRadius: MAGNIFICATION_RADIUS,
    maxScale: MAX_SCALE,
    enableMagnification,
    colors: COLORS,
    spacing: SPACING,
    fontSize: FONT_SIZES,
    borderRadius: BORDER_RADIUS,
    cursorProps,
    onValueChange,
    onUnitChange,
  } = config;

  const [value, setValue] = useState(minValue);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(defaultUnitIndex);
  const cursorAnimY = useSharedValue(0);
  const valueRef = useRef(minValue);
  const initialYRef = useRef(0);
  const rulerRef = useRef<View>(null);
  const rulerTopYRef = useRef(0);
  const tickScaleMap = useRef(new Map());

  // Generate ticks
  const ticks = useMemo(() => {
    const tickArray: TickInfo[] = [];
    for (let v = minValue; v <= maxValue; v += tickInterval) {
      // Invert position so min is at bottom (RULER_HEIGHT) and max is at top (0)
      const position = ((maxValue - v) / (maxValue - minValue)) * RULER_HEIGHT;
      tickArray.push({ value: v, position });
    }
    return tickArray;
  }, [minValue, maxValue, tickInterval, RULER_HEIGHT]);

  const ticksRef = useRef(ticks);
  useEffect(() => {
    ticksRef.current = ticks;
  }, [ticks]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    increment: () => {
      const newValue = Math.min(maxValue, value + step);
      setValue(newValue);
      valueRef.current = newValue;
      onValueChange?.(newValue);

      const newPosition = ((maxValue - newValue) / (maxValue - minValue)) * RULER_HEIGHT;
      cursorAnimY.value = withTiming(newPosition, {
        duration: 50,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
      updateTickScales(newPosition);
    },
    decrement: () => {
      const newValue = Math.max(minValue, value - step);
      setValue(newValue);
      valueRef.current = newValue;
      onValueChange?.(newValue);

      const newPosition = ((maxValue - newValue) / (maxValue - minValue)) * RULER_HEIGHT;
      cursorAnimY.value = withTiming(newPosition, {
        duration: 50,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
      updateTickScales(newPosition);
    },
    setValue: (newValue: number) => {
      const clampedValue = Math.max(minValue, Math.min(maxValue, newValue));
      setValue(clampedValue);
      valueRef.current = clampedValue;
      onValueChange?.(clampedValue);

      const newPosition = ((maxValue - clampedValue) / (maxValue - minValue)) * RULER_HEIGHT;
      cursorAnimY.value = withTiming(newPosition, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
      updateTickScales(newPosition);
    },
    getValue: () => value,
    switchUnit: (index: number) => {
      if (index < 0 || index >= units.length) {
        console.warn(`Invalid unit index: ${index}`);
        return;
      }
      if (index === currentUnitIndex) return;

      const currentUnit = units[currentUnitIndex];
      const targetUnit = units[index];
      
      // Convert value to new unit
      let convertedValue = value;
      if (currentUnit.convertTo) {
        convertedValue = currentUnit.convertTo(value, targetUnit);
      }
      
      convertedValue = Math.max(minValue, Math.min(maxValue, convertedValue));
      setValue(convertedValue);
      valueRef.current = convertedValue;
      setCurrentUnitIndex(index);
      
      const newPosition = ((maxValue - convertedValue) / (maxValue - minValue)) * RULER_HEIGHT;
      cursorAnimY.value = withTiming(newPosition, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      });
      updateTickScales(newPosition);
      
      onValueChange?.(convertedValue);
      onUnitChange?.(targetUnit, index);
    },
    getCurrentUnit: () => units[currentUnitIndex] || unit,
  }), [value, step, minValue, maxValue, RULER_HEIGHT, onValueChange, onUnitChange, units, currentUnitIndex, unit]);

  const updateTickScales = (cursorY: number) => {
    if (!enableMagnification || !ticksRef.current) return;

    ticksRef.current.forEach((tick) => {
      const distance = Math.abs(tick.position - cursorY);
      let scaleValue = 1;

      if (distance < MAGNIFICATION_RADIUS) {
        const proximity = 1 - distance / MAGNIFICATION_RADIUS;
        scaleValue = 1 + proximity * (MAX_SCALE - 1);
      }

      const scaleX = tickScaleMap.current.get(tick.value);
      if (scaleX) {
        scaleX.value = scaleValue;
      }
    });
  };

  const handleIncrement = () => {
    const newValue = Math.min(maxValue, value + step);
    setValue(newValue);
    valueRef.current = newValue;
    onValueChange?.(newValue);

    const newPosition = ((maxValue - newValue) / (maxValue - minValue)) * RULER_HEIGHT;
    cursorAnimY.value = withTiming(newPosition, {
      duration: 50,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    updateTickScales(newPosition);
  };

  const handleDecrement = () => {
    const newValue = Math.max(minValue, value - step);
    setValue(newValue);
    valueRef.current = newValue;
    onValueChange?.(newValue);

    const newPosition = ((maxValue - newValue) / (maxValue - minValue)) * RULER_HEIGHT;
    cursorAnimY.value = withTiming(newPosition, {
      duration: 50,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
    updateTickScales(newPosition);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (rulerRef.current) {
          rulerRef.current.measure((x, y, width, height, pageX, pageY) => {
            rulerTopYRef.current = pageY;
          });
        }
        initialYRef.current = evt.nativeEvent.pageY;
      },
      onPanResponderMove: (evt) => {
        const dragFromRulerTop = evt.nativeEvent.pageY - rulerTopYRef.current;
        const clampedDrag = Math.max(0, Math.min(RULER_HEIGHT, dragFromRulerTop));

        const percentage = clampedDrag / RULER_HEIGHT;
        const newValue = maxValue - percentage * (maxValue - minValue);
        const steppedValue = Math.round(newValue / step) * step;
        const newPosition = (clampedDrag / RULER_HEIGHT) * RULER_HEIGHT;

        // Smooth drag feedback with minimal delay
        cursorAnimY.value = withTiming(newPosition, {
          duration: 10,
          easing: Easing.linear,
        });
        updateTickScales(newPosition);

        setValue(steppedValue);
        onValueChange?.(steppedValue);
      },
      onPanResponderRelease: (evt) => {
        const dragFromRulerTop = evt.nativeEvent.pageY - rulerTopYRef.current;
        const clampedDrag = Math.max(0, Math.min(RULER_HEIGHT, dragFromRulerTop));

        const percentage = clampedDrag / RULER_HEIGHT;
        const newValue = maxValue - percentage * (maxValue - minValue);
        const steppedValue = Math.round(newValue / step) * step;
        const newPosition = (clampedDrag / RULER_HEIGHT) * RULER_HEIGHT;

        valueRef.current = steppedValue;
        setValue(steppedValue);
        onValueChange?.(steppedValue);

        // Smooth snap animation on release
        cursorAnimY.value = withTiming(newPosition, {
          duration: 200,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        });

        ticksRef.current.forEach((tick) => {
          const scaleX = tickScaleMap.current.get(tick.value);
          if (scaleX) {
            scaleX.value = withTiming(1, {
              duration: 200,
              easing: Easing.out(Easing.cubic),
            });
          }
        });
      },
    })
  ).current;

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cursorAnimY.value }],
  }));

  const renderTicks = () => {
    return ticks.map((tick) => {
      const isMajorTick = tick.value % 10 === 0;
      const baseHeight = isMajorTick ? 5 : 3;

      return (
        <TickComponent
          key={`tick-${tick.value}`}
          tick={tick}
          baseHeight={baseHeight}
          isMajorTick={isMajorTick}
          colors={COLORS}
          rulerWidth={RULER_WIDTH}
          tickScaleMap={tickScaleMap.current}
        />
      );
    });
  };

  const renderTickLabels = () => {
    return ticks
      .filter((tick) => tick.value % 10 === 0)
      .map((tick) => (
        <Text
          key={`label-${tick.value}`}
          style={[
            styles(COLORS, SPACING, FONT_SIZES).tickLabel,
            { top: tick.position - 8 }
          ]}
        >
          {tick.value}
        </Text>
      ));
  };

  return (
    <View style={styles(COLORS, SPACING, FONT_SIZES).container}>
      <Text style={styles(COLORS, SPACING, FONT_SIZES).title}>{title}</Text>

      <View style={styles(COLORS, SPACING, FONT_SIZES).content}>
        <View
          style={[
            styles(COLORS, SPACING, FONT_SIZES).tickLabelsContainer,
            { height: RULER_HEIGHT }
          ]}
        >
          {renderTickLabels()}
        </View>

        <View
          ref={rulerRef}
          style={[
            styles(COLORS, SPACING, FONT_SIZES).ruler,
            { height: RULER_HEIGHT, width: RULER_WIDTH }
          ]}
          pointerEvents="box-only"
          {...panResponder.panHandlers}
        >
          {renderTicks()}

          <Animated.View
            style={[
              styles(COLORS, SPACING, FONT_SIZES).cursor,
              {
                marginTop: cursorProps.marginTop,
                paddingLeft: cursorProps.paddingLeft,
              },
              cursorAnimatedStyle
            ]}
            pointerEvents="none"
          >
            <View style={[styles(COLORS, SPACING, FONT_SIZES).cursorBar, {
              height: cursorProps.height,
              borderRadius: cursorProps.borderRadius,
            }]} />
          </Animated.View>
        </View>

        <View style={styles(COLORS, SPACING, FONT_SIZES).rightContent}>
          <View style={styles(COLORS, SPACING, FONT_SIZES).valueSection}>
            {enableButtons && (
              <Pressable
                onPress={handleDecrement}
                style={({ pressed }) => [
                  styles(COLORS, SPACING, FONT_SIZES).adjustButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles(COLORS, SPACING, FONT_SIZES).adjustButtonText}>−</Text>
              </Pressable>
            )}

            <Text style={styles(COLORS, SPACING, FONT_SIZES).valueText}>{value.toFixed(1)}</Text>

            {enableButtons && (
              <Pressable
                onPress={handleIncrement}
                style={({ pressed }) => [
                  styles(COLORS, SPACING, FONT_SIZES).adjustButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Text style={styles(COLORS, SPACING, FONT_SIZES).adjustButtonText}>+</Text>
              </Pressable>
            )}
          </View>

          {showUnitSwitcher && units.length > 0 ? (
            <View style={styles(COLORS, SPACING, FONT_SIZES).unitSwitcher}>
              {units.map((u, index) => (
                <Pressable
                  key={u.symbol}
                  onPress={() => ref && (ref as any).current?.switchUnit(index)}
                  style={({ pressed }) => [
                    styles(COLORS, SPACING, FONT_SIZES).unitButton,
                    {
                      opacity: pressed ? 0.7 : 1,
                      backgroundColor: currentUnitIndex === index ? COLORS.accent : COLORS.primaryLight,
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles(COLORS, SPACING, FONT_SIZES).unitButtonText,
                      { color: currentUnitIndex === index ? COLORS.white : COLORS.primary }
                    ]}
                  >
                    {u.symbol}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles(COLORS, SPACING, FONT_SIZES).unitLabel}>
              {units[currentUnitIndex]?.symbol || unit}
            </Text>
          )}
          {showDate && (
            <Text style={styles(COLORS, SPACING, FONT_SIZES).dateText}>
              {new Date().toLocaleDateString('en-US', dateFormat)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

interface TickComponentProps {
  tick: TickInfo;
  baseHeight: number;
  isMajorTick: boolean;
  colors: any;
  rulerWidth: number;
  tickScaleMap: Map<number, SharedValue<number>>;
}

const TickComponent: React.FC<TickComponentProps> = ({
  tick,
  baseHeight,
  isMajorTick,
  colors,
  rulerWidth,
  tickScaleMap,
}) => {
  if (!tick) return null;

  const scaleX = useSharedValue(1);
  tickScaleMap.set(tick.value, scaleX);

  const baseWidth = isMajorTick ? rulerWidth * 0.8 : rulerWidth * 0.5;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleX: scaleX.value },
      { translateX: (scaleX.value - 1) * (baseWidth / 2.5) }
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: tick.position - baseHeight / 2,
          width: baseWidth,
          height: baseHeight,
          backgroundColor: isMajorTick ? '#333333' : '#CCCCCC',
          borderRadius: 2,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
};

const styles = (colors: any, spacing: any, fontSize: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingVertical: spacing.lg,
    },
    title: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      width: '100%',
      alignItems: 'stretch',
    },
    ruler: {
      position: 'relative',
      marginLeft: spacing.xxl,
      paddingLeft: spacing.sm,
      paddingRight: spacing.md,
    },
    cursor: {
      position: 'absolute',
      width: '100%',
      height: 4,
      justifyContent: 'center',
      alignItems: 'flex-start',
      left: 0,
      marginTop: -2,
      paddingLeft: 8,
    },
    cursorBar: {
      width: '200%',
      height: 4,
      backgroundColor: colors.warning,
      borderRadius: 6,
      opacity: 1,
    },
    rightContent: {
      flex: 1,
      paddingLeft: spacing.xl,
      paddingRight: spacing.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    valueSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    valueText: {
      fontSize: 64,
      fontWeight: '700',
      color: colors.primary,
    },
    unitLabel: {
      fontSize: fontSize.md,
      fontWeight: '500',
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    dateText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    tickLabel: {
      position: 'absolute',
      fontSize: fontSize.xs,
      fontWeight: '500',
      color: colors.textSecondary,
      left: spacing.md,
    },
    tickLabelsContainer: {
      position: 'absolute',
      left: spacing.sm,
      top: 0,
      width: spacing.xxl,
      alignItems: 'flex-end',
      paddingRight: spacing.sm,
    },
    adjustButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: spacing.xs,
    },
    adjustButtonText: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
    },
    unitSwitcher: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: spacing.xs,
    },
    unitButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unitButtonText: {
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
  });

export default React.memo(forwardRef(VerticalRulerComponent));
