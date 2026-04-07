// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Tab icons
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'checkmark.circle.fill': 'check-circle',
  'chart.bar.fill': 'bar-chart',
  'gearshape.fill': 'settings',

  // Task detail icons
  'clock': 'access-time',
  'person': 'person-outline',
  'list.bullet': 'format-list-bulleted',
  'pencil': 'edit',

  // Reckoning icons
  'checkmark.seal': 'verified',
  'calendar.badge.clock': 'event-note',
  'checkmark.circle': 'check-circle-outline',
  'calendar': 'calendar-today',
  'exclamationmark.triangle.fill': 'warning',
  'trash': 'delete',
  'scissors': 'content-cut',
  'bell.slash': 'notifications-off',
  'person.2': 'group',

  // Settings icons
  'checkmark': 'check',
  'moon.fill': 'dark-mode',
  'iphone': 'smartphone',
  'sun.max.fill': 'wb-sunny',
  'arrow.counterclockwise': 'refresh',

  // Explore icons
  'brain.head.profile': 'psychology',
  'circle.fill': 'radio-button-checked',

  // Subtask icons
  'plus': 'add',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
