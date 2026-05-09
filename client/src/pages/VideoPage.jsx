import { Link, useParams } from "react-router-dom"
import { Bell, Check, Heart, MessageCircle, Send, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import EmptyState from "../components/EmptyState.jsx"
import Spinner from "../components/Spinner.jsx"
import { commentApi, likeApi, userApi, videoApi } from "../lib/api.js"
import { avatarUrl, compactNumber, formatDate, formatDuration, mediaUrl } from "../lib/format.js"

export default function VideoPage({ user }) {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const [error, setError] = useState("")
  const [commentError, setCommentError] = useState("")

  useEffect(() => {
    let alive = true
    async function loadVideo() {
      setLoading(true)
      setError("")
      try {
        const payload = await videoApi.get(videoId)
        if (alive) setVideo(payload.data)
      } catch (err) {
        if (alive) setError(err.message)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadVideo()
    return () => {
      alive = false
    }
  }, [videoId])

  useEffect(() => {
    let alive = true
    async function loadComments() {
      setCommentError("")
      try {
        const payload = await commentApi.list(videoId)
        if (alive) setComments(payload.data.comments || [])
      } catch (err) {
        if (alive) {
          setComments([])
          setCommentError(err.message)
        }
      }
    }
    loadComments()
    return () => {
      alive = false
    }
  }, [videoId])

  async function submitComment(event) {
    event.preventDefault()
    const content = commentText.trim()
    if (!content) return
    setCommentLoading(true)
    setCommentError("")
    try {
      const payload = await commentApi.create(videoId, content)
      setComments((current) => [payload.data, ...current])
      setCommentText("")
    } catch (err) {
      setCommentError(err.message)
    } finally {
      setCommentLoading(false)
    }
  }

  async function toggleLike() {
    if (!video?._id || actionLoading) return
    const wasLiked = Boolean(video.isLiked)
    setActionLoading("like")
    setVideo((current) => ({
      ...current,
      isLiked: !wasLiked,
      likesCount: Math.max(0, (current.likesCount || 0) + (wasLiked ? -1 : 1))
    }))
    try {
      await likeApi.toggleVideo(video._id)
    } catch (err) {
      setError(err.message)
      setVideo((current) => ({
        ...current,
        isLiked: wasLiked,
        likesCount: Math.max(0, (current.likesCount || 0) + (wasLiked ? 1 : -1))
      }))
    } finally {
      setActionLoading("")
    }
  }

  async function toggleSubscription() {
    const ownerId = video?.owner?._id || video?.owner
    if (!ownerId || ownerId === user?._id || actionLoading) return
    const wasSubscribed = Boolean(video.isSubscribed)
    setActionLoading("subscribe")
    setVideo((current) => ({
      ...current,
      isSubscribed: !wasSubscribed,
      subscribersCount: Math.max(0, (current.subscribersCount || 0) + (wasSubscribed ? -1 : 1))
    }))
    try {
      await userApi.toggleSubscription(ownerId)
    } catch (err) {
      setError(err.message)
      setVideo((current) => ({
        ...current,
        isSubscribed: wasSubscribed,
        subscribersCount: Math.max(0, (current.subscribersCount || 0) + (wasSubscribed ? 1 : -1))
      }))
    } finally {
      setActionLoading("")
    }
  }

  if (loading) return <Spinner label="Loading video" />
  if (error) return <EmptyState title="Video could not load" text={error} />
  if (!video) return <EmptyState title="Video unavailable" />

  const owner = typeof video.owner === "object" ? video.owner : null
  const ownerId = owner?._id || video.owner
  const isOwnVideo = ownerId === user?._id

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 space-y-5">
        <div className="overflow-hidden rounded-lg bg-slate-950">
          {mediaUrl(video.videoFile) ? (
            <video className="aspect-video w-full bg-slate-950" src={mediaUrl(video.videoFile)} controls poster={mediaUrl(video.thumbnail)} />
          ) : (
            <div className="flex aspect-video items-center justify-center text-sm text-slate-300">Video file unavailable</div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-950">{video.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>{compactNumber(video.views)} views</span>
                <span>{compactNumber(video.likesCount || 0)} likes</span>
                <span>{formatDate(video.createdAt)}</span>
                <span>{formatDuration(video.duration)}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleLike}
                disabled={actionLoading === "like"}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                  video.isLiked ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200" : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                title={video.isLiked ? "Unlike video" : "Like video"}
              >
                <Heart className={`h-4 w-4 ${video.isLiked ? "fill-current" : ""}`} aria-hidden="true" />
                {compactNumber(video.likesCount || 0)}
              </button>

              {owner ? (
                <Link
                  to={isOwnVideo ? "/profile" : `/profile/${owner.username}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <img src={avatarUrl(owner)} alt="" className="h-6 w-6 rounded-full object-cover" />
                  {owner.username || "Channel"}
                </Link>
              ) : (
                <span className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  Channel
                </span>
              )}

              {!isOwnVideo && ownerId ? (
                <button
                  type="button"
                  onClick={toggleSubscription}
                  disabled={actionLoading === "subscribe"}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                    video.isSubscribed ? "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                  title={video.isSubscribed ? "Unsubscribe" : "Subscribe"}
                >
                  {video.isSubscribed ? <Check className="h-4 w-4" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
                  {video.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              ) : null}
            </div>
          </div>
          {owner ? (
            <div className="mt-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <img src={avatarUrl(owner)} alt="" className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-950">{owner.fullName}</p>
                <p className="truncate text-xs text-slate-500">
                  @{owner.username} · {compactNumber(video.subscribersCount || 0)} subscribers
                </p>
              </div>
            </div>
          ) : null}
          <p className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{video.description}</p>
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-950">
            <MessageCircle className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            Comments
          </h2>
          <span className="text-sm text-slate-500">{comments.length}</span>
        </div>

        <form onSubmit={submitComment} className="mt-4 flex gap-2">
          <input
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            placeholder="Add a comment"
          />
          <button
            type="submit"
            disabled={commentLoading || !commentText.trim()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            title="Post comment"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        {commentError ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{commentError}</p> : null}

        <div className="mt-5 grid max-h-[620px] gap-3 overflow-y-auto pr-1">
          {comments.length === 0 && !commentError ? (
            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <article key={comment._id} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {typeof comment.owner === "object" ? (
                    <img src={avatarUrl(comment.owner)} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  )}
                  <span>{comment.owner?._id === user?._id || comment.owner === user?._id ? "You" : comment.owner?.username || "Viewer"}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{comment.content}</p>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
