# React Native Vertical Ruler

A highly customizable, smooth vertical ruler component for React Native with magnification effects and precise value selection. Perfect for height measurements, weight selection, or any continuous value input.

## ✨ Features

- **Smooth Animations** - Uses React Native Reanimated for 60fps animations
- **Precise Gestures** - Accurate touch handling with proper coordinate mapping
- **Magnification Effect** - macOS dock-style scaling of ticks near the cursor
- **Increment/Decrement** - Built-in +/- buttons for fine adjustments
- **Fully Customizable** - Colors, sizes, spacing, fonts, cursor - all configurable
- **Production Ready** - TypeScript support, comprehensive prop validation
- **Zero Runtime Dependencies** - Only requires React Native and Reanimated

## 📦 Installation

```bash
npm install react-native-vertical-ruler react-native-reanimated
```

or with yarn:

```bash
yarn add react-native-vertical-ruler react-native-reanimated
```

## 🚀 Quick Start

```tsx
import { VerticalRuler } from 'react-native-vertical-ruler';

export default function HeightSelector() {
  return (
    <VerticalRuler
      minValue={150}
      maxValue={220}
      step={1}
      unit="cm"
      title="Select Your Height"
      onValueChange={(value) => console.log('Height:', value)}
    />
  );
}
```

## 📖 Complete API Documentation

### Configuration Props

#### Value Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minValue` | number | 150 | Minimum value on the ruler |
| `maxValue` | number | 220 | Maximum value on the ruler |
| `step` | number | 1 | Step increment for value changes |
| `unit` | string | 'cm' | Unit label displayed to user |

#### Display Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | 'Enter Your Height' | Title text shown above ruler |
| `showDate` | boolean | true | Show current date below value |
| `dateFormat` | Intl.DateTimeFormatOptions | See default | Intl date format options |
| `enableButtons` | boolean | true | Show +/- increment/decrement buttons |

#### Ruler Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rulerHeight` | number | 400 | Height of the ruler in pixels |
| `rulerWidth` | number | 80 | Width of the ruler in pixels |
| `tickInterval` | number | 5 | Distance between ticks in value units |

#### Magnification Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableMagnification` | boolean | true | Enable tick magnification effect |
| `magnificationRadius` | number | 80 | Radius in pixels for magnification effect |
| `maxScale` | number | 1.5 | Maximum scale factor for magnified ticks |

#### Unit Switcher Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `units` | UnitConfig[] | [cm, in, ft] | Array of unit configurations with conversion functions |
| `defaultUnitIndex` | number | 0 | Index of the initial unit to display |
| `showUnitSwitcher` | boolean | false | Show interactive unit switcher buttons |

#### Cursor Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cursorProps` | CursorProps | See below | Customize cursor appearance |

**CursorProps:**
```typescript
{
  height?: number;           // Cursor bar height (default: 4)
  width?: string | number;   // Cursor container width (default: '100%')
  marginTop?: number;        // Vertical offset (default: -2)
  paddingLeft?: number;      // Horizontal padding (default: 8)
  borderRadius?: number;     // Border radius (default: 6)
  color?: string;            // Cursor bar color (default: '#F59E0B')
  barWidth?: string | number; // Cursor bar width (default: '200%')
  opacity?: number;          // Cursor bar opacity (default: 1)
}
```

#### Styling

All styling is fully customizable:

```tsx
<VerticalRuler
  colors={{
    primary: '#8F917C',
    primaryLight: '#EBDBD3',
    accent: '#D0BEA3',
    warning: '#F59E0B',
    background: '#F5F4F7',
    textPrimary: '#1A1A1A',
    textSecondary: '#8F917C',
    white: '#FFFFFF',
  }}
  spacing={{
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  }}
  fontSize={{
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  }}
  borderRadius={{
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
  }}
/>
```

#### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onValueChange` | (value: number) => void | Called when value changes via drag or button |
| `onUnitChange` | (unit: UnitConfig, unitIndex: number) => void | Called when unit is switched |

## 💡 Advanced Examples

### Custom Styling for Weight

```tsx
<VerticalRuler
  minValue={40}
  maxValue={150}
  step={0.5}
  unit="kg"
  title="What is your weight?"
  colors={{
    primary: '#FF6B6B',
    primaryLight: '#FFE0E0',
    warning: '#FF6B6B',
  }}
  onValueChange={(weight) => {
    updateUserWeight(weight);
  }}
/>
```

### Customize Cursor Appearance

