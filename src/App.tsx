
import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X
} from "lucide-react";

type Page =
  | "Dashboard"
  | "Schools"
  | "Students"
  | "Teachers"
  | "Classes"
  | "Attendance"
  | "Timetable"
  | "Reports"
  | "Settings";

const navigation: {
  label: Page;
  icon: typeof LayoutDashboard;
}[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Schools", icon: GraduationCap },
  { label: "Students", icon: Users },
  { label: "Teachers", icon: BookOpen },
  { label: "Classes", icon: CalendarDays },
  { label: "Attendance", icon: ClipboardCheck },
  { label: "Timetable", icon: CalendarDays },
  { label: "Reports", icon: Activity },
  { label: "Settings", icon: Settings }
];

const metrics = [
  {
    label: "Total Schools",
    value: "24",
    change: "+3 this month",
    icon: GraduationCap,
    color: "blue"
  },
  {
    label: "Total Students",
    value: "8,420",
    change: "+12.8% this month",
    icon: Users,
    color: "violet"
  },
  {
    label: "Teachers",
    value: "386",
    change: "+8 this month",
    icon: BookOpen,
    color: "green"
  },
  {
    label: "Attendance Rate",
    value: "94.6%",
    change: "+2.4% this month",
    icon: ClipboardCheck,
    color: "orange"
  }
];

function Dashboard() {
  return (
    <>
      <div className="welcome-row">
        <div>
          <div className="eyebrow">OVERVIEW / DASHBOARD</div>
          <h1>Good day, Administrator</h1>
          <p className="muted">
            Here's what's happening across your school network.
          </p>
        </div>
        <div className="date-chip">
          <CalendarDays size={16} />
          <span>{new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          })}</span>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="metric-card" key={metric.label}>
              <div className="metric-top">
                <span>{metric.label}</span>
                <div className={`metric-icon ${metric.color}`}>
                  <Icon size={19} />
                </div>
              </div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-change">
                <ArrowUpRight size={15} />
                {metric.change}
              </div>
            </article>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Attendance overview</h2>
              <p className="muted">Illustrative weekly attendance data</p>
            </div>
            <button className="subtle-button">
              This week <ChevronDown size={15} />
            </button>
          </div>

          <div className="chart-area">
            <div className="chart-y-labels">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className="chart-content">
              <div className="chart-grid-lines">
                {[0, 1, 2, 3, 4].map((line) => (
                  <span key={line} />
                ))}
              </div>
              <div className="chart-bars">
                {[
                  ["Mon", 82],
                  ["Tue", 91],
                  ["Wed", 76],
                  ["Thu", 95],
                  ["Fri", 88],
                  ["Sat", 67]
                ].map(([day, height]) => (
                  <div className="bar-column" key={day}>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span>{day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-legend">
            <span className="legend-dot" />
            Attendance percentage
          </div>
        </section>

        <section className="panel quick-panel">
          <div className="panel-heading">
            <div>
              <h2>Quick overview</h2>
              <p className="muted">Platform status</p>
            </div>
            <Activity size={19} className="muted-icon" />
          </div>
          <div className="status-row">
            <div className="status-symbol green">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <strong>Application interface</strong>
              <span>Running</span>
            </div>
            <span className="status-indicator" />
          </div>
          <div className="status-row">
            <div className="status-symbol blue">
              <ShieldCheck size={19} />
            </div>
            <div>
              <strong>Database connection</strong>
              <span>Configure Supabase to activate</span>
            </div>
            <span className="status-indicator warning" />
          </div>
          <div className="status-row">
            <div className="status-symbol violet">
              <Users size={19} />
            </div>
            <div>
              <strong>School accounts</strong>
              <span>Awaiting live data integration</span>
            </div>
            <span className="status-indicator warning" />
          </div>
        </section>
      </div>

      <section className="panel bottom-panel">
        <div className="panel-heading">
          <div>
            <h2>Platform modules</h2>
            <p className="muted">
              Your school management workspace
            </p>
          </div>
        </div>
        <div className="module-grid">
          {[
            ["School management", "Manage applications and school profiles", GraduationCap],
            ["Student records", "Student profiles and guardians", Users],
            ["Teacher management", "Teacher accounts and assignments", BookOpen],
            ["Period attendance", "Individual period attendance records", ClipboardCheck]
          ].map(([title, description, Icon]) => {
            const ModuleIcon = Icon as typeof LayoutDashboard;
            return (
              <div className="module-card" key={title as string}>
                <ModuleIcon size={21} />
                <strong>{title as string}</strong>
                <span>{description as string}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function PlaceholderPage({ page }: { page: Page }) {
  return (
    <div className="empty-module panel">
      <div className="empty-icon">
        <BookOpen size={28} />
      </div>
      <div className="eyebrow">REGISTER BOOK / {page.toUpperCase()}</div>
      <h2>{page}</h2>
      <p className="muted">
        This module is part of the application plan. Its database-backed
        workflow will be added in the next implementation stage.
      </p>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <BookOpen size={22} />
          </div>
          <div>
            <strong>register<span>book</span></strong>
            <small>SCHOOL MANAGEMENT</small>
          </div>
          <button
            className="icon-button sidebar-close"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => {
                setActivePage(label);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
              {label === "Schools" && (
                <span className="nav-count">24</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <ShieldCheck size={20} />
            <strong>Private workspace</strong>
            <span>School data protection is a core platform requirement.</span>
          </div>
          <div className="profile-mini">
            <div className="avatar">AD</div>
            <div>
              <strong>Administrator</strong>
              <span>Platform workspace</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{activePage}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search workspace..."
                aria-label="Search workspace"
              />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Bell size={19} />
              <i />
            </button>
            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="page-content">
          {activePage === "Dashboard" ? (
            <Dashboard />
          ) : (
            <PlaceholderPage page={activePage} />
          )}
          <footer className="footer">
            <span>© {new Date().getFullYear()} Register Book</span>
            <span>School management workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
