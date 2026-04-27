import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { useProfile } from '../hooks/useProfile';
import { colors, theme } from '../theme';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function PersonalDataScreen() {
  const { profile } = useProfile();

  if (!profile) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.card}>
        <Field label="Nombre completo" value={`${profile.name} ${profile.surname}`} />
        <Field label="Identificación" value={profile.employeeId} />
        <Field label="Puesto" value={profile.role} />
        <Field label="Departamento" value={profile.department} />
        <Field label="Turno" value={profile.shiftType} />
        <Field label="Correo" value={profile.email} />
        <Field label="Teléfono" value={profile.phone} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 14,
    marginTop: 8,
    padding: 18,
  },
  field: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: 4,
    paddingBottom: 12,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  fieldValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
});
