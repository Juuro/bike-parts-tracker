import { useEffect } from "react";

/**
 * Custom hook to handle ESC key press to close modal and prevent body scrolling
 * @param isModalOpen - Boolean indicating if the modal is open
 * @param onClose - Function to call when ESC is pressed or modal should be closed
 */
export const useEscapeToCloseModal = (
  isModalOpen: boolean,
  onClose: () => void
) => {
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        onClose();
      }
    },
    [isModalOpen, onClose]
  );

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = ""; // Restore scrolling
    };
  }, [isModalOpen, onClose]);
};
