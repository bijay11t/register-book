
export type UserRole =
  | "platform_owner"
  | "pending_school_admin"
  | "school_admin"
  | "headmaster"
  | "teacher";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  school_id: string | null;
}

export interface School {
  id: string;
  name: string;
  contact_email: string;
  contact_phone?: string | null;
  status: "pending" | "approved" | "rejected" | "suspended";
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  full_name: string;
  roll_number: string;
  class_name: string;
  section: string;
  photo_url?: string | null;
}
