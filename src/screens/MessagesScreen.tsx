import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { colors, theme } from '../theme';

export function MessagesScreen() {
  return (
    <Screen contentContainerStyle={styles.content} scroll={false}>
      <View style={styles.emptyState}>
        <View style={styles.iconWrap}>
          <Ionicons color={colors.primary} name="chatbubble-ellipses-outline" size={38} />
        </View>
        <Text style={styles.title}>No tienes mensajes nuevos</Text>
        <Text style={styles.subtitle}>
          Esta vista está lista para mostrar un listado de mensajes cuando lo necesites.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  title: {
    color: colors.textPrimary,
    fontSize: theme.typography.heading,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 280,
    textAlign: 'center',
  },
});
