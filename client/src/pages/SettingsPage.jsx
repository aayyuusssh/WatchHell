import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { userApi } from "../lib/api.js"

export default function SettingsPage({ user, onUserUpdate }) {
  const [values, setValues] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || ""
  })
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [section, setSection] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    setValues({
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || ""
    })
  }, [user])

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const payload = await userApi.updateDetails({
        username: values.username,
        fullName: values.fullName,
        email: values.email
      })
      onUserUpdate?.((current) => ({ ...current, ...payload.data }))
      setMessage("Profile settings saved.")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordError("")
    setPasswordMessage("")

    if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    setPasswordLoading(true)
    try {
      await userApi.changePassword({
        oldPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword
      })
      setPasswordMessage("Password updated successfully.")
      setPasswordValues({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (err) {
      setPasswordError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <button
            type="button"
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
              section === "profile" ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setSection("profile")}
          >
            Profile settings
          </button>
          <button
            type="button"
            className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
              section === "security" ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setSection("security")}
          >
            Security
          </button>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-slate-950">Account settings</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your profile information, username, and password.</p>
        </div>

        {section === "profile" ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Profile settings</h2>
            <p className="mt-1 text-sm text-slate-500">Change your username, full name, or email address.</p>
            <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit}>
              <label className="block text-sm text-slate-700">
                Username
                <input
                  value={values.username}
                  onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                Full name
                <input
                  value={values.fullName}
                  onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                Email address
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Save profile
              </button>
            </form>
          </div>
        ) : null}

        {section === "security" ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Security</h2>
            <p className="mt-1 text-sm text-slate-500">Change your password securely.</p>
            <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
              <label className="block text-sm text-slate-700">
                Current password
                <input
                  type="password"
                  value={passwordValues.currentPassword}
                  onChange={(event) => setPasswordValues((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                New password
                <input
                  type="password"
                  value={passwordValues.newPassword}
                  onChange={(event) => setPasswordValues((current) => ({ ...current, newPassword: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                Confirm new password
                <input
                  type="password"
                  value={passwordValues.confirmPassword}
                  onChange={(event) => setPasswordValues((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>

              {passwordError ? <p className="text-sm text-rose-600">{passwordError}</p> : null}
              {passwordMessage ? <p className="text-sm text-emerald-600">{passwordMessage}</p> : null}

              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Change password
              </button>
            </form>
          </div>
        ) : null}
      </section>
    </div>
  )
}
