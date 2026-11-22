import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowRight, BookOpen, Building2, CalendarDays, Check,
  CheckCircle2, ChevronRight, GraduationCap, LayoutDashboard, LockKeyhole,
  LogOut, Menu, ShieldCheck, Users, X
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { Profile, School, Student } from "./lib/types";

type Screen = "home" | "login" | "apply";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) void loadProfile(data.session.user.id);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        setLoading(true);
        window.setTimeout(() => void loadProfile(next.user.id), 0);
      } else {
        setProfile(null);
        setSchool(null);
        setLoading(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, school_id")
      .eq("id", userId)
      .maybeSingle();
    if (error) setNotice(error.message);
    setProfile(data as Profile | null);
    if (data?.school_id) {
      const { data: schoolData } = await supabase
        .from("schools").select("*").eq("id", data.school_id).maybeSingle();
      setSchool(schoolData as School | null);
    } else {
      setSchool(null);
    }
    setLoading(false);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setNotice("");
    setScreen("home");
  }

  if (!isSupabaseConfigured) {
    return <SetupScreen onApply={() => setScreen("apply")} onLogin={() => setScreen("login")} screen={screen} setScreen={setScreen} />;
  }

  if (loading) return <div className="loading-screen"><div className="loader" /><span>Opening Register Book…</span></div>;

  if (!session) {
    return <PublicSite
      screen={screen}
      setScreen={setScreen}
      notice={notice}
      setNotice={setNotice}
    />;
  }

  if (!profile) {
    return <div className="loading-screen"><div className="loader" /><p>Preparing your account…</p><button className="text-button" onClick={signOut}>Sign out</button></div>;
  }

  if (profile.role === "platform_owner") {
    return <OwnerDashboard profile={profile} onSignOut={signOut} notice={notice} setNotice={setNotice} />;
  }
  if (profile.role === "pending_school_admin") {
    return <PendingScreen name={profile.full_name} onSignOut={signOut} />;
  }
  return <SchoolDashboard profile={profile} school={school} onSignOut={signOut} notice={notice} setNotice={setNotice} />;
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <div className={`brand ${inverse ? "brand-inverse" : ""}`}>
    <div className="brand-mark"><BookOpen size={20} strokeWidth={2.4} /></div>
    <span>register<span className="brand-light">book</span></span>
  </div>;
}

function SetupScreen({ onApply, onLogin, screen, setScreen }: any) {
  return <PublicSite screen={screen} setScreen={setScreen} notice="The website design is ready. Connect Supabase to activate school applications, sign-in and private school data." setNotice={() => {}} setupMode onApply={onApply} onLogin={onLogin} />;
}

