import { useAppData } from '../context/AppDataContext';
import { Shift } from '../types/app';
import { getDateKey } from '../utils/dateHelpers';

export function useShifts() {
  const { shifts } = useAppData();

  const getShiftForDate = (dateKey: string) => {
    return shifts.find((shift) => shift.date === dateKey) ?? null;
  };

  const getTodayShift = () => getShiftForDate(getDateKey(new Date()));

  const getShiftMinutes = (shift: Shift | null) => {
    if (!shift || shift.type === 'libre') {
      return 0;
    }

    const [startHour, startMinute] = shift.start.split(':').map(Number);
    const [endHour, endMinute] = shift.end.split(':').map(Number);
    let total = endHour * 60 + endMinute - (startHour * 60 + startMinute);

    if (total <= 0) {
      total += 24 * 60;
    }

    return total;
  };

  return {
    shifts,
    getShiftForDate,
    getTodayShift,
    getShiftMinutes,
  };
}
