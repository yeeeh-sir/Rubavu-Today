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

  if ((match = value.match(/^https?:\/\/(?:www\.)?youtu\.be\/([A-Za-z0-9_-]{11})(?:[?#&].*)?$/))) {
    return buildEmbed(match[1]);
  }

  if ((match = value.match(/^https?:\/\/(?:www\.)?youtube\.com\/(?:shorts|embed)\/([A-Za-z0-9_-]{11})(?:[?#&].*)?$/))) {
    return buildEmbed(match[1]);
  }

  if ((match = value.match(/^https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/watch\?.*[?&]v=([A-Za-z0-9_-]{11})(?:&.*)?$/))) {
    return buildEmbed(match[1]);
  }

  return null;
}

function buildEmbed(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}