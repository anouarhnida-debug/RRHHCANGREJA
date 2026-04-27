import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../theme';

type ClockButtonsProps = {
  canClockIn: boolean;
  canClockOut: boolean;
  onClockIn: () => void;
  onClockOut: () => void;
};

function ActionButton({
  title,
  color,
  icon,
  disabled,
  onPress,
}: {
  title: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: disabled ? colors.border : color },
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons
        color={disabled ? colors.textMuted : colors.onPrimary}
        name={disabled ? 'checkmark-circle' : icon}
        size={18}
      />
      <Text style={[styles.buttonText, disabled && styles.disabledText]}>
        {disabled ? 'Registrado' : title}
      </Text>
    </Pressable>
  );
}

export function ClockButtons({
  canClockIn,
  canClockOut,
  onClockIn,
  onClockOut,
}: ClockButtonsProps) {
  return (
    <View style={styles.row}>
      <ActionButton
        color={colors.primary}
        disabled={!canClockIn}
        icon="log-in-outline"
        onPress={onClockIn}
        title="Registrar entrada"
      />
      <ActionButton
        color={colors.danger}
        disabled={!canClockOut}
        icon="log-out-outline"
        onPress={onClockOut}
        title="Registrar salida"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.card,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.92,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.textMuted,
  },
});
