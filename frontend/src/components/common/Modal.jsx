import React from 'react';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiXCircle, FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  type = 'info', // 'success', 'warning', 'danger', 'info', 'confirm'
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  maxWidth = '460px'
}) => {
  if (!isOpen) return null;

  const icons = {
    success: <FiCheckCircle size={28} color="#10b981" />,
    warning: <FiAlertTriangle size={28} color="#f59e0b" />,
    danger: <FiXCircle size={28} color="#ef4444" />,
    info: <FiInfo size={28} color="#2563eb" />,
    confirm: <FiAlertTriangle size={28} color="#f59e0b" />
  };

  const bgColors = {
    success: 'rgba(16,185,129,0.1)',
    warning: 'rgba(245,158,11,0.1)',
    danger: 'rgba(239,68,68,0.1)',
    info: 'rgba(37,99,235,0.1)',
    confirm: 'rgba(245,158,11,0.1)'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000, padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        width: '100%',
        maxWidth,
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '6px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--background)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <FiX size={18} />
        </button>

        {/* Header Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: title || children ? '16px' : '0' }}>
          {icons[type] && (
            <div style={{
              width: 48, height: 48, borderRadius: '12px',
              background: bgColors[type],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {icons[type]}
            </div>
          )}
          <div style={{ flex: 1, paddingTop: '2px' }}>
            {title && (
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, paddingRight: '24px' }}>
                {title}
              </h3>
            )}
          </div>
        </div>

        {/* Body Content */}
        {children && (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: (onConfirm || type === 'confirm') ? '24px' : '8px' }}>
            {children}
          </div>
        )}

        {/* Footer Actions */}
        {(onConfirm || type === 'confirm') && (
          <div className="flex" style={{ gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              {cancelText}
            </button>
            <button
              className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Modal;