function PublicSite({ screen, setScreen, notice, setNotice, setupMode = false, onApply, onLogin }: any) {
  const [name, setName] = useState("");
  const [admin, setAdmin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setNotice("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNotice(error.message);
    setBusy(false);
  }

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setNotice("");
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: admin } }
    });
    if (error) { setNotice(error.message); setBusy(false); return; }
    if (!data.session) {
      setNotice("Account created. Confirm your email, then sign in and submit the school application. If email confirmation is disabled during setup, the application will be submitted automatically.");
      setBusy(false);
      setScreen("login");
      return;
    }
    const { error: appError } = await supabase.rpc("submit_school_application", {
      p_school_name: name,
      p_contact_phone: phone
    });
    setNotice(appError ? appError.message : "Your school application has been submitted. The platform owner must approve it before your school workspace becomes active.");
    setBusy(false);
  }

  return <div className="public-shell">
    <header className="topbar">
      <Brand />
      <nav className="desktop-nav">
        <a href="#features">Features</a><a href="#how-it-works">How it works</a><a href="#privacy">Privacy</a>
      </nav>
      <div className="top-actions">
        <button className="button button-ghost" onClick={() => setScreen("login")}>Sign in</button>
        <button className="button button-primary" onClick={() => setScreen("apply")}>Register a school <ArrowRight size={16}/></button>
      </div>
    </header>

    {screen === "home" && <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> SCHOOL MANAGEMENT, MADE CLEAR</div>
          <h1>Every school day.<br/><span>In good order.</span></h1>
          <p className="hero-text">A simple, secure place for schools to manage students, teachers, timetables and period-wise attendance.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => setScreen("apply")}>Register your school <ArrowRight size={17}/></button>
            <button className="button button-outline button-large" onClick={() => setScreen("login")}>School sign in</button>
          </div>
          <div className="hero-proof"><ShieldCheck size={17}/> Separate, private workspace for every approved school</div>
        </div>
        <div className="hero-visual">
          <div className="visual-glow"/>
          <div className="mock-window">
            <div className="mock-head"><div className="mock-dots"><i/><i/><i/></div><span>ATTENDANCE OVERVIEW</span><span className="mock-live">LIVE VIEW</span></div>
            <div className="mock-welcome"><div><small>MONDAY, 22 NOVEMBER</small><h3>Good morning, School Admin</h3></div><div className="mock-avatar">SA</div></div>
            <div className="mock-stats">
              <div className="mock-stat"><span>Present</span><strong>842</strong><em className="green">● On track</em></div>
              <div className="mock-stat"><span>Absent</span><strong>26</strong><em className="red">● Review</em></div>
              <div className="mock-stat"><span>Late</span><strong>12</strong><em className="amber">● Follow up</em></div>
            </div>
            <div className="mock-chart"><div className="chart-title"><b>Attendance trend</b><span>This week</span></div><div className="chart-bars">{[48,68,57,82,72,91,76,96,69,85,75,92,63,80,95,72,88,78,96,68,83,74,91,80].map((v,i)=><i key={i} style={{height:`${v}%`}}/>)}</div><div className="chart-labels"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span></div></div>
            <div className="mock-bottom"><span><i className="tiny-dot"/> Class 8 · Section A</span><b>96.4% attendance</b></div>
          </div>
          <div className="float-card float-card-top"><div className="float-icon purple"><Users size={17}/></div><div><b>Student records</b><small>Organised by class</small></div><CheckCircle2 size={18} className="float-check"/></div>
          <div className="float-card float-card-bottom"><div className="float-icon mint"><Check size={18}/></div><div><b>Period submitted</b><small>Mathematics · Period 3</small></div></div>
        </div>
      </section>

      <section className="trust-strip"><div><strong>One platform</strong><span>for every school</span></div><div><strong>Role-based access</strong><span>for staff and teachers</span></div><div><strong>Period-wise records</strong><span>with clear history</span></div><div><strong>Private by design</strong><span>school data stays separate</span></div></section>

      <section className="section" id="features">
        <div className="section-heading"><div className="eyebrow">BUILT FOR THE SCHOOL DAY</div><h2>Less paperwork.<br/><span>More clarity.</span></h2><p>Keep daily school operations organised without making the process complicated.</p></div>
        <div className="feature-grid">
          <Feature icon={<Users/>} title="Student records" text="Keep student profiles, roll numbers, class, section and photos organised."/>
          <Feature icon={<CalendarDays/>} title="Period-wise attendance" text="Teachers submit attendance for their assigned class and period."/>
          <Feature icon={<GraduationCap/>} title="Teacher access" text="Give each staff member an account and the right level of access."/>
          <Feature icon={<Activity/>} title="Clear reports" text="Review present, absent and late records across the school day."/>
          <Feature icon={<Building2/>} title="Separate school spaces" text="Each approved school gets its own private workspace and records."/>
          <Feature icon={<ShieldCheck/>} title="Controlled access" text="School information is protected by account roles and database permissions."/>
        </div>
      </section>

      <section className="how-section" id="how-it-works"><div className="how-inner"><div className="eyebrow">GETTING STARTED</div><h2>Three steps to a<br/><span>more organised school.</span></h2><div className="steps"><Step n="01" title="Apply" text="A school administrator submits the school's registration details."/><Step n="02" title="Get approved" text="The platform owner reviews the application and activates the school."/><Step n="03" title="Get to work" text="The school admin sets up classes, staff, students and the timetable."/></div><button className="button button-primary button-large" onClick={() => setScreen("apply")}>Apply for school access <ArrowRight size={17}/></button></div></section>

      <section className="privacy-section" id="privacy"><div className="privacy-icon"><LockKeyhole size={25}/></div><div><div className="eyebrow">PRIVACY MATTERS</div><h2>School records are<br/><span>not public records.</span></h2><p>Register Book is designed so school staff can access only the school information they are authorised to see. Student details and photographs must remain protected behind sign-in and school-level permissions.</p></div></section>
    </main>}

    {screen === "login" && <AuthPanel title="Welcome back" subtitle="Sign in to your Register Book workspace." onSubmit={login} busy={busy} notice={notice} email={email} setEmail={setEmail} password={password} setPassword={setPassword} submitText="Sign in" onBack={() => setScreen("home")} switchText="Need a school account?" switchAction={() => setScreen("apply")}/>}
    {screen === "apply" && <div className="form-page"><div className="form-card"><button className="back-link" onClick={() => setScreen("home")}>← Back to home</button><div className="eyebrow">SCHOOL REGISTRATION</div><h2>Bring your school<br/><span>onto Register Book.</span></h2><p className="form-intro">Submit your details. Your school workspace will be created after approval.</p>
      <form onSubmit={apply} className="form-grid">
        <label>School name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sunrise Public School"/></label>
        <label>Administrator / Headmaster name<input required value={admin} onChange={e=>setAdmin(e.target.value)} placeholder="Full name"/></label>
        <label>Official email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="school@example.com"/></label>
        <label>Contact phone<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91"/></label>
        <label className="full-field">Create password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
        {notice && <div className="notice full-field">{notice}</div>}
        {setupMode && <div className="notice full-field">The visual website is ready. Connect Supabase and run the included database setup before registrations can work.</div>}
        <button disabled={busy || setupMode} className="button button-primary button-large full-field">{busy ? "Submitting…" : "Submit school application"} <ArrowRight size={17}/></button>
      </form><p className="form-foot">Already registered? <button onClick={() => setScreen("login")}>Sign in</button></p>
    </div></div>}
    <footer className="footer"><Brand/><span>© {new Date().getFullYear()} Register Book. School records, organised.</span><span>Independent school workspaces</span></footer>
  </div>;
}

