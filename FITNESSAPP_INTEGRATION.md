# React Native Vertical Ruler - FitnessApp Integration Guide

This guide explains how to integrate the `react-native-vertical-ruler` npm package into the FitnessApp project.

## Current Status

✅ **Package Created** - Full npm package ready  
✅ **OnboardingCarousel Updated** - Already updated to import from package  
✅ **Fully Customizable** - All options exposed as props  
⬜ **Installation Required** - Follow steps below  

## Installation Steps

### Step 1: Build the Package

In the `react-native-vertical-ruler` directory:

```bash
cd ../react-native-vertical-ruler
npm install
npm run build
```

This creates the `dist/` folder with compiled JavaScript and TypeScript definitions.

### Step 2: Link the Package (Development)

```bash
# In react-native-vertical-ruler directory
npm link

# In FitnessApp/apps/mobile directory
npm link react-native-vertical-ruler
```

Or install directly if published to NPM:

```bash
cd FitnessApp/apps/mobile
npm install react-native-vertical-ruler
```

### Step 3: Verify Installation

```bash
npm list react-native-vertical-ruler
```

Should show: `react-native-vertical-ruler@1.0.0`

## Current Integration

### Already Updated Files

**apps/mobile/src/components/onboarding/OnboardingCarousel.tsx**

```tsx
import { VerticalRuler } from 'react-native-vertical-ruler';

// In SLIDES array:
{ id: 'ruler', title: 'Vertical Ruler', subtitle: 'Measure your progress', Component: VerticalRuler }
```

### Files to Remove (Optional)

Once verified working, you can remove the old inline component:

```bash
rm apps/mobile/src/components/onboarding/slides/VerticalRulerSlide.tsx
```

## Usage in FitnessApp

### Default Usage (Recommended)

```tsx
import { VerticalRuler } from 'react-native-vertical-ruler';

export default function HeightOnboarding() {
  return (
    <VerticalRuler
      minValue={150}
      maxValue={220}
      step={1}
      unit="cm"
      title="Enter Your Height"
      onValueChange={(height) => {
        updateUserHeight(height);
      }}
    />
  );
}
```

### Custom Styling for Weight

If you want to add more measurement slides:

```tsx
import { VerticalRuler } from 'react-native-vertical-ruler';

export default function WeightOnboarding() {
  return (
    <VerticalRuler
      minValue={40}
      maxValue={150}
      step={0.5}
      unit="kg"
      title="What is your weight?"
      colors={{
        primary: '#8F917C',
        primaryLight: '#EBDBD3',
        accent: '#D0BEA3',
        warning: '#F59E0B',
      }}
      onValueChange={(weight) => {
        updateUserWeight(weight);
      }}
    />
  );
}
```

## Configuration Options

All options are optional with sensible defaults. Here are commonly used ones:

```tsx
<VerticalRuler
  // Value range
  minValue={150}
  maxValue={220}
  step={1}
  
  // Display
  unit="cm"
  title="Enter Your Height"
  showDate={true}
  
  // Ruler size
  rulerHeight={400}
  rulerWidth={80}
  tickInterval={5}
  
  // Magnification effect
  enableMagnification={true}
  magnificationRadius={80}
  maxScale={1.5}
  
  // Custom colors (uses your app's palette by default)
  colors={{
    primary: '#8F917C',
    primaryLight: '#EBDBD3',
    accent: '#D0BEA3',
    warning: '#F59E0B',
  }}
  
  // Callbacks
  onValueChange={(value) => console.log(value)}
/>
```

## Troubleshooting

### Package import not found

**Error**: `Cannot find module 'react-native-vertical-ruler'`

**Solution**:
```bash
cd FitnessApp/apps/mobile
npm link react-native-vertical-ruler
npm start --reset-cache
```

### Component not rendering

**Error**: `ReferenceError: VerticalRuler is not defined`

**Solution**:
1. Check import is correct: `import { VerticalRuler }`
2. Verify package installed: `npm list react-native-vertical-ruler`
3. Clear cache and rebuild

### Type errors in TypeScript

**Error**: `Cannot find type definition for react-native-vertical-ruler`

**Solution**: The types are included in the package. Ensure:
1. Package is properly installed
2. Run `npm install` in the package directory first
3. Build the package: `npm run build`

## Development Workflow

### Making Changes to the Package

If you need to modify the component:

1. Edit `react-native-vertical-ruler/src/VerticalRuler.tsx`
2. Rebuild: `npm run build`
3. Changes automatically reflect in FitnessApp (with npm link)
4. Restart the app if needed

### Testing

Before deploying:

```bash
# In FitnessApp/apps/mobile
npm start

# Test the height selector on the onboarding screen
```

## Publishing Updates

When you're ready to publish to NPM:

1. Update version in package.json
2. Commit changes to GitHub
3. Run `npm publish`

See `SETUP.md` for detailed publishing instructions.

## Features Summary

✅ **Smooth Gestures** - Drag to select values  
✅ **Magnification** - Ticks scale as cursor moves  
✅ **Quick Adjust** - +/- buttons for fine tuning  
✅ **Date Display** - Shows current date  
✅ **Fully Typed** - Complete TypeScript support  
✅ **Customizable** - Every color and size adjustable  
✅ **No Dependencies** - Only uses standard React Native  
✅ **60fps Animations** - Uses React Native Reanimated  

## Integration Checklist

- ✅ Package created and built
- ✅ OnboardingCarousel.tsx updated
- ⬜ Package installed/linked in FitnessApp
- ⬜ Test height selector in onboarding
- ⬜ Remove old VerticalRulerSlide.tsx
- ⬜ Test on iOS and Android
- ⬜ Deploy to production

## Questions?

Refer to the other documentation files:
- **README.md** - Full component documentation
- **SETUP.md** - GitHub/NPM publishing guide
- **MIGRATION.md** - Migration from inline component
- **SUMMARY.md** - Complete package overview

## Support

If you encounter issues:
1. Check the package is built: `npm run build`
2. Clear cache: `npm start --reset-cache`
3. Check imports are correct
4. Verify react-native-reanimated is installed

Happy integrating! 🚀
