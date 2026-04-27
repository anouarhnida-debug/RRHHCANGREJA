import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, theme } from '../theme';

type ScreenProps = PropsWithChildren<{
  contentContainerStyle?: ViewStyle;
  scroll?: boolean;
}>;

export function Screen({
  children,
  contentContainerStyle,
  scroll = true,
}: ScreenProps) {
  const content = <View style={[styles.content, contentContainerStyle]}>{children}</View>;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    gap: theme.spacing.section,
    paddingBottom: 32,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.lg,
  },
});
