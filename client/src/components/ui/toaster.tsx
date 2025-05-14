import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// We'll use a simpler approach without depending on the CartContext directly
export function Toaster() {
  const { toasts } = useToast()
  
  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport 
        className="fixed bottom-0 flex max-h-screen w-full flex-col p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
        style={{ 
          transform: 'translateZ(9999px)', // Use a large Z translation to force it on top
          position: 'fixed',
          zIndex: '99999', // Force an extremely high z-index
          isolation: 'isolate',
          transformStyle: 'preserve-3d',
          /* Attempt to override any potential interference */
          boxShadow: '0 0 0 9999px rgba(0,0,0,0)',
        }}
      />
    </ToastProvider>
  )
}
