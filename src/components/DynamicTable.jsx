import React, { useCallback, useMemo } from 'react';

const DynamicTable = ({
    headers,
    data,
    onSort,
    sortConfig = {},
    className = '',
}) => {
    const renderHeaders = useCallback(() => {
        return headers.map(({ key, label, sortable = false }) => (
            <th
                key={key}
                className={`sortable ${sortable ? 'clickable' : ''}`}
                onClick={() => sortable && onSort(key)}
            >
                {label}
                {sortable && (
                    <span className={`sort-arrow ${sortConfig?.key === key ? sortConfig.direction : 'none'}`} />
                )}
            </th>
        ));
    }, [headers, sortConfig, onSort]);

    const renderRows = useCallback(() => {
        return data.map((item, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}>
                {headers.map(({ key }) => (
                    <td key={`${rowIndex}-${key}`} className={typeof item[key] === 'number' ? 'numeric' : 'text'}>
                        {item[key]}
                    </td>
                ))}
            </tr>
        ));
    }, [data, headers]);

    return (
        <table className={`dynamic-table ${className}`}>
            <thead>
                <tr>{renderHeaders()}</tr>
            </thead>
            <tbody>{renderRows()}</tbody>
        </table>
    );
};

export default DynamicTable;