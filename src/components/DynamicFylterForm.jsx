import React, { useCallback } from 'react';

const DynamicFilterForm = ({
    filters,
    onFilterChange,
    onSubmit,
    filterFields,
    className = ''
}) => {
    const renderFilterGroups = useCallback(() => {
        return filterFields.map(({ key, label, type = 'text', placeholder }) => (
            <div key={key} className="filter-group">
                <input
                    type={type}
                    placeholder={placeholder || label}
                    value={filters[key] || ''}
                    onChange={(e) => onFilterChange(key, e.target.value)}
                    className="filter-input"
                />
            </div>
        ));
    }, [filters, filterFields, onFilterChange]);

    return (
        <form onSubmit={onSubmit} className={`filter-form ${className}`}>
            {renderFilterGroups()}
        </form>
    );
};

export default DynamicFilterForm;