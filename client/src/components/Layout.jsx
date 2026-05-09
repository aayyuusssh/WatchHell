import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { Clapperboard, LogOut, Menu, Search, Upload, UserRound, X } from "lucide-react"
import { useState } from "react"
import { authApi } from "../lib/api.js"
import { avatarUrl } from "../lib/format.js"

const navItems = [
  { to: "/", label: "Home" },
  { to: "/upload", label: "Upload" },
  { to: "/profile", label: "Profile" }
]

export default function Layout({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function handleLogout() {
    await authApi.logout()
    onLogout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Clapperboard className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-normal text-slate-950">WatchHell</span>
          </Link>

          <div className="hidden min-w-0 max-w-md flex-1 px-8 md:block">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                placeholder="Search is on the feed"
                disabled
              />
            </label>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-3 hidden items-center gap-3 md:flex">
            <Link
              to="/upload"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload
            </Link>
            <img src={avatarUrl(user)} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200" />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              title="Logout"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
            onClick={() => setOpen((value) => !value)}
            title="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <img src={avatarUrl(user)} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">{user?.fullName}</p>
                <p className="truncate text-xs text-slate-500">@{user?.username}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium ${
                      isActive ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`
                  }
                >
                  {item.to === "/upload" ? <Upload className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
