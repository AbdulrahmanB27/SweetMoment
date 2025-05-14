import React, { createContext, useContext, useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  InfoIcon,
  XCircle 
} from "lucide-react";

type NotificationVariant = "success" | "error" | "warning" | "info";
type NotificationPosition = "top-right" | "top-center" | "bottom-right";

interface Notification {
  id: string;
  title: string;
  message: string;
  variant: NotificationVariant;
  position?: NotificationPosition;
  timeout?: number;
}

interface AdminNotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, "id">) => void;
  dismissNotification: (id: string) => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = {
      ...notification,
      id,
      position: notification.position || "top-right",
      timeout: notification.timeout || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Auto-dismiss after timeout
    setTimeout(() => {
      dismissNotification(id);
    }, newNotification.timeout);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <AdminNotificationContext.Provider
      value={{ notifications, showNotification, dismissNotification }}
    >
      {children}
      
      {/* Notification container */}
      <div className="fixed z-50 flex flex-col gap-2 p-4 max-w-md w-full pointer-events-none">
        {notifications.map((notification) => {
          // Set position classes based on position prop
          let positionClasses = "top-0 right-0"; // default is top-right
          if (notification.position === "top-center") {
            positionClasses = "top-0 left-1/2 transform -translate-x-1/2";
          } else if (notification.position === "bottom-right") {
            positionClasses = "bottom-0 right-0";
          }

          // Set colors based on variant
          let bgColor = "bg-green-50 border-green-500 text-green-700";
          let icon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
          
          if (notification.variant === "error") {
            bgColor = "bg-red-50 border-red-500 text-red-700";
            icon = <XCircle className="h-5 w-5 text-red-500" />;
          } else if (notification.variant === "warning") {
            bgColor = "bg-amber-50 border-amber-500 text-amber-700";
            icon = <AlertCircle className="h-5 w-5 text-amber-500" />;
          } else if (notification.variant === "info") {
            bgColor = "bg-blue-50 border-blue-500 text-blue-700";
            icon = <InfoIcon className="h-5 w-5 text-blue-500" />;
          }

          return (
            <div
              key={notification.id}
              className={`${positionClasses} fixed shadow-md rounded-md border border-l-4 p-4 ${bgColor} pointer-events-auto transition-all duration-300 ease-in-out`}
              style={{ maxWidth: "calc(100% - 2rem)" }}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <div className="mt-1 text-sm">{notification.message}</div>
                </div>
                <button
                  type="button"
                  className="ml-4 flex-shrink-0 inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                  onClick={() => dismissNotification(notification.id)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminNotificationContext.Provider>
  );
}

export const useAdminNotification = () => {
  const context = useContext(AdminNotificationContext);
  
  if (context === undefined) {
    throw new Error("useAdminNotification must be used within a AdminNotificationProvider");
  }
  
  return context;
};