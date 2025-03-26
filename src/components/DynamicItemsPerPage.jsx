import React from 'react';

const DynamicItemsPerPage = ({
    itemsPerPage,
    onItemsPerPageChange
}) => {
    return (
        <>
            <select
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(e.target.value)}
                className="items-per-page"
            >
                <option value="5">5 записей</option>
                <option value="10">10 записей</option>
                <option value="15">15 записей</option>
            </select>
        </>
    );
};

export default DynamicItemsPerPage;