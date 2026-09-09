import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getUnreadNotificationsCount } from "../services/api";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const count = await getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (err) {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();

    timerRef.current = setInterval(refresh, 45000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [refresh]);

  const setCount = useCallback((count) => {
    setUnreadCount(Number(count) || 0);
  }, []);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh, setCount }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used inside NotificationsProvider");
  }
  return context;
}

export default NotificationsContext;