function Feature({icon,title,text}:any){return <article className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p><ChevronRight size={17} className="feature-arrow"/></article>}
function Step({n,title,text}:any){return <div className="step"><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>}

function AuthPanel({title,subtitle,onSubmit,busy,notice,email,setEmail,password,setPassword,submitText,onBack,switchText,switchAction}:any){
  return <div className="auth-page"><div className="auth-card"><button className="back-link" onClick={onBack}>← Back</button><Brand/><div className="eyebrow">SECURE SCHOOL ACCESS</div><h2>{title}</h2><p>{subtitle}</p><form onSubmit={onSubmit} className="auth-form"><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@school.edu"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></label>{notice&&<div className="notice">{notice}</div>}<button className="button button-primary button-large" disabled={busy}>{busy?"Please wait…":submitText}<ArrowRight size={17}/></button></form><p className="auth-switch">{switchText} <button onClick={switchAction}>Register a school</button></p></div></div>
}

function OwnerDashboard({profile,onSignOut,notice,setNotice}:any){
  const [schools,setSchools]=useState<School[]>([]);
  const [busy,setBusy]=useState(true);
  const [filter,setFilter]=useState("all");
  async function load(){if(!supabase)return;setBusy(true);const {data,error}=await supabase.from("schools").select("*").order("created_at",{ascending:false});if(error)setNotice(error.message);setSchools((data||[]) as School[]);setBusy(false)}
  useEffect(()=>{void load()},[]);
  async function approve(id:string){if(!supabase)return;const {error}=await supabase.rpc("approve_school_application",{p_school_id:id});setNotice(error?error.message:"School approved successfully.");if(!error)void load()}
  const shown=useMemo(()=>filter==="all"?schools:schools.filter(s=>s.status===filter),[schools,filter]);
  return <DashboardShell title="Platform overview" subtitle="Manage school applications and platform access." name={profile.full_name} onSignOut={onSignOut} active="Overview">
    <div className="dash-welcome"><div><div className="eyebrow">PLATFORM OWNER</div><h1>Good day, {profile.full_name.split(" ")[0]}.</h1><p>Here is the current Register Book school directory.</p></div><div className="welcome-icon"><ShieldCheck size={28}/></div></div>
    {notice&&<div className="notice">{notice}</div>}
    <div className="stat-grid"><Stat icon={<Building2/>} label="Total schools" value={schools.length}/><Stat icon={<Activity/>} label="Pending review" value={schools.filter(s=>s.status==="pending").length}/><Stat icon={<CheckCircle2/>} label="Approved" value={schools.filter(s=>s.status==="approved").length}/><Stat icon={<LockKeyhole/>} label="Suspended" value={schools.filter(s=>s.status==="suspended").length}/></div>
    <div className="panel"><div className="panel-head"><div><h2>School directory</h2><p>Review applications and manage school access.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All schools</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="suspended">Suspended</option><option value="rejected">Rejected</option></select></div>
      {busy?<div className="empty-state">Loading schools…</div>:shown.length===0?<div className="empty-state"><Building2 size={26}/><b>No schools found</b><span>New school applications will appear here.</span></div>:<div className="table-wrap"><table><thead><tr><th>School</th><th>Contact email</th><th>Applied</th><th>Status</th><th>Action</th></tr></thead><tbody>{shown.map(s=><tr key={s.id}><td><b>{s.name}</b></td><td>{s.contact_email}</td><td>{new Date(s.created_at).toLocaleDateString()}</td><td><span className={`status status-${s.status}`}>{s.status}</span></td><td>{s.status==="pending"?<button className="small-action" onClick={()=>approve(s.id)}><Check size={14}/> Approve</button>:<span className="muted">—</span>}</td></tr>)}</tbody></table></div>}
    </div>
  </DashboardShell>
}

