import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyPosts, updatePost } from "../../services/api";
import ArticleEditor from "../../components/article/ArticleEditor";
import { useToast, CardSkeleton as SkeletonCard } from "../../components/employee/EmployeeUI";
import { DEPARTMENTS } from "./employeeHelpers";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyPosts();
        if (cancelled) return;
        const posts = Array.isArray(data) ? data : [];
        const found = posts.find((item) => String(item.id || item._id) === String(id));
        if (!found) {
          setError("Employees can only edit their own pending posts.");
        } else {
          setPost(found);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Ntitwashoboye kubona iyi nkuru.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = useCallback(
    async (formData) => {
      if (saving) return;
      setSaving(true);
      try {
        await updatePost(id, formData);
        toast.success("Impinduka zabikiwe neza. Inkuru isigaye itegereje gusuzumwa.");
        navigate("/employee/articles", { replace: true });
      } catch (err) {
        toast.error(err?.message || "Hari ikosa ryabaye mu kwihindura inkuru.");
      } finally {
        setSaving(false);
      }
    },
    [saving, id, navigate, toast]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40"><SkeletonCard /></div>
        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-5">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-14 text-center">
        <h2 className="text-lg font-bold text-slate-800">Ntibishoboka guhindura iyi nkuru.</h2>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <button
          onClick={() => navigate("/employee/articles")}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          ← Subira ku nkuru zanjye
        </button>
      </div>
    );
  }

  const canEdit = String(post?.status || "").toLowerCase() === "pending";

  if (!canEdit) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-14 text-center">
        <h2 className="text-lg font-bold text-slate-800">Employees can only edit their own pending posts.</h2>
        <p className="mt-2 text-sm text-slate-600">Iyi nkuru ntikiri mu miterere itegereje gusuzumwa.</p>
        <button
          onClick={() => navigate("/employee/articles")}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          ← Subira ku nkuru zanjye
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hindura Inkuru</h2>
          <p className="text-sm text-slate-500">
            Impinduka zishyirwa muri {String(post.status || "pending").toUpperCase()} kugeza umusuzumyi aremeye.
          </p>
        </div>
        <button
          onClick={() => navigate("/employee/articles")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ← Subira inyuma
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <ArticleEditor
          initial={post}
          categories={DEPARTMENTS}
          submitLabel="Bika impinduka"
          saving={saving}
          hideStatusField
          onSubmit={handleSave}
          onCancel={() => navigate("/employee/articles")}
        />
      </div>
    </div>
  );
}