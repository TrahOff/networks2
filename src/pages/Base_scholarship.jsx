import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import '../styles/table.css';
import DynamicTable from '../components/DynamicTable';
import DynamicFilterForm from '../components/DynamicFylterForm';
import DynamicPagination from '../components/DynamicPagination';
import DynamicItemsPerPage from '../components/DynamicItemsPerPage';
import DynamicModal from '../components/DynamicModal';

const REFRESH_INTERVAL = 5000; // 5 секунд

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
    const [selectedScholarship, setSelectedScholarship] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const token = useSelector(state => state.auth.token);
    const userData = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    const scholarshipFields = useMemo(() => [
        { key: 'id', label: 'ID' },
        { key: 'scholarship_type', label: 'Тип стипендии' },
        { key: 'base_amount', label: 'Базовая сумма' }
    ], []);

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

    const fetchScholarships = useCallback(async (params) => {
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
    }, []);

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

    const handleRowClick = useCallback((scholarshipId) => {
        const scholarship = scholarships.find(s => s.id === scholarshipId);
        setSelectedScholarship(scholarship);
        setIsEditing(true);
        setIsCreating(false);
    }, [scholarships]);

    const handleCloseModal = useCallback(() => {
        setSelectedScholarship(null);
        setIsEditing(false);
        setIsCreating(false);
    }, []);

    const handleUpdate = useCallback((fieldKey, value) => {
        if (fieldKey === 'confirm') return;
        setSelectedScholarship(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    }, []);

    const handleDelete = useCallback(async (scholarshipId) => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/base_scholarship/delete?element_id=${scholarshipId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при удалении стипендии';
                throw new Error(errorMessage);
            }

            await fetchScholarships({
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

            setScholarships(prev => prev.filter(scholarship => scholarship.id !== scholarshipId));
            setTotal(prev => prev - 1);
            setSelectedScholarship(null);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при удалении стипендии:', error);
        }
    }, [filters, sortConfig, page, itemsPerPage, fetchScholarships, token]);

    const handleSaveChanges = useCallback(async () => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/base_scholarship/update?element_id=${selectedScholarship.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(selectedScholarship)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Произошла ошибка при обновлении');
            }

            await fetchScholarships({
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

            setSelectedScholarship(null);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при обновлении стипендии:', error);
        }
    }, [selectedScholarship, filters, sortConfig, page, itemsPerPage, fetchScholarships, token]);

    const handleCreate = useCallback(() => {
        setIsCreating(true);
        setSelectedScholarship(null);
    }, []);

    const handleCreateSubmit = useCallback(async (scholarshipData) => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/base_scholarship/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(scholarshipData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при создании стипендии';
                throw new Error(errorMessage);
            }

            await fetchScholarships({
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

            setIsCreating(false);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при создании стипендии:', error);
        }
    }, [filters, sortConfig, page, itemsPerPage, fetchScholarships, token]);

    useEffect(() => {
        document.title = "стипендии";

        // Сначала выполним первоначальную загрузку
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

        // Создаем интервал для периодического обновления
        const interval = setInterval(() => {
            console.log('🔄 Автоматическое обновление данных...');
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
        }, REFRESH_INTERVAL);

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(interval);
    }, [sortConfig, page, itemsPerPage, filters, fetchScholarships]);

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
            <h2>стипендии</h2>
            <div className="table-container">
                <div className="header-wrapper">
                    <button
                        onClick={handleCreate}
                        className="create-button"
                    >
                        Создать стипендию
                    </button>
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
                    <p className="error">{error}</p>
                ) : (
                    <DynamicTable
                        headers={tableHeaders}
                        data={scholarships}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                        onRowClick={handleRowClick}
                    />
                )}

                <DynamicPagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            </div>

            <DynamicModal
                isOpen={isCreating}
                onClose={handleCloseModal}
                data={{
                    scholarship_type: '',
                    base_amount: '',
                    min_base_amount: '',
                    max_base_amount: ''
                }}
                type="scholarship"
                fields={scholarshipFields}
                onUpdate={handleUpdate}
                onSave={handleCreateSubmit}
            />

            <DynamicModal
                isOpen={isEditing && !!selectedScholarship}
                onClose={handleCloseModal}
                data={selectedScholarship || {}}
                type="scholarship"
                fields={scholarshipFields}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onSave={handleSaveChanges}
            />
        </>
    );
};

export default Scholarships;