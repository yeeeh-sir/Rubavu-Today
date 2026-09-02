import React, {
    useEffect,
    useState,
    useCallback,
    useRef,
    useMemo,
} from "react";

import {
    API_ROOT,
    getAdminPosts,
    approvePost,
    rejectPost,
    reviewPost,
    updatePost,
    deletePost,
    updateEmployee,
    deleteEmployee,
    updateChiefEditor,
    deleteChiefEditor,
    updateAdvertisement,
    deleteAdvertisement,
    addPost,
    getEmployees,
    addEmployee,
    getChiefEditors,
    addChiefEditor,
    getAdvertisements,
    addAdvertisement,
    changeMyPassword,
    changeMyEmail,
    getAllComments,
    deleteComment,
} from "../../services/api";

import { DashboardLayout } from "../../components/dashboard";
import ArticleEditor from "../../components/article/ArticleEditor";

const API_URL = API_ROOT;

const DEPARTMENTS = [
    { name: "Amakuru", icon: "📰", color: "blue" },
    { name: "Ubukungu", icon: "💼", color: "emerald" },
    { name: "Imikino", icon: "⚽", color: "orange" },
    { name: "Imyidagaduro", icon: "🎭", color: "pink" },
    { name: "Uburezi", icon: "🎓", color: "purple" },
];

const DEFAULT_AD_POSITIONS = [
    "header",
    "sidebar",
    "footer",
    "inline",
    "between-posts",
];

