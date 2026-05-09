import { Link } from "react-router-dom"
import { Search, SlidersHorizontal, Upload } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import EmptyState from "../components/EmptyState.jsx"
import Spinner from "../components/Spinner.jsx"
import VideoCard from "../components/VideoCard.jsx"
import { videoApi } from "../lib/api.js"

export default function HomePage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [sortType, setSortType] = useState("desc")

  const filters = useMemo(() => ({ page: 1, limit: 12, query, sortBy: "createdAt", sortType }), [query, sortType])

  useEffect(() => {
    let alive = true
    async function loadVideos() {
      setLoading(true)
      setError("")
      try {
        const payload = await videoApi.list(filters)
        if (alive) setVideos(payload.data.videos || [])
      } catch (err) {
        if (alive) {
          setVideos([])
          setError(err.message === "No videos found" ? "" : err.message)
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadVideos()
    return () => {
      alive = false
    }
  }, [filters])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg bg-slate-950 text-white">
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_340px] md:p-8">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">WatchHell feed</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-normal sm:text-4xl">Discover uploads from your streaming backend.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Browse videos, open a watch page, comment, and jump straight into publishing your next video.
            </p>
          </div>
          <div className="relative min-h-48 overflow-hidden rounded-lg">
            <img
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=900&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            placeholder="Search videos by title"
          />
        </label>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <select
            value={sortType}
            onChange={(event) => setSortType(event.target.value)}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </section>

      {loading ? <Spinner label="Loading videos" /> : null}
      {!loading && error ? <EmptyState title="Feed could not load" text={error} /> : null}
      {!loading && !error && videos.length === 0 ? (
        <EmptyState
          title="No videos yet"
          text="Publish the first video and it will appear here."
          action={
            <Link to="/upload" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload video
            </Link>
          }
        />
      ) : null}
      {!loading && !error && videos.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </section>
      ) : null}
    </div>
  )
}
