import React, { useRef, useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, PanResponder, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

export interface VerticalRulerConfig {
  // Value configuration
  minValue?: number;
  maxValue?: number;
  step?: number;
  
  // Display configuration
  unit?: string;
  title?: string;
  showDate?: boolean;
  dateFormat?: Intl.DateTimeFormatOptions;
  
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
  
  // Callbacks
  onValueChange?: (value: number) => void;
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
  title: 'Enter Your Height',
  showDate: true,
  dateFormat: { month: 'short', day: '2-digit', year: 'numeric' },
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
  onValueChange: undefined,
};

const VerticalRuler: React.FC<VerticalRulerProps> = (props) => {
  // Merge config with defaults
  const config = useMemo(() => ({
    ...DEFAULT_CONFIG,
    colors: { ...DEFAULT_CONFIG.colors, ...props.colors },
    spacing: { ...DEFAULT_CONFIG.spacing, ...props.spacing },
    fontSize: { ...DEFAULT_CONFIG.fontSize, ...props.fontSize },
    borderRadius: { ...DEFAULT_CONFIG.borderRadius, ...props.borderRadius },
    ...props,
  }), [props]);

  const {
    minValue,
    maxValue,
    step,
    unit,
    title,
    showDate,
    dateFormat,
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
    onValueChange,
  } = config;

  const [value, setValue] = useState(minValue);
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
      const position = ((v - minValue) / (maxValue - minValue)) * RULER_HEIGHT;
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

    const newPosition = ((newValue - minValue) / (maxValue - minValue)) * RULER_HEIGHT;
    cursorAnimY.value = withTiming(newPosition, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    updateTickScales(newPosition);
  };

  const handleDecrement = () => {
    const newValue = Math.max(minValue, value - step);
    setValue(newValue);
    valueRef.current = newValue;
    onValueChange?.(newValue);

    const newPosition = ((newValue - minValue) / (maxValue - minValue)) * RULER_HEIGHT;
    cursorAnimY.value = withTiming(newPosition, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
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
        const newValue = minValue + percentage * (maxValue - minValue);
        const steppedValue = Math.round(newValue / step) * step;
        const newPosition = (clampedDrag / RULER_HEIGHT) * RULER_HEIGHT;

        cursorAnimY.value = withTiming(newPosition, {
          duration: 100,
          easing: Easing.out(Easing.quad),
        });
        updateTickScales(newPosition);

        setValue(steppedValue);
        onValueChange?.(steppedValue);
      },
      onPanResponderRelease: (evt) => {
        const dragFromRulerTop = evt.nativeEvent.pageY - rulerTopYRef.current;
        const clampedDrag = Math.max(0, Math.min(RULER_HEIGHT, dragFromRulerTop));

        const percentage = clampedDrag / RULER_HEIGHT;
        const newValue = minValue + percentage * (maxValue - minValue);
        const steppedValue = Math.round(newValue / step) * step;
        const newPosition = (clampedDrag / RULER_HEIGHT) * RULER_HEIGHT;

        valueRef.current = steppedValue;
        setValue(steppedValue);
        onValueChange?.(steppedValue);

        cursorAnimY.value = withTiming(newPosition, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
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
          pointerEvents="none"
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
          pointerEvents="none"
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
              cursorAnimatedStyle
            ]}
            pointerEvents="none"
          >
            <View style={styles(COLORS, SPACING, FONT_SIZES).cursorBar} />
          </Animated.View>
        </View>

        <View style={styles(COLORS, SPACING, FONT_SIZES).rightContent}>
          <View style={styles(COLORS, SPACING, FONT_SIZES).valueSection}>
            <Pressable
              onPress={handleDecrement}
              style={({ pressed }) => [
                styles(COLORS, SPACING, FONT_SIZES).adjustButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles(COLORS, SPACING, FONT_SIZES).adjustButtonText}>−</Text>
            </Pressable>

            <Text style={styles(COLORS, SPACING, FONT_SIZES).valueText}>{value.toFixed(1)}</Text>

            <Pressable
              onPress={handleIncrement}
              style={({ pressed }) => [
                styles(COLORS, SPACING, FONT_SIZES).adjustButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles(COLORS, SPACING, FONT_SIZES).adjustButtonText}>+</Text>
            </Pressable>
          </View>

          <Text style={styles(COLORS, SPACING, FONT_SIZES).unitLabel}>{unit}</Text>
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
  tickScaleMap: Map<number, Animated.SharedValue<number>>;
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
      alignItems: 'center',
      left: 0,
      marginTop: -2,
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
  });

export default React.memo(VerticalRuler);
