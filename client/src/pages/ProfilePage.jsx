import { Link, useParams } from "react-router-dom"
import { Bell, Camera, Check, Eye, Loader2, Trash2, Upload, UsersRound } from "lucide-react"
import { useEffect, useState } from "react"
import EmptyState from "../components/EmptyState.jsx"
import Spinner from "../components/Spinner.jsx"
import VideoCard from "../components/VideoCard.jsx"
import { userApi, videoApi } from "../lib/api.js"
import { avatarUrl, compactNumber, mediaUrl } from "../lib/format.js"

export default function ProfilePage({ user, onUserUpdate }) {
  const { username } = useParams()
  const activeUsername = username || user?.username
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [mediaLoading, setMediaLoading] = useState("")
  const [deletingVideoId, setDeletingVideoId] = useState("")
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const isOwnProfile = activeUsername === user?.username

  useEffect(() => {
    let alive = true
    async function loadProfile() {
      setLoading(true)
      setError("")
      try {
        const channelPayload = await userApi.channel(activeUsername)
        const nextChannel = channelPayload.data
        if (!alive) return
        setChannel(nextChannel)

        const [subscribedResult, subscribersResult, videosResult] = await Promise.allSettled([
          userApi.subscriptions(nextChannel._id),
          userApi.subscribers(nextChannel._id),
          videoApi.list({ userId: nextChannel._id, limit: 12 })
        ])

        if (!alive) return
        if (subscribedResult.status === "fulfilled") {
          setSubscriptions(subscribedResult.value.data.subscribedChannelList || [])
        } else {
          setSubscriptions([])
        }
        if (subscribersResult.status === "fulfilled") {
          setSubscribersCount(subscribersResult.value.data.subscribersCount || nextChannel.subscribersCount || 0)
        } else {
          setSubscribersCount(nextChannel.subscribersCount || 0)
        }
        if (videosResult.status === "fulfilled") {
          setVideos(videosResult.value.data.videos || [])
        } else {
          setVideos([])
        }
      } catch (err) {
        if (alive) setError(err.message)
      } finally {
        if (alive) setLoading(false)
      }
    }

    if (activeUsername) loadProfile()
    return () => {
      alive = false
    }
  }, [activeUsername])

  async function toggleSubscription() {
    if (!channel?._id) return
    const previous = channel
    setChannel((current) => ({
      ...current,
      isSubscribed: !current.isSubscribed,
      subscribersCount: Math.max(0, (current.subscribersCount || 0) + (current.isSubscribed ? -1 : 1))
    }))
    try {
      await userApi.toggleSubscription(channel._id)
    } catch {
      setChannel(previous)
    }
  }

  async function updateProfileImage(type, event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || mediaLoading) return

    const formData = new FormData()
    const fieldName = type === "avatar" ? "avatar" : "coverImage"
    formData.append(fieldName, file)
    setMediaLoading(type)
    setActionError("")

    try {
      const payload = type === "avatar" ? await userApi.updateAvatar(formData) : await userApi.updateCoverImage(formData)
      const updatedUser = payload.data
      setChannel((current) => ({ ...current, [fieldName]: updatedUser[fieldName] }))
      onUserUpdate?.((current) => ({ ...current, [fieldName]: updatedUser[fieldName] }))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setMediaLoading("")
    }
  }

  async function deleteVideo(videoId) {
    if (deletingVideoId) return
    const confirmed = window.confirm("Delete this video?")
    if (!confirmed) return

    const previousVideos = videos
    setDeletingVideoId(videoId)
    setActionError("")
    setVideos((current) => current.filter((video) => video._id !== videoId))

    try {
      await videoApi.delete(videoId)
    } catch (err) {
      setVideos(previousVideos)
      setActionError(err.message)
    } finally {
      setDeletingVideoId("")
    }
  }

  if (loading) return <Spinner label="Loading profile" />
  if (error) return <EmptyState title="Profile could not load" text={error} />
  if (!channel) return <EmptyState title="Channel unavailable" />

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="relative h-44 bg-slate-900 sm:h-56">
          {mediaUrl(channel.coverImage) ? (
            <img src={mediaUrl(channel.coverImage)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,#0f172a,#115e59,#f59e0b)]" />
          )}
          <div className="absolute inset-0 bg-slate-950/20" />
          {isOwnProfile ? (
            <label className="absolute right-4 top-4 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/95 px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-white">
              {mediaLoading === "coverImage" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
              Cover
              <input className="sr-only" type="file" accept="image/*" onChange={(event) => updateProfileImage("coverImage", event)} />
            </label>
          ) : null}
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                <img src={avatarUrl(channel)} alt="" className="h-full w-full rounded-full border-4 border-white bg-white object-cover shadow-sm" />
                {isOwnProfile ? (
                  <label className="absolute bottom-1 right-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-950 text-white shadow-sm transition hover:bg-slate-800" title="Change avatar">
                    {mediaLoading === "avatar" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
                    <input className="sr-only" type="file" accept="image/*" onChange={(event) => updateProfileImage("avatar", event)} />
                  </label>
                ) : null}
              </div>
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold text-slate-950">{channel.fullName}</h1>
                <p className="text-sm text-slate-500">@{channel.username}</p>
              </div>
            </div>

            {isOwnProfile ? (
              <Link
                to="/upload"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Upload
              </Link>
            ) : (
              <button
                type="button"
                onClick={toggleSubscription}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
                  channel.isSubscribed ? "bg-slate-100 text-slate-800 hover:bg-slate-200" : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
              >
                {channel.isSubscribed ? <Check className="h-4 w-4" aria-hidden="true" /> : <Bell className="h-4 w-4" aria-hidden="true" />}
                {channel.isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          {actionError ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{actionError}</p> : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Subscribers</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{compactNumber(subscribersCount)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Subscribed to</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{compactNumber(channel.channelSubscribedToCount || subscriptions.length)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Videos</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{compactNumber(videos.length)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Uploads</h2>
            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
              <Eye className="h-4 w-4" aria-hidden="true" />
              Public videos
            </span>
          </div>
          {videos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {videos.map((video) => (
                <div key={video._id} className="relative">
                  <VideoCard video={video} />
                  {isOwnProfile ? (
                    <button
                      type="button"
                      onClick={() => deleteVideo(video._id)}
                      disabled={deletingVideoId === video._id}
                      className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                      title="Delete video"
                    >
                      {deletingVideoId === video._id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No uploads yet" text={isOwnProfile ? "Your published videos will appear here." : "This channel has not published videos yet."} />
          )}
        </section>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Subscriptions</h2>
            <UsersRound className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3">
            {subscriptions.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No subscribed channels yet.</p>
            ) : (
              subscriptions.map((item) => {
                const subscribedChannel = item.channel
                return (
                  <Link
                    key={item._id}
                    to={`/profile/${subscribedChannel?.username}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <img src={avatarUrl(subscribedChannel)} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">{subscribedChannel?.fullName}</p>
                      <p className="truncate text-xs text-slate-500">@{subscribedChannel?.username}</p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
