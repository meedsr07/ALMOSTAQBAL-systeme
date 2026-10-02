"use client";

import PlayerForm from "./PlayerForm";

// White modal that holds the player registration form.
// Pass a player to open it in edit mode (the fields come pre-filled).
// onSaved: called with the created or updated player after a successful save.
export default function PlayerFormModal({ player, onClose, onSaved }) {
  const isEditing = Boolean(player);

  function handleSuccess(saved) {
    if (!saved) return;

    // let the success message show for a moment, then close the modal
    setTimeout(() => {
      onSaved?.(saved, isEditing);
      onClose();
    }, 1200);
  }

  return (
    <div className="modal-backdrop"><div className="modal">
        <div className="modal-header">
          <div>
            <h2>{isEditing ? "تعديل بيانات اللاعب" : "تسجيل لاعب جديد"}</h2><p className="muted">
              {isEditing ? "عدّل البيانات واحفظ التغييرات" : "املأ البيانات وأضف صورة اللاعب"}
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
          <PlayerForm
            player={player}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}