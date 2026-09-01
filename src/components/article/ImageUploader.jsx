import React, { useCallback, useState } from "react";
import { Upload } from "lucide-react";

const ImageUploader = ({
  onAdd,
  multiple = false,
  label = "Drag images here",
  hint = "PNG, JPG or WEBP",
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = React.useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      const images = files.filter((file) =>
        /^image\//i.test(file.type || "")
      );

      if (images.length > 0 && onAdd) {
        onAdd(images);
      }
    },
    [onAdd]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
        }`}
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Upload className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">
          Click to browse or drag {multiple ? "images" : "an image"} here
        </p>
        <span className="text-[10px] text-slate-400">{hint}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
};

export default ImageUploader;