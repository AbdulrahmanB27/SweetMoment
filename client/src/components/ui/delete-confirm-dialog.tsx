import React, { useState } from "react";
import { Trash } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose?: () => void;
  buttonVariant?: "ghost" | "destructive" | "outline";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonLabel?: string;
  buttonClassName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
}

export function DeleteConfirmDialog({
  title,
  description,
  onConfirm,
  onClose,
  buttonVariant = "ghost",
  buttonSize = "icon",
  buttonLabel,
  buttonClassName = "text-red-500 hover:text-red-700",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  icon = <Trash className="h-4 w-4" />,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={buttonClassName}
        onClick={() => setOpen(true)}
      >
        {buttonLabel ? buttonLabel : icon}
      </Button>

      <AlertDialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen && onClose) {
          onClose();
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
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
    </>
  );
}