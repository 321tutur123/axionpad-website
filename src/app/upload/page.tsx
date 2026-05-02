"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ACCEPTED = ".svg,.dxf,.ai,.eps,.pdf";

function UploadContent() {
  const params     = useSearchParams();
  const order      = params.get("order")?.toUpperCase() ?? "";
  const sig        = params.get("sig") ?? "";

  const [file,     setFile]     = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status,   setStatus]   = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [errMsg,   setErrMsg]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const invalid = !order || !sig;

  const pick = (f: File) => {
    setFile(f);
    setStatus("idle");
    setErrMsg("");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pick(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const submit = async () => {
    if (!file || status === "uploading") return;
    setStatus("uploading");
    setErrMsg("");

    const form = new FormData();
    form.append("order", order);
    form.append("sig",   sig);
    form.append("file",  file);

    try {
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setErrMsg(data.error ?? "Erreur inattendue");
        setStatus("error");
      } else {
        setStatus("done");
      }
    } catch {
      setErrMsg("Impossible de joindre le serveur.");
      setStatus("error");
    }
  };

  if (invalid) {
    return (
      <main className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6" style={{ background: "transparent" }}>
        <p className="text-2xl mb-3" style={{ color: "var(--color-text)" }}>Lien invalide</p>
        <p className="mb-6" style={{ color: "var(--color-text-mute)" }}>Utilisez le lien fourni dans votre e-mail de confirmation.</p>
        <Link href="/" className="btn-accent px-6 py-3">Retour à l'accueil</Link>
      </main>
    );
  }

  if (status === "done") {
    return (
      <main className="min-h-screen pt-24 flex flex-col items-center justify-center text-center px-6" style={{ background: "transparent" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl border mb-8"
          style={{ background: "rgba(107,146,116,0.12)", borderColor: "rgba(107,146,116,0.3)", color: "#4a8f5b" }}>
          &#10003;
        </div>
        <h1 className="text-2xl font-semibold mb-3" style={{ color: "var(--color-text)" }}>Fichier re&#231;u !</h1>
        <p className="mb-2" style={{ color: "var(--color-text-mute)" }}>
          Votre fichier a &#233;t&#233; transmis &#224; l'&#233;quipe AxionPad.
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-mute)" }}>
          Commande <strong style={{ color: "var(--color-accent)" }}>{order}</strong> &#8212; fabrication lanc&#233;e apr&#232;s validation.
        </p>
        <a href={`mailto:contact@axionpad.fr?subject=Commande ${order}`}
          className="text-sm underline" style={{ color: "var(--color-accent)" }}>
          Une question ? contact@axionpad.fr
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6" style={{ background: "transparent" }}>
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <span className="badge mb-4 inline-flex" style={{ color: "var(--color-accent)" }}>
            Commande {order}
          </span>
          <h1 className="text-2xl font-semibold mb-2" style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}>
            Envoyez votre fichier de gravure
          </h1>
          <p style={{ color: "var(--color-text-mute)", fontSize: "15px" }}>
            Formats accept&#233;s : SVG, DXF, AI, PDF &#8212; max 5 Mo
          </p>
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className="rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all mb-6"
          style={{
            borderColor: dragging ? "var(--color-accent)" : "var(--color-border)",
            background:  dragging ? "var(--color-accent-lt)" : "var(--color-bg-card)",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) pick(f); }}
          />

          {file ? (
            <div>
              <p className="text-4xl mb-3">&#128196;</p>
              <p className="font-medium" style={{ color: "var(--color-text)" }}>{file.name}</p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-mute)" }}>
                {(file.size / 1024).toFixed(0)} Ko &#8212; cliquez pour changer
              </p>
            </div>
          ) : (
            <div>
              <p className="text-4xl mb-3">&#128196;</p>
              <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>
                Glissez votre fichier ici
              </p>
              <p className="text-sm" style={{ color: "var(--color-text-mute)" }}>
                ou cliquez pour parcourir
              </p>
            </div>
          )}
        </div>

        {errMsg && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm border"
            style={{ background: "rgba(200,80,80,0.08)", borderColor: "rgba(200,80,80,0.25)", color: "#9b3a3a" }}>
            {errMsg}
          </div>
        )}

        <button
          onClick={submit}
          disabled={!file || status === "uploading"}
          className="w-full py-4 rounded-full font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-accent"
        >
          {status === "uploading" ? "Envoi en cours..." : "Envoyer le fichier &#8594;"}
        </button>

        <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-mute)" }}>
          Votre fichier est transmis directement &#224; l'&#233;quipe AxionPad et ne sera jamais partag&#233;.
        </p>

      </div>
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24" style={{ background: "transparent" }} />}>
      <UploadContent />
    </Suspense>
  );
}
