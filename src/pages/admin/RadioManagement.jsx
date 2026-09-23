import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getAdminRadio,
    addRadioItem,
    updateRadioItem,
    deleteRadioItem,
    setRadioItemStatus,
    reorderRadioItem,
    setRadioNowPlaying,
    logout,
} from "../../services/api";
import { DashboardLayout, ModalShell, ModalHeader, ModalFooter, FormField } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";
import { extractYouTubeVideoId } from "../../utils/youtube";

function RadioManagement() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busyId, setBusyId] = useState(null);

    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newYoutube, setNewYoutube] = useState("");
    const [newStatus, setNewStatus] = useState("active");
    const [newOrder, setNewOrder] = useState("1");

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editYoutube, setEditYoutube] = useState("");
    const [editStatus, setEditStatus] = useState("active");
    const [editOrder, setEditOrder] = useState("0");

    const load = async () => {
        try {
            const data = await getAdminRadio();
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Unable to load radio items.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const resetCreate = () => {
        setNewTitle(""); setNewDesc(""); setNewYoutube("");
        setNewStatus("active"); setNewOrder(String(items.length + 1));
    };

    const openCreate = () => {
        resetCreate();
        setShowCreate(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (!extractYouTubeVideoId(newYoutube)) {
                setError("Invalid YouTube URL");
                return;
            }
            await addRadioItem({
                title: newTitle,
                description: newDesc || undefined,
                youtube_url: newYoutube || undefined,
                status: newStatus,
                queue_order: Number(newOrder) || 0,
            });
            setMessage("Programe y'urubuga ryongewe neza.");
            setShowCreate(false);
            await load();
        } catch (err) {
            setError(err?.message || "Failed to add radio item.");
        }
    };

    const openEdit = (item) => {
        setEditId(item.id);
        setEditTitle(item.title || "");
        setEditDesc(item.description || "");
        setEditYoutube(item.youtube_url || "");
        setEditStatus(item.status || "active");
        setEditOrder(String(item.queue_order ?? 0));
        setShowEdit(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (editYoutube && !extractYouTubeVideoId(editYoutube)) {
                setError("Invalid YouTube URL");
                return;
            }
            await updateRadioItem(editId, {
                title: editTitle,
                description: editDesc || undefined,
                youtube_url: editYoutube || undefined,
                status: editStatus,
                queue_order: Number(editOrder) || 0,
            });
            setMessage("Programe y'urubuga yahinduwe neza.");
            setShowEdit(false);
            await load();
        } catch (err) {
            setError(err?.message || "Failed to update radio item.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Siba iyi programe? Ntibishobora gusubizwa.")) return;
        setBusyId(id);
        try {
            await deleteRadioItem(id);
            setMessage("Programe y'urubuga yasibwe.");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to delete radio item.");
        } finally {
            setBusyId(null);
        }
    };

    const handleToggleStatus = async (item) => {
        const next = item.status === "active" ? "inactive" : "active";
        setBusyId(item.id);
        try {
            await setRadioItemStatus(item.id, next);
            setMessage(next === "active" ? "Programe yafunguwe." : "Programe yafunzwe.");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to change status.");
        } finally {
            setBusyId(null);
        }
    };

    const handleNowPlaying = async (item) => {
        setBusyId(item.id);
        try {
            await setRadioNowPlaying(item.id, !item.now_playing);
            setMessage(!item.now_playing ? "Iyi programe ni yo iri gukorera ubu." : "Now playing yahagaritswe kuri iyi programe.");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to update now playing.");
        } finally {
            setBusyId(null);
        }
    };

    const sorted = [...items].sort((a, b) => (a.queue_order ?? 0) - (b.queue_order ?? 0) || a.id - b.id);

    const handleMove = async (item, direction) => {
        const index = sorted.findIndex((entry) => entry.id === item.id);
        const target = sorted[index + (direction === "up" ? -1 : 1)];
        if (!target) return;
        setBusyId(item.id);
        try {
            await reorderRadioItem(item.id, target.queue_order ?? 0);
            await reorderRadioItem(target.id, item.queue_order ?? 0);
            setMessage("Ikurikiranyabumenyi ryahindutse.");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to reorder radio.");
        } finally {
            setBusyId(null);
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
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Radio</h1>
                        <p className="mt-0.5 text-sm text-slate-400">Imicungire y'ibigezweho by'urubuga rwa radio.</p>
                    </div>
                    <button onClick={openCreate}
                        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
                        + Ongera programe
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
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <p className="text-lg font-bold text-slate-700">Nta bigezweho bya radio bibonetse</p>
                        <p className="mt-1 text-sm text-slate-400">Kanda "+ Ongera programe" utangire.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
                            <span className="col-span-3">Programe</span>
                            <span className="col-span-2">Imimerere</span>
                            <span className="col-span-2">Ikurikiranyabumenyi</span>
                            <span className="col-span-2">Now Playing</span>
                            <span className="col-span-3 text-right">Ibikorwa</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {sorted.map((item) => (
                                <li key={item.id} className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-2 md:grid-cols-12 md:items-center">
                                    <span className="col-span-3 min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-800">{item.title || "Untitled"}</p>
                                        {item.description && <p className="truncate text-xs text-slate-400">{item.description}</p>}
                                    </span>
                                    <span className="col-span-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            {item.status || "inactive"}
                                        </span>
                                    </span>
                                    <span className="col-span-2 flex items-center gap-2 text-xs text-slate-500">
                                        <span className="font-bold">{item.queue_order ?? 0}</span>
                                        <button onClick={() => handleMove(item, "up")} disabled={busyId === item.id}
                                            className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" aria-label="Upload">↑</button>
                                        <button onClick={() => handleMove(item, "down")} disabled={busyId === item.id}
                                            className="grid h-6 w-6 place-items-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40" aria-label="Download">↓</button>
                                    </span>
                                    <span className="col-span-2">
                                        <button onClick={() => handleNowPlaying(item)} disabled={busyId === item.id}
                                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${item.now_playing ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"} disabled:opacity-40`}>
                                            {item.now_playing ? "● Now Playing" : "Shyira"}
                                        </button>
                                    </span>
                                    <span className="col-span-3 flex flex-wrap justify-end gap-2">
                                        <button onClick={() => handleToggleStatus(item)} disabled={busyId === item.id}
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40 ${item.status === "active" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                                            {item.status === "active" ? "Funga" : "Fungura"}
                                        </button>
                                        <button onClick={() => openEdit(item)}
                                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Hindura</button>
                                        <button onClick={() => handleDelete(item.id)} disabled={busyId === item.id}
                                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40">Siba</button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {showCreate && (
                    <ModalShell onClose={() => setShowCreate(false)} maxWidth="max-w-lg">
                        <ModalHeader title="Ongera programe ya radio" description="Onjera ikintu gishya mu ikurikiranyabumenyi." onClose={() => setShowCreate(false)} />
                        <form onSubmit={handleCreate} className="flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 scrollbar-thin">
                                <FormField label="Umutwe" required><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="form-input" /></FormField>
                                <FormField label="Ibisobanuro"><textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="form-input" rows={2} /></FormField>
                                <FormField label="YouTube URL" required>
                                    <input value={newYoutube} onChange={(e) => setNewYoutube(e.target.value)} required type="url" placeholder="https://www.youtube.com/watch?v=XXXXXXXX" className="form-input" />
                                </FormField>
                                <FormField label="Imimerere">
                                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="form-select">
                                            <option value="active">active</option>
                                            <option value="inactive">inactive</option>
                                        </select>
                                    </FormField>
                            </div>
                            <ModalFooter onCancel={() => setShowCreate(false)} onConfirm={handleCreate} confirmText="Ongera" confirmType="submit" />
                        </form>
                    </ModalShell>
                )}

                {showEdit && (
                    <ModalShell onClose={() => setShowEdit(false)} maxWidth="max-w-lg">
                        <ModalHeader title="Hindura programe ya radio" description="Vugurura amakuru y'iki gipande." onClose={() => setShowEdit(false)} />
                        <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
                            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 scrollbar-thin">
                                <FormField label="Umutwe" required><input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required className="form-input" /></FormField>
                                <FormField label="Ibisobanuro"><textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="form-input" rows={2} /></FormField>
                                <FormField label="YouTube URL">
                                    <input value={editYoutube} onChange={(e) => setEditYoutube(e.target.value)} placeholder="https://www.youtube.com/watch?v=XXXXXXXX" className="form-input" />
                                </FormField>
                                <FormField label="Imimerere">
                                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-select">
                                            <option value="active">active</option>
                                            <option value="inactive">inactive</option>
                                        </select>
                                    </FormField>
                            </div>
                            <ModalFooter onCancel={() => setShowEdit(false)} onConfirm={handleSave} confirmText="Bika" confirmType="submit" />
                        </form>
                    </ModalShell>
                )}
            </div>
        </DashboardLayout>
    );
}

export default RadioManagement;