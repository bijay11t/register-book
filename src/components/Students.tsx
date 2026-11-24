
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  RefreshCw,
  Users,
  Phone,
  Hash
} from "lucide-react";
import { supabase } from "../lib/supabase";

type SchoolClass = {
  id: string;
  name: string;
  section: string;
  academic_year: string;
};

type Student = {
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
};

type StudentForm = {
  full_name: string;
  class_id: string;
  roll_number: string;
  admission_number: string;
  photo_url: string;
  guardian_name: string;
  guardian_phone: string;
};

const emptyForm: StudentForm = {
  full_name: "",
  class_id: "",
  roll_number: "",
  admission_number: "",
  photo_url: "",
  guardian_name: "",
  guardian_phone: ""
};

export default function Students({
  schoolId
}: {
  schoolId: string;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    if (!supabase) return;

    setLoading(true);
    setError("");

    try {
      const [studentsResult, classesResult] = await Promise.all([
        supabase
          .from("students")
          .select(
            "id, school_id, class_id, full_name, roll_number, admission_number, photo_url, guardian_name, guardian_phone, created_at"
          )
          .eq("school_id", schoolId)
          .order("full_name"),

        supabase
          .from("classes")
          .select("id, name, section, academic_year")
          .eq("school_id", schoolId)
          .order("name")
      ]);

      if (studentsResult.error) throw studentsResult.error;
      if (classesResult.error) throw classesResult.error;

      setStudents((studentsResult.data ?? []) as Student[]);
      setClasses((classesResult.data ?? []) as SchoolClass[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [schoolId]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !query ||
        student.full_name.toLowerCase().includes(query) ||
        student.roll_number.toLowerCase().includes(query) ||
        (student.admission_number ?? "").toLowerCase().includes(query) ||
        (student.guardian_name ?? "").toLowerCase().includes(query);

      const matchesClass =
        classFilter === "all" || student.class_id === classFilter;

      return matchesSearch && matchesClass;
    });
  }, [students, search, classFilter]);

  function openAddModal() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      class_id: classes[0]?.id ?? ""
    });
    setError("");
    setModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingId(student.id);
    setForm({
      full_name: student.full_name,
      class_id: student.class_id,
      roll_number: student.roll_number,
      admission_number: student.admission_number ?? "",
      photo_url: student.photo_url ?? "",
      guardian_name: student.guardian_name ?? "",
      guardian_phone: student.guardian_phone ?? ""
    });
    setError("");
    setModalOpen(true);
  }

  function updateField(
    field: keyof StudentForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) return;

    if (!form.full_name.trim() || !form.class_id || !form.roll_number.trim()) {
      setError("Please enter the student name, class and roll number.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const studentData = {
      school_id: schoolId,
      class_id: form.class_id,
      full_name: form.full_name.trim(),
      roll_number: form.roll_number.trim(),
      admission_number: form.admission_number.trim() || null,
      photo_url: form.photo_url.trim() || null,
      guardian_name: form.guardian_name.trim() || null,
      guardian_phone: form.guardian_phone.trim() || null
    };

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from("students")
          .update(studentData)
          .eq("id", editingId)
          .eq("school_id", schoolId);

        if (updateError) throw updateError;

        setSuccess("Student details updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("students")
          .insert(studentData);

        if (insertError) throw insertError;

        setSuccess("Student added successfully.");
      }

      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save student."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student: Student) {
    if (!supabase) return;

    const confirmed = window.confirm(
      `Delete ${student.full_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const { error: deleteError } = await supabase
        .from("students")
        .delete()
        .eq("id", student.id)
        .eq("school_id", schoolId);

      if (deleteError) throw deleteError;

      setStudents((current) =>
        current.filter((item) => item.id !== student.id)
      );
      setSuccess("Student deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete student."
      );
    }
  }

  function getClassName(classId: string) {
    const found = classes.find((item) => item.id === classId);
    return found
      ? `${found.name} - ${found.section}`
      : "Class unavailable";
  }

  return (
    <div className="students-module">
      <div className="students-heading">
        <div>
          <span className="students-eyebrow">SCHOOL RECORDS</span>
          <h2>Students</h2>
          <p>Manage student profiles, admissions and class information.</p>
        </div>

        <button
          className="students-primary-button"
          onClick={openAddModal}
          disabled={classes.length === 0}
        >
          <Plus size={17} />
          Add student
        </button>
      </div>

      <div className="students-summary">
        <div className="students-summary-icon">
          <Users size={22} />
        </div>
        <div>
          <strong>{students.length.toLocaleString("en-IN")}</strong>
          <span>Total registered students</span>
        </div>
      </div>

      {error && (
        <div className="students-message students-error">
          {error}
          <button onClick={() => setError("")} aria-label="Close error">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="students-message students-success">
          {success}
          <button onClick={() => setSuccess("")} aria-label="Close message">
            <X size={16} />
          </button>
        </div>
      )}

      {classes.length === 0 && !loading && (
        <div className="students-empty">
          <GraduationCap size={28} />
          <h3>Create classes first</h3>
          <p>Add at least one class and section before registering students.</p>
        </div>
      )}

      <div className="students-toolbar">
        <div className="students-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, roll number or admission number..."
          />
        </div>

        <select
          value={classFilter}
          onChange={(event) => setClassFilter(event.target.value)}
        >
          <option value="all">All classes</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} - {item.section}
            </option>
          ))}
        </select>

        <button
          className="students-refresh"
          onClick={() => void loadData()}
          disabled={loading}
          title="Refresh students"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <div className="students-table-panel">
        {loading ? (
          <div className="students-loading">
            <RefreshCw size={22} className="students-spin" />
            Loading student records...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="students-empty">
            <GraduationCap size={30} />
            <h3>No students found</h3>
            <p>Try changing your search or add a new student.</p>
          </div>
        ) : (
          <div className="students-table-scroll">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll number</th>
                  <th>Class</th>
                  <th>Admission no.</th>
                  <th>Guardian</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name-cell">
                        <div className="student-photo">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.full_name}
                            />
                          ) : (
                            <GraduationCap size={18} />
                          )}
                        </div>
                        <strong>{student.full_name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="student-number">
                        <Hash size={12} />
                        {student.roll_number}
                      </span>
                    </td>

                    <td>{getClassName(student.class_id)}</td>
                    <td>{student.admission_number || "—"}</td>
                    <td>{student.guardian_name || "—"}</td>

                    <td>
                      {student.guardian_phone ? (
                        <span className="student-phone">
                          <Phone size={12} />
                          {student.guardian_phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <div className="student-actions">
                        <button
                          onClick={() => openEditModal(student)}
                          title="Edit student"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="student-delete"
                          onClick={() => void deleteStudent(student)}
                          title="Delete student"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="students-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setModalOpen(false);
            }
          }}
        >
          <div className="students-modal">
            <div className="students-modal-header">
              <div>
                <span className="students-eyebrow">STUDENT INFORMATION</span>
                <h2>{editingId ? "Edit student" : "Add new student"}</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveStudent}>
              <div className="students-form-grid">
                <label className="students-field students-field-full">
                  Student full name *
                  <input
                    value={form.full_name}
                    onChange={(event) =>
                      updateField("full_name", event.target.value)
                    }
                    placeholder="Enter full name"
                    required
                  />
                </label>

                <label className="students-field">
                  Class and section *
                  <select
                    value={form.class_id}
                    onChange={(event) =>
                      updateField("class_id", event.target.value)
                    }
                    required
                  >
                    <option value="">Select class</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - {item.section}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="students-field">
                  Roll number *
                  <input
                    value={form.roll_number}
                    onChange={(event) =>
                      updateField("roll_number", event.target.value)
                    }
                    placeholder="e.g. 01"
                    required
                  />
                </label>

                <label className="students-field">
                  Admission number
                  <input
                    value={form.admission_number}
                    onChange={(event) =>
                      updateField("admission_number", event.target.value)
                    }
                    placeholder="Admission number"
                  />
                </label>

                <label className="students-field">
                  Guardian name
                  <input
                    value={form.guardian_name}
                    onChange={(event) =>
                      updateField("guardian_name", event.target.value)
                    }
                    placeholder="Parent or guardian"
                  />
                </label>

                <label className="students-field">
                  Guardian phone
                  <input
                    type="tel"
                    value={form.guardian_phone}
                    onChange={(event) =>
                      updateField("guardian_phone", event.target.value)
                    }
                    placeholder="Phone number"
                  />
                </label>

                <label className="students-field students-field-full">
                  Student photo URL
                  <input
                    type="url"
                    value={form.photo_url}
                    onChange={(event) =>
                      updateField("photo_url", event.target.value)
                    }
                    placeholder="https://example.com/student-photo.jpg"
                  />
                  <small>
                    Enter an image URL. Photo upload will be connected to
                    Supabase Storage in a later step.
                  </small>
                </label>
              </div>

              {error && (
                <div className="students-message students-error">
                  {error}
                </div>
              )}

              <div className="students-modal-actions">
                <button
                  type="button"
                  className="students-cancel-button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="students-primary-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="students-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      {editingId ? "Save changes" : "Add student"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
