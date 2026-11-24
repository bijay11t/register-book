
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  CalendarDays,
  BookOpen,
  BarChart3,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Download,
  Check,
  X,
  Clock3,
  TrendingUp,
  Menu,
  School,
  ShieldCheck,
  LogOut,
  MoreHorizontal,
  ArrowUpRight,
  UserRound,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Filter,
  Calendar,
} from "lucide-react";
import {
  isSupabaseConfigured,
  supabase,
} from "./lib/supabase";
import type {
  AttendanceStatus,
  School as SchoolType,
  Student,
} from "./lib/types";

type Page =
  | "Overview"
  | "Schools"
  | "Students"
  | "Attendance"
  | "Classes"
  | "Timetable"
  | "Reports"
  | "Settings";

type NavItem = {
  label: Page;
  icon: typeof LayoutDashboard;
};

const navigation: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Schools", icon: School },
  { label: "Students", icon: GraduationCap },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Classes", icon: BookOpen },
  { label: "Timetable", icon: CalendarDays },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const demoSchools: SchoolType[] = [
  {
    id: "1",
    name: "Delhi Public Academy",
    code: "DPA001",
    contact_email: "admin@dpa.edu",
    contact_phone: "+91 98765 43210",
    address: "New Delhi, India",
    logo_url: null,
    status: "approved",
    created_at: "2026-11-20",
  },
  {
    id: "2",
    name: "St. Mary's High School",
    code: "SMH002",
    contact_email: "office@stmarys.edu",
    contact_phone: "+91 98765 43211",
    address: "Bhubaneswar, India",
    logo_url: null,
    status: "pending",
    created_at: "2026-11-22",
  },
  {
    id: "3",
    name: "Green Valley School",
    code: "GVS003",
    contact_email: "hello@gvs.edu",
    contact_phone: "+91 98765 43212",
    address: "Kolkata, India",
    logo_url: null,
    status: "approved",
    created_at: "2026-11-18",
  },
  {
    id: "4",
    name: "Sunrise International",
    code: "SIS004",
    contact_email: "info@sunrise.edu",
    contact_phone: "+91 98765 43213",
    address: "Cuttack, India",
    logo_url: null,
    status: "pending",
    created_at: "2026-11-23",
  },
];

const demoStudents: Student[] = [
  {
    id: "1",
    school_id: "1",
    class_id: "class-1",
    full_name: "Aarav Sharma",
    roll_number: "001",
    admission_number: "ADM001",
    photo_url: null,
    guardian_name: "Raj Sharma",
    guardian_phone: "+91 90000 00001",
    created_at: "2026-04-01",
  },
  {
    id: "2",
    school_id: "1",
    class_id: "class-1",
    full_name: "Ananya Patel",
    roll_number: "002",
    admission_number: "ADM002",
    photo_url: null,
    guardian_name: "Amit Patel",
    guardian_phone: "+91 90000 00002",
    created_at: "2026-04-01",
  },
  {
    id: "3",
    school_id: "1",
    class_id: "class-1",
    full_name: "Vihaan Kumar",
    roll_number: "003",
    admission_number: "ADM003",
    photo_url: null,
    guardian_name: "Suresh Kumar",
    guardian_phone: "+91 90000 00003",
    created_at: "2026-04-01",
  },
  {
    id: "4",
    school_id: "1",
    class_id: "class-1",
    full_name: "Diya Singh",
    roll_number: "004",
    admission_number: "ADM004",
    photo_url: null,
    guardian_name: "Ravi Singh",
    guardian_phone: "+91 90000 00004",
    created_at: "2026-04-01",
  },
  {
    id: "5",
    school_id: "1",
    class_id: "class-1",
    full_name: "Arjun Das",
    roll_number: "005",
    admission_number: "ADM005",
    photo_url: null,
    guardian_name: "Mohan Das",
    guardian_phone: "+91 90000 00005",
    created_at: "2026-04-01",
  },
];

