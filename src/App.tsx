
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
  Users,
  UserRound,
  X,
  XCircle
} from "lucide-react";

import AuthScreen from "./components/AuthScreen";
import { getMyProfile, signOut } from "./lib/auth";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { Profile, SchoolStatus, UserRole } from "./lib/types";

type SchoolRow = {
  id: string;
  name: string;
  code: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  logo_url: string | null;
  status: SchoolStatus;
  created_at: string;
};

type DashboardCounts = {
  students: number;
  teachers: number;
  classes: number;
  attendance: number;
};

type Section =
  | "Overview"
  | "Schools"
  | "Students"
  | "Classes"
  | "Teachers"
  | "Attendance"
  | "Timetable"
  | "Reports"
  | "Settings";

const navigation: {
  label: Section;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
}[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["platform_owner", "school_admin", "headmaster", "teacher"]
  },
  {
    label: "Schools",
    icon: Building2,
    roles: ["platform_owner"]
  },
  {
    label: "Students",
    icon: GraduationCap,
    roles: ["school_admin", "headmaster", "teacher"]
  },
  {
    label: "Classes",
    icon: BookOpen,
    roles: ["school_admin", "headmaster", "teacher"]
  },
  {
    label: "Teachers",
    icon: Users,
    roles: ["school_admin", "headmaster"]
  },
  {
    label: "Attendance",
    icon: CalendarDays,
    roles: ["school_admin", "headmaster", "teacher"]
  },
  {
    label: "Timetable",
    icon: Clock3,
    roles: ["school_admin", "headmaster", "teacher"]
  },
  {
    label: "Reports",
    icon: Activity,
    roles: ["school_admin", "headmaster", "teacher"]
  },
  {
    label: "Settings",
    icon: ShieldCheck,
    roles: ["platform_owner", "school_admin", "headmaster"]
  }
];

function formatDate(value?: string) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getInitials(name?: string | null) {
  if (!name) return "RB";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    platform_owner: "Platform Owner",
    pending_school_admin: "School Application",
    school_admin: "School Administrator",
    headmaster: "Headmaster",
    teacher: "Teacher"
  };

  return labels[role];
}

