import { Platform } from 'react-native';

import { colors } from '../constants/colors';

export { colors };

export const theme = {
  colors,
  spacing: {
    screen: 20,
    section: 16,
    cardGap: 12,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  radius: {
    card: 16,
    small: 10,
    pill: 999,
  },
  typography: {
    heading: 22,
    body: 14,
    title: 28,
    mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
};
