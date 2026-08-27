import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://rubavutoday.com";
const SITE_NAME = "Rubavu Today";
const DEFAULT_IMAGE = `${SITE_URL}/Rubavu.jpeg`;
const BACKEND_URL = "https://rubavu-today-backend.onrender.com";
const DEFAULT_DESCRIPTION =
  "Rubavu Today - Amakuru mashya mu karere ka Rubavu n'ibindi byose. Latest news from Rubavu and beyond.";

function getAbsoluteImageUrl(image) {
  if (!image) return DEFAULT_IMAGE;
  if (image.startsWith("https://")) return image;
  if (image.startsWith("http://")) return image.replace(/^http:\/\//, "https://");
  if (image.startsWith("/")) return `${BACKEND_URL}${image}`;
  return `${BACKEND_URL}/${image}`;
}

function cleanDescription(text) {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

export function SiteSEO() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: DEFAULT_IMAGE,
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
    },
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Helmet>
      <title>{SITE_NAME} - Amakuru Mashya</title>
      <meta name="description" content={DEFAULT_DESCRIPTION} />
      <link rel="canonical" href={SITE_URL} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={SITE_NAME} />
      <meta property="og:description" content={DEFAULT_DESCRIPTION} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="rw_RW" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SITE_NAME} />
      <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteLd)}
      </script>
    </Helmet>
  );
}

export function ArticleSEO({ post }) {
  if (!post) return null;

  const title = post.title || SITE_NAME;
  const description =
    cleanDescription(post.description || post.summary || "") ||
    `${title} - ${SITE_NAME}`;
  const image = getAbsoluteImageUrl(post.image);
  const authorName =
    post.Author || post.author || post.author_name || "Rubavu Today";

  const articleUrl = post.slug
    ? `${SITE_URL}/${post.slug}.html`
    : `${SITE_URL}/post/${post.id}`;

  const postDate =
    post.createdDate || post.created_at || post.createdAt || post.date;
  const modifiedDate =
    post.updatedDate || post.updated_at || post.updatedAt || postDate;

  const publishedTime = postDate
    ? new Date(postDate).toISOString()
    : undefined;
  const modifiedTime = modifiedDate
    ? new Date(modifiedDate).toISOString()
    : undefined;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: description,
    image: image,
    url: articleUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_IMAGE,
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <Helmet>
      <title>{title} | {SITE_NAME}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={articleUrl} />

      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={articleUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="rw_RW" />

      <meta property="article:published_time" content={publishedTime} />
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      <meta property="article:author" content={authorName} />
      {post.category && (
        <meta property="article:section" content={post.category} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <script type="application/ld+json">
        {JSON.stringify(articleLd)}
      </script>
    </Helmet>
  );
}

export function NotFoundSEO() {
  return (
    <Helmet>
      <title>404 - Page Not Found | {SITE_NAME}</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta
        name="description"
        content="The page you are looking for does not exist."
      />
    </Helmet>
  );
}
