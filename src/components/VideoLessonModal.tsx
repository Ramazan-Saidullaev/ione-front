import { useEffect, useMemo, useRef } from "react";

type VideoLessonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
};

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").trim();
      return id ? id : null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? id : null;
    }
    return null;
  } catch {
    return null;
  }
}

function toDrivePreviewUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== "drive.google.com") return null;

    const match = u.pathname.match(/^\/file\/d\/([^/]+)\//);
    if (!match) return null;

    const id = match[1];
    return `https://drive.google.com/file/d/${id}/preview`;
  } catch {
    return null;
  }
}

function getEmbedInfo(url: string): { kind: "youtube" | "drive" | "html5"; src: string } {
  const trimmed = url.trim();
  const youtubeId = getYoutubeId(trimmed);
  if (youtubeId) {
    return {
      kind: "youtube",
      src: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
    };
  }

  const drivePreview = toDrivePreviewUrl(trimmed);
  if (drivePreview) {
    return {
      kind: "drive",
      src: drivePreview
    };
  }

  return {
    kind: "html5",
    src: trimmed
  };
}

export function VideoLessonModal({ isOpen, onClose, title, videoUrl }: VideoLessonModalProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const embed = useMemo(() => getEmbedInfo(videoUrl), [videoUrl]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const requestFullscreen = () => {
    const el = embed.kind === "html5" ? videoRef.current : iframeRef.current;
    if (!el) return;

    const anyEl = el as any;
    if (typeof anyEl.requestFullscreen === "function") anyEl.requestFullscreen();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: "980px", width: "min(980px, 96vw)" }}
      >
        <div className="modal-header" style={{ padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#111827" }}>{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px"
              }}
            >
              &times;
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: "16px 24px" }}>
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              background: "#0b1220",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(16, 32, 51, 0.12)"
            }}
          >
            {embed.kind === "html5" ? (
              <video
                ref={videoRef}
                src={embed.src}
                controls
                playsInline
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <iframe
                ref={iframeRef}
                src={embed.src}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "12px" }}>
            <a className="secondary-link-button" href={videoUrl} target="_blank" rel="noreferrer" style={{ padding: "10px 14px" }}>
              Открыть в новой вкладке
            </a>
            <button type="button" className="primary-button" onClick={requestFullscreen} style={{ padding: "10px 14px" }}>
              На весь экран
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
