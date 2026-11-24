
export type UserRole =
  | "platform_owner"
  | "pending_school_admin"
  | "school_admin"
  | "headmaster"
  | "teacher";

export type SchoolStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "late";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  school_id: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  logo_url: string | null;
  status: SchoolStatus;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
  section: string;
  academic_year: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  class_id: string;
  full_name: string;
  roll_number: string;
  admission_number: string | null;
  photo_url: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  created_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  profile_id: string;
  employee_number: string | null;
  designation: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  class_id: string;
  name: string;
  created_at: string;
}

export interface TeacherAssignment {
  id: string;
  school_id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  created_at: string;
}

export interface TimetablePeriod {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  period_number: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  timetable_period_id: string;
  attendance_date: string;
  status: AttendanceStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}
