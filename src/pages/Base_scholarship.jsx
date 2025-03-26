import React, { useEffect, useState, useMemo } from 'react';
import '../styles/table.css';
import DynamicTable from '../components/DynamicTable';
import DynamicFilterForm from '../components/DynamicFylterForm';
import DynamicPagination from '../components/DynamicPagination';
import DynamicItemsPerPage from '../components/DynamicItemsPerPage';

const Scholarships = () => {
    const [scholarships, setScholarships] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        scholarship_type: '',
        base_amount: '',
        min_base_amount: '',
        max_base_amount: ''
    });

    const filterFields = useMemo(() => [
        {
            key: 'scholarship_type',
            label: 'Тип стипендии',
            type: 'text',
            placeholder: 'Тип стипендии'
        },
        {
            key: 'base_amount',
            label: 'Базовая сумма',
            type: 'number',
            placeholder: 'Базовая сумма'
        },
        {
            key: 'min_base_amount',
            label: 'Минимальная сумма',
            type: 'number',
            placeholder: 'Минимальная сумма'
        },
        {
            key: 'max_base_amount',
            label: 'Максимальная сумма',
            type: 'number',
            placeholder: 'Максимальная сумма'
        }
    ], []);

    const tableHeaders = useMemo(() => [
        { key: 'id', label: '№', sortable: true },
        { key: 'scholarship_type', label: 'Тип стипендии', sortable: true },
        { key: 'base_amount', label: 'Базовая сумма', sortable: true }
    ], []);

    const getWordForm = (number) => {
        if (number === 1) return 'запись';
        if (number >= 2 && number <= 4) return 'записи';
        return 'записей';
    };

    const fetchScholarships = async (params) => {
        setError(null);
        try {
            const url = new URL('http://localhost:8000/base_scholarship');
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== '' && value !== undefined) {
                    url.searchParams.append(key, value);
                }
            });

            const response = await fetch(url.toString(), {
                method: 'GET'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Произошла ошибка');
            }

            const data = await response.json();
            setScholarships(data.scholarships);
            setTotal(data.total[0].count);
        } catch (error) {
            setError(error.message);
            console.error(error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setPage(1);
    };

    useEffect(() => {
        document.title = "стипендии";
        fetchScholarships({
            scholarship_id: null,
            scholarship_type: filters.scholarship_type,
            base_amount: filters.base_amount,
            min_base_amount: filters.min_base_amount,
            max_base_amount: filters.max_base_amount,
            sort_by: sortConfig.key,
            sort_order: sortConfig.direction,
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage
        });
    }, [sortConfig, page, itemsPerPage, filters]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(parseInt(value));
        setPage(1);
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    return (
        <>
            <h2>Таблица стипендий</h2>
            <div className="table-container">
                <div className="header-wrapper">
                    <DynamicItemsPerPage
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                    <div className="info-line">
                        По Вашему запросу найдено {total} {getWordForm(total)}
                    </div>
                </div>

                <DynamicFilterForm
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSubmit={handleFilterSubmit}
                    filterFields={filterFields}
                />

                {error ? (
                    <p className="error">Ошибка: {error}</p>
                ) : (
                    <DynamicTable
                        headers={tableHeaders}
                        data={scholarships}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                )}

                <DynamicPagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>
        </>
    );
};

export default Scholarships;