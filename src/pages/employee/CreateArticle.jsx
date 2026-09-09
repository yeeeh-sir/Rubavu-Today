import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleEditor from "../../components/article/ArticleEditor";
import { addPost } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/employee/EmployeeUI";
import { DEPARTMENTS, errorMessage } from "./employeeHelpers";

const CATEGORY_LIST = DEPARTMENTS.map((name) => ({ name }));

export default function CreateArticle() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (fd) => {
    setSaving(true);
    try {
      await addPost(fd);
      toast.success("Inkuru yawe yoherejwe ku Chief Editor kugira ngo ayisuzume.");
      navigate("/employee/articles");
    } catch (err) {
      toast.error(errorMessage(err, "Ntanabonye gutangisha inkuru. Ongera ugerageze."));
      setSaving(false);
    }
  };

  const handleDraft = async (fd) => {
    fd.append("status", "draft");
    setSaving(true);
    try {
      await addPost(fd);
      toast.success("Draft yabikiwe neza. Uzabasha kwita cyane nyuma.");
      navigate("/employee/articles");
    } catch (err) {
      toast.error(errorMessage(err, "Ntanabonye kubika draft. Ongera ugerageze."));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            📝
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kora Inkuru Nshya</h2>
            <p className="text-xs text-slate-500">
              Andika inkuru, ubike draft cyangwa utange kugira isuzumwe.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 text-xs text-amber-800 sm:grid-cols-2">
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Umwanditsi: <b className="font-bold">{user?.full_name || user?.name || user?.email || "Umukozi"}</b>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Nyuma yo gutanga, Chief Editor azasuzuma inkuru yawe mbere yo gusohoka.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <ArticleEditor
          key="new"
          initial={null}
          categories={CATEGORY_LIST}
          authorText={user?.full_name || user?.name || ""}
          submitLabel="Tangiza Gusuzumwa"
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/employee/articles")}
          draftLabel="Bika nka Draft"
          onDraft={handleDraft}
          hideStatusField
        />
      </div>
    </div>
  );
}