import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getChiefEditors,
    addChiefEditor,
    updateChiefEditor,
    deleteChiefEditor,
    logout,
} from "../../services/api";
import { DashboardLayout, ModalShell, ModalHeader, ModalFooter, FormField } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

function ChiefEditors() {
    const navigate = useNavigate();
    const [chiefs, setChiefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editStatus, setEditStatus] = useState("active");

    const load = async () => {
        try {
            const data = await getChiefEditors();
            setChiefs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Unable to load chief editors.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = chiefs.filter((c) => {
        const q = search.toLowerCase();
        return !q ||
            (c.full_name || "").toLowerCase().includes(q) ||
            (c.email || "").toLowerCase().includes(q);
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await addChiefEditor({
                full_name: newName, email: newEmail, phone: newPhone || null,
                password: newPassword, status: "active",
            });
            setMessage("Umwanditsi mukuru yongewe neza.");
            setShowCreate(false);
            setNewName(""); setNewEmail(""); setNewPhone(""); setNewPassword("");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to add chief editor.");
        }
    };

    const openEdit = (c) => {
        setEditId(c.id);
        setEditName(c.full_name || c.name || "");
        setEditEmail(c.email || "");
        setEditPhone(c.phone || "");
        setEditStatus(c.status || "active");
        setShowEdit(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await updateChiefEditor(editId, {
                full_name: editName, email: editEmail, phone: editPhone || null,
                status: editStatus || "active",
            });
            setMessage("Umwanditsi mukuru yahinduwe neza.");
            setShowEdit(false);
            await load();
        } catch (err) {
            setError(err?.message || "Failed to update chief editor.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Siba uyu mwanditsi mukuru? Ntibishobora gusubizwa.")) return;
        try {
            await deleteChiefEditor(id);
            setMessage("Umwanditsi mukuru yasibwe.");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to delete chief editor.");
        }
    };

    return (
        <DashboardLayout
            navigationSections={ADMIN_NAV_SECTIONS}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Abanditsi Bakuru</h1>
                        <p className="mt-0.5 text-sm text-slate-400">Imicungire y'abanditsi bakuru.</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
                        + Ongera umwanditsi mukuru
                    </button>
                </div>

                <div className="mb-5">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Shakisha umwanditsi mukuru..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                </div>

                {message && (
                    <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✓ {message}</p>
                )}
                {error && (
                    <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
                )}

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">Birimo gutwara...</p>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <p className="text-lg font-bold text-slate-700">Nta banditsi bakuru babonetse</p>
                        <p className="mt-1 text-sm text-slate-400">Kanda "+ Ongera umwanditsi mukuru" utangire.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
                            <span className="col-span-4">Izina</span>
                            <span className="col-span-4">Imeriyo</span>
                            <span className="col-span-2">Ikibanza</span>
                            <span className="col-span-2 text-right">Ibikorwa</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {filtered.map((c) => (
                                <li key={c.id} className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-2 md:grid-cols-12 md:items-center">
                                    <span className="col-span-4 truncate text-sm font-semibold text-slate-800">
                                        {c.full_name || c.name || c.email}
                                    </span>
                                    <span className="col-span-4 truncate text-xs text-slate-400">{c.email}</span>
                                    <span className="col-span-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            {c.status || "active"}
                                        </span>
                                    </span>
                                    <span className="col-span-2 flex justify-end gap-2">
                                        <button onClick={() => openEdit(c)}
                                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Hindura</button>
                                        <button onClick={() => handleDelete(c.id)}
                                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Siba</button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {showCreate && (
                    <ModalShell onClose={() => setShowCreate(false)} maxWidth="max-w-md">
                        <ModalHeader title="Ongera umwanditsi mukuru" description="Onjera umwanditsi mukuru mushya." onClose={() => setShowCreate(false)} />
                        <form onSubmit={handleCreate} className="space-y-4 p-5">
                            <FormField label="Izina" required><input value={newName} onChange={(e) => setNewName(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Imeriyo" required><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Telefoni"><input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Ijambo ry'ibanga" required><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="form-input" /></FormField>
                            <ModalFooter onCancel={() => setShowCreate(false)} onConfirm={handleCreate} confirmText="Ongera" />
                        </form>
                    </ModalShell>
                )}

                {showEdit && (
                    <ModalShell onClose={() => setShowEdit(false)} maxWidth="max-w-md">
                        <ModalHeader title="Hindura umwanditsi mukuru" description="Vugurura amakuru." onClose={() => setShowEdit(false)} />
                        <form onSubmit={handleSaveEdit} className="space-y-4 p-5">
                            <FormField label="Izina" required><input value={editName} onChange={(e) => setEditName(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Imeriyo" required><input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Telefoni"><input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Ikibanza">
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-select">
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </FormField>
                            <ModalFooter onCancel={() => setShowEdit(false)} onConfirm={handleSaveEdit} confirmText="Bika" />
                        </form>
                    </ModalShell>
                )}
            </div>
        </DashboardLayout>
    );
}

export default ChiefEditors;
