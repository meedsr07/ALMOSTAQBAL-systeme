"use client";

import { useRouter } from "next/navigation";
import PlayerForm from "@/components/PlayerForm";

export default function CreatePlayerPage() {
  const router = useRouter();

  function handleSuccess(player) {
    if (!player) return;

    // go to the players page after the success message appears
    setTimeout(() => router.push("/players"), 1200);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
        <div className="mb-6 border-b border-line pb-5">
          <h2 className="text-lg font-bold text-ink">تسجيل لاعب جديد</h2>
          <p className="mt-0.5 text-xs text-muted">
            املأ البيانات وأضف صورة اللاعب
          </p>
        </div>

        <PlayerForm onSuccess={handleSuccess} onCancel={() => router.push("/players")} />
      </div>
    </div>
  );
}
