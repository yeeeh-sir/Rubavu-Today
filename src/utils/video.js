/**
 * Safely extract a YouTube video ID from common YouTube URL formats and
 * return a working embed URL. Returns null for non-YouTube or direct
 * video file URLs so callers can fall back to an HTML5 <video> player.
 *
 * Supports:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://youtube.com/embed/VIDEO_ID
 *   - any of the above with extra query parameters
 */
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;

  const value = url.trim();
  if (!value) return null;

  let match;

  // https://youtu.be/VIDEO_ID
  if ((match = value.match(/^https?:\/\/(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})(?:[?#&].*)?$/))) {
    return buildEmbed(match[1]);
  }

  // https://www.youtube.com/shorts/VIDEO_ID or /embed/VIDEO_ID
  if ((match = value.match(/^https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})(?:[?#&].*)?$/))) {
    return buildEmbed(match[1]);
  }

  // https://www.youtube.com/watch?v=... (v may appear anywhere in the query string)
  if (/^https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\//.test(value)) {
    match = value.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (match) {
      return buildEmbed(match[1]);
    }
  }

  return null;
}

function buildEmbed(videoId) {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&color=white`;
}