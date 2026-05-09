const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1"
const TOKEN_KEY = "watchhell.accessToken"

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function getErrorMessage(payload, fallback = "Request failed") {
  const message = payload?.message || payload?.error || fallback
  if (typeof message !== "string") return fallback

  const trimmed = message.trim()
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.includes("<pre>")) {
    return "Something went wrong. Please try again."
  }

  return trimmed
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {})
  const token = getStoredToken()
  const isFormData = options.body instanceof FormData

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers
  })

  let payload = null
  const text = await response.text()
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: "Something went wrong. Please try again." }
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload))
  }

  return payload
}

export const authApi = {
  async login(values) {
    const payload = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify(values)
    })
    setStoredToken(payload?.data?.accessToken)
    return payload
  },
  async signup(formData) {
    const payload = await apiRequest("/users/register", {
      method: "POST",
      body: formData
    })
    return payload
  },
  currentUser() {
    return apiRequest("/users/current-user")
  },
  async logout() {
    try {
      await apiRequest("/users/logout", { method: "POST" })
    } finally {
      clearStoredToken()
    }
  }
}

export const videoApi = {
  list(params = {}) {
    const query = new URLSearchParams(params)
    return apiRequest(`/video?${query.toString()}`)
  },
  get(videoId) {
    return apiRequest(`/video/${videoId}`)
  },
  upload(formData) {
    return apiRequest("/video", {
      method: "POST",
      body: formData
    })
  },
  delete(videoId) {
    return apiRequest(`/video/${videoId}`, { method: "DELETE" })
  }
}

export const commentApi = {
  list(videoId) {
    return apiRequest(`/comment/${videoId}`)
  },
  create(videoId, content) {
    return apiRequest(`/comment/${videoId}`, {
      method: "POST",
      body: JSON.stringify({ content })
    })
  }
}

export const likeApi = {
  toggleVideo(videoId) {
    return apiRequest(`/like/toggle/v/${videoId}`, { method: "POST" })
  },
  likedVideos() {
    return apiRequest("/like/videos")
  }
}

export const userApi = {
  channel(username) {
    return apiRequest(`/users/c/${username}`)
  },
  subscriptions(userId) {
    return apiRequest(`/subscription/u/${userId}`)
  },
  subscribers(channelId) {
    return apiRequest(`/subscription/c/${channelId}`)
  },
  toggleSubscription(channelId) {
    return apiRequest(`/subscription/c/${channelId}`, { method: "POST" })
  },
  updateAvatar(formData) {
    return apiRequest("/users/avatar", {
      method: "PATCH",
      body: formData
    })
  },
  updateCoverImage(formData) {
    return apiRequest("/users/cover-Image", {
      method: "PATCH",
      body: formData
    })
  },
  history() {
    return apiRequest("/users/history")
  }
}
