"use client";

import PlayerForm from "./PlayerForm";

// White modal that holds the player registration form.
// onCreated: called with the new player after a successful save.
export default function PlayerFormModal({ onClose, onCreated }) {
  function handleSuccess(player) {
    if (!player) return;

    // let the success message show for a moment, then close the modal
    setTimeout(() => {
      onCreated?.(player);
      onClose();
    }, 1200);
  }

  return (
    <div className="modal-backdrop"><div className="modal">
        <div className="modal-header">
          <div>
            <h2>تسجيل لاعب جديد</h2><p className="muted">
              املأ البيانات وأضف صورة اللاعب
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="close-button"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <PlayerForm onSuccess={handleSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
