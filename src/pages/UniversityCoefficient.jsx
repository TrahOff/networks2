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

const UniversityCoefficient = () => {
    const [coefficients, setCoefficients] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        coefficient_id: '',
        university_name: '',
        coefficient: '',
        scholarship_id: '',
        min_coefficient: '',
        max_coefficient: ''
    });
    const [selectedCoefficient, setSelectedCoefficient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const token = useSelector(state => state.auth.token);
    const userData = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    const coefficientFields = useMemo(() => [
        { key: 'coefficient_id', label: 'ID' },
        { key: 'university_name', label: 'Название университета' },
        { key: 'coefficient', label: 'Коэффициент' },
        { key: 'scholarship_id', label: 'ID стипендии' }
    ], []);

    const filterFields = useMemo(() => [
        {
            key: 'coefficient_id',
            label: 'ID коэффициента',
            type: 'number',
            placeholder: 'ID коэффициента'
        },
        {
            key: 'university_name',
            label: 'Название университета',
            type: 'text',
            placeholder: 'Название университета'
        },
        {
            key: 'coefficient',
            label: 'Коэффициент',
            type: 'number',
            placeholder: 'Коэффициент'
        },
        {
            key: 'scholarship_id',
            label: 'ID стипендии',
            type: 'number',
            placeholder: 'ID стипендии'
        },
        {
            key: 'min_coefficient',
            label: 'Минимальный коэффициент',
            type: 'number',
            placeholder: 'Минимальный коэффициент'
        },
        {
            key: 'max_coefficient',
            label: 'Максимальный коэффициент',
            type: 'number',
            placeholder: 'Максимальный коэффициент'
        }
    ], []);

    const tableHeaders = useMemo(() => [
        { key: 'coefficient_id', label: 'ID', sortable: true },
        { key: 'university_name', label: 'Название университета', sortable: true },
        { key: 'coefficient', label: 'Коэффициент', sortable: true },
        { key: 'scholarship_id', label: 'ID стипендии', sortable: true }
    ], []);

    const getWordForm = (number) => {
        if (number === 1) return 'запись';
        if (number >= 2 && number <= 4) return 'записи';
        return 'записей';
    };

    const fetchCoefficients = useCallback(async (params) => {
        setError(null);
        try {
            const url = new URL('http://localhost:8000/university_coefficient');
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
            setCoefficients(data.university_coefficient);
            setTotal(data.total);
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

    const handleRowClick = useCallback((coefficientId) => {
        const coefficient = coefficients.find(c => c.coefficient_id === coefficientId);
        setSelectedCoefficient(coefficient);
        setIsEditing(true);
        setIsCreating(false);
    }, [coefficients]);

    const handleCloseModal = useCallback(() => {
        setSelectedCoefficient(null);
        setIsEditing(false);
        setIsCreating(false);
    }, []);

    const handleUpdate = useCallback((fieldKey, value) => {
        if (fieldKey === 'confirm') return;
        setSelectedCoefficient(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    }, []);

    const handleDelete = useCallback(async (coefficientId) => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/university_coefficient/delete?element_id=${coefficientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при удалении коэффициента';
                throw new Error(errorMessage);
            }

            await fetchCoefficients({
                coefficient_id: filters.coefficient_id,
                university_name: filters.university_name,
                coefficient: filters.coefficient,
                scholarship_id: filters.scholarship_id,
                min_coefficient: filters.min_coefficient,
                max_coefficient: filters.max_coefficient,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });

            setCoefficients(prev => prev.filter(coef => coef.coefficient_id !== coefficientId));
            setTotal(prev => prev - 1);
            setSelectedCoefficient(null);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при удалении коэффициента:', error);
        }
    }, [filters, sortConfig, page, itemsPerPage, fetchCoefficients, token]);

    const handleSaveChanges = useCallback(async () => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/university_coefficient/update?element_id=${selectedCoefficient.coefficient_id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(selectedCoefficient)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Произошла ошибка при обновлении');
            }

            await fetchCoefficients({
                coefficient_id: filters.coefficient_id,
                university_name: filters.university_name,
                coefficient: filters.coefficient,
                scholarship_id: filters.scholarship_id,
                min_coefficient: filters.min_coefficient,
                max_coefficient: filters.max_coefficient,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });

            setSelectedCoefficient(null);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при обновлении коэффициента:', error);
        }
    }, [selectedCoefficient, filters, sortConfig, page, itemsPerPage, fetchCoefficients, token]);

    const handleCreate = useCallback(() => {
        setIsCreating(true);
        setSelectedCoefficient(null);
    }, []);

    const handleCreateSubmit = useCallback(async (coefficientData) => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/university_coefficient/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(coefficientData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при создании коэффициента';
                throw new Error(errorMessage);
            }

            await fetchCoefficients({
                coefficient_id: filters.coefficient_id,
                university_name: filters.university_name,
                coefficient: filters.coefficient,
                scholarship_id: filters.scholarship_id,
                min_coefficient: filters.min_coefficient,
                max_coefficient: filters.max_coefficient,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });

            setIsCreating(false);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при создании коэффициента:', error);
        }
    }, [filters, sortConfig, page, itemsPerPage, fetchCoefficients, token]);

    useEffect(() => {
        document.title = "коэффициенты университета";

        // Сначала выполним первоначальную загрузку
        fetchCoefficients({
            coefficient_id: filters.coefficient_id,
            university_name: filters.university_name,
            coefficient: filters.coefficient,
            scholarship_id: filters.scholarship_id,
            min_coefficient: filters.min_coefficient,
            max_coefficient: filters.max_coefficient,
            sort_by: sortConfig.key,
            sort_order: sortConfig.direction,
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage
        });

        // Создаем интервал для периодического обновления
        const interval = setInterval(() => {
            console.log('🔄 Автоматическое обновление данных...');
            fetchCoefficients({
                coefficient_id: filters.coefficient_id,
                university_name: filters.university_name,
                coefficient: filters.coefficient,
                scholarship_id: filters.scholarship_id,
                min_coefficient: filters.min_coefficient,
                max_coefficient: filters.max_coefficient,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });
        }, REFRESH_INTERVAL);

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(interval);
    }, [sortConfig, page, itemsPerPage, filters, fetchCoefficients]);

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
            <h2>коэффициенты университета</h2>
            <div className="table-container">
                <div className="header-wrapper">
                    <button
                        onClick={handleCreate}
                        className="create-button"
                    >
                        Создать коэффициент
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
                        data={coefficients}
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
                    coefficient_id: '',
                    university_name: '',
                    coefficient: '',
                    scholarship_id: ''
                }}
                type="coefficient"
                fields={coefficientFields}
                onUpdate={handleUpdate}
                onSave={handleCreateSubmit}
            />

            <DynamicModal
                isOpen={isEditing && !!selectedCoefficient}
                onClose={handleCloseModal}
                data={selectedCoefficient || {}}
                type="coefficient"
                fields={coefficientFields}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onSave={handleSaveChanges}
            />
        </>
    );
};

export default UniversityCoefficient;