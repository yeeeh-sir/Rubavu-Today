import React, { useEffect } from "react";
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
import Home from "../pages/Home";
import PostDetails from "../pages/PostDetails";
import NotFound from "../pages/NotFound";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateEmployee from "../pages/admin/CreateEmployee";
import CreateChiefEditor from "../pages/admin/CreateChiefEditor";
import ChiefLogin from "../pages/chief-editor/ChiefLogin";
import ChiefDashboard from "../pages/chief-editor/ChiefDashboard";
import EmployeeLogin from "../pages/employee/EmployeeLogin";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeWorkspace from "../pages/employee/EmployeeWorkspace";
import Profile from "../pages/employee/Profile";
import { logout } from "../services/api";
import { getUserRole, isAuthenticated } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";

const PublicLayout = ({ children, showHomeContent = true }) => (
    <><Navbar showHomeContent={showHomeContent} />{children}<Footer /></>
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
    const { user, loading, refreshUser } = useAuth();
    const needsVerification = isAuthenticated() && !user;

    useEffect(() => {
        if (needsVerification) {
            refreshUser();
        }
    }, [needsVerification, refreshUser]);

    if (loading || needsVerification) {
        return <LoadingScreen message="Checking authentication..." />;
    }

    if (!user || !roles.includes(getUserRole(user))) {
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

function AppRoutes() {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/post/:id" element={<PublicLayout showHomeContent={false}><PostDetails /></PublicLayout>} />

            <Route path="/admin/login" element={<PublicOnlyRoute role="admin" redirectTo="/admin/dashboard"><AdminLogin onLogin={() => navigate("/admin/dashboard", { replace: true })} /></PublicOnlyRoute>} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminPortal /></ProtectedRoute>} />
            <Route path="/admin/create-employee" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><CreateEmployee /></ProtectedRoute>} />
            <Route path="/admin/create-chief-editor" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><CreateChiefEditor /></ProtectedRoute>} />

            <Route path="/chief/login" element={<PublicOnlyRoute role="chief_editor" redirectTo="/chief-editor/dashboard"><ChiefLogin /></PublicOnlyRoute>} />
            <Route path="/chief" element={<Navigate to="/chief-editor/dashboard" replace />} />
            <Route path="/chief-editor/dashboard" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefDashboard /></ProtectedRoute>} />
            <Route path="/chief-editor/posts" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefDashboard /></ProtectedRoute>} />

            <Route path="/employee/login" element={<PublicOnlyRoute role="employee" redirectTo="/employee/dashboard"><EmployeeLogin /></PublicOnlyRoute>} />
            <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
            <Route path="/employee/dashboard" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><EmployeeLayout><EmployeeDashboard /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/workspace" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><EmployeeLayout><EmployeeWorkspace /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/employee/posts" element={<Navigate to="/employee/workspace" replace />} />
            <Route path="/employee/profile" element={<ProtectedRoute roles={["admin", "chief_editor", "employee", "reporter"]} loginPath="/employee/login"><EmployeeLayout><Profile /></EmployeeLayout></ProtectedRoute>} />
            <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoutes;