import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminDeleteDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  isOpen: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
}

export function AdminDeleteDialog({
  title,
  description,
  onConfirm,
  onClose,
  isOpen,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  icon = <AlertTriangle className="h-6 w-6 text-red-500" />,
}: AdminDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <AlertDialogContent className="overflow-y-auto max-h-[80vh]">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}