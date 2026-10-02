"use client";

import { useState } from "react";
import { createPlayer } from "@/lib/api";

const fieldClass = "field";
const labelClass = "field-label";

const positions = ["Forward", "Midfielder", "Defender", "Goalkeeper", "Winger"];
const categories = ["U13", "U15", "U17", "U19", "Senior"];
const feet = ["Right", "Left", "Both"];

// The player registration form.
// It is used inside the modal and on the /players/create page.
export default function PlayerForm({ onSuccess, onCancel }) {
  const [imagePreview, setImagePreview] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setImagePreview("");
      return;
    }

    // the image must be one of these types, same as the backend rule
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setImagePreview("");
      setError("الصورة يجب أن تكون بصيغة JPG أو PNG أو WEBP");
      return;
    }

    setError("");
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    // Build FormData. Do NOT set the Content-Type header, the browser does it.
    const formData = new FormData(event.target);

    setSending(true);
    setError("");

    try {
      const data = await createPlayer(formData);
      setSaved(true);
      onSuccess?.(data.player);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}><div className="form-grid">
        <div>
          <label htmlFor="first_name" className={labelClass}>
            الاسم الأول *
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="last_name" className={labelClass}>
            اسم العائلة *
          </label>
          <input
            id="last_name"
            name="last_name"
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="date_of_birth" className={labelClass}>
            تاريخ الميلاد *
          </label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="position" className={labelClass}>
            المركز
          </label>
          <select id="position" name="position" className={fieldClass} defaultValue="">
            <option value="">بدون</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            الفئة
          </label>
          <select id="category" name="category" className={fieldClass} defaultValue="">
            <option value="">بدون</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="preferred_foot" className={labelClass}>
            القدم المفضلة
          </label>
          <select
            id="preferred_foot"
            name="preferred_foot"
            className={fieldClass}
            defaultValue=""
          >
            <option value="">بدون</option>
            {feet.map((foot) => (
              <option key={foot} value={foot}>
                {foot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="height_cm" className={labelClass}>
            الطول (سم)
          </label>
          <input
            id="height_cm"
            name="height_cm"
            type="number"
            min="50"
            max="250"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="weight_kg" className={labelClass}>
            الوزن (كجم)
          </label>
          <input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            min="5"
            max="200"
            className={fieldClass}
          />
        </div>

        <div className="form-span">
          <label htmlFor="previous_team" className={labelClass}>
            الفريق السابق
          </label>
          <input
            id="previous_team"
            name="previous_team"
            className={fieldClass}
          />
        </div>

        <div className="form-span">
          <label htmlFor="profile_image" className={labelClass}>
            صورة اللاعب *
          </label>
          <input
            id="profile_image"
            name="profile_image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="field file-field"
          />

          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="معاينة الصورة"
              className="image-preview"
            />
          )}
        </div>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {saved && (
        <p className="notice">
          تم حفظ اللاعب بنجاح
        </p>
      )}

      <div className="form-actions">
        <button
          type="submit"
          disabled={sending || saved}
          className="button button-primary"
        >
          {sending ? "جاري الحفظ..." : "حفظ اللاعب"}
        </button>

        <button
          type="button"
          onClick={() => onCancel?.()}
          className="button button-secondary"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}
