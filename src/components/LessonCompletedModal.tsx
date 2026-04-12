export function LessonCompletedModal({ 
  onNextLesson, 
  hasNextLesson,
  onClose 
}: { 
  onNextLesson: () => void; 
  hasNextLesson: boolean;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#111827' }}>
            Поздравляем!
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '1.05rem' }}>
            Вы успешно завершили этот урок
          </p>
        </div>

        <div className="modal-body" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ 
            padding: '20px', 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ margin: 0, color: '#15803d', fontWeight: 600 }}>
              ✓ Урок отмечен как завершённый
            </p>
          </div>

          {hasNextLesson && (
            <p style={{ 
              margin: '0 0 24px 0', 
              color: '#4b5563',
              fontSize: '1.05rem'
            }}>
              Готовы к следующему уроку?
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button 
            className="primary-button" 
            onClick={onNextLesson}
            disabled={!hasNextLesson}
            style={{ 
              width: '100%', 
              padding: '14px 24px',
              fontSize: '1.05rem',
              opacity: hasNextLesson ? 1 : 0.5,
              cursor: hasNextLesson ? 'pointer' : 'not-allowed'
            }}
          >
            {hasNextLesson ? '→ Перейти на следующий урок' : '✓ Вы прошли все уроки'}
          </button>
          <button 
            className="ghost-button" 
            onClick={onClose}
            style={{ 
              width: '100%', 
              padding: '12px 24px',
              fontSize: '1rem',
              marginTop: '12px'
            }}
          >
            Остаться на этом уроке
          </button>
        </div>
      </div>
    </div>
  );
}
