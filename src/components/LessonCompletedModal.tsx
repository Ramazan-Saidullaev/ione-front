type LessonCompletedModalProps = {
  onPrimaryAction: () => void;
  primaryActionLabel: string;
  completionMessage: string;
  helperText?: string;
  isPrimaryActionDisabled?: boolean;
  onClose: () => void;
};

export function LessonCompletedModal({
  onPrimaryAction,
  primaryActionLabel,
  completionMessage,
  helperText,
  isPrimaryActionDisabled = false,
  onClose
}: LessonCompletedModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
          <h2 style={{ margin: "0 0 8px 0", fontSize: "1.8rem", color: "#111827" }}>
            Поздравляем!
          </h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "1.05rem" }}>{completionMessage}</p>
        </div>

        <div className="modal-body" style={{ padding: "24px", textAlign: "center" }}>
          <div
            style={{
              padding: "20px",
              background: "#f0fdf4",
              border: "2px solid #22c55e",
              borderRadius: "12px",
              marginBottom: "24px"
            }}
          >
            <p style={{ margin: 0, color: "#15803d", fontWeight: 600 }}>
              ✓ Результат сохранён в прогрессе ученика
            </p>
          </div>

          {helperText ? (
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#4b5563",
                fontSize: "1.05rem"
              }}
            >
              {helperText}
            </p>
          ) : null}
        </div>

        <div className="modal-footer">
          <button
            className="primary-button"
            onClick={onPrimaryAction}
            disabled={isPrimaryActionDisabled}
            style={{
              width: "100%",
              padding: "14px 24px",
              fontSize: "1.05rem",
              opacity: isPrimaryActionDisabled ? 0.5 : 1,
              cursor: isPrimaryActionDisabled ? "not-allowed" : "pointer"
            }}
          >
            {primaryActionLabel}
          </button>
          <button
            className="ghost-button"
            onClick={onClose}
            style={{
              width: "100%",
              padding: "12px 24px",
              fontSize: "1rem",
              marginTop: "12px"
            }}
          >
            Остаться на текущем экране
          </button>
        </div>
      </div>
    </div>
  );
}
