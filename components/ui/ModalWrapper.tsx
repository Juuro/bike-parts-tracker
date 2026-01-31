"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showBackdrop?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  children,
  showBackdrop = true,
  closeOnBackdropClick = true,
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>,
    document.body
  );
};

export default ModalWrapper;
