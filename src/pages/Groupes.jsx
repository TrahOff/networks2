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

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filters, setFilters] = useState({
        group_id: '',
        group_name: '',
        course: '',
        admission_year: '',
        university: '',
        curator_name: '',
        curator_photo: '',
        min_course: '',
        max_course: '',
        min_admission_year: '',
        max_admission_year: ''
    });
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const token = useSelector(state => state.auth.token);
    const userData = useSelector(state => state.auth.user);
    const navigate = useNavigate();

    const groupFields = useMemo(() => [
        { key: 'id', label: 'ID' },
        { key: 'group_name', label: 'Название группы' },
        { key: 'course', label: 'Курс' },
        { key: 'admission_year', label: 'Год поступления' },
        { key: 'university', label: 'Университет' },
        { key: 'curator_name', label: 'Куратор' },
        { key: 'curator_photo', label: 'Фото куратора', type: 'image' }
    ], []);

    const filterFields = useMemo(() => [
        {
            key: 'group_name',
            label: 'Название группы',
            type: 'text',
            placeholder: 'Название группы'
        },
        {
            key: 'course',
            label: 'Курс',
            type: 'number',
            placeholder: 'Курс'
        },
        {
            key: 'admission_year',
            label: 'Год поступления',
            type: 'number',
            placeholder: 'Год поступления'
        },
        {
            key: 'university',
            label: 'Университет',
            type: 'text',
            placeholder: 'Университет'
        },
        {
            key: 'curator_name',
            label: 'Имя куратора',
            type: 'text',
            placeholder: 'Имя куратора'
        },
        {
            key: 'curator_photo',
            label: 'URL фото куратора',
            type: 'text',
            placeholder: 'URL фото куратора'
        },
        {
            key: 'min_course',
            label: 'Минимальный курс',
            type: 'number',
            placeholder: 'Минимальный курс'
        },
        {
            key: 'max_course',
            label: 'Максимальный курс',
            type: 'number',
            placeholder: 'Максимальный курс'
        },
        {
            key: 'min_admission_year',
            label: 'Минимальный год поступления',
            type: 'number',
            placeholder: 'Минимальный год поступления'
        },
        {
            key: 'max_admission_year',
            label: 'Максимальный год поступления',
            type: 'number',
            placeholder: 'Максимальный год поступления'
        }
    ], []);

    const tableHeaders = useMemo(() => [
        { key: 'id', label: '№', sortable: true },
        { key: 'group_name', label: 'Название группы', sortable: true },
        { key: 'course', label: 'Курс', sortable: true },
        { key: 'admission_year', label: 'Год поступления', sortable: true },
        { key: 'university', label: 'Университет', sortable: true },
        { key: 'curator_name', label: 'Куратор', sortable: true },
        { key: 'curator_photo', label: 'Фото куратора', sortable: false }
    ], []);

    const getWordForm = (number) => {
        if (number === 1) return 'группа';
        if (number >= 2 && number <= 4) return 'группы';
        return 'групп';
    };

    const fetchGroups = useCallback(async (params) => {
        setError(null);
        try {
            const url = new URL('http://localhost:8000/group');
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
            setGroups(data.Groups);
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

    const handleRowClick = useCallback((groupId) => {
        const group = groups.find(g => g.id === groupId);
        setSelectedGroup(group);
        setIsEditing(true);
        setIsCreating(false);
    }, [groups]);

    const handleCloseModal = useCallback(() => {
        setSelectedGroup(null);
        setIsEditing(false);
        setIsCreating(false);
    }, []);

    const handleUpdate = useCallback((fieldKey, value) => {
        if (fieldKey === 'confirm') return;
        setSelectedGroup(prev => ({
            ...prev,
            [fieldKey]: value
        }));
    }, []);

    const handleDelete = useCallback(async (groupId) => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/group/delete?element_id=${groupId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при удалении группы';
                throw new Error(errorMessage);
            }

            await fetchGroups({
                group_id: filters.group_id,
                group_name: filters.group_name,
                course: filters.course,
                admission_year: filters.admission_year,
                university: filters.university,
                curator_name: filters.curator_name,
                curator_photo: filters.curator_photo,
                min_course: filters.min_course,
                max_course: filters.max_course,
                min_admission_year: filters.min_admission_year,
                max_admission_year: filters.max_admission_year,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });

            setGroups(prev => prev.filter(group => group.id !== groupId));
            setTotal(prev => prev - 1);
            setSelectedGroup(null);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при удалении группы:', error);
        }
    }, [filters, sortConfig, page, itemsPerPage, fetchGroups, token]);

    const handleSaveChanges = useCallback(async () => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        console.log(token);
        console.log(selectedGroup);

        try {
            const response = await fetch(`http://localhost:8000/group/update?element_id=${selectedGroup.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(selectedGroup)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Произошла ошибка при обновлении');
            }

            await fetchGroups({
                group_id: filters.group_id,
                group_name: filters.group_name,
                course: filters.course,
                admission_year: filters.admission_year,
                university: filters.university,
                curator_name: filters.curator_name,
                curator_photo: filters.curator_photo,
                min_course: filters.min_course,
                max_course: filters.max_course,
                min_admission_year: filters.min_admission_year,
                max_admission_year: filters.max_admission_year,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });

            setSelectedGroup(null);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при обновлении группы:', error);
        }
    }, [selectedGroup, filters, sortConfig, page, itemsPerPage, fetchGroups, token]);

    const handleCreate = useCallback(() => {
        setIsCreating(true);
        setSelectedGroup(null);
    }, []);

    const handleCreateSubmit = useCallback(async (groupData) => {
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/group/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(groupData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при создании группы';
                throw new Error(errorMessage);
            }

            await fetchGroups({
                group_id: filters.group_id,
                group_name: filters.group_name,
                course: filters.course,
                admission_year: filters.admission_year,
                university: filters.university,
                curator_name: filters.curator_name,
                curator_photo: filters.curator_photo,
                min_course: filters.min_course,
                max_course: filters.max_course,
                min_admission_year: filters.min_admission_year,
                max_admission_year: filters.max_admission_year,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });

            setIsCreating(false);
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при создании группы:', error);
        }
    }, [filters, sortConfig, page, itemsPerPage, fetchGroups, token]);

    useEffect(() => {
        document.title = "группы";

        // Сначала выполним первоначальную загрузку
        fetchGroups({
            group_id: filters.group_id,
            group_name: filters.group_name,
            course: filters.course,
            admission_year: filters.admission_year,
            university: filters.university,
            curator_name: filters.curator_name,
            curator_photo: filters.curator_photo,
            min_course: filters.min_course,
            max_course: filters.max_course,
            min_admission_year: filters.min_admission_year,
            max_admission_year: filters.max_admission_year,
            sort_by: sortConfig.key,
            sort_order: sortConfig.direction,
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage
        });

        // Создаем интервал для периодического обновления
        const interval = setInterval(() => {
            console.log('🔄 Автоматическое обновление данных...');
            fetchGroups({
                group_id: filters.group_id,
                group_name: filters.group_name,
                course: filters.course,
                admission_year: filters.admission_year,
                university: filters.university,
                curator_name: filters.curator_name,
                curator_photo: filters.curator_photo,
                min_course: filters.min_course,
                max_course: filters.max_course,
                min_admission_year: filters.min_admission_year,
                max_admission_year: filters.max_admission_year,
                sort_by: sortConfig.key,
                sort_order: sortConfig.direction,
                limit: itemsPerPage,
                offset: (page - 1) * itemsPerPage
            });
        }, REFRESH_INTERVAL);

        // Очищаем интервал при размонтировании компонента
        return () => clearInterval(interval);
    }, [sortConfig, page, itemsPerPage, filters, fetchGroups]);

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
            <h2>группы</h2>
            <div className="table-container">
                <div className="header-wrapper">
                    <button
                        onClick={handleCreate}
                        className="create-button"
                    >
                        Создать группу
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
                        data={groups}
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
                    group_name: '',
                    course: '',
                    admission_year: '',
                    university: '',
                    curator_name: '',
                    curator_photo: ''
                }}
                type="group"
                fields={groupFields}
                onUpdate={handleUpdate}
                onSave={handleCreateSubmit}
            />

            <DynamicModal
                isOpen={isEditing && !!selectedGroup}
                onClose={handleCloseModal}
                data={selectedGroup || {}}
                type="group"
                fields={groupFields}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onSave={handleSaveChanges}
            />
        </>
    );
};

export default Groups;