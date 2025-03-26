// components/DynamicPagination/index.jsx
import React from 'react';

const DynamicPagination = ({
    page,
    totalPages,
    onPageChange
}) => {
    return (
        <div className="pagination-container">
            <div className="pagination">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="pagination-button"
                >
                    ←
                </button>
                <span className="current-page">
                    Страница {page} из {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="pagination-button"
                >
                    →
                </button>
            </div>
        </div>
    );
};

export default DynamicPagination;