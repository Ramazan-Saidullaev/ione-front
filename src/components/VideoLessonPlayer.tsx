import { useMemo, useRef } from "react";

type VideoLessonPlayerProps = {
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
      src: `https://www.youtube.com/embed/${youtubeId}?rel=0`
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

export function VideoLessonPlayer({ title, videoUrl }: VideoLessonPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const embed = useMemo(() => getEmbedInfo(videoUrl), [videoUrl]);

  const requestFullscreen = () => {
    const el = embed.kind === "html5" ? videoRef.current : iframeRef.current;
    if (!el) return;

    const anyEl = el as any;
    if (typeof anyEl.requestFullscreen === "function") anyEl.requestFullscreen();
  };

  return (
    <div style={{ marginTop: "12px" }}>
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "10px" }}>
        <a className="secondary-link-button" href={videoUrl} target="_blank" rel="noreferrer" style={{ padding: "10px 14px" }}>
          Открыть в новой вкладке
        </a>
        <button type="button" className="primary-button" onClick={requestFullscreen} style={{ padding: "10px 14px" }}>
          На весь экран
        </button>
      </div>
    </div>
  );
}