```tsx
<VerticalRuler
  cursorProps={{
    height: 6,
    marginTop: -3,
    paddingLeft: 10,
    borderRadius: 8,
    color: '#FF6B6B',      // Custom color
    barWidth: '150%',      // Cursor bar width
    opacity: 0.9,          // Transparency
  }}
/>
```

### Disabled Magnification

```tsx
<VerticalRuler
  enableMagnification={false}
/>
```

### Compact Version

```tsx
<VerticalRuler
  rulerHeight={250}
  rulerWidth={40}
  title="Height"
  spacing={{ xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24 }}
  fontSize={{ xs: 10, sm: 12, md: 14, lg: 16, xl: 18 }}
/>
```

### Gesture-Only Mode (Disable Buttons)

```tsx
<VerticalRuler
  enableButtons={false}
  title="Select Your Height"
  // Users can only adjust value via dragging the ruler
/>
```

### Unit Switcher with Built-in Conversions

```tsx
<VerticalRuler
  minValue={150}
  maxValue={220}
  showUnitSwitcher={true}
  defaultUnitIndex={0}
  // Users can switch between cm, inches, and feet with automatic conversion
/>
```

### Custom Units with Conversion Functions

```tsx
import { VerticalRuler, UnitConfig } from 'react-native-vertical-ruler';

const customUnits: UnitConfig[] = [
  {
    label: 'Kilograms',
    symbol: 'kg',
    convertTo: (value, targetUnit) => {
      if (targetUnit.symbol === 'lbs') return value * 2.20462;
      return value;
    },
  },
  {
    label: 'Pounds',
    symbol: 'lbs',
    convertTo: (value, targetUnit) => {
      if (targetUnit.symbol === 'kg') return value / 2.20462;
      return value;
    },
  },
];

export default function WeightSelector() {
  return (
    <VerticalRuler
      minValue={40}
      maxValue={150}
      step={0.5}
      units={customUnits}
      defaultUnitIndex={0}
      showUnitSwitcher={true}
      title="Select Your Weight"
      onUnitChange={(unit, index) => {
        console.log(`Switched to ${unit.label}`);
      }}
    />
  );
}
```

## 🎛️ Imperative Handle Methods

Control the ruler programmatically using a ref:

```tsx
import { useRef } from 'react';
import { VerticalRuler, VerticalRulerHandle } from 'react-native-vertical-ruler';

export default function MyComponent() {
  const rulerRef = useRef<VerticalRulerHandle>(null);

  return (
    <>
      <VerticalRuler
        ref={rulerRef}
        minValue={150}
        maxValue={220}
      />
      
      <Button
        title="Increment"
        onPress={() => rulerRef.current?.increment()}
      />
      <Button
        title="Decrement"
        onPress={() => rulerRef.current?.decrement()}
      />
      <Button
        title="Set to 180"
        onPress={() => rulerRef.current?.setValue(180)}
      />
      <Button
        title="Get Value"
        onPress={() => {
          const currentValue = rulerRef.current?.getValue();
          console.log('Current value:', currentValue);
        }}
      />
    </>
  );
}
```

### Available Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `increment()` | none | Increases value by the configured step |
| `decrement()` | none | Decreases value by the configured step |
| `setValue(value: number)` | value | Sets the ruler to a specific value (clamped to min/max) |
| `getValue()` | none | Returns the current value |
| `switchUnit(index: number)` | index | Switch to a different unit by index |
| `getCurrentUnit()` | none | Get the current unit configuration |

## 🔐 TypeScript Support

Full TypeScript support is included:

```tsx
import { VerticalRuler, VerticalRulerConfig } from 'react-native-vertical-ruler';

const config: VerticalRulerConfig = {
  minValue: 150,
  maxValue: 220,
  step: 1,
  onValueChange: (value: number) => console.log(value),
};

<VerticalRuler {...config} />;
```

## ⚡ Performance

- ✅ Memoized component to prevent unnecessary re-renders
- ✅ Uses React Native Reanimated for smooth 60fps animations
- ✅ Efficient gesture handling with native driver animations
- ✅ Optimized tick rendering and magnification calculations

## 🌐 Browser Support

- iOS 12+
- Android 8+

## 📋 Dependencies

### Peer Dependencies (required)
- `react: ^18.0.0 || ^19.0.0`
- `react-native: >=0.71.0`
- `react-native-reanimated: ^3.0.0 || ^4.0.0`

### Runtime Dependencies
None! This package only depends on standard React Native libraries.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- **GitHub**: https://github.com/Lanioque/react-native-vertical-ruler
- **NPM**: https://www.npmjs.com/package/react-native-vertical-ruler

## 💬 Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/Lanioque/react-native-vertical-ruler/issues).
