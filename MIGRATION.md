# Migration Guide: From Inline Component to NPM Package

This guide helps you migrate from the inline `VerticalRulerSlide` component to the published `react-native-vertical-ruler` npm package.

## Step 1: Install the Package

In your FitnessApp project root:

```bash
cd /path/to/FitnessApp/apps/mobile

# For development with local package:
npm link ../../react-native-vertical-ruler

# Or install from NPM when published:
npm install react-native-vertical-ruler
```

## Step 2: Update Imports

### Before (inline component):
```tsx
import VerticalRulerSlide from './slides/VerticalRulerSlide';

// In your slides array:
{ id: 'ruler', title: 'Vertical Ruler', subtitle: 'Measure your progress', Component: VerticalRulerSlide }
```

### After (npm package):
```tsx
import { VerticalRuler } from 'react-native-vertical-ruler';

// In your slides array:
{ id: 'ruler', title: 'Vertical Ruler', subtitle: 'Measure your progress', Component: VerticalRuler }
```

## Step 3: Remove Old Files (Optional)

Once migrated and tested, you can remove the old inline component:

```bash
rm apps/mobile/src/components/onboarding/slides/VerticalRulerSlide.tsx
```

## Step 4: Customize the Component (If Needed)

The component now accepts all options as props:

```tsx
<VerticalRuler
  minValue={150}
  maxValue={220}
  step={1}
  unit="cm"
  title="Enter Your Height"
  colors={{
    primary: '#8F917C',
    primaryLight: '#EBDBD3',
    accent: '#D0BEA3',
    warning: '#F59E0B',
  }}
  onValueChange={(value) => {
    console.log('Selected height:', value);
    // Save to your store or state
  }}
/>
```

## Breaking Changes

### None! 🎉

The component API is backward compatible. All props are optional with sensible defaults.

## Benefits of Migration

✅ **Maintenance** - Updates to the component apply everywhere  
✅ **Reusability** - Share the component across projects  
✅ **Type Safety** - Full TypeScript support  
✅ **Code Clarity** - Less code duplication  
✅ **Professional** - Published on NPM  

## Troubleshooting

### Import not found error

Make sure the package is installed:
```bash
npm list react-native-vertical-ruler
```

If not listed, install it:
```bash
npm install react-native-vertical-ruler
```

### Component not rendering

Check that `react-native-reanimated` is installed:
```bash
npm list react-native-reanimated
```

### Need to customize styling?

All colors, sizes, and fonts are now props:

```tsx
<VerticalRuler
  colors={{
    primary: '#FF6B6B',      // Your custom color
    primaryLight: '#FFE0E0',
    warning: '#FF6B6B',
  }}
  spacing={{
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  }}
/>
```

## Rollback

If you need to revert to the inline component:

```bash
# Remove the package
npm uninstall react-native-vertical-ruler

# Restore the original file from git
git restore apps/mobile/src/components/onboarding/slides/VerticalRulerSlide.tsx

# Update imports back
# (in OnboardingCarousel.tsx)
```

## Questions?

Check the full documentation in `README.md` or visit the GitHub repository.

Happy migrating! 🚀
