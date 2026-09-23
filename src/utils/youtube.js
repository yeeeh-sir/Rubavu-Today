export function extractYouTubeVideoId(value) {
  const url = String(value || "").trim();
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  let normalized = url;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www\.|m\.)/i, "");
  if (host !== "youtube.com" && host !== "youtu.be") return null;
  let videoId = null;
  if (host === "youtu.be") {
    const match = parsed.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
    videoId = match ? match[1] : null;
  } else {
    videoId = parsed.searchParams.get("v");
    if (!videoId) {
      const match = parsed.pathname.match(/\/(?:embed|shorts|live|v)\/([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : null;
    }
  }
  return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
}

export function getYouTubeThumbnail(value) {
  const videoId = extractYouTubeVideoId(value);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}