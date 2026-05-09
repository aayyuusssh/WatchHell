import { Link } from "react-router-dom"
import { Clock3, Eye } from "lucide-react"
import { compactNumber, formatDate, formatDuration, mediaUrl } from "../lib/format.js"

export default function VideoCard({ video }) {
  return (
    <Link
      to={`/watch/${video._id}`}
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-glow"
    >
      <div className="relative aspect-video overflow-hidden bg-slate-200">
        {mediaUrl(video.thumbnail) ? (
          <img
            src={mediaUrl(video.thumbnail)}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-300">
            No thumbnail
          </div>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-slate-950/85 px-2 py-1 text-xs font-medium text-white">
          <Clock3 className="h-3 w-3" aria-hidden="true" />
          {formatDuration(video.duration)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-950">{video.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{video.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {compactNumber(video.views)} views
          </span>
          <span>{formatDate(video.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}
