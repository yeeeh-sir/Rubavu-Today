const SITE_NAME = "Rubavu Today";
const SITE_URL = "https://www.rubavutoday.com";
const RADIO_TITLE = "RubavuToday Radio";
const RADIO_DESCRIPTION =
  "News, discussions, entertainment, music and more from across Rubavu.";
const CRAWLER_RE =
  /(whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|telegrambot|discordbot|slackbot|pinterest)/i;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function getRadioLogoUrl(requestUrl) {
  try {
    const response = await fetch(new URL("/asset-manifest.json", requestUrl));
    if (!response.ok) return `${SITE_URL}/Rubavu.jpeg`;

    const manifest = await response.json();
    const logo = Object.entries(manifest.files || {}).find(([source]) => {
      try {
        return decodeURIComponent(source).endsWith("/Rubavu Today Radio.png");
      } catch {
        return false;
      }
    });

    return logo?.[1]
      ? new URL(logo[1], requestUrl).toString()
      : `${SITE_URL}/Rubavu.jpeg`;
  } catch {
    return `${SITE_URL}/Rubavu.jpeg`;
  }
}

function buildRadioPreviewHtml(imageUrl) {
  const canonicalUrl = `${SITE_URL}/radio`;
  const image = escapeHtml(imageUrl);
  const description = escapeHtml(RADIO_DESCRIPTION);
  const title = escapeHtml(RADIO_TITLE);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | ${SITE_NAME}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:image" content="${image}">
<meta property="og:image:url" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="${title}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:src" content="${image}">
<meta name="twitter:image:alt" content="${title}">
<meta name="twitter:url" content="${canonicalUrl}">
</head>
<body><h1>${title}</h1><p>${description}</p><img src="${image}" alt="${title}"></body>
</html>`;
}

export default async function radioOg(request, context) {
  const userAgent = request.headers.get("user-agent") || "";
  if (request.method !== "GET" || !CRAWLER_RE.test(userAgent)) {
    return context.next();
  }

  const imageUrl = await getRadioLogoUrl(request.url);
  return new Response(buildRadioPreviewHtml(imageUrl), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      Vary: "User-Agent",
    },
  });
}