/** Escape text for HTML body / attribute contexts (not full URL context). */
export function escapeHtml(s: string | undefined): string {
  return (s ?? "")
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}

/** Sanitize a client-supplied filename for use as an email attachment name. */
export function safeAttachmentFilename(name: string): string {
  return (
    name
      .replace(/[^a-zA-Z0-9.\-_ ]/g, "_")
      .replace(/\.{2,}/g, "_")
      .slice(0, 200) || "fichier"
  );
}
