import { Film } from "lucide-react"

export default function EmptyState({ title, text, action }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/80 p-8 text-center">
      <Film className="h-10 w-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
      {text ? <p className="mt-2 max-w-md text-sm text-slate-500">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
