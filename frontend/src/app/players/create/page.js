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
    <div className="panel"><div className="section-header">
          <div><h2>تسجيل لاعب جديد</h2><p className="muted">
            املأ البيانات وأضف صورة اللاعب
          </p>
        </div></div>
        <PlayerForm onSuccess={handleSuccess} onCancel={() => router.push("/players")} />
      </div>
  );
}
