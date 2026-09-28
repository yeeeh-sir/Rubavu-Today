import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    logout,
    getPermissions,
    getEmployeePermissions,
    saveEmployeePermissions,
} from "../../services/api";
import { DashboardLayout, ModalShell, ModalHeader, ModalFooter, FormField } from "../../components/dashboard";
import { ADMIN_NAV_SECTIONS } from "./adminNav";

function Employees() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [permissionDefinitions, setPermissionDefinitions] = useState([]);
    const [permissionMap, setPermissionMap] = useState({});
    const [savingPermissions, setSavingPermissions] = useState(false);

    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [newNickname, setNewNickname] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showEdit, setShowEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editNickname, setEditNickname] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editStatus, setEditStatus] = useState("active");

    const load = async () => {
        try {
            const data = await getEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Unable to load employees.");
        } finally {
            setLoading(false);
        }
    };

    const openPermissionPanel = async (emp) => {
        setSelectedEmployee(emp);
        setError("");
        try {
            const [permissionList, employeePermissionData] = await Promise.all([
                getPermissions(),
                getEmployeePermissions(emp.id),
            ]);

            const list = Array.isArray(permissionList) ? permissionList : [];
            const enabledPermissions = Array.isArray(employeePermissionData?.permissions)
                ? employeePermissionData.permissions
                : [];

            const nextMap = {};
            list.forEach((permission) => {
                const enabled = enabledPermissions.some(
                    (entry) => entry && entry.key === permission.key && Boolean(entry.enabled)
                );
                nextMap[permission.key] = Boolean(enabled);
            });

            setPermissionDefinitions(list);
            setPermissionMap(nextMap);
        } catch (err) {
            setError(err?.message || "Unable to load employee permissions.");
        }
    };

    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return employees.filter((e) => !q ||
            (e.full_name || "").toLowerCase().includes(q) ||
            (e.nickname || "").toLowerCase().includes(q) ||
            (e.email || "").toLowerCase().includes(q) ||
            (e.role || "").toLowerCase().includes(q));
    }, [employees, search]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await addEmployee({
                full_name: newName, nickname: newNickname.trim() || null,
                email: newEmail, phone: newPhone || null,
                password: newPassword, role: "reporter", status: "active",
            });
            setMessage("Umukozi yongewe neza.");
            setShowCreate(false);
            setNewName(""); setNewNickname(""); setNewEmail(""); setNewPhone(""); setNewPassword("");
            await load();
        } catch (err) {
            setError(err?.message || "Failed to add employee.");
        }
    };

    const openEdit = (emp) => {
        setEditId(emp.id);
        setEditName(emp.full_name || emp.name || "");
        setEditNickname(emp.nickname || "");
        setEditEmail(emp.email || "");
        setEditPhone(emp.phone || "");
        setEditStatus(emp.status || "active");
        setShowEdit(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await updateEmployee(editId, {
                full_name: editName, nickname: editNickname.trim(),
                email: editEmail, phone: editPhone || null,
                status: editStatus || "active",
            });
            setMessage("Umukozi yahinduwe neza.");
            setShowEdit(false);
            await load();
        } catch (err) {
            setError(err?.message || "Failed to update employee.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Siba uyu mukozi? Ntibishobora gusubizwa.")) return;
        try {
            await deleteEmployee(id);
            setMessage("Umukozi yasibwe.");
            if (selectedEmployee?.id === id) {
                setSelectedEmployee(null);
                setPermissionDefinitions([]);
                setPermissionMap({});
            }
            await load();
        } catch (err) {
            setError(err?.message || "Failed to delete employee.");
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedEmployee) return;

        setSavingPermissions(true);
        setError("");

        try {
            const selectedKeys = Object.entries(permissionMap)
                .filter(([, enabled]) => Boolean(enabled))
                .map(([key]) => key);

            await saveEmployeePermissions(selectedEmployee.id, selectedKeys);
            setMessage(`Uburyo bw'uburenganzira bwa ${selectedEmployee.full_name || selectedEmployee.email} bwabitswe neza.`);
            await openPermissionPanel(selectedEmployee);
        } catch (err) {
            setError(err?.message || "Failed to save employee permissions.");
        } finally {
            setSavingPermissions(false);
        }
    };

    return (
        <DashboardLayout
            navigationSections={ADMIN_NAV_SECTIONS}
            roleLabel="Imicungire y'ubwanditsi"
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        >
            <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Abakozi</h1>
                        <p className="mt-0.5 text-sm text-slate-400">Imicungire y'abakozi.</p>
                    </div>
                    <button onClick={() => setShowCreate(true)}
                        className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700">
                        + Ongera Umukozi
                    </button>
                </div>

                <div className="mb-5">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Shakisha umukozi..."
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
                        <p className="text-lg font-bold text-slate-700">Nta bakozi babonetse</p>
                        <p className="mt-1 text-sm text-slate-400">Kanda "+ Ongera Umukozi" utangire.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
                            <span className="col-span-4">Izina</span>
                            <span className="col-span-3">Imeriyo</span>
                            <span className="col-span-2">Umurimo</span>
                            <span className="col-span-1">Ikibanza</span>
                            <span className="col-span-2 text-right">Ibikorwa</span>
                        </div>
                        <ul className="divide-y divide-slate-100">
                            {filtered.map((emp) => (
                                <li key={emp.id} className="grid grid-cols-1 gap-2 px-5 py-3.5 sm:grid-cols-2 md:grid-cols-12 md:items-center">
                                    <span className="col-span-4 truncate text-sm font-semibold text-slate-800">
                                        {emp.full_name || emp.name || emp.email}
                                        {emp.nickname ? (
                                            <span className="ml-1 font-medium text-brand-600">({emp.nickname})</span>
                                        ) : null}
                                    </span>
                                    <span className="col-span-3 truncate text-xs text-slate-400">{emp.email}</span>
                                    <span className="col-span-2 text-xs text-slate-500">{emp.role || "reporter"}</span>
                                    <span className="col-span-1">
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${emp.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                            {emp.status || "active"}
                                        </span>
                                    </span>
                                    <span className="col-span-2 flex justify-end gap-2">
                                        <button onClick={() => openPermissionPanel(emp)} className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Permissions</button>
                                        <button onClick={() => openEdit(emp)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Hindura</button>
                                        <button onClick={() => handleDelete(emp.id)} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Siba</button>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {selectedEmployee && (
                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Employee Management</p>
                                <h2 className="text-xl font-black text-slate-900">{selectedEmployee.full_name || selectedEmployee.email}</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEmployee(null)}
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mb-5 grid gap-4 md:grid-cols-4">
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Employee</p>
                                <p className="mt-2 text-sm font-semibold text-slate-800">{selectedEmployee.full_name || selectedEmployee.email}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Real name</p>
                                <p className="mt-2 text-sm font-semibold text-slate-800">{selectedEmployee.full_name || "—"}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Nickname</p>
                                <p className="mt-2 text-sm font-semibold text-slate-800">{selectedEmployee.nickname || "—"}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Current role</p>
                                <p className="mt-2 text-sm font-semibold text-slate-800">{selectedEmployee.role || "reporter"}</p>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Permissions</h3>
                            <button
                                type="button"
                                onClick={handleSavePermissions}
                                disabled={savingPermissions}
                                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-200 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingPermissions ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            {permissionDefinitions.map((permission) => (
                                <label key={permission.key} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/40">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(permissionMap[permission.key])}
                                        onChange={() => setPermissionMap((prev) => ({
                                            ...prev,
                                            [permission.key]: !Boolean(prev[permission.key]),
                                        }))}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-800">{permission.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">{permission.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {showCreate && (
                    <ModalShell onClose={() => setShowCreate(false)} maxWidth="max-w-md">
                        <ModalHeader title="Ongera Umukozi" description="Onjera umukozi mushya." onClose={() => setShowCreate(false)} />
                        <form onSubmit={handleCreate} className="space-y-4 p-5">
                            <FormField label="Izina" required><input value={newName} onChange={(e) => setNewName(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Nickname" description="Ntihagenewe. Igaragara ku byanditswe nk' Izina (Nickname)."><input value={newNickname} onChange={(e) => setNewNickname(e.target.value)} maxLength={100} className="form-input" /></FormField>
                            <FormField label="Imeriyo" required><input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Telefoni"><input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="form-input" /></FormField>
                            <FormField label="Ijambo ry'ibanga" required><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="form-input" /></FormField>
                            <ModalFooter onCancel={() => setShowCreate(false)} onConfirm={handleCreate} confirmText="Ongera" />
                        </form>
                    </ModalShell>
                )}

                {showEdit && (
                    <ModalShell onClose={() => setShowEdit(false)} maxWidth="max-w-md">
                        <ModalHeader title="Hindura Umukozi" description="Vugurura amakuru y'umukozi." onClose={() => setShowEdit(false)} />
                        <form onSubmit={handleSaveEdit} className="space-y-4 p-5">
                            <FormField label="Izina" required><input value={editName} onChange={(e) => setEditName(e.target.value)} required className="form-input" /></FormField>
                            <FormField label="Nickname" description="Urimwe usiga nk'oko ukubikira."><input value={editNickname} onChange={(e) => setEditNickname(e.target.value)} maxLength={100} className="form-input" /></FormField>
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

export default Employees;
