import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Clapperboard, ImagePlus, Loader2, LockKeyhole, Mail, UserRound } from "lucide-react"
import { useState } from "react"
import { authApi, getStoredToken } from "../lib/api.js"

function Field({ icon: Icon, ...props }) {
  return (
    <label className="relative block">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        {...props}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  )
}

export default function AuthPage({ mode, onAuth }) {
  const isSignup = mode === "signup"
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    avatar: null,
    coverImage: null
  })
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  if (getStoredToken()) return <Navigate to="/" replace />

  function updateValue(event) {
    const { name, value, files } = event.target
    setValues((current) => ({ ...current, [name]: files ? files[0] : value }))
  }

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      if (isSignup) {
        const formData = new FormData()
        formData.append("fullName", values.fullName)
        formData.append("email", values.email)
        formData.append("username", values.username)
        formData.append("password", values.password)
        if (values.avatar) formData.append("avatar", values.avatar)
        if (values.coverImage) formData.append("coverImage", values.coverImage)
        await authApi.signup(formData)
      }

      const payload = await authApi.login({
        email: values.email,
        username: values.username,
        password: values.password
      })
      onAuth(payload.data.user)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950">
                <Clapperboard className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-xl font-bold">WatchHell</span>
            </Link>
            <div className="max-w-xl pb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Creator streaming studio</p>
              <h1 className="mt-5 text-5xl font-bold leading-tight tracking-normal">Stream, publish, and grow your channel from one clean dashboard.</h1>
              <p className="mt-5 text-base leading-7 text-slate-100">
                A modern frontend for your video backend with uploads, comments, subscriptions, and responsive browsing ready to wire into production.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Clapperboard className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-slate-950">WatchHell</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-950">{isSignup ? "Create your channel" : "Welcome back"}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {isSignup ? "Add an avatar so viewers recognize your channel." : "Sign in with your username or email."}
                </p>
              </div>

              {error ? <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

              <form onSubmit={submit} className="mt-6 grid gap-4">
                {isSignup ? <Field icon={UserRound} name="fullName" placeholder="Full name" value={values.fullName} onChange={updateValue} required /> : null}
                <Field icon={Mail} name="email" type="email" placeholder="Email" value={values.email} onChange={updateValue} required={isSignup} />
                <Field icon={UserRound} name="username" placeholder="Username" value={values.username} onChange={updateValue} required />
                <Field icon={LockKeyhole} name="password" type="password" placeholder="Password" value={values.password} onChange={updateValue} required />

                {isSignup ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50">
                      <ImagePlus className="mb-2 h-5 w-5" aria-hidden="true" />
                      {values.avatar?.name || "Avatar"}
                      <input className="sr-only" name="avatar" type="file" accept="image/*" onChange={updateValue} required />
                    </label>
                    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50">
                      <ImagePlus className="mb-2 h-5 w-5" aria-hidden="true" />
                      {values.coverImage?.name || "Cover image"}
                      <input className="sr-only" name="coverImage" type="file" accept="image/*" onChange={updateValue} />
                    </label>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  {isSignup ? "Create account" : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                {isSignup ? "Already have an account?" : "New to WatchHell?"}{" "}
                <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to={isSignup ? "/login" : "/signup"}>
                  {isSignup ? "Sign in" : "Create one"}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
