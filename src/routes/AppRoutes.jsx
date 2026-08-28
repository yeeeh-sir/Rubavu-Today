import React, { Suspense, lazy, useEffect } from "react";
import {
    Navigate,
    Route,
    Routes,
    useNavigate,
} from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EmployeeNavbar from "../components/employee/Navbar";
import EmployeeSidebar from "../components/employee/Sidebar";
import { DashboardLayout } from "../components/dashboard";
import { logout, getStoredUser } from "../services/api";
import { getUserRole, isAuthenticated } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";
import WebsiteChat from "../components/WebsiteChat/WebsiteChat";

const Home = lazy(() => import("../pages/Home"));
const PostDetails = lazy(() => import("../pages/PostDetails"));
const NotFound = lazy(() => import("../pages/NotFound"));
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const CreateEmployee = lazy(() => import("../pages/admin/CreateEmployee"));
const CreateChiefEditor = lazy(() => import("../pages/admin/CreateChiefEditor"));
const ChiefLogin = lazy(() => import("../pages/chief-editor/ChiefLogin"));
const ChiefDashboard = lazy(() => import("../pages/chief-editor/ChiefDashboard"));
const EmployeeLogin = lazy(() => import("../pages/employee/EmployeeLogin"));
const EmployeeDashboard = lazy(() => import("../pages/employee/EmployeeDashboard"));
const EmployeeWorkspace = lazy(() => import("../pages/employee/EmployeeWorkspace"));
const Profile = lazy(() => import("../pages/employee/Profile"));

const PublicLayout = ({ children, showHomeContent = true }) => (
    <><Navbar showHomeContent={showHomeContent} />{children}<Footer /><WebsiteChat /></>
);

const EmployeeLayout = ({ children }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
        <EmployeeNavbar />
        <div className="flex flex-1">
            <EmployeeSidebar />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
    </div>
);

function ProtectedRoute({ roles, loginPath, children }) {
    const { user, refreshUser } = useAuth();
    const storedUser = getStoredUser();
    const effectiveUser = user || storedUser;

    useEffect(() => {
        if (isAuthenticated() && !user) {
            refreshUser();
        }
    }, [user, refreshUser]);

    if (!isAuthenticated()) {
        return <Navigate to={loginPath} replace />;
    }

    if (!effectiveUser) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    if (!roles.includes(getUserRole(effectiveUser))) {
        return <Navigate to={loginPath} replace />;
    }
    return children;
}

function PublicOnlyRoute({ role, redirectTo, children }) {
    if (isAuthenticated() && getUserRole() === role) {
        return <Navigate to={redirectTo} replace />;
    }
    return children;
}

function AdminPortal() {
    const navigate = useNavigate();
    return (
        <AdminDashboard
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
            onNavigateToChiefEditors={() => navigate("/admin")}
            onCreateEmployee={() => navigate("/admin/create-employee")}
            onCreateChiefEditor={() => navigate("/admin/create-chief-editor")}
        />
    );
}

function ChiefPortal() {
    const navigate = useNavigate();
    return (
        <ChiefDashboard
            onLogout={() => { logout(); navigate("/chief/login", { replace: true }); }}
        />
    );
}

function EmployeePortal() {
    const navigate = useNavigate();
    return (
        <EmployeeDashboard
            onLogout={() => { logout(); navigate("/employee/login", { replace: true }); }}
        />
    );
}

function AdminCreateEmployeePortal() {
    const navigate = useNavigate();
    return (
        <CreateEmployee
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        />
    );
}

function AdminCreateChiefPortal() {
    const navigate = useNavigate();
    return (
        <CreateChiefEditor
            onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}
        />
    );
}

function AdminProfileRoute() {
    const navigate = useNavigate();
    return (
        <DashboardLayout navigationSections={[]} roleLabel="Imicungire y'ubwanditsi" onLogout={() => { logout(); navigate("/admin/login", { replace: true }); }}>
            <Profile />
        </DashboardLayout>
    );
}

function ChiefProfileRoute() {
    const navigate = useNavigate();
    return (
        <DashboardLayout navigationSections={[]} roleLabel="Umwanditsi Mukuru" onLogout={() => { logout(); navigate("/chief/login", { replace: true }); }}>
            <Profile />
        </DashboardLayout>
    );
}

function EmployeeProfileRoute() {
    const navigate = useNavigate();
    return (
        <DashboardLayout navigationSections={[]} roleLabel="Employee" onLogout={() => { logout(); navigate("/employee/login", { replace: true }); }}>
            <Profile />
        </DashboardLayout>
    );
}

function AppRoutes() {
    const navigate = useNavigate();

    return (
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
            <Routes>
                <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                <Route path="/:slug" element={<PublicLayout showHomeContent={false}><PostDetails /></PublicLayout>} />
                <Route path="/post/:id" element={<PublicLayout showHomeContent={false}><PostDetails /></PublicLayout>} />

                <Route path="/admin/login" element={<PublicOnlyRoute role="admin" redirectTo="/admin/dashboard"><AdminLogin onLogin={() => navigate("/admin/dashboard", { replace: true })} /></PublicOnlyRoute>} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminPortal /></ProtectedRoute>} />
                <Route path="/admin/create-employee" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminCreateEmployeePortal /></ProtectedRoute>} />
                <Route path="/admin/create-chief-editor" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminCreateChiefPortal /></ProtectedRoute>} />

                <Route path="/chief/login" element={<PublicOnlyRoute role="chief_editor" redirectTo="/chief-editor/dashboard"><ChiefLogin /></PublicOnlyRoute>} />
                <Route path="/chief" element={<Navigate to="/chief-editor/dashboard" replace />} />
                <Route path="/chief-editor/dashboard" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefPortal /></ProtectedRoute>} />
                <Route path="/chief-editor/posts" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefPortal /></ProtectedRoute>} />

                <Route path="/employee/login" element={<PublicOnlyRoute role="employee" redirectTo="/employee/dashboard"><EmployeeLogin /></PublicOnlyRoute>} />
                <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
                <Route path="/employee/dashboard" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><EmployeePortal /></ProtectedRoute>} />
                <Route path="/employee/workspace" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><EmployeeLayout><EmployeeWorkspace /></EmployeeLayout></ProtectedRoute>} />
                <Route path="/employee/posts" element={<Navigate to="/employee/workspace" replace />} />
                <Route path="/employee/profile" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><EmployeeProfileRoute /></ProtectedRoute>} />
                <Route path="/admin/profile" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminProfileRoute /></ProtectedRoute>} />
                <Route path="/chief-editor/profile" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefProfileRoute /></ProtectedRoute>} />
                <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}

export default AppRoutes;
