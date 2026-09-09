import React, { useEffect, useState } from "react";
import {
  Camera,
  Check,
  Clipboard,
  Trash2,
  X,
} from "lucide-react";
import { deleteMedia, getMediaLibrary } from "../../services/api";
import { useToast, ConfirmModal, CardSkeleton } from "../../components/employee/EmployeeUI";
import { errorMessage, formatShortDate } from "./employeeHelpers";

const MAX_PREVIEW = 24;

export default function MediaLibrary() {
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMediaLibrary();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(errorMessage(err, "Ntanabonye guheruka amafoto."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMedia(deleteTarget.id);
      toast.success("Ifoto yakukuruweho neza.");
      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(errorMessage(err, "Ntanabonye gukuraho ifoto."));
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = (item) => {
    const url = item.image_url || "";
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopiedId(item.id);
          setTimeout(() => setCopiedId(null), 1800);
        },
        () => toast.info(url)
      );
    } else {
      toast.info(url);
    }
  };

  const visible = items;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : visible.length === 0 ? (
        <></>
      ) : (
        <>
          <p className="text-xs font-medium text-slate-500">{visible.length} {visible.length === 1 ? "ifoto" : "amafoto"}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visible.slice(0, MAX_PREVIEW).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition ${
                  selected?.id === item.id ? "ring-2 ring-blue-500" : "hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <img src={item.image_url} alt={item.filename} className="h-32 w-full object-cover sm:h-36" />
                <div className="p-2.5">
                  <p className="truncate text-xs font-semibold text-slate-700">{item.filename}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{formatShortDate(item.created_at)}</p>
                </div>
                {selected?.id === item.id && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
          {visible.length > MAX_PREVIEW && (
            <p className="text-center text-xs font-medium text-slate-400">
              +{visible.length - MAX_PREVIEW} izindi zirembere. Hitamo ifoto kugira ngo ushake izirerereye.
            </p>
          )}
        </>
      )}

      <MediaDetailsModal
        item={selected}
        onClose={() => setSelected(null)}
        onDelete={() => {
          setDeleteTarget(selected);
          setSelected(null);
        }}
        onCopy={copyUrl}
        copiedId={copiedId}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Kuraho ifoto?"
        description={`Ifoto "${deleteTarget?.filename || ""}" izakurwa mu bubiko kandi irandwe ku rubuga rw'ifoto.`}
        confirmText="Kuraho"
        cancelText="Reka"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function MediaDetailsModal({ item, onClose, onDelete, onCopy, copiedId }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl animate-slide-up">
        <div className="relative">
          <img src={item.image_url} alt={item.filename} className="h-64 w-full object-cover" />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Camera className="h-3.5 w-3.5" /> Yashyirwe muri {formatShortDate(item.created_at)}
          </p>
          <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{item.image_url}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onCopy(item)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              {copiedId === item.id ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
              {copiedId === item.id ? "Yafatirwe" : "Kosoroza URL"}
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" /> Kuraho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}