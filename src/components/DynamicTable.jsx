import React, { useCallback, useMemo } from 'react';

const DynamicTable = ({
    headers,
    data,
    onSort,
    sortConfig = {},
    className = '',
    onRowClick,
    page = 1,
    itemsPerPage = 10
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
        return data.map((item, rowIndex) => {
            const rowNumber = (page - 1) * itemsPerPage + rowIndex + 1;
            return (
                <tr
                    key={rowNumber}
                    className={`table-row ${rowIndex % 2 === 0 ? 'even-row' : 'odd-row'}`}
                    onClick={() => onRowClick?.(item.id)}
                >
                    {headers.map(({ key }) => (
                        <td
                            key={`${rowIndex}-${key}`}
                            className={typeof item[key] === 'number' ? 'numeric' : 'text'}
                        >
                            {key === 'id' ? rowNumber : item[key]}
                        </td>
                    ))}
                </tr>
            );
        });
    }, [data, headers, onRowClick, page, itemsPerPage]);

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