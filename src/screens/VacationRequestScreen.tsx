import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../components/Screen';
import { useAppData } from '../context/AppDataContext';
import { colors, theme } from '../theme';
import {
  addDays,
  getDateKey,
  getMonthMatrix,
  getCurrentMonthLabel,
  parseDateKey,
} from '../utils/dateHelpers';

function DateSelector({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.selector, pressed && styles.pressed]}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Text style={styles.selectorValue}>{value ?? 'Seleccionar fecha'}</Text>
    </Pressable>
  );
}

type PickerField = 'start' | 'end' | null;

export function VacationRequestScreen() {
  const { vacationRequests, saveVacationRequest } = useAppData();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<PickerField>(null);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const monthDays = getMonthMatrix(visibleMonth);

  const handlePick = (date: Date) => {
    const dateKey = getDateKey(date);

    if (activeField === 'start') {
      setStartDate(dateKey);
    }

    if (activeField === 'end') {
      setEndDate(dateKey);
    }

    setActiveField(null);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Fechas incompletas', 'Selecciona una fecha de inicio y otra de fin.');
      return;
    }

    if (parseDateKey(startDate) > parseDateKey(endDate)) {
      Alert.alert('Rango inválido', 'La fecha de inicio no puede ser posterior a la fecha final.');
      return;
    }

    await saveVacationRequest(startDate, endDate);
    setStartDate(null);
    setEndDate(null);
    Alert.alert('Solicitud enviada', 'Tu solicitud de vacaciones ha quedado guardada.');
  };

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>Rango de vacaciones</Text>
        <Text style={styles.subtitle}>
          Selecciona el inicio y el fin para guardar una solicitud local.
        </Text>

        <DateSelector label="Inicio" onPress={() => setActiveField('start')} value={startDate} />
        <DateSelector label="Fin" onPress={() => setActiveField('end')} value={endDate} />

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
        >
          <Text style={styles.submitText}>Guardar solicitud</Text>
        </Pressable>
      </View>

      <View style={styles.history}>
        <Text style={styles.historyTitle}>Solicitudes guardadas</Text>
        {vacationRequests.length === 0 ? (
          <Text style={styles.historyEmpty}>No has solicitado vacaciones todavía.</Text>
        ) : (
          vacationRequests.map((request) => (
            <View key={request.id} style={styles.historyCard}>
              <Text style={styles.historyRange}>
                {request.startDate} - {request.endDate}
              </Text>
              <Text style={styles.historyStatus}>Estado: {request.status}</Text>
            </View>
          ))
        )}
      </View>

      <Modal animationType="fade" transparent visible={activeField !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Pressable
                onPress={() => setVisibleMonth((current) => addDays(new Date(current.getFullYear(), current.getMonth(), 1), -1))}
                style={styles.modalArrow}
              >
                <Ionicons color={colors.textPrimary} name="chevron-back" size={18} />
              </Pressable>
              <Text style={styles.modalTitle}>{getCurrentMonthLabel(visibleMonth)}</Text>
              <Pressable
                onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                style={styles.modalArrow}
              >
                <Ionicons color={colors.textPrimary} name="chevron-forward" size={18} />
              </Pressable>
            </View>

            <View style={styles.weekHeader}>
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
                <Text key={day} style={styles.weekHeaderText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {monthDays.map((day, index) =>
                day ? (
                  <Pressable
                    key={getDateKey(day)}
                    onPress={() => handlePick(day)}
                    style={({ pressed }) => [
                      styles.dayCell,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.dayCellText}>{day.getDate()}</Text>
                  </Pressable>
                ) : (
                  <View key={`empty-${index}`} style={styles.dayCell} />
                ),
              )}
            </View>

            <Pressable onPress={() => setActiveField(null)} style={styles.closeButton}>
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 12,
    marginTop: 8,
    padding: 18,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  selector: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: theme.radius.small,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  selectorLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  selectorValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: theme.radius.card,
    justifyContent: 'center',
    minHeight: 50,
  },
  submitText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  history: {
    gap: 10,
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  historyEmpty: {
    color: colors.textMuted,
    fontSize: 14,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 4,
    padding: 14,
  },
  historyRange: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  historyStatus: {
    color: colors.textMuted,
    fontSize: 13,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    gap: 14,
    padding: 16,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalArrow: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekHeaderText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    width: '14.2%',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    justifyContent: 'center',
    width: '13.3%',
  },
  dayCellText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  closeButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
