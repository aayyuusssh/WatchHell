export default function Spinner({ label = "Loading" }) {
  return (
    <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
      <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      {label}
    </div>
  )
}
