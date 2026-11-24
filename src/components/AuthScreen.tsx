
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound
} from "lucide-react";
import {
  applyForSchool,
  signIn
} from "../lib/auth";

interface AuthScreenProps {
  onAuthenticated: () => void;
}

type AuthMode = "login" | "register";

export default function AuthScreen({
  onAuthenticated
}: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    schoolName: "",
    contactPhone: "",
    address: ""
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(form.email, form.password);
        onAuthenticated();
      } else {
        const result = await applyForSchool(form);

        if (result.confirmationRequired) {
          setSuccessMessage(
            "Your school application has been submitted. Check your email and confirm your address before signing in. Your application will remain pending until the platform owner approves it."
          );
        } else {
          setSuccessMessage(
            "Your school application has been created. Your account is awaiting platform approval."
          );
        }

        setMode("login");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background-glow" />

      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <BookOpen size={25} />
          </div>
          <div>
            <strong>register<span>book</span></strong>
            <small>SCHOOL MANAGEMENT PLATFORM</small>
          </div>
        </div>

        <div className="auth-brand-content">
          <div className="auth-eyebrow">
            <span />
            THE SMARTER SCHOOL WORKSPACE
          </div>
          <h1>
            Every school.
            <br />
            One <span>intelligent</span>
            <br />
            workspace.
          </h1>
          <p>
            Manage school operations, student records,
            teachers, timetables and period-wise attendance
            from one secure platform.
          </p>

          <div className="auth-feature-list">
            <div>
              <ShieldCheck size={19} />
              <span>Private school workspaces</span>
            </div>
            <div>
              <UsersIcon />
              <span>Role-based access</span>
            </div>
            <div>
              <CheckCircle2 size={19} />
              <span>Period-wise attendance records</span>
            </div>
          </div>
        </div>

        <div className="auth-brand-footer">
          REGISTER BOOK V7 <span>•</span> SCHOOL MANAGEMENT
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand">
            <div className="auth-brand-icon">
              <BookOpen size={22} />
            </div>
            <strong>register<span>book</span></strong>
          </div>

          <div className="auth-heading">
            <div className="auth-eyebrow">
              {mode === "login" ? "WELCOME BACK" : "JOIN REGISTER BOOK"}
            </div>
            <h2>
              {mode === "login"
                ? "Sign in to your workspace"
                : "Register your school"}
            </h2>
            <p>
              {mode === "login"
                ? "Enter your account details to continue."
                : "Submit your school details for platform approval."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "selected" : ""}
              onClick={() => changeMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "selected" : ""}
              onClick={() => changeMode("register")}
            >
              School registration
            </button>
          </div>

          {errorMessage && (
            <div className="auth-message auth-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-message auth-success" role="status">
              {successMessage}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <label>
                  Your full name
                  <span className="auth-input-wrap">
                    <UserRound size={17} />
                    <input
                      value={form.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </span>
                </label>

                <label>
                  School name
                  <span className="auth-input-wrap">
                    <Building2 size={17} />
                    <input
                      value={form.schoolName}
                      onChange={(event) =>
                        updateField("schoolName", event.target.value)
                      }
                      placeholder="Enter your school name"
                      required
                    />
                  </span>
                </label>

                <label>
                  Contact phone
                  <span className="auth-input-wrap">
                    <Phone size={17} />
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(event) =>
                        updateField("contactPhone", event.target.value)
                      }
                      placeholder="School contact number"
                    />
                  </span>
                </label>

                <label>
                  School address
                  <span className="auth-input-wrap">
                    <MapPin size={17} />
                    <input
                      value={form.address}
                      onChange={(event) =>
                        updateField("address", event.target.value)
                      }
                      placeholder="City, district and state"
                    />
                  </span>
                </label>
              </>
            )}

            <label>
              Email address
              <span className="auth-input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </span>
            </label>

            <label>
              Password
              <span className="auth-input-wrap">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  placeholder={
                    mode === "register"
                      ? "At least 8 characters"
                      : "Enter your password"
                  }
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </span>
            </label>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in to workspace"
                  : "Submit school application"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-security-note">
            <ShieldCheck size={16} />
            <span>
              Your school information is protected by account-based access.
            </span>
          </div>

          <div className="auth-bottom-note">
            {mode === "login"
              ? "New school? Register your school to request access."
              : "Already registered? Sign in to your account."}
          </div>
        </div>
      </section>
    </main>
  );
}

function UsersIcon() {
  return <UserRound size={19} />;
}


