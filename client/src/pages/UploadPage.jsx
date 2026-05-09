import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileVideo, ImagePlus, Loader2, Send } from "lucide-react"
import { videoApi } from "../lib/api.js"

export default function UploadPage() {
  const [values, setValues] = useState({ title: "", description: "", videoFile: null, thumbnail: null })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function updateValue(event) {
    const { name, value, files } = event.target
    setValues((current) => ({ ...current, [name]: files ? files[0] : value }))
  }

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("description", values.description)
    if (values.videoFile) formData.append("videoFile", values.videoFile)
    if (values.thumbnail) formData.append("thumbnail", values.thumbnail)

    try {
      const payload = await videoApi.upload(formData)
      navigate(`/watch/${payload.data._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Creator studio</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">Upload a video</h1>
          <p className="mt-2 text-sm text-slate-500">Prepare the title, artwork, and video file before publishing.</p>
        </div>

        {error ? <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <form onSubmit={submit} className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Title</span>
            <input
              name="title"
              value={values.title}
              onChange={updateValue}
              required
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Give your video a clear title"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea
              name="description"
              value={values.description}
              onChange={updateValue}
              required
              rows={6}
              className="resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="Tell viewers what they are about to watch"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50">
              <FileVideo className="mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
              <span className="font-semibold text-slate-800">{values.videoFile?.name || "Choose video"}</span>
              <span className="mt-1 text-xs text-slate-500">MP4, MOV, or supported browser media</span>
              <input className="sr-only" type="file" name="videoFile" accept="video/*" onChange={updateValue} required />
            </label>

            <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50">
              <ImagePlus className="mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
              <span className="font-semibold text-slate-800">{values.thumbnail?.name || "Choose thumbnail"}</span>
              <span className="mt-1 text-xs text-slate-500">Use a 16:9 image for best results</span>
              <input className="sr-only" type="file" name="thumbnail" accept="image/*" onChange={updateValue} required />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            Publish video
          </button>
        </form>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Upload checklist</h2>
        <div className="mt-4 grid gap-3 text-sm text-slate-600">
          <p className="rounded-lg bg-slate-50 p-3">Use a title that is easy to scan in the feed.</p>
          <p className="rounded-lg bg-slate-50 p-3">Choose a thumbnail that clearly frames the subject.</p>
          <p className="rounded-lg bg-slate-50 p-3">After publishing, you will land directly on the watch page.</p>
        </div>
      </aside>
    </div>
  )
}