const initialAttendance: Record<string, AttendanceStatus> = {
  "1": "present",
  "2": "present",
  "3": "absent",
  "4": "late",
  "5": "present",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [schools, setSchools] = useState(demoSchools);
  const [students, setStudents] = useState(demoStudents);
  const [attendance, setAttendance] =
    useState<Record<string, AttendanceStatus>>(initialAttendance);
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [studentName, setStudentName] = useState("");
  const [studentRoll, setStudentRoll] = useState("");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("Platform Administrator");

  const pendingSchools = schools.filter(
    (school) => school.status === "pending"
  ).length;

  const presentCount = Object.values(attendance).filter(
    (status) => status === "present"
  ).length;

  const absentCount = Object.values(attendance).filter(
    (status) => status === "absent"
  ).length;

  const lateCount = Object.values(attendance).filter(
    (status) => status === "late"
  ).length;

  const filteredStudents = useMemo(
    () =>
      students.filter((student) =>
        `${student.full_name} ${student.roll_number}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  const filteredSchools = useMemo(
    () =>
      schools.filter((school) => {
        const matchesSearch =
          `${school.name} ${school.code} ${school.contact_email}`
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesStatus =
          schoolFilter === "all" ||
          school.status === schoolFilter;

        return matchesSearch && matchesStatus;
      }),
    [schools, search, schoolFilter]
  );

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function changeSchoolStatus(
    schoolId: string,
    status: "approved" | "rejected"
  ) {
    if (!supabase) {
      notify("Supabase is not connected. This is demo mode.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("schools")
      .update({ status })
      .eq("id", schoolId);

    setSaving(false);

    if (error) {
      notify(error.message);
      return;
    }

    setSchools((current) =>
      current.map((school) =>
        school.id === schoolId
          ? { ...school, status }
          : school
      )
    );

    notify(
      status === "approved"
        ? "School approved successfully."
        : "School application rejected."
    );
  }

  async function addStudent() {
    const name = studentName.trim();
    const roll = studentRoll.trim();

    if (!name || !roll) {
      notify("Enter the student name and roll number.");
      return;
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      school_id: "1",
      class_id: "class-1",
      full_name: name,
      roll_number: roll,
      admission_number: null,
      photo_url: null,
      guardian_name: null,
      guardian_phone: null,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase
        .from("students")
        .insert({
          school_id: newStudent.school_id,
          class_id: newStudent.class_id,
          full_name: newStudent.full_name,
          roll_number: newStudent.roll_number,
        })
        .select()
        .single();

      if (error) {
        notify(error.message);
        return;
      }

      setStudents((current) => [
        data as Student,
        ...current,
      ]);
    } else {
      setStudents((current) => [
        newStudent,
        ...current,
      ]);
      notify("Demo student added locally.");
    }

    setStudentName("");
    setStudentRoll("");
    setShowAddStudent(false);
  }

  function updateAttendance(
    studentId: string,
    status: AttendanceStatus
  ) {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }));
  }

  function markAllPresent() {
    const updated: Record<string, AttendanceStatus> = {};

    students.forEach((student) => {
      updated[student.id] = "present";
    });

    setAttendance(updated);
    notify("All students marked present in this demo session.");
  }

  function exportStudents() {
    const header = [
      "Name",
      "Roll Number",
      "Admission Number",
    ];

    const rows = students.map((student) => [
      student.full_name,
      student.roll_number,
      student.admission_number ?? "",
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "register-book-students.csv";
    link.click();

    URL.revokeObjectURL(url);
    notify("Student CSV exported.");
  }

  function renderOverview() {
    return (
      <>
        <div className="welcome-row">
          <div>
            <div className="eyebrow">MONDAY, 23 NOVEMBER 2026</div>
            <h1>Good evening, Administrator <span>✦</span></h1>
            <p className="muted">
              Here's what's happening across your school network today.
            </p>
          </div>
          <button className="primary-button" onClick={() => setPage("Schools")}>
            <Plus size={17} /> Manage schools
          </button>
        </div>

        <section className="stats-grid">
          <StatCard
            label="Total schools"
            value={schools.length.toString()}
            detail="Registered institutions"
            icon={School}
            color="blue"
            trend="+12.5%"
          />
          <StatCard
            label="Total students"
            value={students.length.toString()}
            detail="In this demonstration"
            icon={GraduationCap}
            color="violet"
            trend="+8.2%"
          />
          <StatCard
            label="Pending applications"
            value={pendingSchools.toString()}
            detail="Awaiting review"
            icon={Clock3}
            color="amber"
            trend="Needs attention"
          />
          <StatCard
            label="Present today"
            value={`${students.length ? Math.round((presentCount / students.length) * 100) : 0}%`}
            detail={`${presentCount} present in demo`}
            icon={TrendingUp}
            color="green"
            trend="Live demo data"
          />
        </section>

        <div className="dashboard-grid">
          <section className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <h2>Attendance overview</h2>
                <p>Today's attendance summary</p>
              </div>
              <button
                className="subtle-button"
                onClick={() => setPage("Attendance")}
              >
                View details <ArrowUpRight size={15} />
              </button>
            </div>

            <div className="attendance-chart-area">
              <div className="donut-wrap">
                <div className="donut">
                  <div className="donut-center">
                    <strong>
                      {students.length
                        ? Math.round(
                            (presentCount / students.length) * 100
                          )
                        : 0}%
                    </strong>
                    <span>Present</span>
                  </div>
                </div>
              </div>
              <div className="chart-legend">
                <Legend color="green" label="Present" value={presentCount} />
                <Legend color="red" label="Absent" value={absentCount} />
                <Legend color="amber" label="Late" value={lateCount} />
              </div>
            </div>

            <div className="chart-footer">
              <span><Calendar size={14} /> 23 November 2026</span>
              <span>Demo figures</span>
            </div>
          </section>

          <section className="panel applications-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent applications</h2>
                <p>Schools waiting for approval</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setPage("Schools")}
                aria-label="View schools"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>

            {schools
              .filter((school) => school.status === "pending")
              .slice(0, 4)
              .map((school) => (
                <div className="application-item" key={school.id}>
                  <div className="school-avatar">
                    {school.name.charAt(0)}
                  </div>
                  <div className="application-info">
                    <strong>{school.name}</strong>
                    <span>{school.contact_email}</span>
                  </div>
                  <span className="status pending">Pending</span>
                </div>
              ))}

            {pendingSchools === 0 && (
              <div className="empty-state">
                No pending applications.
              </div>
            )}

            <button
              className="full-width-link"
              onClick={() => setPage("Schools")}
            >
              View all applications <ArrowUpRight size={15} />
            </button>
          </section>
        </div>

        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>School directory</h2>
              <p>Recently registered institutions</p>
            </div>
            <button
              className="subtle-button"
              onClick={() => setPage("Schools")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>
          <SchoolTable schools={schools.slice(0, 4)} />
        </section>
      </>
    );
  }

  function renderSchools() {
    return (
      <>
        <PageHeading
          eyebrow="INSTITUTION MANAGEMENT"
          title="School directory"
          description="Review applications and manage registered institutions."
        />
        <div className="toolbar panel">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search schools..."
            />
          </div>
          <select
            value={schoolFilter}
            onChange={(event) => setSchoolFilter(event.target.value)}
            className="filter-select"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>All institutions</h2>
              <p>{filteredSchools.length} schools found</p>
            </div>
          </div>
          <SchoolTable
            schools={filteredSchools}
            onApprove={(id) => changeSchoolStatus(id, "approved")}
            onReject={(id) => changeSchoolStatus(id, "rejected")}
            busy={saving}
          />
        </section>
      </>
    );
  }

  function renderStudents() {
    return (
      <>
        <PageHeading
          eyebrow="ACADEMIC RECORDS"
          title="Student directory"
          description="Manage student records and enrollment information."
        />
        <div className="toolbar panel">
          <div className="search-field">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students..."
            />
          </div>
          <button className="secondary-button" onClick={exportStudents}>
            <Download size={16} /> Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => setShowAddStudent(true)}
          >
            <Plus size={17} /> Add student
          </button>
        </div>

        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Students</h2>
              <p>{filteredStudents.length} records</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll number</th>
                  <th>Admission ID</th>
                  <th>Class</th>
                  <th>Guardian</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.full_name.charAt(0)}
                        </div>
                        <strong>{student.full_name}</strong>
                      </div>
                    </td>
                    <td>{student.roll_number}</td>
                    <td>{student.admission_number || "—"}</td>
                    <td>Class 10 · A</td>
                    <td>{student.guardian_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="empty-state">No students found.</div>
          )}
        </section>

        {showAddStudent && (
          <Modal title="Add new student" onClose={() => setShowAddStudent(false)}>
            <div className="form-stack">
              <label>
                Student name
                <input
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Enter full name"
                />
              </label>
              <label>
                Roll number
                <input
                  value={studentRoll}
                  onChange={(event) => setStudentRoll(event.target.value)}
                  placeholder="Enter roll number"
                />
              </label>
              <button className="primary-button block-button" onClick={addStudent}>
                Add student
              </button>
            </div>
          </Modal>
        )}
      </>
    );
  }

  function renderAttendance() {
    return (
      <>
        <PageHeading
          eyebrow="DAILY REGISTER"
          title="Attendance register"
          description="Review and update student attendance records."
        />
        <section className="panel attendance-toolbar">
          <div>
            <label className="small-label">CLASS</label>
            <select className="filter-select">
              <option>Class 10 · Section A</option>
            </select>
          </div>
          <div>
            <label className="small-label">DATE</label>
            <input
              type="date"
              className="filter-select"
              defaultValue="2026-11-23"
            />
          </div>
          <button className="primary-button" onClick={markAllPresent}>
            <Check size={17} /> Mark all present
          </button>
        </section>

        <section className="stats-grid compact-stats">
          <StatCard label="Present" value={String(presentCount)} icon={CheckCircle2} color="green" />
          <StatCard label="Absent" value={String(absentCount)} icon={X} color="red" />
          <StatCard label="Late" value={String(lateCount)} icon={Clock3} color="amber" />
          <StatCard label="Total students" value={String(students.length)} icon={Users} color="blue" />
        </section>

        <section className="panel table-panel">
          <div className="panel-heading">
            <div>
              <h2>Class attendance</h2>
              <p>Demo attendance data · Not yet saved to database</p>
            </div>
            <span className="status pending">Draft</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll number</th>
                  <th>Attendance status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-cell">
                        <div className="student-avatar">
                          {student.full_name.charAt(0)}
                        </div>
                        <strong>{student.full_name}</strong>
                      </div>
                    </td>
                    <td>{student.roll_number}</td>
                    <td>
                      <div className="attendance-actions">
                        {(
                          ["present", "absent", "late"] as AttendanceStatus[]
                        ).map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              updateAttendance(student.id, status)
                            }
                            className={`attendance-choice ${status} ${
                              attendance[student.id] === status
                                ? "selected"
                                : ""
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderPlaceholder(title: string, description: string) {
    return (
      <>
        <PageHeading
          eyebrow="REGISTER BOOK"
          title={title}
          description={description}
        />
        <section className="panel coming-soon">
          <div className="coming-icon"><ShieldCheck size={28} /></div>
          <h2>{title} workspace</h2>
          <p>
            This section is part of the Register Book V7 development plan.
            The complete database-backed workflow will be added in the next implementation stage.
          </p>
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <BookOpen size={22} />
          </div>
          <div className="brand-copy">
            <strong>register<span>.</span></strong>
            <small>BOOK MANAGEMENT</small>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-symbol"><ShieldCheck size={18} /></div>
          <div>
            <strong>Platform workspace</strong>
            <span>Administrator</span>
          </div>
          <ChevronDown size={15} />
        </div>

        <div className="nav-label">WORKSPACE</div>
        <nav className="side-navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-link ${page === label ? "active" : ""}`}
              onClick={() => {
                setPage(label);
                setMobileMenu(false);
                setSearch("");
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Schools" && pendingSchools > 0 && (
                <span className="nav-count">{pendingSchools}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon"><ShieldCheck size={18} /></div>
            <strong>Secure workspace</strong>
            <p>Keep every school's records protected.</p>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">PA</div>
            <div>
              <strong>{userName}</strong>
              <span>Platform owner</span>
            </div>
            <button
              className="icon-button"
              onClick={() => notify("Sign out requires authentication setup.")}
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button icon-button"
              onClick={() => setMobileMenu(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumbs">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{page}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={16} />
              <input
                placeholder="Search..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </div>
            <button
              className="notification-button icon-button"
              onClick={() => setPage("Schools")}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {pendingSchools > 0 && <i />}
            </button>
            <div className="topbar-divider" />
            <div className="topbar-profile">
              <div className="user-avatar small-avatar">PA</div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        <div className="page-content">
          {page === "Overview" && renderOverview()}
          {page === "Schools" && renderSchools()}
          {page === "Students" && renderStudents()}
          {page === "Attendance" && renderAttendance()}
          {page === "Classes" &&
            renderPlaceholder("Classes & sections", "Organize academic classes, sections and student groups.")}
          {page === "Timetable" &&
            renderPlaceholder("Timetable", "Manage subjects, periods, teachers and weekly schedules.")}
          {page === "Reports" &&
            renderPlaceholder("Reports & analytics", "View attendance summaries and academic reports.")}
          {page === "Settings" &&
            renderPlaceholder("Settings", "Configure school policies, account preferences and platform options.")}
        </div>
      </main>

      {notice && (
        <div className="toast">
          <AlertCircle size={17} />
          {notice}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: typeof LayoutDashboard;
  color: string;
  trend?: string;
}) {
  return (
    <div className="stat-card panel">
      <div className="stat-top">
        <span>{label}</span>
        <div className={`stat-icon ${color}`}><Icon size={19} /></div>
      </div>
      <strong className="stat-value">{value}</strong>
      <div className="stat-bottom">
        <span>{detail || "Overview"}</span>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="legend-item">
      <span className={`legend-dot ${color}`} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p className="muted">{description}</p>
    </div>
  );
}

function SchoolTable({
  schools,
  onApprove,
  onReject,
  busy = false,
}: {
  schools: SchoolType[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  busy?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Institution</th>
            <th>School code</th>
            <th>Contact</th>
            <th>Status</th>
            {(onApprove || onReject) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {schools.map((school) => (
            <tr key={school.id}>
              <td>
                <div className="school-cell">
                  <div className="school-avatar">
                    {school.name.charAt(0)}
                  </div>
                  <div>
                    <strong>{school.name}</strong>
                    <span>{school.address || "Address not provided"}</span>
                  </div>
                </div>
              </td>
              <td><span className="code-text">{school.code}</span></td>
              <td>
                <div className="contact-cell">
                  <strong>{school.contact_email}</strong>
                  <span>{school.contact_phone || "—"}</span>
                </div>
              </td>
              <td>
                <span className={`status ${school.status}`}>
                  {school.status}
                </span>
              </td>
              {(onApprove || onReject) && (
                <td>
                  {school.status === "pending" ? (
                    <div className="row-actions">
                      {onApprove && (
                        <button
                          className="approve-button"
                          disabled={busy}
                          onClick={() => onApprove(school.id)}
                        >
                          <Check size={14} /> Approve
                        </button>
                      )}
                      {onReject && (
                        <button
                          className="reject-button"
                          disabled={busy}
                          onClick={() => onReject(school.id)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {schools.length === 0 && (
        <div className="empty-state">No schools match your search.</div>
      )}
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-card"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default App;
