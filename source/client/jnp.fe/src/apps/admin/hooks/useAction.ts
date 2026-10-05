import { useState, useCallback } from "react";

//Action cho xử lí modal
export const useOpenModal = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleSubmit = useCallback(
    (callback?: (values: any) => void) => {
      return (values: any) => {
        if (callback) callback(values); 
        handleClose();
      };
    },
    [handleClose]
  );

  return {
    open,
    handleOpen,
    handleClose,
    handleSubmit,
  };
};