function SchoolDashboard({profile,school,onSignOut,notice,setNotice}:any){
  const [students,setStudents]=useState<Student[]>([]);
  const [classes,setClasses]=useState<any[]>([]);
  const [tab,setTab]=useState("Overview");
  const [showAdd,setShowAdd]=useState(false);
  const [fullName,setFullName]=useState("");
  const [roll,setRoll]=useState("");
  const [className,setClassName]=useState("");
  const [section,setSection]=useState("");
  const [busy,setBusy]=useState(false);
  async function load(){if(!supabase||!profile.school_id)return;const [st,cl]=await Promise.all([supabase.from("students").select("id,full_name,roll_number,class_name,section").eq("school_id",profile.school_id).order("class_name"),supabase.from("school_classes").select("*").eq("school_id",profile.school_id)]);if(st.error)setNotice(st.error.message);setStudents((st.data||[]) as Student[]);setClasses(cl.data||[])}
  useEffect(()=>{void load()},[profile.school_id]);
  async function addStudent(e:React.FormEvent){e.preventDefault();if(!supabase||!profile.school_id)return;setBusy(true);const {error}=await supabase.from("students").insert({school_id:profile.school_id,full_name:fullName,roll_number:roll,class_name:className,section});setNotice(error?error.message:"Student added.");if(!error){setFullName("");setRoll("");setClassName("");setSection("");setShowAdd(false);void load()}setBusy(false)}
  const nav=["Overview","Students","Teachers","Attendance","Timetable"];
  return <DashboardShell title={school?.name||"School workspace"} subtitle="Your school's private attendance workspace." name={profile.full_name} onSignOut={onSignOut} active={tab} onNav={setTab}>
    <div className="dash-welcome"><div><div className="eyebrow">{school?.name||"SCHOOL WORKSPACE"}</div><h1>Good morning, {profile.full_name.split(" ")[0]}.</h1><p>Here is your school's workspace at a glance.</p></div><div className="welcome-icon"><GraduationCap size={28}/></div></div>
    {school?.status!=="approved"&&<div className="notice">Your school account is awaiting platform approval. Some actions are unavailable until approval is complete.</div>}
    {notice&&<div className="notice">{notice}</div>}
    {tab==="Overview"&&<><div className="stat-grid"><Stat icon={<Users/>} label="Students" value={students.length}/><Stat icon={<GraduationCap/>} label="Classes" value={classes.length}/><Stat icon={<CalendarDays/>} label="Attendance sessions" value="—"/><Stat icon={<Activity/>} label="Today's attendance" value="—"/></div><div className="panel"><div className="panel-head"><div><h2>Workspace setup</h2><p>Start by organising your school records.</p></div></div><div className="setup-list"><SetupItem n="01" title="Add your classes and sections" desc="Set up class levels and sections for your school."/><SetupItem n="02" title="Add student records" desc="Create student profiles with roll numbers and class details."/><SetupItem n="03" title="Set up teachers and timetable" desc="Assign staff, subjects and periods."/><SetupItem n="04" title="Start period-wise attendance" desc="Teachers can submit their own period attendance."/></div></div></>}
    {tab==="Students"&&<div className="panel"><div className="panel-head"><div><h2>Student records</h2><p>Manage student names, roll numbers and class assignments.</p></div><button className="button button-primary" onClick={()=>setShowAdd(!showAdd)}>+ Add student</button></div>{showAdd&&<form className="student-form" onSubmit={addStudent}><label>Student name<input required value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name"/></label><label>Roll number<input required value={roll} onChange={e=>setRoll(e.target.value)} placeholder="Roll no."/></label><label>Class number<input required value={className} onChange={e=>setClassName(e.target.value)} placeholder="e.g. 8"/></label><label>Section<input required value={section} onChange={e=>setSection(e.target.value)} placeholder="e.g. A"/></label><button className="button button-primary" disabled={busy}>{busy?"Saving…":"Save student"}</button></form>}{students.length===0?<div className="empty-state"><Users size={26}/><b>No student records yet</b><span>Add your first student to begin.</span></div>:<div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Class</th><th>Section</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td><b>{s.full_name}</b></td><td>{s.roll_number}</td><td>{s.class_name}</td><td>{s.section}</td></tr>)}</tbody></table></div>}</div>}
    {tab!=="Overview"&&tab!=="Students"&&<div className="panel"><div className="empty-state"><Activity size={26}/><b>{tab} setup is the next development phase</b><span>The project foundation is in place. This module still needs to be implemented and tested before school use.</span></div></div>}
  </DashboardShell>
}

function DashboardShell({children,title,subtitle,name,onSignOut,active,onNav}:any){
  const [open,setOpen]=useState(false);
  const nav=[{label:"Overview",icon:<LayoutDashboard size={18}/>},{label:"Students",icon:<Users size={18}/>},{label:"Teachers",icon:<GraduationCap size={18}/>},{label:"Attendance",icon:<CalendarDays size={18}/>},{label:"Timetable",icon:<BookOpen size={18}/>}];
  return <div className="dashboard-shell"><aside className={`sidebar ${open?"sidebar-open":""}`}><Brand/><div className="side-label">WORKSPACE</div>{nav.map(n=><button key={n.label} onClick={()=>{onNav?.(n.label);setOpen(false)}} className={`side-link ${active===n.label?"side-active":""}`}>{n.icon}{n.label}</button>)}<div className="sidebar-bottom"><div className="user-mini"><div className="user-avatar">{name?.slice(0,1)||"U"}</div><div><b>{name}</b><small>Signed in</small></div></div><button className="side-link signout" onClick={onSignOut}><LogOut size={18}/> Sign out</button></div></aside><main className="dashboard-main"><header className="dash-topbar"><button className="menu-button" onClick={()=>setOpen(!open)}><Menu/></button><div><b>{title}</b><small>{subtitle}</small></div><div className="top-user"><span>{name}</span><div className="user-avatar">{name?.slice(0,1)||"U"}</div></div></header><div className="dash-content">{children}</div></main></div>
}
function Stat({icon,label,value}:any){return <div className="stat-card"><div className="stat-top"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>Current records</small></div>}
function SetupItem({n,title,desc}:any){return <div className="setup-item"><span>{n}</span><div><b>{title}</b><small>{desc}</small></div><ChevronRight size={18}/></div>}
function PendingScreen({name,onSignOut}:any){return <div className="pending-page"><div className="pending-card"><div className="pending-icon"><Activity size={28}/></div><Brand/><h1>Application under review</h1><p>Hello {name}. Your school registration has been received. The platform owner must approve it before your school workspace is activated.</p><button className="button button-outline" onClick={onSignOut}>Sign out</button></div></div>}