function StatusBadge({ status }: { status: SchoolStatus }) {
  const styles: Record<SchoolStatus, string> = {
    approved: "status-approved",
    pending: "status-pending",
    rejected: "status-rejected",
    suspended: "status-suspended"
  };

  return (
    <span className={`status-badge ${styles[status]}`}>
      <span className="status-dot" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function LoadingScreen() {
  return (
    <div className="app-loading">
      <div className="loading-brand">
        <div className="brand-mark">
          <BookOpen size={24} />
        </div>
        <span>REGISTER<span className="brand-accent">BOOK</span></span>
      </div>
      <div className="loading-spinner" />
      <p>Preparing your workspace...</p>
    </div>
  );
}

function NoticeScreen({
  title,
  description,
  icon: Icon,
  action
}: {
  title: string;
  description: string;
  icon: typeof Clock3;
  action?: () => void;
}) {
  return (
    <div className="notice-screen">
      <div className="notice-card">
        <div className="notice-icon">
          <Icon size={30} />
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        {action && (
          <button className="primary-button" onClick={action}>
            <LogOut size={16} />
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [school, setSchool] = useState<SchoolRow | null>(null);
  const [schoolStatus, setSchoolStatus] = useState<SchoolStatus | null>(null);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [counts, setCounts] = useState<DashboardCounts>({
    students: 0,
    teachers: 0,
    classes: 0,
    attendance: 0
  });

  const [section, setSection] = useState<Section>("Overview");
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [processingSchool, setProcessingSchool] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const currentProfile = await getMyProfile();
      setProfile(currentProfile);

      if (!currentProfile) {
        setSchool(null);
        setSchoolStatus(null);
        setSchools([]);
        return;
      }

      if (currentProfile.role === "platform_owner") {
        setSchool(null);
        setSchoolStatus(null);
        return;
      }

      if (!currentProfile.school_id) {
        setSchool(null);
        setSchoolStatus(null);
        return;
      }

      const { data, error: schoolError } = await supabase
        .from("schools")
        .select(
          "id, name, code, contact_email, contact_phone, address, logo_url, status, created_at"
        )
        .eq("id", currentProfile.school_id)
        .maybeSingle();

      if (schoolError) throw schoolError;

      setSchool(data as SchoolRow | null);
      setSchoolStatus((data?.status as SchoolStatus) ?? null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your account."
      );
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    if (!supabase || !profile) return;

    setDataLoading(true);
    setError("");

    try {
      if (profile.role === "platform_owner") {
        const { data, error: schoolsError } = await supabase
          .from("schools")
          .select(
            "id, name, code, contact_email, contact_phone, address, logo_url, status, created_at"
          )
          .order("created_at", { ascending: false });

        if (schoolsError) throw schoolsError;

        setSchools((data ?? []) as SchoolRow[]);
        return;
      }

      if (!profile.school_id) return;

      const schoolId = profile.school_id;

      const [
        studentsResult,
        teachersResult,
        classesResult,
        attendanceResult
      ] = await Promise.all([
        supabase
          .from("students")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId),

        supabase
          .from("teachers")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId),

        supabase
          .from("classes")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId),

        supabase
          .from("attendance")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId)
      ]);

      const firstError =
        studentsResult.error ||
        teachersResult.error ||
        classesResult.error ||
        attendanceResult.error;

      if (firstError) throw firstError;

      setCounts({
        students: studentsResult.count ?? 0,
        teachers: teachersResult.count ?? 0,
        classes: classesResult.count ?? 0,
        attendance: attendanceResult.count ?? 0
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard information."
      );
    } finally {
      setDataLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    const initialize = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          await loadProfile();
        } else if (active) {
          setProfile(null);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to initialize your account."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void initialize();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setSchool(null);
        setSchoolStatus(null);
        setSchools([]);
        setCounts({
          students: 0,
          teachers: 0,
          classes: 0,
          attendance: 0
        });
        setSection("Overview");
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        window.setTimeout(() => {
          if (active) {
            void loadProfile();
          }
        }, 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  useEffect(() => {
    if (profile) {
      void loadDashboardData();
    }
  }, [profile, loadDashboardData]);

  const handleSignOut = async () => {
    try {
      setError("");
      await signOut();
      setProfile(null);
      setSchool(null);
      setSchoolStatus(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to sign out."
      );
    }
  };

  const updateSchoolStatus = async (
    schoolId: string,
    status: SchoolStatus
  ) => {
    if (!supabase || profile?.role !== "platform_owner") return;

    const confirmed = window.confirm(
      `Are you sure you want to ${status} this school application?`
    );

    if (!confirmed) return;

    setProcessingSchool(schoolId);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await supabase
        .from("schools")
        .update({ status })
        .eq("id", schoolId);

      if (updateError) throw updateError;

      const updatedSchools = schools.map((item) =>
        item.id === schoolId ? { ...item, status } : item
      );

      setSchools(updatedSchools);
      setSuccess(`School application ${status}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update school status."
      );
    } finally {
      setProcessingSchool(null);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <NoticeScreen
        title="Connect your database"
        description="Add your Supabase project URL and publishable key in the Vercel environment variables, then redeploy the application."
        icon={ShieldCheck}
      />
    );
  }

  if (loading) return <LoadingScreen />;

  if (!profile) {
    return (
      <AuthScreen
        onAuthenticated={() => {
          setLoading(true);
          void loadProfile().finally(() => setLoading(false));
        }}
      />
    );
  }

  if (profile.role === "pending_school_admin") {
    return (
      <NoticeScreen
        title="Application under review"
        description="Your school registration has been received. You can access the school workspace after the platform owner approves your application."
        icon={Clock3}
        action={handleSignOut}
      />
    );
  }

  if (
    profile.role !== "platform_owner" &&
    (!profile.school_id || !school)
  ) {
    return (
      <NoticeScreen
        title="School profile unavailable"
        description="Your account is not connected to an active school profile. Please contact the platform administrator."
        icon={School}
        action={handleSignOut}
      />
    );
  }

  if (
    profile.role !== "platform_owner" &&
    schoolStatus !== "approved"
  ) {
    const blockedTitle =
      schoolStatus === "rejected"
        ? "Application not approved"
        : schoolStatus === "suspended"
          ? "School account suspended"
          : "Waiting for approval";

    const blockedDescription =
      schoolStatus === "rejected"
        ? "Your school application was not approved. Please contact the platform administrator."
        : schoolStatus === "suspended"
          ? "Access to this school workspace has been suspended. Please contact the platform administrator."
          : "Your school account is awaiting approval from the platform owner.";

    return (
      <NoticeScreen
        title={blockedTitle}
        description={blockedDescription}
        icon={ShieldCheck}
        action={handleSignOut}
      />
    );
  }

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(profile.role)
  );

  const pendingCount = schools.filter(
    (item) => item.status === "pending"
  ).length;

  const filteredSchools = schools.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      item.name.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query) ||
      item.contact_email.toLowerCase().includes(query)
    );
  });

  const pageTitle =
    section === "Overview"
      ? profile.role === "platform_owner"
        ? "Platform overview"
        : "School overview"
      : section;

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <BookOpen size={22} />
          </div>
          <div className="brand-name">
            <strong>REGISTER<span>BOOK</span></strong>
            <small>SCHOOL MANAGEMENT</small>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-workspace">
          <div className="workspace-icon">
            {profile.role === "platform_owner" ? (
              <ShieldCheck size={19} />
            ) : (
              <School size={19} />
            )}
          </div>
          <div className="workspace-copy">
            <strong>
              {profile.role === "platform_owner"
                ? "Platform workspace"
                : school?.name ?? "School workspace"}
            </strong>
            <small>{roleLabel(profile.role)}</small>
          </div>
        </div>

        <div className="nav-heading">WORKSPACE</div>

        <nav className="sidebar-nav">
          {visibleNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  section === item.label ? "nav-item-active" : ""
                }`}
                onClick={() => {
                  setSection(item.label);
                  setMobileMenuOpen(false);
                  setError("");
                  setSuccess("");
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === "Schools" && pendingCount > 0 && (
                  <span className="nav-count">{pendingCount}</span>
                )}
                {section === item.label && (
                  <ChevronRight className="nav-chevron" size={16} />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Secure workspace</strong>
              <small>Your school data stays private</small>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div>
              <div className="breadcrumb">
                Workspace <ChevronRight size={13} /> {section}
              </div>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="topbar-right">
            <button
              className="icon-button"
              title="Refresh dashboard"
              onClick={() => {
                void loadDashboardData();
                void loadProfile();
              }}
            >
              <RefreshCw size={17} />
            </button>

            <div className="topbar-user">
              <div className="user-avatar">
                {getInitials(profile.full_name)}
              </div>
              <div className="user-info">
                <strong>{profile.full_name}</strong>
                <small>{roleLabel(profile.role)}</small>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="app-alert app-alert-error">
              <XCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )}

          {success && (
            <div className="app-alert app-alert-success">
              <CheckCircle2 size={18} />
              <span>{success}</span>
              <button onClick={() => setSuccess("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )}

          {section === "Overview" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <span className="eyebrow">
                    {profile.role === "platform_owner"
                      ? "PLATFORM CONTROL CENTER"
                      : "YOUR SCHOOL WORKSPACE"}
                  </span>
                  <h2>
                    Welcome back, {profile.full_name.split(" ")[0]}.
                  </h2>
                  <p>
                    {profile.role === "platform_owner"
                      ? "Manage school applications and monitor your platform."
                      : "Your school's records and daily operations, all in one place."}
                  </p>
                </div>
                <div className="welcome-decoration">
                  <div className="welcome-decoration-circle">
                    <BookOpen size={52} />
                  </div>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h2>At a glance</h2>
                  <p>
                    {profile.role === "platform_owner"
                      ? "Current platform activity"
                      : "Your school's current records"}
                  </p>
                </div>
                <button
                  className="subtle-button"
                  onClick={() => void loadDashboardData()}
                  disabled={dataLoading}
                >
                  <RefreshCw
                    size={15}
                    className={dataLoading ? "spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {profile.role === "platform_owner" ? (
                <div className="stats-grid">
                  <StatCard
                    title="Total schools"
                    value={schools.length}
                    icon={Building2}
                    tone="blue"
                    detail="Registered schools"
                  />
                  <StatCard
                    title="Pending applications"
                    value={pendingCount}
                    icon={Clock3}
                    tone="orange"
                    detail="Awaiting review"
                  />
                  <StatCard
                    title="Approved schools"
                    value={
                      schools.filter((item) => item.status === "approved")
                        .length
                    }
                    icon={CheckCircle2}
                    tone="green"
                    detail="Active workspaces"
                  />
                  <StatCard
                    title="Suspended schools"
                    value={
                      schools.filter((item) => item.status === "suspended")
                        .length
                    }
                    icon={ShieldCheck}
                    tone="purple"
                    detail="Restricted workspaces"
                  />
                </div>
              ) : (
                <div className="stats-grid">
                  <StatCard
                    title="Total students"
                    value={counts.students}
                    icon={GraduationCap}
                    tone="blue"
                    detail="Enrolled students"
                  />
                  <StatCard
                    title="Total teachers"
                    value={counts.teachers}
                    icon={Users}
                    tone="green"
                    detail="School teaching staff"
                  />
                  <StatCard
                    title="Total classes"
                    value={counts.classes}
                    icon={BookOpen}
                    tone="orange"
                    detail="Classes and sections"
                  />
                  <StatCard
                    title="Attendance records"
                    value={counts.attendance}
                    icon={CalendarDays}
                    tone="purple"
                    detail="Saved attendance entries"
                  />
                </div>
              )}

              {profile.role === "platform_owner" ? (
                <section className="content-panel">
                  <div className="panel-header">
                    <div>
                      <h2>Recent school applications</h2>
                      <p>Review and manage registered schools</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setSection("Schools")}
                    >
                      View all <ChevronRight size={15} />
                    </button>
                  </div>
                  <SchoolTable
                    schools={schools.slice(0, 5)}
                    processingSchool={processingSchool}
                    onStatusChange={updateSchoolStatus}
                  />
                </section>
              ) : (
                <section className="content-panel">
                  <div className="panel-header">
                    <div>
                      <h2>School information</h2>
                      <p>Your registered school profile</p>
                    </div>
                    <StatusBadge status="approved" />
                  </div>
                  <div className="school-information">
                    <div className="school-avatar">
                      {school?.logo_url ? (
                        <img src={school.logo_url} alt="School logo" />
                      ) : (
                        <School size={28} />
                      )}
                    </div>
                    <div className="school-details">
                      <h3>{school?.name}</h3>
                      <p>School code: {school?.code || "Not assigned"}</p>
                      <p>{school?.contact_email}</p>
                      <p>{school?.address || "Address not provided"}</p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {section === "Schools" && profile.role === "platform_owner" && (
            <section className="content-panel">
              <div className="panel-header">
                <div>
                  <h2>School management</h2>
                  <p>Review applications and manage school access</p>
                </div>
                <div className="panel-actions">
                  <span className="record-count">
                    {schools.length} schools
                  </span>
                </div>
              </div>

              <div className="table-toolbar">
                <div className="search-field">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search schools, codes or email..."
                  />
                </div>
                <button
                  className="subtle-button"
                  onClick={() => void loadDashboardData()}
                >
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>

              <SchoolTable
                schools={filteredSchools}
                processingSchool={processingSchool}
                onStatusChange={updateSchoolStatus}
              />
            </section>
          )}

          {section !== "Overview" && section !== "Schools" && (
            <section className="content-panel coming-panel">
              <div className="coming-icon">
                {section === "Students" && <GraduationCap size={30} />}
                {section === "Classes" && <BookOpen size={30} />}
                {section === "Teachers" && <Users size={30} />}
                {section === "Attendance" && <CalendarDays size={30} />}
                {section === "Timetable" && <Clock3 size={30} />}
                {section === "Reports" && <Activity size={30} />}
                {section === "Settings" && <ShieldCheck size={30} />}
              </div>
              <h2>{section}</h2>
              <p>
                This workspace module is being connected to the database.
                Your account and school access are active.
              </p>
              <div className="coming-status">
                <span className="status-dot" />
                Module setup in progress
              </div>
            </section>
          )}

          <footer className="app-footer">
            <span>© {new Date().getFullYear()} Register Book</span>
            <span>School management workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
  detail
}: {
  title: string;
  value: number;
  icon: typeof Users;
  tone: "blue" | "green" | "orange" | "purple";
  detail: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className={`stat-icon stat-${tone}`}>
          <Icon size={20} />
        </span>
        <span className="stat-trend">
          <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="stat-value">{value.toLocaleString("en-IN")}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-detail">{detail}</div>
    </div>
  );
}

function SchoolTable({
  schools,
  processingSchool,
  onStatusChange
}: {
  schools: SchoolRow[];
  processingSchool: string | null;
  onStatusChange: (
    schoolId: string,
    status: SchoolStatus
  ) => Promise<void>;
}) {
  if (schools.length === 0) {
    return (
      <div className="empty-state">
        <Building2 size={30} />
        <h3>No schools found</h3>
        <p>School applications will appear here after registration.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>School</th>
            <th>Contact</th>
            <th>Registered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="school-table-name">
                  <div className="school-table-avatar">
                    {item.logo_url ? (
                      <img src={item.logo_url} alt="" />
                    ) : (
                      <School size={18} />
                    )}
                  </div>
                  <div>
                    <strong>{item.name}</strong>
                    <small>{item.code}</small>
                  </div>
                </div>
              </td>
              <td>
                <div className="contact-cell">
                  <strong>{item.contact_email}</strong>
                  <small>{item.contact_phone || "No phone provided"}</small>
                </div>
              </td>
              <td>{formatDate(item.created_at)}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>
                <div className="school-actions">
                  {item.status !== "approved" && (
                    <button
                      className="action-approve"
                      title="Approve school"
                      disabled={processingSchool === item.id}
                      onClick={() =>
                        void onStatusChange(item.id, "approved")
                      }
                    >
                      {processingSchool === item.id ? (
                        <RefreshCw size={15} className="spin" />
                      ) : (
                        <Check size={15} />
                      )}
                    </button>
                  )}

                  {item.status !== "rejected" && (
                    <button
                      className="action-reject"
                      title="Reject school"
                      disabled={processingSchool === item.id}
                      onClick={() =>
                        void onStatusChange(item.id, "rejected")
                      }
                    >
                      <X size={15} />
                    </button>
                  )}

                  {item.status !== "suspended" &&
                    item.status === "approved" && (
                      <button
                        className="action-suspend"
                        title="Suspend school"
                        disabled={processingSchool === item.id}
                        onClick={() =>
                          void onStatusChange(item.id, "suspended")
                        }
                      >
                        <ShieldCheck size={15} />
                      </button>
                    )}

                  {item.status === "suspended" && (
                    <button
                      className="action-approve"
                      title="Reactivate school"
                      disabled={processingSchool === item.id}
                      onClick={() =>
                        void onStatusChange(item.id, "approved")
                      }
                    >
                      <Check size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
