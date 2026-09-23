import React, { Suspense, lazy, useEffect } from "react";
import {
    Navigate,
    Outlet,
    Route,
    Routes,
    useNavigate,
    useLocation,
} from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import EmployeeNavbar from "../components/employee/Navbar";
import EmployeeSidebar from "../components/employee/Sidebar";
import EmployeePortalLayout from "../components/employee/EmployeeLayout";
import { DashboardLayout } from "../components/dashboard";
import { logout, getStoredUser } from "../services/api";
import { getUserRole, isAuthenticated } from "../utils/auth";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";
import WebsiteChat from "../components/WebsiteChat/WebsiteChat";

const Home = lazy(() => import("../pages/Home"));
const RadioPage = lazy(() => import("../pages/RadioPage"));
const PostDetails = lazy(() => import("../pages/PostDetails"));
const Media = lazy(() => import("../pages/Media"));
const NotFound = lazy(() => import("../pages/NotFound"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const Terms = lazy(() => import("../pages/Terms"));
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
const CreateArticle = lazy(() => import("../pages/employee/CreateArticle"));
const MyArticles = lazy(() => import("../pages/employee/MyArticles"));
const EditArticle = lazy(() => import("../pages/employee/EditArticle"));
const EmployeeMediaLibrary = lazy(() => import("../pages/employee/MediaLibrary"));
const EmployeeNotifications = lazy(() => import("../pages/employee/EmployeeNotifications"));
const EmployeeStatistics = lazy(() => import("../pages/employee/EmployeeStatistics"));
const EmployeeProfilePage = lazy(() => import("../pages/employee/EmployeeProfile"));
const TextCleanerPage = lazy(() => import("../pages/admin/TextCleanerPage"));
const ChangePassword = lazy(() => import("../pages/admin/ChangePassword"));
const ChangeEmail = lazy(() => import("../pages/admin/ChangeEmail"));
const CreatePostPage = lazy(() => import("../pages/admin/CreatePost"));
const PostListPage = lazy(() => import("../pages/admin/PostListPage"));
const PostPreview = lazy(() => import("../pages/admin/PostPreview"));
const EditPost = lazy(() => import("../pages/admin/EditPost"));
const Overview = lazy(() => import("../pages/admin/Overview"));
const Employees = lazy(() => import("../pages/admin/Employees"));
const ChiefEditors = lazy(() => import("../pages/admin/ChiefEditors"));
const Advertisements = lazy(() => import("../pages/admin/Advertisements"));
const RadioManagement = lazy(() => import("../pages/admin/RadioManagement"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Performance = lazy(() => import("../pages/admin/Performance"));
const Accounts = lazy(() => import("../pages/admin/Accounts"));

const PublicLayout = ({ children, showHomeContent = true }) => (
    <>
        <Navbar showHomeContent={showHomeContent} />
        {children}
        <Footer />
        <WebsiteChat />
    </>
);

const LegacyEmployeeLayout = ({ children }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col">
        <EmployeeNavbar />
        <div className="flex flex-1">
            <EmployeeSidebar />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
    </div>
);

function EmployeeShellLayout() {
    const navigate = useNavigate();
    return (
        <EmployeePortalLayout
            onLogout={() => {
                logout();
                navigate("/employee/login", { replace: true });
            }}
        >
            <Outlet />
        </EmployeePortalLayout>
    );
}

function ProtectedRoute({ roles, loginPath, children }) {
    const { user, loading, refreshUser } = useAuth();
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

    if (loading) {
        return <LoadingScreen message="Checking authentication..." />;
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

function AppRoutes() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (typeof window.gtag === "function") {
            window.gtag("config", "G-3PD3XPEQSQ", {
                page_path: location.pathname + location.search + location.hash,
            });
        }
    }, [location]);

    return (
        <>
            <Suspense fallback={<LoadingScreen message="Loading..." />}>
                <Routes>
                    <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                    <Route path="/media" element={<PublicLayout showHomeContent={false}><Media /></PublicLayout>} />
                    <Route path="/radio" element={<PublicLayout showHomeContent={false}><RadioPage /></PublicLayout>} />
                    <Route path="/post/:id/*" element={<PublicLayout showHomeContent={false}><PostDetails /></PublicLayout>} />

                    <Route path="/about" element={<PublicLayout showHomeContent={false}><About /></PublicLayout>} />
                    <Route path="/contact" element={<PublicLayout showHomeContent={false}><Contact /></PublicLayout>} />
                    <Route path="/privacy-policy" element={<PublicLayout showHomeContent={false}><PrivacyPolicy /></PublicLayout>} />
                    <Route path="/terms" element={<PublicLayout showHomeContent={false}><Terms /></PublicLayout>} />

                    <Route path="/:slug.html" element={<PublicLayout showHomeContent={false}><PostDetails /></PublicLayout>} />
                    <Route path="/:slug" element={<PublicLayout showHomeContent={false}><PostDetails /></PublicLayout>} />

                    <Route path="/admin/login" element={<PublicOnlyRoute role="admin" redirectTo="/admin/dashboard"><AdminLogin onLogin={() => navigate("/admin/dashboard", { replace: true })} /></PublicOnlyRoute>} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminPortal /></ProtectedRoute>} />
                    <Route path="/admin/create-employee" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminCreateEmployeePortal /></ProtectedRoute>} />
                    <Route path="/admin/create-chief-editor" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminCreateChiefPortal /></ProtectedRoute>} />
                    <Route path="/admin/text-cleaner" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><TextCleanerPage /></ProtectedRoute>} />
                    <Route path="/admin/change-password" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><ChangePassword /></ProtectedRoute>} />
                    <Route path="/admin/change-email" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><ChangeEmail /></ProtectedRoute>} />
                    <Route path="/admin/posts/new" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><CreatePostPage /></ProtectedRoute>} />
                    <Route path="/admin/posts/:mode" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><PostListPage /></ProtectedRoute>} />
                    <Route path="/admin/posts/:id/view" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><PostPreview /></ProtectedRoute>} />
                    <Route path="/admin/posts/:id/edit" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><EditPost /></ProtectedRoute>} />
                    <Route path="/admin/overview" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><Overview /></ProtectedRoute>} />
                    <Route path="/admin/employees" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><Employees /></ProtectedRoute>} />
                    <Route path="/admin/chief-editors" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><ChiefEditors /></ProtectedRoute>} />
                    <Route path="/admin/advertisements" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><Advertisements /></ProtectedRoute>} />
                    <Route path="/admin/reports" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><Reports /></ProtectedRoute>} />
                    <Route path="/admin/performance" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><Performance /></ProtectedRoute>} />
                    <Route path="/admin/accounts" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><Accounts /></ProtectedRoute>} />
                    <Route path="/admin/radio" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><RadioManagement /></ProtectedRoute>} />

                    <Route path="/chief/login" element={<PublicOnlyRoute role="chief_editor" redirectTo="/chief-editor/dashboard"><ChiefLogin /></PublicOnlyRoute>} />
                    <Route path="/chief" element={<Navigate to="/chief-editor/dashboard" replace />} />
                    <Route path="/chief-editor/dashboard" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefPortal /></ProtectedRoute>} />
                    <Route path="/chief-editor/posts" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefPortal /></ProtectedRoute>} />

                    <Route path="/employee/login" element={<PublicOnlyRoute role="employee" redirectTo="/employee/dashboard"><EmployeeLogin /></PublicOnlyRoute>} />
                    <Route path="/employee" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><EmployeeShellLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<EmployeeDashboard />} />
                        <Route path="create" element={<CreateArticle />} />
                        <Route path="articles" element={<MyArticles />} />
                        <Route path="posts/:id/edit" element={<EditArticle />} />
                        <Route path="media" element={<EmployeeMediaLibrary />} />
                        <Route path="notifications" element={<EmployeeNotifications />} />
                        <Route path="statistics" element={<EmployeeStatistics />} />
                        <Route path="profile" element={<EmployeeProfilePage />} />
                    </Route>
                    <Route path="/employee/workspace" element={<ProtectedRoute roles={["employee", "reporter"]} loginPath="/employee/login"><LegacyEmployeeLayout><EmployeeWorkspace /></LegacyEmployeeLayout></ProtectedRoute>} />
                    <Route path="/employee/posts" element={<Navigate to="/employee/workspace" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/employee/dashboard" replace />} />
                    <Route path="/admin/profile" element={<ProtectedRoute roles={["admin"]} loginPath="/admin/login"><AdminProfileRoute /></ProtectedRoute>} />
                    <Route path="/chief-editor/profile" element={<ProtectedRoute roles={["chief_editor"]} loginPath="/chief/login"><ChiefProfileRoute /></ProtectedRoute>} />
                    <Route path="/profile" element={<Navigate to="/employee/profile" replace />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </>
    );
}

export default AppRoutes;
