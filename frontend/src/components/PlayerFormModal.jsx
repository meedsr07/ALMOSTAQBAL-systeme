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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#212529]/45 p-4 py-10 sm:p-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl shadow-[#212529]/20">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-ink">تسجيل لاعب جديد</h2>
            <p className="mt-0.5 text-xs text-muted">
              املأ البيانات وأضف صورة اللاعب
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-bold text-body transition hover:bg-page hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <PlayerForm onSuccess={handleSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