const POST_STATUSES = {
    ALL: "all",
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

const PAGE_SIZE = 8;

const AdminDashboard = ({
    onLogout,
    onNavigateToChiefEditors,
    onCreateEmployee,
    onCreateChiefEditor,
    onPostAdvertisement,
}) => {
    const [posts, setPosts] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState(
        POST_STATUSES.PENDING
    );

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedPosts, setSelectedPosts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid");

    const [allComments, setAllComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [commentsError, setCommentsError] = useState("");

    const [editingPostId, setEditingPostId] = useState(null);
    const [editInitial, setEditInitial] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [createPostSaving, setCreatePostSaving] = useState(false);

    const previousRef = useRef([]);





    const [showCreatePost, setShowCreatePost] = useState(false);
    const [postEditorKey, setPostEditorKey] = useState(0);





    const [showCreateEmployee, setShowCreateEmployee] = useState(false);
    const [empName, setEmpName] = useState("");
    const [empEmail, setEmpEmail] = useState("");
    const [empPhone, setEmpPhone] = useState("");
    const [empPassword, setEmpPassword] = useState("");





    const [showCreateChief, setShowCreateChief] = useState(false);
    const [chiefName, setChiefName] = useState("");
    const [chiefEmail, setChiefEmail] = useState("");
    const [chiefPhone, setChiefPhone] = useState("");
    const [chiefPassword, setChiefPassword] = useState("");





    const [showCreateAd, setShowCreateAd] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [adTitle, setAdTitle] = useState("");
    const [adDescription, setAdDescription] = useState("");
    const [adTargetUrl, setAdTargetUrl] = useState("");
    const [adLink, setAdLink] = useState("");
    const [adPosition, setAdPosition] = useState("");
    const [adPositions] = useState(DEFAULT_AD_POSITIONS);
    const [adStartDate, setAdStartDate] = useState("");
    const [adEndDate, setAdEndDate] = useState("");
    const [adStatus, setAdStatus] = useState("active");
    const [adImage, setAdImage] = useState(null);

    const [employees, setEmployees] = useState([]);
    const [chiefEditors, setChiefEditors] = useState([]);
    const [advertisements, setAdvertisements] = useState([]);

    const [showEditEmployee, setShowEditEmployee] = useState(false);
    const [editEmpId, setEditEmpId] = useState(null);
    const [editEmpName, setEditEmpName] = useState("");
    const [editEmpEmail, setEditEmpEmail] = useState("");
    const [editEmpPhone, setEditEmpPhone] = useState("");
    const [editEmpStatus, setEditEmpStatus] = useState("active");

    const [showEditChief, setShowEditChief] = useState(false);
    const [editChiefId, setEditChiefId] = useState(null);
    const [editChiefName, setEditChiefName] = useState("");
    const [editChiefEmail, setEditChiefEmail] = useState("");
    const [editChiefPhone, setEditChiefPhone] = useState("");
    const [editChiefStatus, setEditChiefStatus] = useState("active");

    const [showEditAd, setShowEditAd] = useState(false);
    const [editAdId, setEditAdId] = useState(null);
    const [editAdTitle, setEditAdTitle] = useState("");
    const [editAdDescription, setEditAdDescription] = useState("");
    const [editAdTargetUrl, setEditAdTargetUrl] = useState("");
    const [editAdLink, setEditAdLink] = useState("");
    const [editAdPosition, setEditAdPosition] = useState("");
    const [editAdPositions] = useState(DEFAULT_AD_POSITIONS);
    const [editAdStartDate, setEditAdStartDate] = useState("");
    const [editAdEndDate, setEditAdEndDate] = useState("");
    const [editAdStatus, setEditAdStatus] = useState("active");
    const [editAdImage, setEditAdImage] = useState(null);





    const normalizeStatus = (post) =>
        String(
            post?.status ||
            post?.approval_status ||
            post?.publication_status ||
            "pending"
        ).toLowerCase();

    const getImageUrl = (image) => {
        if (!image) return null;

        if (
            typeof image === "string" &&
            (image.startsWith("http://") ||
                image.startsWith("https://") ||
                image.startsWith("blob:"))
        ) {
            return image;
        }

        return `${API_URL}${image}`;
    };





    const loadPosts = useCallback(async (isPolling = false) => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getAdminPosts();
            const list = Array.isArray(data) ? data : [];

            if (isPolling && previousRef.current.length) {
                list.forEach((post) => {
                    const previous = previousRef.current.find(
                        (item) => item.id === post.id
                    );

                    const oldComments = previous?.comments?.length || 0;
                    const newComments = post.comments?.length || 0;

                    if (newComments > oldComments) {
                        setStatusMessage(
                            `New comment on "${post.title || "story"}"`
                        );
                    }
                });
            }

            setPosts(list);
            previousRef.current = list;
        } catch (error) {
            console.error("loadPosts", error);
            setPosts([]);
            setErrorMessage("Unable to load posts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);





    useEffect(() => {
        loadPosts();
    }, [loadPosts]);





    useEffect(() => {
        const loadAll = async () => {
            try {
                const emps = await getEmployees();
                setEmployees(Array.isArray(emps) ? emps : []);
            } catch (err) {
                console.error("loadEmployees", err);
                setEmployees([]);
            }

            try {
                const chiefs = await getChiefEditors();
                setChiefEditors(Array.isArray(chiefs) ? chiefs : []);
            } catch (err) {
                console.error("loadChiefEditors", err);
                setChiefEditors([]);
            }

            try {
                const ads = await getAdvertisements();
                setAdvertisements(Array.isArray(ads) ? ads : []);
            } catch (err) {
                console.error("loadAdvertisements", err);
                setAdvertisements([]);
            }

            try {
                const comments = await getAllComments();
                setAllComments(Array.isArray(comments) ? comments : []);
            } catch (err) {
                console.error("loadAllComments", err);
                setCommentsError(err?.message || "Unable to load comments.");
                setAllComments([]);
            } finally {
                setLoadingComments(false);
            }
        };

        loadAll();
    }, []);





    const handleDeleteAllComment = async (commentId) => {
        if (!commentId) {
            setCommentsError("Unable to identify this comment.");
            return;
        }

        const confirmed = window.confirm("Remove this comment?");
        if (!confirmed) return;

        try {
            setCommentsError("");
            await deleteComment(commentId);
            setAllComments((prev) =>
                prev.filter((c) => (c.id ?? c.comment_id ?? c._id) !== commentId)
            );
        } catch (err) {
            console.error("Delete comment error:", err);
            setCommentsError(err?.message || "Unable to remove comment.");
        }
    };





    const modalOpen =
        showCreatePost ||
        showCreateEmployee ||
        showCreateChief ||
        showCreateAd ||
        showChangePassword ||
        showChangeEmail ||
        showEditEmployee ||
        showEditChief ||
        showEditAd ||
        Boolean(editingPostId);

    useEffect(() => {
        if (!modalOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [modalOpen]);





    const statistics = useMemo(() => {
        const pending = posts.filter(
            (post) => normalizeStatus(post) === POST_STATUSES.PENDING
        ).length;

        const approved = posts.filter(
            (post) => normalizeStatus(post) === POST_STATUSES.APPROVED
        ).length;

        const rejected = posts.filter(
            (post) => normalizeStatus(post) === POST_STATUSES.REJECTED
        ).length;

        const comments = posts.reduce(
            (total, post) => total + (post.comments?.length || 0),
            0
        );

        return {
            total: posts.length,
            pending,
            approved,
            rejected,
            comments,
        };
    }, [posts]);






    const filteredPosts = useMemo(() => {
        let result = [...posts];

        if (selectedDepartment !== "All") {
            result = result.filter(
                (post) => post.category === selectedDepartment
            );
        }

        if (selectedStatus !== POST_STATUSES.ALL) {
            result = result.filter(
                (post) => normalizeStatus(post) === selectedStatus
            );
        }

        if (search.trim()) {
            const query = search.toLowerCase().trim();

            result = result.filter((post) => {
                return (
                    post.title?.toLowerCase().includes(query) ||
                    post.description?.toLowerCase().includes(query) ||
                    post.category?.toLowerCase().includes(query)
                );
            });
        }

        result.sort((a, b) => {
            if (sortBy === "title") {
                return (a.title || "").localeCompare(b.title || "");
            }

            if (sortBy === "oldest") {
                return (
                    new Date(a.createdDate || 0) -
                    new Date(b.createdDate || 0)
                );
            }

            return (
                new Date(b.createdDate || 0) -
                new Date(a.createdDate || 0)
            );
        });

        return result;
    }, [
        posts,
        selectedDepartment,
        selectedStatus,
        search,
        sortBy,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPosts.length / PAGE_SIZE)
    );

    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedDepartment, selectedStatus, sortBy]);





    const handleApprove = async (post) => {
        if (!window.confirm(`Approve "${post.title}"?`)) return;

        try {
            setStatusMessage("Approving post...");
            await approvePost(post.id);
            setStatusMessage("Post approved successfully.");
            await loadPosts();
        } catch (error) {
            console.error(error);
            setStatusMessage("Failed to approve post.");
        }
    };

    const handleReject = async (post) => {
        if (!window.confirm(`Reject "${post.title}"?`)) return;

        try {
            setStatusMessage("Rejecting post...");
            await rejectPost(post.id);
            setStatusMessage("Post rejected.");
            await loadPosts();
        } catch (error) {
            console.error(error);
            setStatusMessage("Failed to reject post.");
        }
    };

    const handlePending = async (post) => {
        if (!window.confirm(`Move "${post.title}" back to pending?`)) return;

        try {
            setStatusMessage("Updating post status...");
            await reviewPost(post.id);
            setStatusMessage("Post moved back to pending.");
            await loadPosts();
        } catch (error) {
            console.error(error);
            setStatusMessage("Failed to change status.");
        }
    };

    const handleDelete = async (post) => {
        if (
            !window.confirm(
                `Delete "${post.title}"?\n\nThis action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setStatusMessage("Deleting post...");

            await deletePost(post.id);

            setSelectedPosts((current) =>
                current.filter((id) => id !== post.id)
            );

            setStatusMessage("Post deleted.");
            await loadPosts();
        } catch (error) {
            console.error(error);
            setStatusMessage("Failed to delete post.");
        }
    };





    const openEdit = (post) => {
        setEditingPostId(post.id);
        setEditInitial({
            title: post.title || "",
            description: post.description || post.content || "",
            youtube_url: post.youtube_url || "",
            image: post.image || null,
            category: post.category || DEPARTMENTS[0].name,
            content_blocks: post.content_blocks || null,
        });
    };

    const closeEdit = () => {
        setEditingPostId(null);
        setEditInitial(null);
    };

    const handleSubmitEdit = async (formData) => {
        if (!editingPostId) return;

        try {
            setStatusMessage("Updating post...");
            setEditSaving(true);

            await updatePost(editingPostId, formData);

            setStatusMessage("Post updated successfully.");
            closeEdit();
            await loadPosts();
        } catch (error) {
            console.error("Update post error:", error);
            setErrorMessage(
                error?.message || "Failed to update post."
            );
        } finally {
            setEditSaving(false);
        }
    };





    const togglePostSelection = (id) => {
        setSelectedPosts((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id]
        );
    };

    const selectAllVisible = () => {
        const visibleIds = paginatedPosts.map((post) => post.id);

        const allSelected =
            visibleIds.length > 0 &&
            visibleIds.every((id) => selectedPosts.includes(id));

        if (allSelected) {
            setSelectedPosts((current) =>
                current.filter((id) => !visibleIds.includes(id))
            );
        } else {
            setSelectedPosts((current) => [
                ...new Set([...current, ...visibleIds]),
            ]);
        }
    };

    const clearSelection = () => {
        setSelectedPosts([]);
    };

    const handleBulkApprove = async () => {
        if (!selectedPosts.length) return;

        if (
            !window.confirm(
                `Approve ${selectedPosts.length} selected post(s)?`
            )
        ) {
            return;
        }

        try {
            setStatusMessage("Approving selected posts...");

            for (const id of selectedPosts) {
                await approvePost(id);
            }

            clearSelection();
            setStatusMessage("Selected posts approved.");
            await loadPosts();
        } catch (error) {
            console.error(error);
            setStatusMessage("Some posts could not be approved.");
        }
    };

    const handleBulkReject = async () => {
        if (!selectedPosts.length) return;

        if (
            !window.confirm(
                `Reject ${selectedPosts.length} selected post(s)?`
            )
        ) {
            return;
        }

        try {
            setStatusMessage("Rejecting selected posts...");

            for (const id of selectedPosts) {
                await rejectPost(id);
            }

            clearSelection();
            setStatusMessage("Selected posts rejected.");
            await loadPosts();
        } catch (error) {
            console.error(error);
            setStatusMessage("Some posts could not be rejected.");
        }
    };





    const exportPosts = () => {
        if (!filteredPosts.length) {
            setStatusMessage("There are no posts to export.");
            return;
        }

        const headers = [
            "Title",
            "Category",
            "Status",
            "Created Date",
            "Comments",
        ];

        const rows = filteredPosts.map((post) => [
            post.title || "",
            post.category || "",
            normalizeStatus(post),
            post.createdDate || "",
            post.comments?.length || 0,
        ]);

        const csv = [headers, ...rows]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([csv], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "rubavu-today-posts.csv";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        setStatusMessage("Posts exported successfully.");
    };





    const quickAction = (callback, fallback) => {
        if (callback) {
            callback();
        } else {
            setStatusMessage(fallback);
        }
    };





    const handleCreatePost = async (formData) => {
        if (createPostSaving) return;
        try {
            setCreatePostSaving(true);
            setStatusMessage("Creating post...");

            await addPost(formData);

            setStatusMessage("Post created.");
            setShowCreatePost(false);
            setPostEditorKey((k) => k + 1);

            await loadPosts();
        } catch (err) {
            console.error(err);
            setStatusMessage(
                err?.message || "Failed to create post."
            );
        } finally {
            setCreatePostSaving(false);
        }
    };





    const handleCreateEmployee = async () => {
        if (
            !empName.trim() ||
            !empEmail.trim() ||
            !empPassword.trim()
        ) {
            setStatusMessage(
                "Name, email and password are required for employee."
            );
            return;
        }

        try {
            setStatusMessage("Creating employee...");

            await addEmployee({
                full_name: empName,
                email: empEmail,
                phone: empPhone || null,
                password: empPassword,
                role: "reporter",
                status: "active",
            });

            const emps = await getEmployees();
            setEmployees(Array.isArray(emps) ? emps : []);

            setStatusMessage("Employee created.");
            setShowCreateEmployee(false);

            setEmpName("");
            setEmpEmail("");
            setEmpPhone("");
            setEmpPassword("");
        } catch (err) {
            console.error(err);
            setStatusMessage(
                err?.message || "Failed to create employee."
            );
        }
    };





    const handleCreateChief = async () => {
        if (
            !chiefName.trim() ||
            !chiefEmail.trim() ||
            !chiefPassword.trim()
        ) {
            setStatusMessage(
                "Name, email and password are required for chief editor."
            );
            return;
        }

        try {
            setStatusMessage("Creating chief editor...");

            await addChiefEditor({
                full_name: chiefName,
                email: chiefEmail,
                phone: chiefPhone || null,
                password: chiefPassword,
                status: "active",
            });

            const chiefs = await getChiefEditors();
            setChiefEditors(Array.isArray(chiefs) ? chiefs : []);

            setStatusMessage("Chief editor created.");
            setShowCreateChief(false);

            setChiefName("");
            setChiefEmail("");
            setChiefPhone("");
            setChiefPassword("");
        } catch (err) {
            console.error(err);
            setStatusMessage(
                err?.message || "Failed to create chief editor."
            );
        }
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();

        if (newPassword.length < 6) {
            setStatusMessage("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusMessage("New passwords do not match.");
            return;
        }

        try {
            await changeMyPassword(currentPassword, newPassword);
            setStatusMessage("Password changed successfully.");
            setShowChangePassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setStatusMessage(error?.message || "Unable to change password.");
        }
    };

    const handleChangeEmail = async (event) => {
        event.preventDefault();

        try {
            await changeMyEmail(newEmail, currentPassword);
            setStatusMessage("Email changed successfully.");
            setShowChangeEmail(false);
            setNewEmail("");
            setCurrentPassword("");
        } catch (error) {
            setStatusMessage(error?.message || "Unable to change email.");
        }
    };





    const handleCreateAd = async () => {
        if (!adTitle.trim() || !adPosition.trim()) {
            setStatusMessage(
                "Title and position are required for advertisement."
            );
            return;
        }

        try {
            setStatusMessage("Creating advertisement...");

            await addAdvertisement({
                title: adTitle,
                description: adDescription || null,
                target_url: adTargetUrl || null,
                link: adLink || null,
                position: adPosition,
                start_date: adStartDate || null,
                end_date: adEndDate || null,
                status: adStatus || "active",
                image: adImage || null,
            });

            const ads = await getAdvertisements();
            setAdvertisements(Array.isArray(ads) ? ads : []);

            setStatusMessage("Advertisement created.");
            setShowCreateAd(false);

            setAdTitle("");
            setAdDescription("");
            setAdTargetUrl("");
            setAdLink("");
            setAdPosition("");
            setAdStartDate("");
            setAdEndDate("");
            setAdStatus("active");
            setAdImage(null);
        } catch (err) {
            console.error(err);
            setStatusMessage(
                err?.message || "Failed to create advertisement."
            );
        }
    };


    const openEditEmployee = (emp) => {
        setEditEmpId(emp.id);
        setEditEmpName(emp.full_name || emp.name || "");
        setEditEmpEmail(emp.email || "");
        setEditEmpPhone(emp.phone || "");
        setEditEmpStatus(emp.status || "active");
        setShowEditEmployee(true);
    };

    const handleSaveEmployeeEdit = async () => {
        if (!editEmpName.trim() || !editEmpEmail.trim()) {
            setStatusMessage("Name and email are required.");
            return;
        }

        try {
            setStatusMessage("Saving employee...");
            await updateEmployee(editEmpId, {
                full_name: editEmpName,
                email: editEmpEmail,
                phone: editEmpPhone || null,
                status: editEmpStatus || "active",
            });


            try {
                const emps = await getEmployees();
                setEmployees(Array.isArray(emps) ? emps : []);
            } catch (err2) {
                console.error('refresh employees', err2);
            }

            setStatusMessage("Employee updated.");
            setShowEditEmployee(false);
        } catch (err) {
            console.error(err);
            setStatusMessage(err?.message || "Failed to update employee.");
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Delete this employee? This cannot be undone.')) return;

        try {
            setStatusMessage('Deleting employee...');
            await deleteEmployee(id);

            const emps = await getEmployees();
            setEmployees(Array.isArray(emps) ? emps : []);
            setStatusMessage('Employee deleted.');
        } catch (err) {
            console.error(err);
            setStatusMessage(err?.message || 'Failed to delete employee.');
        }
    };


    const openEditChief = (c) => {
        setEditChiefId(c.id);
        setEditChiefName(c.full_name || c.name || "");
        setEditChiefEmail(c.email || "");
        setEditChiefPhone(c.phone || "");
        setEditChiefStatus(c.status || "active");
        setShowEditChief(true);
    };

    const handleSaveChiefEdit = async () => {
        if (!editChiefName.trim() || !editChiefEmail.trim()) {
            setStatusMessage("Name and email are required.");
            return;
        }

        try {
            setStatusMessage("Saving chief editor...");
            await updateChiefEditor(editChiefId, {
                full_name: editChiefName,
                email: editChiefEmail,
                phone: editChiefPhone || null,
                status: editChiefStatus || "active",
            });


            try {
                const chiefs = await getChiefEditors();
                setChiefEditors(Array.isArray(chiefs) ? chiefs : []);
            } catch (err2) {
                console.error('refresh chiefs', err2);
            }

            setStatusMessage("Chief editor updated.");
            setShowEditChief(false);
        } catch (err) {
            console.error(err);
            setStatusMessage(err?.message || "Failed to update chief editor.");
        }
    };

    const handleDeleteChief = async (id) => {
        if (!window.confirm('Delete this chief editor? This cannot be undone.')) return;

        try {
            setStatusMessage('Deleting chief editor...');
            await deleteChiefEditor(id);

            const chiefs = await getChiefEditors();
            setChiefEditors(Array.isArray(chiefs) ? chiefs : []);
            setStatusMessage('Chief editor deleted.');
        } catch (err) {
            console.error(err);
            setStatusMessage(err?.message || 'Failed to delete chief editor.');
        }
    };


    const openEditAd = (a) => {
        setEditAdId(a.id);
        setEditAdTitle(a.title || "");
        setEditAdDescription(a.description || "");
        setEditAdTargetUrl(a.target_url || "");
        setEditAdLink(a.link || "");
        setEditAdPosition(a.position || "");
        setEditAdStartDate(a.start_date || "");
        setEditAdEndDate(a.end_date || "");
        setEditAdStatus(a.status || "active");
        setEditAdImage(null);
        setShowEditAd(true);
    };

    const handleSaveAdEdit = async () => {
        if (!editAdTitle.trim() || !editAdPosition.trim()) {
            setStatusMessage('Title and position are required.');
            return;
        }

        try {
            setStatusMessage('Saving advertisement...');

            await updateAdvertisement(editAdId, {
                title: editAdTitle,
                description: editAdDescription || null,
                target_url: editAdTargetUrl || null,
                link: editAdLink || null,
                position: editAdPosition,
                start_date: editAdStartDate || null,
                end_date: editAdEndDate || null,
                status: editAdStatus || 'active',
                image: editAdImage || null,
            });

            const ads = await getAdvertisements();
            setAdvertisements(Array.isArray(ads) ? ads : []);

            setStatusMessage('Advertisement updated.');
            setShowEditAd(false);
        } catch (err) {
            console.error(err);
            setStatusMessage(err?.message || 'Failed to update advertisement.');
        }
    };

    const handleDeleteAd = async (id) => {
        if (!window.confirm('Delete this advertisement? This cannot be undone.')) return;

        try {
            setStatusMessage('Deleting advertisement...');
            await deleteAdvertisement(id);

            const ads = await getAdvertisements();
            setAdvertisements(Array.isArray(ads) ? ads : []);
            setStatusMessage('Advertisement deleted.');
        } catch (err) {
            console.error(err);
            setStatusMessage(err?.message || 'Failed to delete advertisement.');
        }
    };

    const handleSendAd = async (ad) => {
        const id = ad?.id || ad;

        if (!id) return;

        if (!window.confirm('Send this advertisement to live (set status to active)?')) return;

        try {
            setStatusMessage('Sending advertisement...');

            await updateAdvertisement(id, { status: 'active' });

            const ads = await getAdvertisements();
            setAdvertisements(Array.isArray(ads) ? ads : []);

            setStatusMessage('Advertisement sent (activated).');
        } catch (err) {
            console.error('send ad', err);
            setStatusMessage(err?.message || 'Failed to send advertisement.');
        }
    };





    const openEmployeeManager = () => {
        if (onCreateEmployee) {
            quickAction(
                onCreateEmployee,
                "Employee management is ready to connect."
            );
        } else {
            setShowCreateEmployee(true);
        }
    };

    const openChiefManager = () => {
        if (onNavigateToChiefEditors) {
            onNavigateToChiefEditors();
        } else if (onCreateChiefEditor) {
            quickAction(
                onCreateChiefEditor,
                "Chief Editor management is ready to connect."
            );
        } else {
            setShowCreateChief(true);
        }
    };

    const openAdvertisementManager = () => {
        if (onPostAdvertisement) {
            quickAction(
                onPostAdvertisement,
                "Advertisement management is ready to connect."
            );
        } else {
            setShowCreateAd(true);
        }
    };

    const navSections = [
        {
            label: "Dashboard",
            items: [
                { icon: <span>▦</span>, label: "Imbonerahamwe", path: "/admin/dashboard" },
                { icon: <span>⏳</span>, label: "Zitegereje gusuzumwa", badge: statistics.pending, onClick: () => { setSelectedStatus(POST_STATUSES.PENDING); } },
                { icon: <span>✓</span>, label: "Inkuru zasohotse", onClick: () => { setSelectedStatus(POST_STATUSES.APPROVED); } },
                { icon: <span>✕</span>, label: "Zanzwe", onClick: () => { setSelectedStatus(POST_STATUSES.REJECTED); } },
            ],
        },
        {
            label: "Imicungire",
            items: [
                { icon: <span>👤</span>, label: "Abakozi", onClick: openEmployeeManager },
                { icon: <span>🛡️</span>, label: "Abanditsi Bakuru", onClick: openChiefManager },
                { icon: <span>📢</span>, label: "Kwamamaza", onClick: openAdvertisementManager },
                { icon: <span>📥</span>, label: "Kuramo raporo", onClick: () => { exportPosts(); } },
            ],
        },
    ];

    return (
        <DashboardLayout navigationSections={navSections} roleLabel="Imicungire y'ubwanditsi" onLogout={onLogout}>

            {showEditEmployee && (
                <ModalShell onClose={() => setShowEditEmployee(false)} maxWidth="max-w-md">
                    <ModalHeader title="Hindura Umukozi" description="Vugurura amakuru y'umukozi." onClose={() => setShowEditEmployee(false)} />

                    <form onSubmit={(e) => { e.preventDefault(); handleSaveEmployeeEdit(); }} className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                            <input value={editEmpName} onChange={(e) => setEditEmpName(e.target.value)} placeholder="Izina ry'umuntu" className="form-input" />
                            <input value={editEmpEmail} onChange={(e) => setEditEmpEmail(e.target.value)} placeholder="Imeyili" type="email" className="form-input" />
                            <input value={editEmpPhone} onChange={(e) => setEditEmpPhone(e.target.value)} placeholder="Telefone (Byibuze)" className="form-input" />
                            <FormField label="Imimerere">
                                <select value={editEmpStatus} onChange={(e) => setEditEmpStatus(e.target.value)} className="form-input">
                                    <option value="active">Akitirije</option>
                                    <option value="inactive">Itigize</option>
                                </select>
                            </FormField>
                        </div>

                        <ModalFooter onCancel={() => setShowEditEmployee(false)} confirmText="Kubika" confirmClass="bg-emerald-600 hover:bg-emerald-700" confirmType="submit" />
                    </form>
                </ModalShell>
            )}



            {showEditChief && (
                <ModalShell onClose={() => setShowEditChief(false)} maxWidth="max-w-md">
                    <ModalHeader title="Hindura Umwanditsi Mukuru" description="Vugurura amakuru y'umwanditsi mukuru." onClose={() => setShowEditChief(false)} />

                    <form onSubmit={(e) => { e.preventDefault(); handleSaveChiefEdit(); }} className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                            <input value={editChiefName} onChange={(e) => setEditChiefName(e.target.value)} placeholder="Izina ry'umuntu" className="form-input" />
                            <input value={editChiefEmail} onChange={(e) => setEditChiefEmail(e.target.value)} placeholder="Imeyili" type="email" className="form-input" />
                            <input value={editChiefPhone} onChange={(e) => setEditChiefPhone(e.target.value)} placeholder="Telefone (Byibuze)" className="form-input" />
                            <FormField label="Imimerere">
                                <select value={editChiefStatus} onChange={(e) => setEditChiefStatus(e.target.value)} className="form-input">
                                    <option value="active">Akitirije</option>
                                    <option value="inactive">Itigize</option>
                                </select>
                            </FormField>
                        </div>

                        <ModalFooter onCancel={() => setShowEditChief(false)} confirmText="Kubika" confirmClass="bg-indigo-600 hover:bg-indigo-700" confirmType="submit" />
                    </form>
                </ModalShell>
            )}



            {showEditAd && (
                <ModalShell onClose={() => setShowEditAd(false)} maxWidth="max-w-2xl">
                    <ModalHeader title="Hindura Kwamamaza" description="Vugurura amakuru y'kwamamaza." onClose={() => setShowEditAd(false)} />
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveAdEdit(); }} className="flex min-h-0 flex-1 flex-col">
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                            <FormField label="Umutwe">
                                <input value={editAdTitle} onChange={(e) => setEditAdTitle(e.target.value)} className="form-input" />
                            </FormField>

                            <FormField label="Ahandi ko barobanye">
                                <select value={editAdPosition} onChange={(e) => setEditAdPosition(e.target.value)} className="form-input">
                                    <option value="">Hitamo inzira</option>
                                    {editAdPositions.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="URL y'ikintu">
                                <input value={editAdTargetUrl} onChange={(e) => setEditAdTargetUrl(e.target.value)} className="form-input" />
                            </FormField>

                            <FormField label="Ikintu cyokubikira (Byibuze)">
                                <input value={editAdLink} onChange={(e) => setEditAdLink(e.target.value)} className="form-input" />
                            </FormField>

                            <FormField label="Ibisobanuro">
                                <textarea value={editAdDescription} onChange={(e) => setEditAdDescription(e.target.value)} rows={4} className="form-input resize-none" />
                            </FormField>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Itariki y'inzira">
                                    <input type="date" value={editAdStartDate} onChange={(e) => setEditAdStartDate(e.target.value)} className="form-input" />
                                </FormField>

                                <FormField label="Itariki y'impera">
                                    <input type="date" value={editAdEndDate} onChange={(e) => setEditAdEndDate(e.target.value)} className="form-input" />
                                </FormField>
                            </div>

                            <FormField label="Ifoto (Byibuze)">
                                <input type="file" accept="image/*" onChange={(e) => setEditAdImage(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700" />
                            </FormField>

                            <FormField label="Imimerere">
                                <select value={editAdStatus} onChange={(e) => setEditAdStatus(e.target.value)} className="form-input">
                                    <option value="active">Akitirije</option>
                                    <option value="inactive">Itigize</option>
                                </select>
                            </FormField>
                        </div>

                        <ModalFooter onCancel={() => setShowEditAd(false)} confirmText="Kubika" confirmClass="bg-indigo-600 hover:bg-indigo-700" confirmType="submit" />
                    </form>
                </ModalShell>
            )}







            <div className="min-w-0">


                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
                    <div className="mx-auto flex min-h-16 max-w-[1700px] flex-wrap items-center gap-2 px-3 py-2 sm:flex-nowrap sm:gap-3 sm:px-6 lg:px-8">




                        <div className="min-w-0 flex-1">
                            <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                                Ubwanditsi / Imbonerahamwe
                            </p>

                            <h2 className="truncate text-sm font-bold text-slate-900 sm:text-lg">
                                Imbonerahamwe y'ubwanditsi
                            </h2>
                        </div>


                        <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:shrink-0 sm:flex-nowrap sm:gap-3">
                            <button
                                onClick={() => loadPosts()}
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 sm:px-3"
                                title="Ongera ushyireho"
                            >
                                ↻
                                <span className="ml-1 hidden sm:inline">
                                    Ongera ushyireho
                                </span>
                            </button>

                            <button
                                onClick={() => setShowChangePassword(true)}
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 sm:px-3"
                            >
                                Hindura ijambobanga
                            </button>

                            <button
                                onClick={() => setShowChangeEmail(true)}
                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 sm:px-3"
                            >
                                Hindura imeyili
                            </button>

                            <button
                                className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm sm:p-2.5"
                                title="Imenyesha"
                            >
                                🔔

                                {statistics.pending > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                                        {statistics.pending > 9
                                            ? "9+"
                                            : statistics.pending}
                                    </span>
                                )}
                            </button>

                            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                                    A
                                </div>

                                <div className="hidden xl:block">
                                    <p className="text-xs font-bold text-slate-800">
                                        Administrator
                                    </p>

                                    <p className="text-[10px] text-slate-400">
                                        Super Admin
                                    </p>
                                </div>
                            </div>


                            <div className="items-center gap-2 flex">
                                <button
                                    onClick={() => setShowCreatePost(true)}
                                    className="rounded-xl bg-blue-600 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white transition hover:bg-blue-700 lg:px-4"
                                >
                                    + Inkuru nshya
                                </button>

                                <button
                                    onClick={() => setShowCreateAd(true)}
                                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 transition hover:bg-slate-50 lg:px-4"
                                >
                                    + Kwamamaza
                                </button>
                            </div>
                        </div>
                    </div>
                </header>



                <main className="mx-auto w-full max-w-[1700px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">


                    <section className="mb-5 sm:mb-6">
                        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-xl sm:p-7">
                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <p className="mb-1 text-sm font-medium text-blue-300">
                                        Murakaza neza, Imicungire
                                    </p>

                                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                                        Editorial Control Center
                                    </h1>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                        Review stories, manage your newsroom,
                                        monitor publication activity and keep
                                        Rubavu Today up to date.
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowCreateEmployee(true)
                                    }
                                    className="w-full shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-blue-50 sm:w-auto"
                                >
                                    + Ongeraho Umukozi
                                </button>
                            </div>
                        </div>


                    </section>



                    <section className="mb-5 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-3 lg:grid-cols-5">
                        <StatCard
                            label="Inkuru zose"
                            value={statistics.total}
                            icon="📰"
                            color="blue"
                        />

                        <StatCard
                            label="Zitegereje gusuzumwa"
                            value={statistics.pending}
                            icon="⏳"
                            color="amber"
                        />

                        <StatCard
                            label="Zemejwe"
                            value={statistics.approved}
                            icon="✓"
                            color="emerald"
                        />

                        <StatCard
                            label="Zanzwe"
                            value={statistics.rejected}
                            icon="✕"
                            color="red"
                        />

                        <StatCard
                            label="Ibigambi"
                            value={statistics.comments}
                            icon="💬"
                            color="purple"
                        />
                    </section>



                    {/* ---- ALL COMMENTS (every reader comment on every post) ---- */}
                    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

                            <div>

                                <h2 className="text-lg font-black text-slate-900">
                                    Ibitekerezo byose
                                </h2>

                                <p className="mt-1 text-xs text-slate-400">
                                    Reba ibisobanuro by'abasomyi ku nkuru zose.
                                </p>

                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                                {allComments.length}
                            </span>

                        </div>

                        {commentsError && (
                            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                                {commentsError}
                            </p>
                        )}

                        {loadingComments ? (
                            <p className="py-6 text-center text-sm text-slate-500">
                                Birimo gutwara ibitekerezo...
                            </p>
                        ) : allComments.length === 0 ? (
                            <p className="py-6 text-center text-sm text-slate-500">
                                Nta bitekerezo bihari.
                            </p>
                        ) : (
                            <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">

                                {allComments.map((comment) => {

                                    const commentId = comment.id ?? comment.comment_id ?? comment._id;

                                    return (

                                        <div
                                            key={commentId}
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                        >

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <span className="text-sm font-black text-slate-900">
                                                            {comment.name || comment.user_name || comment.author || "Anonymous"}
                                                        </span>

                                                        {comment.post_title && (
                                                            <span className="truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-700">
                                                                {comment.post_title}
                                                            </span>
                                                        )}

                                                    </div>

                                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                        {comment.comment || comment.content || comment.text || ""}
                                                    </p>

                                                    {comment.created_at && (
                                                        <p className="mt-2 text-[11px] text-slate-400">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </p>
                                                    )}

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteAllComment(commentId)}
                                                    className="flex-shrink-0 rounded-lg bg-red-50 px-2 py-1 text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white"
                                                >
                                                    Gusiba
                                                </button>

                                            </div>

                                        </div>

                                    );
                                })}

                            </div>
                        )}

                    </section>


                    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">


                        <section className="min-w-0">

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="flex flex-col gap-4">

                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-black text-slate-900">
                                                    Inkuru
                                                </h2>

                                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                    {filteredPosts.length}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Suzuma kandi uyigenzure inkuru zatewe mu ubwanditsi.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={exportPosts}
                                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >
                                                📥 Kuramo
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setShowFilters(
                                                        (value) => !value
                                                    )
                                                }
                                                className={`
                                                    rounded-xl px-3 py-2
                                                    text-sm font-semibold
                                                    transition
                                                    ${showFilters
                                                        ? "bg-slate-900 text-white"
                                                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                    }
                                                `}
                                            >
                                                ⚙ Izuza
                                            </button>

                                            <div className="hidden overflow-hidden rounded-xl border border-slate-200 sm:flex">
                                                <button
                                                    onClick={() =>
                                                        setViewMode("grid")
                                                    }
                                                    className={`px-3 py-2 text-sm ${viewMode === "grid"
                                                        ? "bg-slate-900 text-white"
                                                        : "text-slate-500 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    ▦
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setViewMode("list")
                                                    }
                                                    className={`px-3 py-2 text-sm ${viewMode === "list"
                                                        ? "bg-slate-900 text-white"
                                                        : "text-slate-500 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    ☰
                                                </button>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="flex min-w-0 flex-col gap-3 md:flex-row">
                                        <div className="relative min-w-0 flex-1">
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                🔎
                                            </span>

                                            <input
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Shakisha inkuru..."
                                                className="w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                            />
                                        </div>

                                        <select
                                            value={sortBy}
                                            onChange={(e) =>
                                                setSortBy(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 md:w-auto"
                                        >
                                            <option value="newest">
                                                Inyanya zikipiranya
                                            </option>

                                            <option value="oldest">
                                                Inyanya zizirizaga
                                            </option>

                                            <option value="title">
                                                Umutwe A-Z
                                            </option>
                                        </select>
                                    </div>


                                    {showFilters && (
                                        <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                                            <div className="min-w-0">
                                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    Ibyiciro
                                                </label>

                                                <select
                                                    value={
                                                        selectedDepartment
                                                    }
                                                    onChange={(e) =>
                                                        setSelectedDepartment(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                                >
                                                    <option value="All">
                                                        Ibyiciro byose
                                                    </option>

                                                    {DEPARTMENTS.map(
                                                        (department) => (
                                                            <option
                                                                key={
                                                                    department.name
                                                                }
                                                                value={
                                                                    department.name
                                                                }
                                                            >
                                                                {
                                                                    department.icon
                                                                }{" "}
                                                                {
                                                                    department.name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>

                                            <div className="min-w-0">
                                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                                    Imimerere
                                                </label>

                                                <select
                                                    value={selectedStatus}
                                                    onChange={(e) =>
                                                        setSelectedStatus(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                                >
                                                    <option value="all">
                                                        Imimerere yose
                                                    </option>

                                                    <option value="pending">
                                                        Zitegereje gusuzumwa
                                                    </option>

                                                    <option value="approved">
                                                        Zemejwe
                                                    </option>

                                                    <option value="rejected">
                                                        Zanzwe
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    )}


                                    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                                        <StatusTab
                                            active={
                                                selectedStatus ===
                                                POST_STATUSES.PENDING
                                            }
                                            onClick={() =>
                                                setSelectedStatus(
                                                    POST_STATUSES.PENDING
                                                )
                                            }
                                            label="Zitegereje gusuzumwa"
                                            count={statistics.pending}
                                            color="amber"
                                        />

                                        <StatusTab
                                            active={
                                                selectedStatus ===
                                                POST_STATUSES.APPROVED
                                            }
                                            onClick={() =>
                                                setSelectedStatus(
                                                    POST_STATUSES.APPROVED
                                                )
                                            }
                                            label="Zemejwe"
                                            count={statistics.approved}
                                            color="emerald"
                                        />

                                        <StatusTab
                                            active={
                                                selectedStatus ===
                                                POST_STATUSES.REJECTED
                                            }
                                            onClick={() =>
                                                setSelectedStatus(
                                                    POST_STATUSES.REJECTED
                                                )
                                            }
                                            label="Zanzwe"
                                            count={statistics.rejected}
                                            color="red"
                                        />

                                        <StatusTab
                                            active={
                                                selectedStatus ===
                                                POST_STATUSES.ALL
                                            }
                                            onClick={() =>
                                                setSelectedStatus(
                                                    POST_STATUSES.ALL
                                                )
                                            }
                                            label="Zose"
                                            count={statistics.total}
                                            color="slate"
                                        />
                                    </div>


                                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    paginatedPosts.length > 0 &&
                                                    paginatedPosts.every(
                                                        (post) =>
                                                            selectedPosts.includes(
                                                                post.id
                                                            )
                                                    )
                                                }
                                                onChange={selectAllVisible}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />

                                            <span>Toranya byose byatemuye</span>
                                        </label>

                                        {selectedPosts.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {selectedPosts.length}{" "}
                                                    zatoranyijwe
                                                </span>

                                                <button
                                                    onClick={
                                                        handleBulkApprove
                                                    }
                                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                                                >
                                                    ✓ Emeza
                                                </button>

                                                <button
                                                    onClick={
                                                        handleBulkReject
                                                    }
                                                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700"
                                                >
                                                    ✕ Anga
                                                </button>

                                                <button
                                                    onClick={clearSelection}
                                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
                                                >
                                                    Siba
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {errorMessage && (
                                <div className="mt-4 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
                                    <span>⚠ {errorMessage}</span>

                                    <button
                                        onClick={() => loadPosts()}
                                        className="self-start font-bold underline sm:self-auto"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}


                            <div
                                className={`
                                    mt-5 min-w-0
                                    ${viewMode === "grid"
                                        ? "grid gap-4 sm:grid-cols-2"
                                        : "space-y-3"
                                    }
                                `}
                            >
                                {loading ? (
                                    Array.from({ length: 4 }).map(
                                        (_, index) => (
                                            <PostSkeleton
                                                key={index}
                                                viewMode={viewMode}
                                            />
                                        )
                                    )
                                ) : paginatedPosts.length === 0 ? (
                                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center sm:px-6 sm:py-16">
                                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                                            📰
                                        </div>

                                        <h3 className="font-bold text-slate-800">
                                            Nta nkuru zabonetse
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Gerageza guhindura isango cyangwa usohore inkuru nshya.
                                        </p>

                                        <button
                                            onClick={() => {
                                                setSearch("");
                                                setSelectedDepartment("All");
                                                setSelectedStatus(
                                                    POST_STATUSES.ALL
                                                );
                                            }}
                                            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                                        >
                                            Gushyira isango mu ntangiriro
                                        </button>
                                    </div>
                                ) : (
                                    paginatedPosts.map((post) => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            selected={selectedPosts.includes(
                                                post.id
                                            )}
                                            viewMode={viewMode}
                                            imageUrl={getImageUrl(
                                                post.image
                                            )}
                                            statusBadge={
                                                <StatusBadge post={post} />
                                            }
                                            onSelect={() =>
                                                togglePostSelection(post.id)
                                            }
                                            onApprove={() =>
                                                handleApprove(post)
                                            }
                                            onReject={() =>
                                                handleReject(post)
                                            }
                                            onPending={() =>
                                                handlePending(post)
                                            }
                                            onEdit={() => openEdit(post)}
                                            onDelete={() =>
                                                handleDelete(post)
                                            }
                                        />
                                    ))
                                )}
                            </div>


                            {filteredPosts.length > 0 && (
                                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-500">
                                        Kwerekana{" "}
                                        <strong>
                                            {(currentPage - 1) *
                                                PAGE_SIZE +
                                                1}
                                        </strong>{" "}
                                        -{" "}
                                        <strong>
                                            {Math.min(
                                                currentPage * PAGE_SIZE,
                                                filteredPosts.length
                                            )}
                                        </strong>{" "}
                                        muri{" "}
                                        <strong>
                                            {filteredPosts.length}
                                        </strong>
                                    </p>

                                    <div className="flex w-full items-center gap-2 sm:w-auto">
                                        <button
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                setCurrentPage((page) =>
                                                    Math.max(1, page - 1)
                                                )
                                            }
                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:text-sm"
                                        >
                                            ← Ibanza
                                        </button>

                                        <span className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white sm:text-sm">
                                            {currentPage} / {totalPages}
                                        </span>

                                        <button
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                setCurrentPage((page) =>
                                                    Math.min(
                                                        totalPages,
                                                        page + 1
                                                    )
                                                )
                                            }
                                            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:text-sm"
                                        >
                                            Ikurikira →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>



                        <aside className="min-w-0 space-y-5">

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4">
                                    <h3 className="font-black text-slate-900">
                                        Quick Actions
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Common newsroom tasks
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <QuickAction
                                        icon="👤"
                                        label="Create Employee"
                                        onClick={() =>
                                            onCreateEmployee
                                                ? quickAction(
                                                    onCreateEmployee,
                                                    "Employee creation is ready to connect."
                                                )
                                                : setShowCreateEmployee(
                                                    true
                                                )
                                        }
                                    />

                                    <QuickAction
                                        icon="🛡️"
                                        label="Create Chief Editor"
                                        onClick={() =>
                                            onCreateChiefEditor
                                                ? quickAction(
                                                    onCreateChiefEditor,
                                                    "Chief Editor management is ready to connect."
                                                )
                                                : setShowCreateChief(
                                                    true
                                                )
                                        }
                                    />

                                    <QuickAction
                                        icon="📢"
                                        label="Post Advertisement"
                                        onClick={() =>
                                            onPostAdvertisement
                                                ? quickAction(
                                                    onPostAdvertisement,
                                                    "Advertisement management is ready to connect."
                                                )
                                                : setShowCreateAd(true)
                                        }
                                    />

                                    <QuickAction
                                        icon="📥"
                                        label="Export Report"
                                        onClick={exportPosts}
                                    />
                                </div>
                            </div>


                            <AccountsPanel
                                employees={employees}
                                chiefEditors={chiefEditors}
                                advertisements={advertisements}
                                onEditEmployee={openEditEmployee}
                                onDeleteEmployee={handleDeleteEmployee}
                                onEditChief={openEditChief}
                                onDeleteChief={handleDeleteChief}
                                onEditAd={openEditAd}
                                onDeleteAd={handleDeleteAd}
                                onSendAd={handleSendAd}
                            />


                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="font-black text-slate-900">
                                            Activity
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Latest dashboard event
                                        </p>
                                    </div>

                                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                                </div>

                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="break-words text-sm font-medium text-slate-700">
                                        {statusMessage ||
                                            "Dashboard is up to date."}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Auto-refresh enabled
                                    </p>
                                </div>
                            </div>


                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                                <div className="mb-4">
                                    <h3 className="font-black text-slate-900">
                                        Departments
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Story distribution
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {DEPARTMENTS.map((department) => {
                                        const count = posts.filter(
                                            (post) =>
                                                post.category ===
                                                department.name
                                        ).length;

                                        const percentage =
                                            statistics.total > 0
                                                ? Math.round(
                                                    (count /
                                                        statistics.total) *
                                                    100
                                                )
                                                : 0;

                                        return (
                                            <button
                                                key={department.name}
                                                onClick={() =>
                                                    setSelectedDepartment(
                                                        department.name
                                                    )
                                                }
                                                className="w-full min-w-0 text-left"
                                            >
                                                <div className="mb-1 flex min-w-0 items-center justify-between gap-3">
                                                    <span className="min-w-0 truncate text-xs font-semibold text-slate-600">
                                                        {department.icon}{" "}
                                                        {department.name}
                                                    </span>

                                                    <span className="shrink-0 text-xs font-bold text-slate-400">
                                                        {count}
                                                    </span>
                                                </div>

                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                                    <div
                                                        className="h-full rounded-full bg-blue-600 transition-all"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>


                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg">
                                <div className="text-xl">💡</div>

                                <h3 className="mt-3 font-black">
                                    Editorial Reminder
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-blue-100">
                                    Verify sources, headlines, images and
                                    publication details before approving a
                                    story.
                                </p>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>



            {showCreatePost && (
                <ModalShell
                    onClose={() => setShowCreatePost(false)}
                    maxWidth="max-w-2xl"
                >
                    <ModalHeader
                        title="Kora Inkuru"
                        description="Onjera inkuru nshya mu miryango."
                        onClose={() => setShowCreatePost(false)}
                    />

                    <ArticleEditor
                        key={postEditorKey}
                        initial={null}
                        categories={DEPARTMENTS}
                        submitLabel="Create Post"
                        saving={createPostSaving}
                        onSubmit={handleCreatePost}
                        onCancel={() => setShowCreatePost(false)}
                    />
                </ModalShell>
            )}



            {showCreateAd && (
                <ModalShell
                    onClose={() => setShowCreateAd(false)}
                    maxWidth="max-w-full sm:max-w-2xl"
                >
                    <ModalHeader
                        title="Create Advertisement"
                        description="Add a new advertisement to the site."
                        onClose={() => setShowCreateAd(false)}
                    />
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleCreateAd(); }}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
                            <FormField label="Title">
                                <input
                                    value={adTitle}
                                    onChange={(e) =>
                                        setAdTitle(e.target.value)
                                    }
                                    className="form-input"
                                    placeholder="Advertisement title"
                                />
                            </FormField>

                            <FormField label="Position">
                                <select
                                    value={adPosition}
                                    onChange={(e) =>
                                        setAdPosition(e.target.value)
                                    }
                                    className="form-input"
                                >
                                    <option value="">
                                        Select position
                                    </option>

                                    {adPositions.map((position) => (
                                        <option key={position} value={position}>
                                            {position}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Target URL">
                                <input
                                    value={adTargetUrl}
                                    onChange={(e) =>
                                        setAdTargetUrl(e.target.value)
                                    }
                                    placeholder="https://example.com"
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Fallback Link (optional)">
                                <input
                                    value={adLink}
                                    onChange={(e) =>
                                        setAdLink(e.target.value)
                                    }
                                    placeholder="Optional internal link or campaign id"
                                    className="form-input"
                                />
                            </FormField>

                            <FormField label="Description (optional)">
                                <textarea
                                    value={adDescription}
                                    onChange={(e) =>
                                        setAdDescription(e.target.value)
                                    }
                                    rows={4}
                                    className="form-input resize-none"
                                    placeholder="Advertisement description"
                                />
                            </FormField>


                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Start Date">
                                    <input
                                        type="date"
                                        value={adStartDate}
                                        onChange={(e) =>
                                            setAdStartDate(e.target.value)
                                        }
                                        className="form-input"
                                    />
                                </FormField>

                                <FormField label="End Date">
                                    <input
                                        type="date"
                                        value={adEndDate}
                                        onChange={(e) =>
                                            setAdEndDate(e.target.value)
                                        }
                                        className="form-input"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Image (optional)">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setAdImage(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-indigo-700"
                                />
                            </FormField>

                            {(adImage || adTitle || adDescription) && (
                                <AdPreview
                                    image={adImage}
                                    title={adTitle}
                                    description={adDescription}
                                    targetUrl={adTargetUrl}
                                />
                            )}

                            <FormField label="Status">
                                <select
                                    value={adStatus}
                                    onChange={(e) =>
                                        setAdStatus(e.target.value)
                                    }
                                    className="form-input"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>
                            </FormField>
                        </div>

                        <ModalFooter
                            onCancel={() => setShowCreateAd(false)}
                            confirmText="Save Ad"
                            confirmClass="bg-indigo-600 hover:bg-indigo-700"
                            confirmType="submit"
                        />
                    </form>
                </ModalShell>
            )}



            {showCreateEmployee && (
                <ModalShell
                    onClose={() => setShowCreateEmployee(false)}
                    maxWidth="max-w-md"
                >
                    <ModalHeader
                        title="Create Employee"
                        description="Create a reporter account."
                        onClose={() =>
                            setShowCreateEmployee(false)
                        }
                    />

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleCreateEmployee(); }}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                            <input
                                value={empName}
                                onChange={(e) =>
                                    setEmpName(e.target.value)
                                }
                                placeholder="Full name"
                                className="form-input"
                            />

                            <input
                                value={empEmail}
                                onChange={(e) =>
                                    setEmpEmail(e.target.value)
                                }
                                placeholder="Email"
                                type="email"
                                className="form-input"
                            />

                            <input
                                value={empPhone}
                                onChange={(e) =>
                                    setEmpPhone(e.target.value)
                                }
                                placeholder="Phone (optional)"
                                className="form-input"
                            />

                            <input
                                value={empPassword}
                                onChange={(e) =>
                                    setEmpPassword(e.target.value)
                                }
                                placeholder="Password"
                                type="password"
                                className="form-input"
                            />
                        </div>
                        <ModalFooter
                            onCancel={() =>
                                setShowCreateEmployee(false)
                            }
                            confirmText="Create"
                            confirmClass="bg-emerald-600 hover:bg-emerald-700"
                            confirmType="submit"
                        />
                    </form>
                </ModalShell>
            )}



            {showCreateChief && (
                <ModalShell
                    onClose={() => setShowCreateChief(false)}
                    maxWidth="max-w-md"
                >
                    <ModalHeader
                        title="Create Chief Editor"
                        description="Create a chief editor account."
                        onClose={() => setShowCreateChief(false)}
                    />

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleCreateChief(); }}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
                            <input
                                value={chiefName}
                                onChange={(e) =>
                                    setChiefName(e.target.value)
                                }
                                placeholder="Full name"
                                className="form-input"
                            />

                            <input
                                value={chiefEmail}
                                onChange={(e) =>
                                    setChiefEmail(e.target.value)
                                }
                                placeholder="Email"
                                type="email"
                                className="form-input"
                            />

                            <input
                                value={chiefPhone}
                                onChange={(e) =>
                                    setChiefPhone(e.target.value)
                                }
                                placeholder="Phone (optional)"
                                className="form-input"
                            />

                            <input
                                value={chiefPassword}
                                onChange={(e) =>
                                    setChiefPassword(e.target.value)
                                }
                                placeholder="Password"
                                type="password"
                                className="form-input"
                            />
                        </div>

                        <ModalFooter
                            onCancel={() => setShowCreateChief(false)}
                            confirmText="Create"
                            confirmClass="bg-indigo-600 hover:bg-indigo-700"
                            confirmType="submit"
                        />
                    </form>
                </ModalShell>
            )}



            {editingPostId && editInitial && (
                <ArticleEditor
                    initial={editInitial}
                    categories={DEPARTMENTS}
                    submitLabel="Vugurura inkuru"
                    saving={editSaving}
                    onSubmit={handleSubmitEdit}
                    onCancel={closeEdit}
                />
            )}

            {showChangePassword && (
                <ModalShell
                    onClose={() => setShowChangePassword(false)}
                    maxWidth="max-w-md"
                >
                    <ModalHeader
                        title="Change password"
                        description="Confirm your current password before choosing a new one."
                        onClose={() => setShowChangePassword(false)}
                    />

                    <form onSubmit={handleChangePassword} className="space-y-5 p-4 sm:p-6">
                        <FormField label="Current password">
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                className="form-input"
                                autoComplete="current-password"
                                required
                            />
                        </FormField>

                        <FormField label="New password">
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                className="form-input"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </FormField>

                        <FormField label="Confirm new password">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="form-input"
                                autoComplete="new-password"
                                minLength={6}
                                required
                            />
                        </FormField>

                        <ModalFooter
                            onCancel={() => setShowChangePassword(false)}
                            confirmText="Change password"
                            confirmType="submit"
                        />
                    </form>
                </ModalShell>
            )}

            {showChangeEmail && (
                <ModalShell
                    onClose={() => setShowChangeEmail(false)}
                    maxWidth="max-w-md"
                >
                    <ModalHeader
                        title="Change email"
                        description="Confirm your current password before changing the admin email."
                        onClose={() => setShowChangeEmail(false)}
                    />

                    <form onSubmit={handleChangeEmail} className="space-y-5 p-4 sm:p-6">
                        <FormField label="New email address">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(event) => setNewEmail(event.target.value)}
                                className="form-input"
                                autoComplete="email"
                                required
                            />
                        </FormField>

                        <FormField label="Current password">
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                className="form-input"
                                autoComplete="current-password"
                                required
                            />
                        </FormField>

                        <ModalFooter
                            onCancel={() => setShowChangeEmail(false)}
                            confirmText="Change email"
                            confirmType="submit"
                        />
                    </form>
                </ModalShell>
            )}
        </DashboardLayout>
    );
};





const AccountsPanel = ({
    employees,
    chiefEditors,
    advertisements,
    onEditEmployee,
    onDeleteEmployee,
    onEditChief,
    onDeleteChief,
    onEditAd,
    onDeleteAd,
    onSendAd,
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
                <h3 className="font-black text-slate-900">
                    Recent Accounts & Ads
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                    Latest newsroom management records
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">

                <AccountSection
                    title="Employees"
                    count={employees.length}
                    items={employees}
                    emptyText="No employees yet"
                    onEdit={onEditEmployee}
                    onDelete={onDeleteEmployee}
                    renderItem={(item) => (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-700">{item.full_name || item.name || item.email}</p>
                            <p className="truncate text-xs text-slate-400">{item.email}</p>
                        </div>
                    )}
                />


                <AccountSection
                    title="Chief Editors"
                    count={chiefEditors.length}
                    items={chiefEditors}
                    emptyText="No chief editors yet"
                    onEdit={onEditChief}
                    onDelete={onDeleteChief}
                    renderItem={(item) => (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-700">{item.full_name || item.name || item.email}</p>
                            <p className="truncate text-xs text-slate-400">{item.email}</p>
                        </div>
                    )}
                />


                <AccountSection
                    title="Advertisements"
                    count={advertisements.length}
                    items={advertisements}
                    emptyText="No advertisements yet"
                    onEdit={onEditAd}
                    onDelete={onDeleteAd}
                    onSend={onSendAd}
                    renderItem={(item) => (
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                                {item.image ? (
                                    <img src={item.image} alt={item.title || 'ad'} className="h-12 w-12 flex-none rounded-md object-cover sm:h-14 sm:w-14 md:h-20 md:w-20" />
                                ) : (
                                    <div className="h-12 w-12 flex-none rounded-md bg-slate-200 text-xs text-slate-500 flex items-center justify-center sm:h-14 sm:w-14 md:h-20 md:w-20">No
                                        image</div>
                                )}

                                <div className="min-w-0">
                                    <p className="truncate text-sm sm:text-base md:text-lg font-semibold text-slate-700">{item.title || item.name || 'Untitled'}</p>
                                    <p className="mt-0.5 truncate text-xs sm:text-sm text-slate-400">{item.description || item.summary || ''}</p>

                                    {item.link || item.target_url ? (
                                        <a href={item.link || item.target_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] font-medium text-indigo-600 hover:underline">Open link</a>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

const AccountSection = ({
    title,
    count,
    items,
    emptyText,
    renderItem,
    onEdit,
    onDelete,
    onSend,
}) => {
    return (
        <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-600">{title}</span>

                <span className="shrink-0 text-xs text-slate-400">{count}</span>
            </div>

            <div className="max-h-56 md:max-h-96 overflow-y-auto pr-1">
                <ul className="space-y-2">
                    {items.length === 0 ? (
                        <li className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-400">{emptyText}</li>
                    ) : (
                        items.map((item) => (
                            <li key={item.id} className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 sm:px-4 sm:py-3">
                                {renderItem(item)}

                                {(onEdit || onDelete || onSend) && (
                                    <div className="ml-3 flex items-center gap-2">
                                        {onSend && <button onClick={() => onSend(item)} className="text-sm sm:text-xs text-emerald-600 hover:underline">Send</button>}
                                        {onEdit && <button onClick={() => onEdit(item)} className="text-sm sm:text-xs text-blue-600 hover:underline">Edit</button>}
                                        {onDelete && <button onClick={() => onDelete(item.id)} className="text-sm sm:text-xs text-red-600 hover:underline">Delete</button>}
                                    </div>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};





const StatusBadge = ({ post }) => {
    const status = String(
        post?.status ||
        post?.approval_status ||
        post?.publication_status ||
        "pending"
    ).toLowerCase();

    if (status === "approved") {
        return (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm sm:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Approved
            </span>
        );
    }

    if (status === "rejected") {
        return (
            <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 shadow-sm sm:text-xs">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                Rejected
            </span>
        );
    }

    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 shadow-sm sm:text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
            Pending
        </span>
    );
};





const StatCard = ({ label, value, icon, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
            <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10 sm:text-lg ${colors[color]}`}
            >
                {icon}
            </div>

            <p className="mt-3 truncate text-[10px] font-semibold text-slate-400 sm:mt-4 sm:text-xs">
                {label}
            </p>

            <p className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                {Number(value || 0).toLocaleString()}
            </p>
        </div>
    );
};





const StatusTab = ({
    active,
    onClick,
    label,
    count,
    color,
}) => {
    const activeColors = {
        amber: "bg-amber-500 text-white",
        emerald: "bg-emerald-600 text-white",
        red: "bg-red-600 text-white",
        slate: "bg-slate-900 text-white",
    };

    return (
        <button
            onClick={onClick}
            className={`
                flex shrink-0 items-center gap-2 rounded-xl
                px-3 py-2 text-xs font-bold transition
                ${active
                    ? activeColors[color]
                    : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                }
            `}
        >
            {label}

            <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20" : "bg-slate-100"
                    }`}
            >
                {count}
            </span>
        </button>
    );
};





const QuickAction = ({ icon, label, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700 sm:px-4"
        >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                {icon}
            </span>

            <span className="min-w-0 flex-1 truncate">
                {label}
            </span>

            <span className="shrink-0 text-slate-300">→</span>
        </button>
    );
};





const PostCard = ({
    post,
    selected,
    viewMode,
    imageUrl,
    statusBadge,
    onSelect,
    onApprove,
    onReject,
    onPending,
    onEdit,
    onDelete,
}) => {
    const status = String(
        post?.status ||
        post?.approval_status ||
        post?.publication_status ||
        "pending"
    ).toLowerCase();

    const isList = viewMode === "list";

    return (
        <article
            className={`
                group min-w-0 overflow-hidden rounded-2xl
                border bg-white shadow-sm transition
                hover:-translate-y-0.5 hover:shadow-lg
                ${selected
                    ? "border-blue-500 ring-2 ring-blue-500/10"
                    : "border-slate-200"
                }
                ${isList ? "sm:flex" : ""}
            `}
        >

            <div
                className={`
                    relative shrink-0 overflow-hidden bg-slate-100
                    ${isList
                        ? "h-48 w-full sm:h-auto sm:w-52 lg:w-60"
                        : "h-48 sm:h-52"
                    }
                `}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={post.title || "Story"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                        📰
                    </div>
                )}


                <div className="absolute left-3 top-3">
                    <label
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 shadow-lg backdrop-blur"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={onSelect}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                    </label>
                </div>


                <div className="absolute right-3 top-3 max-w-[45%]">
                    {statusBadge}
                </div>
            </div>


            <div className="flex min-w-0 flex-1 flex-col p-4">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="max-w-full truncate rounded-md bg-blue-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700 sm:text-[10px]">
                        {post.category || "Amakuru"}
                    </span>

                    {post.priority && (
                        <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[9px] font-bold uppercase text-red-600 sm:text-[10px]">
                            Priority
                        </span>
                    )}
                </div>

                <h3 className="mt-3 line-clamp-2 break-words text-base font-black leading-6 text-slate-900">
                    {post.title || "Untitled Story"}
                </h3>

                <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-500">
                    {post.description || "No description available."}
                </p>

                <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
                    <span className="shrink-0">
                        📅{" "}
                        {post.createdDate
                            ? new Date(
                                post.createdDate
                            ).toLocaleDateString()
                            : "No date"}
                    </span>

                    <span className="shrink-0">
                        💬 {post.comments?.length || 0}
                    </span>

                    {post.author && (
                        <span className="min-w-0 max-w-full truncate">
                            ✍{" "}
                            {post.author.name ||
                                post.author}
                        </span>
                    )}
                </div>


                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {status !== "approved" && (
                        <ActionButton
                            onClick={onApprove}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            ✓ Approve
                        </ActionButton>
                    )}

                    {status !== "rejected" && (
                        <ActionButton
                            onClick={onReject}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            ✕ Reject
                        </ActionButton>
                    )}

                    {status !== "pending" && (
                        <ActionButton
                            onClick={onPending}
                            className="bg-amber-500 text-white hover:bg-amber-600"
                        >
                            ↻ Pending
                        </ActionButton>
                    )}

                    <ActionButton
                        onClick={onEdit}
                        className="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    >
                        ✎ Edit
                    </ActionButton>

                    <ActionButton
                        onClick={onDelete}
                        className="border border-red-100 bg-red-50 text-red-600 hover:bg-red-100"
                    >
                        🗑 Delete
                    </ActionButton>
                </div>
            </div>
        </article>
    );
};

const ActionButton = ({ children, onClick, className }) => {
    return (
        <button
            onClick={onClick}
            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${className}`}
        >
            {children}
        </button>
    );
};





const PostSkeleton = ({ viewMode }) => {
    return (
        <div
            className={`
                overflow-hidden rounded-2xl
                border border-slate-200 bg-white
                ${viewMode === "list" ? "sm:flex" : ""}
            `}
        >
            <div
                className={`
                    animate-pulse bg-slate-200
                    ${viewMode === "list"
                        ? "h-48 w-full sm:h-auto sm:w-52"
                        : "h-48 sm:h-52"
                    }
                `}
            />

            <div className="min-w-0 flex-1 space-y-3 p-4">
                <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />

                <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />

                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

                <div className="flex flex-wrap gap-2 pt-3">
                    <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
                </div>
            </div>
        </div>
    );
};





const ModalShell = ({
    children,
    onClose,
    maxWidth = "max-w-md",
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div
                className={`
                    relative z-10 flex max-h-[calc(100dvh-1rem)]
                    w-full ${maxWidth}
                    flex-col overflow-hidden
                    rounded-2xl bg-white shadow-2xl
                    sm:max-h-[85vh]
                `}
            >
                {children}
            </div>
        </div>
    );
};





const ModalHeader = ({
    title,
    description,
    onClose,
}) => {
    return (
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
            <div className="min-w-0">
                <h3 className="truncate text-lg font-black text-slate-900">
                    {title}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                    {description}
                </p>
            </div>

            <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    );
};








const ModalFooter = ({
    onCancel,
    onConfirm,
    confirmText,
    confirmClass = "bg-blue-600 hover:bg-blue-700",
    confirmType = "button",
}) => {
    return (
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end sm:p-5">
            <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 sm:w-auto"
            >
                Cancel
            </button>

            <button
                type={confirmType}
                onClick={confirmType === "submit" ? undefined : onConfirm}
                className={`w-full rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition sm:w-auto ${confirmClass}`}
            >
                {confirmText}
            </button>
        </div>
    );
};





const FormField = ({ label, children }) => {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-sm font-bold text-slate-700">
                {label}
            </label>

            {children}
        </div>
    );
};





const AdPreview = ({
    image,
    title,
    description,
    targetUrl,
}) => {
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        if (!image) {
            setPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(image);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [image]);

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <p className="mb-3 text-xs font-bold text-slate-700">
                Ad Preview
            </p>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Advertisement preview"
                        className="h-20 w-full shrink-0 rounded-lg object-cover sm:w-20"
                    />
                ) : (
                    <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500 sm:w-20">
                        No image
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-bold text-slate-900">
                        {title || "Title"}
                    </div>

                    <div className="mt-1 break-words text-xs leading-5 text-slate-600">
                        {description || "Description"}
                    </div>

                    {targetUrl && (
                        <div className="mt-1 break-all text-xs text-indigo-600">
                            {targetUrl}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
