// components/DynamicModal.jsx
import React, { useCallback, useEffect, useRef } from 'react';

const DynamicModal = ({
    isOpen,
    onClose,
    data,
    type,
    fields,
    onUpdate,
    onDelete,
    onSave
}) => {
    if (!isOpen) return null;

    const modalRef = useRef(null);
    const inputRefs = useRef({});

    useEffect(() => {
        if (isOpen && modalRef.current) {
            // Сначала ждем завершения анимации
            const timer = setTimeout(() => {
                const firstInput = Object.values(inputRefs.current)[0];
                if (firstInput) {
                    firstInput.focus();
                    firstInput.select();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleChange = useCallback((fieldKey, value) => {
        if (fieldKey === 'confirm') return;
        onUpdate(fieldKey, value);
    }, [onUpdate]);

    const handleFocus = useCallback((e) => {
        e.target.select();
    }, []);

    const renderField = useCallback((field) => {
        if (field.key === 'id') return null;

        const value = data[field.key] || '';
        if (field.type === 'image') {
            return (
                <div key={field.key} className="modal-field">
                    <img
                        src={value}
                        alt={field.label}
                        style={{ maxWidth: '200px' }}
                    />
                </div>
            );
        }

        return (
            <div key={field.key} className="modal-field">
                <label>{field.label}:</label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="modal-input"
                    ref={el => inputRefs.current[field.key] = el}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.stopPropagation();
                        }
                    }}
                    aria-label={`Поле ввода: ${field.label}`}
                />
            </div>
        );
    }, [data, handleChange]);

    const handleSave = useCallback(() => {
        onUpdate('confirm', true);
        onSave();
        onClose();
    }, [onSave, onUpdate, onClose]);

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="modal-content"
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>{fields.title}</h2>
                    <button
                        className="close-button"
                        onClick={onClose}
                        aria-label="Закрыть"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    <div className="modal-content-body">
                        {fields.map(renderField)}
                    </div>
                    <div className="modal-buttons">
                        {onDelete && (
                            <button
                                className="delete-button"
                                onClick={() => onDelete(data.id)}
                            >
                                Удалить
                            </button>
                        )}
                        <button
                            className="update-button"
                            onClick={handleSave}
                        >
                            {onDelete ? 'Сохранить изменения' : 'Создать'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicModal;