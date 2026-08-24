import { getStoredUser, getToken } from "../services/api";

export const getUserRole = (user = getStoredUser()) =>
    String(user?.role_type || user?.role || user?.position || "")
        .toLowerCase()
        .replace(/\s+/g, "_");

export const hasRole = (roles, user = getStoredUser()) => {
    const role = getUserRole(user);
    return roles.some((allowedRole) => role === allowedRole);
};

export const isAuthenticated = () => Boolean(getToken());