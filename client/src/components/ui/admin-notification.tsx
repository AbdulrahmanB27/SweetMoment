import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";
import { cva } from "class-variance-authority";

// Notification variants
const notificationVariants = cva(
  "fixed z-50 px-6 py-4 rounded-md shadow-lg flex items-start space-x-4 transition-all duration-300",
  {
    variants: {
      variant: {
        success: "bg-green-50 text-green-800 border-l-4 border-green-500",
        error: "bg-red-50 text-red-800 border-l-4 border-red-500",
        warning: "bg-amber-50 text-amber-800 border-l-4 border-amber-500",
        info: "bg-blue-50 text-blue-800 border-l-4 border-blue-500",
      },
      position: {
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-center": "top-4 left-1/2 transform -translate-x-1/2",
        "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "info",
      position: "bottom-right",
    },
  }
);

// Icon components based on variant
const IconByVariant = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

export type NotificationType = "success" | "error" | "warning" | "info";
export type NotificationPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

export interface NotificationProps {
  title: string;
  message: string;
  variant?: NotificationType;
  position?: NotificationPosition;
  duration?: number;
  onClose?: () => void;
}

export function AdminNotification({
  title,
  message,
  variant = "info",
  position = "bottom-right",
  duration = 3000,
  onClose,
}: NotificationProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const IconComponent = IconByVariant[variant];

  // Close the notification after the specified duration
  useEffect(() => {
    const timeout = setTimeout(() => {
      setExiting(true);
      
      // Allow time for exit animation
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration, onClose]);

  // Handle manual close
  const handleClose = () => {
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div 
      className={notificationVariants({ variant, position })}
      style={{ 
        opacity: exiting ? 0 : 1,
        transform: exiting 
          ? `${position.includes('top') ? 'translateY(-10px)' : 'translateY(10px)'} ${position.includes('center') ? 'translateX(-50%)' : ''}`
          : `translateY(0) ${position.includes('center') ? 'translateX(-50%)' : ''}`,
      }}
    >
      <div className="flex-shrink-0">
        <IconComponent className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-sm opacity-90">{message}</p>
      </div>
      <button 
        onClick={handleClose} 
        className="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700"
        aria-label="Close notification"
      >
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  );
}

// Create a notification context and hook
import { createContext, useContext, ReactNode } from "react";

interface NotificationContextType {
  showNotification: (props: NotificationProps) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
  children: ReactNode;
}

export function AdminNotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (props: NotificationProps) => {
    setNotification(props);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {notification && (
        <AdminNotification
          {...notification}
          onClose={() => setNotification(null)}
        />
      )}
    </NotificationContext.Provider>
  );
}

export function useAdminNotification() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error("useAdminNotification must be used within an AdminNotificationProvider");
  }
  
  return context;
}