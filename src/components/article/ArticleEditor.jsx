import React, { useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Eye,
  FileText,
  GripVertical,
  Heading2,
  Image as ImageIcon,
  Loader2,
  Minus,
  Quote,
  Trash2,
  Video,
} from "lucide-react";
import ImageUploader from "./ImageUploader";
import ArticlePreview from "./ArticlePreview";

const IMAGE_POSITIONS = [
  { value: "full", label: "Full Width" },
  { value: "center", label: "Center" },
  { value: "left", label: "Left (wrap text)" },
  { value: "right", label: "Right (wrap text)" },
  { value: "inline", label: "Inline with Text" },
  { value: "gallery", label: "Gallery" },
];

const BLOCK_TYPES = [
  { value: "paragraph", label: "Paragraph", icon: AlignLeft },
  { value: "heading", label: "Heading", icon: Heading2 },
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "quote", label: "Quote", icon: Quote },
  { value: "divider", label: "Divider", icon: Minus },
  { value: "video", label: "Video", icon: Video },
];

const parseBlocks = (initial) => {
  if (!initial?.content_blocks) return [];

  try {
    const parsed = JSON.parse(initial.content_blocks);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const resolvePreviewUrl = (block) => {
  if (block.file) {
    return URL.createObjectURL(block.file);
  }
  return block.url || "";
};

const ArticleEditor = ({
  initial = null,
  categories = [],
  authorText = "",
  submitLabel = "Publish",
  saving = false,
  onSubmit = () => {},
  onCancel = () => {},
}) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [subtitle, setSubtitle] = useState(
    initial?.description || initial?.summary || initial?.content || ""
  );
  const [category, setCategory] = useState(
    initial?.category || categories[0]?.name || "Amakuru"
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    initial?.youtube_url || initial?.youtubeUrl || ""
  );
  const [headerFile, setHeaderFile] = useState(null);
  const [headerError, setHeaderError] = useState("");
  const [blocks, setBlocks] = useState(() => parseBlocks(initial));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const categoryList =
    categories && categories.length > 0
      ? categories
      : [{ name: "Amakuru" }];

  const headerSource = headerFile
    ? URL.createObjectURL(headerFile)
    : initial?.image || initial?.featured_image || null;

  const addBlock = (type) => {
    const base = { type };

    const block =
      type === "image"
        ? { ...base, url: "", position: "center", caption: "", alt: "", file: null }
        : type === "video"
          ? { ...base, url: "" }
          : { ...base, text: "" };

    setBlocks((previous) => [...previous, block]);
  };

  const updateBlock = (index, patch) => {
    setBlocks((previous) =>
      previous.map((block, i) =>
        i === index ? { ...block, ...patch } : block
      )
    );
  };

  const removeBlock = (index) => {
    setBlocks((previous) => previous.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    setBlocks((previous) => {
      const target = index + direction;

      if (target < 0 || target >= previous.length) {
        return previous;
      }

      const next = previous.slice();
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);

      return next;
    });
  };

  const handleDropBlock = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    setBlocks((previous) => {
      const next = previous.slice();
      const [item] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });

    setDragIndex(null);
  };

  const buildFormData = () => {
    const fd = new FormData();

    fd.append("title", title.trim());

    fd.append("category", category || "Amakuru");

    fd.append("description", subtitle.trim());

    if (youtubeUrl.trim()) {
      fd.append("youtube_url", youtubeUrl.trim());
    }

    if (authorText && authorText.trim()) {
      fd.append("author", authorText.trim());
    }

    if (headerFile) {
      fd.append("image", headerFile);
    }

    const sendBlocks = [];
    const imageFiles = [];
    let imageOrdinal = 0;

    blocks.forEach((block) => {
      if (block.type === "paragraph") {
        if (String(block.text || "").trim()) {
          sendBlocks.push({ type: "paragraph", text: block.text.trim() });
        }
        return;
      }

      if (block.type === "heading") {
        if (String(block.text || "").trim()) {
          sendBlocks.push({ type: "heading", text: block.text.trim() });
        }
        return;
      }

      if (block.type === "quote") {
        if (String(block.text || "").trim()) {
          sendBlocks.push({ type: "quote", text: block.text.trim() });
        }
        return;
      }

      if (block.type === "divider") {
        sendBlocks.push({ type: "divider" });
        return;
      }

      if (block.type === "video") {
        if (String(block.url || "").trim()) {
          sendBlocks.push({ type: "video", url: block.url.trim() });
        }
        return;
      }

      if (block.type === "image") {
        const fallbackAlt = `${String(title || "Rubavu Today").slice(0, 80)} photo ${imageOrdinal + 1}`;

        if (block.file) {
          const index = imageFiles.length;
          imageFiles.push(block.file);

          sendBlocks.push({
            type: "image",
            position: block.position || "center",
            caption: String(block.caption || "").trim(),
            alt: String(block.alt || "").trim() || fallbackAlt,
            fileKey: "images",
            uploadIndex: index,
          });
        } else if (block.url && String(block.url).trim()) {
          sendBlocks.push({
            type: "image",
            url: String(block.url).trim(),
            position: block.position || "center",
            caption: String(block.caption || "").trim(),
            alt: String(block.alt || "").trim() || fallbackAlt,
          });
        }

        imageOrdinal += 1;
      }
    });

    imageFiles.forEach((file) => fd.append("images", file));

    if (sendBlocks.length > 0) {
      fd.append("content_blocks", JSON.stringify(sendBlocks));
    }

    return fd;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setHeaderError("Please enter the article title.");
      return;
    }

    if (!subtitle.trim()) {
      setHeaderError("Please enter the short description.");
      return;
    }

    setHeaderError("");
    onSubmit(buildFormData());
  };

  const previewBlocks = blocks.map((block) => {
    if (block.type === "image") {
      return {
        ...block,
        url: resolvePreviewUrl(block),
      };
    }
    return block;
  });

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {headerError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-medium text-red-600">{headerError}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
            Article Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Catchy headline..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {categoryList.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon ? `${cat.icon} ` : ""}
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
              YouTube URL
              <span className="ml-1 font-normal normal-case text-slate-400">
                Optional
              </span>
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
            Short Description / Subtitle
          </label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={3}
            required
            placeholder="One or two sentences summarising the story..."
            className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-700">
            Header / Featured Image
            <span className="ml-1 font-normal normal-case text-slate-400">
              Optional
            </span>
          </label>

          {!headerSource && (
            <ImageUploader
              multiple={false}
              label="Drag the header image here"
              onAdd={(files) => {
                setHeaderFile(files[0] || null);
              }}
            />
          )}

          {headerSource && (
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={headerSource}
                  alt="Header preview"
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-col items-start justify-center gap-2 sm:px-2">
                <p className="text-xs text-slate-500">
                  This image appears at the top of the article, below the
                  headline.
                </p>

                <div className="flex flex-wrap gap-2">
                  <label
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Replace image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setHeaderFile(file);
                        e.target.value = "";
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setHeaderFile(null)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BLOCK BUILDER */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-700">
              Article Content Builder
            </label>
            <span className="text-[10px] font-medium text-slate-400">
              Drag blocks to reorder
            </span>
          </div>

          <div className="space-y-3">
            {blocks.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm text-slate-500">
                  No content yet. Add paragraphs, headings, images, quotes,
                  dividers or videos below.
                </p>
              </div>
            )}

            {blocks.map((block, index) => (
              <div
                key={`block-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropBlock(index)}
                onDragEnd={() => setDragIndex(null)}
                className={`group rounded-2xl border bg-white transition ${
                  dragIndex === index
                    ? "border-blue-400 ring-2 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-1 border-b border-slate-100 px-3 py-2">
                  <span className="cursor-grab text-slate-400">
                    <GripVertical className="h-4 w-4" />
                  </span>

                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    {BLOCK_TYPES.find((b) => b.value === block.type)?.icon &&
                      (() => {
                        const Icon =
                          BLOCK_TYPES.find((b) => b.value === block.type).icon;
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    {BLOCK_TYPES.find((b) => b.value === block.type)?.label}
                  </span>

                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveBlock(index, -1)}
                      disabled={index === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Move block up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveBlock(index, 1)}
                      disabled={index === blocks.length - 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                      aria-label="Move block down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(index)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  {block.type === "paragraph" && (
                    <textarea
                      rows={4}
                      placeholder="Write a paragraph..."
                      value={block.text || ""}
                      onChange={(e) =>
                        updateBlock(index, { text: e.target.value })
                      }
                      className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  )}

                  {block.type === "heading" && (
                    <input
                      type="text"
                      value={block.text || ""}
                      onChange={(e) =>
                        updateBlock(index, { text: e.target.value })
                      }
                      placeholder="Subheading text..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  )}

                  {block.type === "quote" && (
                    <textarea
                      rows={2}
                      placeholder="Quote text..."
                      value={block.text || ""}
                      onChange={(e) =>
                        updateBlock(index, { text: e.target.value })
                      }
                      className="w-full resize-y rounded-xl border-l-4 border-slate-300 px-3 py-2.5 text-sm italic outline-none focus:border-blue-400"
                    />
                  )}

                  {block.type === "video" && (
                    <input
                      type="url"
                      value={block.url || ""}
                      onChange={(e) =>
                        updateBlock(index, { url: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  )}

                  {block.type === "divider" && (
                    <div className="py-1 text-center">
                      <div className="mx-auto h-px max-w-[420px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                      <p className="mt-1 font-body text-[10px] uppercase tracking-wider text-slate-400">
                        Horizontal divider
                      </p>
                    </div>
                  )}

                  {block.type === "image" && (
                    <div className="space-y-3">
                      {block.file || block.url ? (
                        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            <img
                              src={resolvePreviewUrl(block)}
                              alt={block.alt || "Image preview"}
                              className="aspect-[4/3] h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col items-start justify-center gap-2">
                            <label
                              className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              Replace image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    updateBlock(index, {
                                      file,
                                      url: URL.createObjectURL(file),
                                    });
                                  }
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(index, {
                                  file: null,
                                  url: "",
                                })
                              }
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              Remove image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ImageUploader
                          multiple
                          label="Drag images here"
                          onAdd={(files) => {
                            const [first, ...extras] = files;

                            updateBlock(index, {
                              file: first,
                              url: URL.createObjectURL(first),
                            });

                            if (extras.length > 0) {
                              setBlocks((previous) => [
                                ...previous,
                                ...extras.map((file) => ({
                                  type: "image",
                                  url: URL.createObjectURL(file),
                                  position: "center",
                                  caption: "",
                                  alt: "",
                                  file,
                                })),
                              ]);
                            }
                          }}
                        />
                      )}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Position
                          </label>
                          <select
                            value={block.position || "center"}
                            onChange={(e) =>
                              updateBlock(index, {
                                position: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400"
                          >
                            {IMAGE_POSITIONS.map((pos) => (
                              <option key={pos.value} value={pos.value}>
                                {pos.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Alt text
                            <span className="ml-1 font-normal normal-case text-slate-300">
                              for accessibility
                            </span>
                          </label>
                          <input
                            type="text"
                            value={block.alt || ""}
                            onChange={(e) =>
                              updateBlock(index, { alt: e.target.value })
                            }
                            placeholder="Describe the photo..."
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Caption
                          <span className="ml-1 font-normal normal-case text-slate-300">
                            optional
                          </span>
                        </label>
                        <input
                          type="text"
                          value={block.caption || ""}
                          onChange={(e) =>
                            updateBlock(index, { caption: e.target.value })
                          }
                          placeholder="Caption shown under the photo..."
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ADD BLOCK */}
          <div className="mt-4 flex flex-wrap gap-2">
            {BLOCK_TYPES.map((type) => {
              const Icon = type.icon;

              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => addBlock(type.value)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Icon className="h-3.5 w-3.5" />
                  + {type.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50 sm:w-auto"
          >
            <Eye className="h-4 w-4" />
            Preview Article
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <FileText className="h-4 w-4" />
            {submitLabel}
          </button>
        </div>
      </form>

      <ArticlePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        category={category}
        description={subtitle}
        hero={headerSource}
        blocks={previewBlocks}
        author={authorText}
        dateLabel={new Date().toLocaleDateString()}
      />
    </div>
  );
};

export default ArticleEditor;