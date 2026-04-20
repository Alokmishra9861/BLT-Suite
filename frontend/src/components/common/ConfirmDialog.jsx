import React from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <p>{message}</p>
      <div className="modal-actions">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
