export function mediaUrl(media) {
  if (!media) return ""
  if (typeof media === "string") return media
  return media.url || ""
}

export function avatarUrl(user) {
  return mediaUrl(user?.avatar) || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.username || "WH")}`
}

export function compactNumber(value = 0) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value)
}

export function formatDuration(seconds = 0) {
  if (!Number.isFinite(Number(seconds))) return "0:00"
  const total = Math.max(0, Math.floor(Number(seconds)))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${String(rest).padStart(2, "0")}`
}

export function formatDate(value) {
  if (!value) return "Recently"
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value))
}
