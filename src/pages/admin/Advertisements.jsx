import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAdvertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    logout,
} from "../../services/api";
import { DashboardLayout, ModalShell, ModalHeader, ModalFooter, FormField } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

const DEFAULT_AD_POSITIONS = ["header", "sidebar", "footer", "inline", "between-posts"];

function Advertisements() {
    const navigate = useNavigate();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newTarget, setNewTarget] = useState("");
    const [newLink, setNewLink] = useState("");
    const [newPosition, setNewPosition] = useState("sidebar");
    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");
    const [newImage, setNewImage] = useState(null);

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editTarget, setEditTarget] = useState("");
    const [editLink, setEditLink] = useState("");
    const [editPosition, setEditPosition] = useState("sidebar");
    const [editStart, setEditStart] = useState("");
    const [editEnd, setEditEnd] = useState("");
    const [editStatus, setEditStatus] = useState("active");
    const [editImage, setEditImage] = useState(null);

    const load = async () => {
        try {
            const data = await getAdvertisements();
            setAds(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Unable to load advertisements.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await addAdvertisement({
                title: newTitle, description: newDesc || null,
                target_url: newTarget || null, link: newLink || null,
                position: newPosition, start_date: newStart || null,
                end_date: newEnd || null, status: "active",
                image: newImage || null,
            });
            setMessage("Ikwamamaza ryongewe neza.");
            setShowCreate(false);
            setNewTitle(""); setNewDesc(""); setNewTarget(""); setNewLink("");
            setNewPosition("sidebar"); setNewStart(""); setNewEnd(""); setNewImage(null);
            await load();
        } catch (err) {
            setError(err?.message || "Failed to add advertisement.");
        }
    };

    const openEdit = (a) => {
        setEditId(a.id);
        setEditTitle(a.title || "");
        setEditDesc(a.description || "");
        setEditTarget(a.target_url || "");
        setEditLink(a.link || "");
        setEditPosition(a.position || "sidebar");
        setEditStart(a.start_date || "");
        setEditEnd(a.end_date || "");
        setEditStatus(a.status || "active");
        setEditImage(null);
        setShowEdit(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await updateAdvertisement(editId, {
                title: editTitle, description: editDesc || null,
                target_url: editTarget || null, link: editLink || null,
                position: editPosition, start_date: editStart || null,
                end_date: editEnd || null, status: editStatus || "active",
                image: editImage || null,
            });
            setMessage("Ikwamamaza ryahinduwe neza.");
            setShowEdit(false);
            await load();
        } catch (err) {
            setError(err?.message || "Failed to update advertisement.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Siba ikwamamaza? Ntibishobora gusubizwa.")) return;
        try {
            await deleteAdvertisement(id);
            setMessage("Ikwamamaza ryasibwe.");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to delete advertisement.");
        }
    };

    const handleToggle = async (a) => {
        const next = a.status === "active" ? "inactive" : "active";
        try {
            await updateAdvertisement(a.id, { status: next });
            await load();
        } catch (err) {
            setError(err?.message || "Failed to change status.");
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
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Kwamamaza</h1>
                        <p className="mt-0.5 text-sm text-slate-400">Imicungire y'ibyamamaza by'urubuga.</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
                        + Ongera ikwamamaza
                    </button>
                </div>

                {message && (
                    <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✓ {message}</p>
                )}
                {error && (
                    <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
                )}

                {loading ? (
                    <p className="py-10 text-center text-sm text-slate-400">Birimo gutwara...</p>
                ) : ads.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <p className="text-lg font-bold text-slate-700">Nta byamamaza bibonetse</p>
                        <p className="mt-1 text-sm text-slate-400">Kanda "+ Ongera ikwamamaza" utangire.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
                            <span className="col-span-3">Ifoto</span>
                            <span className="col-span-3">Amakuru</span>
                            <span className="col-span-2">Umwanya</span>
                            <span className="col-span-1">Ikibanza</span>
                            <span className="col-span-3 text-right">Ibikorwa</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {ads.map((a) => (
                                <li key={a.id} className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-2 md:grid-cols-12 md:items-center">
                                    <span className="col-span-3">
                                        {a.image ? (
                                            <img src={a.image} alt={a.title || "ad"} className="h-12 w-24 rounded-lg object-cover" />
                                        ) : (
                                            <div className="flex h-12 w-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">n/a</div>
                                        )}
                                    </span>
                                    <span className="col-span-3 min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-800">{a.title || "Untitled"}</p>
                                        {a.description && <p className="truncate text-xs text-slate-400">{a.description}</p>}
                                        {a.link && (
                                            <a href={a.link} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-brand-600">Fungura link</a>
                                        )}
                                    </span>
                                    <span className="col-span-2 text-xs text-slate-500">{a.position || "sidebar"}</span>
                                    <span className="col-span-1">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            {a.status || "inactive"}
                                        </span>
                                    </span>
                                    <span className="col-span-3 flex flex-wrap justify-end gap-2">
                                        <button onClick={() => handleToggle(a)}
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${a.status === "active" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                                            {a.status === "active" ? "Funga" : "Fungura"}
                                        </button>
                                        <button onClick={() => openEdit(a)}
                                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Hindura</button>
                                        <button onClick={() => handleDelete(a.id)}
                                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Siba</button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Create modal */}
                {showCreate && (
                    <ModalShell onClose={() => setShowCreate(false)} maxWidth="max-w-lg">
                        <ModalHeader title="Ongera ikwamamaza" description="Onjera ikwamamaza rishya." onClose={() => setShowCreate(false)} />
                        <form onSubmit={handleCreate} className="space-y-4 p-5">
                            <FormField label="Umutwe" required><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Ibisobanuro"><textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="form-input" rows={2} /></FormField>
                            <FormField label="Target URL"><input value={newTarget} onChange={(e) => setNewTarget(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Link"><input value={newLink} onChange={(e) => setNewLink(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Umwanya">
                                <select value={newPosition} onChange={(e) => setNewPosition(e.target.value)} className="form-select">
                                    {DEFAULT_AD_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </FormField>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Itariki yo gutangira"><input type="date" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="form-input" /></FormField>
                                <FormField label="Itariki yo kurangira"><input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="form-input" /></FormField>
                            </div>
                            <FormField label="Ifoto"><input type="file" accept="image/*" onChange={(e) => setNewImage(e.target.files?.[0] || null)} className="form-input" /></FormField>
                            <ModalFooter onCancel={() => setShowCreate(false)} onConfirm={handleCreate} confirmText="Ongera" />
                        </form>
                    </ModalShell>
                )}

                {/* Edit modal */}
                {showEdit && (
                    <ModalShell onClose={() => setShowEdit(false)} maxWidth="max-w-lg">
                        <ModalHeader title="Hindura ikwamamaza" description="Vugurura amakuru y'ikwamamaza." onClose={() => setShowEdit(false)} />
                        <form onSubmit={handleSave} className="space-y-4 p-5">
                            <FormField label="Umutwe" required><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Ibisobanuro"><textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="form-input" rows={2} /></FormField>
                            <FormField label="Target URL"><input value={editTarget} onChange={(e) => setEditTarget(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Link"><input value={editLink} onChange={(e) => setEditLink(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Umwanya">
                                <select value={editPosition} onChange={(e) => setEditPosition(e.target.value)} className="form-select">
                                    {DEFAULT_AD_POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </FormField>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Itariki yo gutangira"><input type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} className="form-input" /></FormField>
                                <FormField label="Itariki yo kurangira"><input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className="form-input" /></FormField>
                            </div>
                            <FormField label="Ikibanza">
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-select">
                                    <option value="active">active</option>
                                    <option value="inactive">inactive</option>
                                </select>
                            </FormField>
                            <FormField label="Ifoto (idahinduye niba itarasimbuwe)"><input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files?.[0] || null)} className="form-input" /></FormField>
                            <ModalFooter onCancel={() => setShowEdit(false)} onConfirm={handleSave} confirmText="Bika" />
                        </form>
                    </ModalShell>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Advertisements;
