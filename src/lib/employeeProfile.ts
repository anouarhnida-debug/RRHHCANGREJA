import { UserProfile } from '../types/app';

type EmployeeRow = {
  id?: string;
  auth_user_id?: string | null;
  profile_id?: string | null;
  employee_id?: string | null;
  employee_code?: string | null;
  code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  surname?: string | null;
  full_name?: string | null;
  role?: string | null;
  department?: string | null;
  shift_type?: string | null;
  shift?: string | null;
  email?: string | null;
  work_email?: string | null;
  phone?: string | null;
  mobile?: string | null;
};

function splitFullName(fullName?: string | null) {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return { name: 'Empleado', surname: '' };
  }

  const parts = normalizedName.split(/\s+/);

  return {
    name: parts[0] ?? 'Empleado',
    surname: parts.slice(1).join(' '),
  };
}

export function mapEmployeeRowToUserProfile(
  row: EmployeeRow,
  fallbackEmail: string,
): UserProfile {
  const splitName = splitFullName(row.full_name);
  const name = row.first_name?.trim() || row.name?.trim() || splitName.name;
  const surname = row.last_name?.trim() || row.surname?.trim() || splitName.surname;
  const employeeId =
    row.employee_id?.trim() || row.employee_code?.trim() || row.code?.trim() || row.id || '--';

  return {
    name,
    surname,
    employeeId,
    role: row.role?.trim() || 'employee',
    department: row.department?.trim() || 'Pendiente',
    shiftType: row.shift_type?.trim() || row.shift?.trim() || 'Pendiente',
    email: row.work_email?.trim().toLowerCase() || row.email?.trim().toLowerCase() || fallbackEmail,
    phone: row.phone?.trim() || row.mobile?.trim() || '--',
  };
}
