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

const Students = () => {
  const [students, setStudents] = useState([]);
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
    full_name: '',
    group_id: '',
    address: ''
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const token = useSelector(state => state.auth.token);
  const userData = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  const studentFields = useMemo(() => [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'Полное имя' },
    { key: 'group_id', label: 'группа' },
    { key: 'address', label: 'Адрес' }
  ], []);

  const filterFields = useMemo(() => [
    { key: 'full_name', label: 'Полное имя', type: 'text', placeholder: 'Полное имя' },
    { key: 'group_id', label: 'группа', type: 'text', placeholder: 'Название группы' },
    { key: 'address', label: 'Адрес', type: 'text', placeholder: 'Адрес' }
  ], []);

  const tableHeaders = useMemo(() => [
    { key: 'id', label: '№', sortable: true },
    { key: 'full_name', label: 'Полное имя', sortable: true },
    { key: 'group_id', label: 'группа', sortable: true },
    { key: 'address', label: 'Адрес', sortable: true }
  ], []);

  const getWordForm = (number) => {
    if (number === 1) return 'запись';
    if (number >= 2 && number <= 4) return 'записи';
    return 'записей';
  };

  const fetchGroups = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/group');
      const data = await response.json();
      setGroups(data.Groups);
    } catch (error) {
      console.error('Ошибка при загрузке групп:', error);
    }
  }, []);

  const fetchStudents = async (params) => {
    setError(null);
    try {
      const url = new URL('http://localhost:8000/students');
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== '') {
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
      setStudents(data.Students);
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

  const getGroupName = useCallback((groupId) => {
    return groups.find(group => group.id === groupId)?.group_name || String(groupId);
  }, [groups]);

  const handleRowClick = useCallback((studentId) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent({
      ...student,
      group_id: getGroupName(student.group_id)
    });
    setIsEditing(true);
    setIsCreating(false);
  }, [students, getGroupName]);

  const handleCloseModal = useCallback(() => {
    setSelectedStudent(null);
    setIsEditing(false);
    setIsCreating(false);
  }, []);

  const handleUpdate = useCallback((fieldKey, value) => {
    if (fieldKey === 'confirm') return;
    setSelectedStudent(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  }, []);

  const handleDelete = useCallback(async (studentId) => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/students/delete?element_id=${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при удалении студента';
        throw new Error(errorMessage);
      }
      await fetchStudents({
        student_id: null,
        full_name: filters.full_name,
        group_id: filters.group_id,
        address: filters.address,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      });
      setStudents(prev => prev.filter(student => student.id !== studentId));
      setTotal(prev => prev - 1);
      setSelectedStudent(null);
    } catch (error) {
      setError(error.message);
      console.error('Ошибка при удалении студента:', error);
    }
  }, [filters, sortConfig, page, itemsPerPage, fetchStudents]);

  const handleSaveChanges = useCallback(async () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/students/update?element_id=${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...selectedStudent,
          group_id: parseInt(groups.find(group => group.group_name === selectedStudent.group_id)?.id)
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Произошла ошибка при обновлении');
      }
      await fetchStudents({
        student_id: null,
        full_name: filters.full_name,
        group_id: filters.group_id,
        address: filters.address,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      });
      setSelectedStudent(null);
    } catch (error) {
      setError(error.message);
      console.error(error);
    }
  }, [selectedStudent, filters, sortConfig, page, itemsPerPage, fetchStudents]);

  const handleCreate = useCallback(() => {
    setIsCreating(true);
    setSelectedStudent(null);
  }, []);

  const handleCreateSubmit = useCallback(async (studentData) => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/students/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...studentData,
          group_id: parseInt(groups.find(group => group.group_name === studentData.group_id)?.id)
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.detail || errorData?.message || 'Произошла ошибка при создании студента';
        throw new Error(errorMessage);
      }
      await fetchStudents({
        student_id: null,
        full_name: filters.full_name,
        group_id: filters.group_id,
        address: filters.address,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      });
      setIsCreating(false);
    } catch (error) {
      setError(error.message);
      console.error('Ошибка при создании студента:', error);
    }
  }, [filters, sortConfig, page, itemsPerPage, fetchStudents, token, groups]);

  useEffect(() => {
    document.title = "студенты";
    // Сначала выполним первоначальную загрузку
    fetchGroups();
    fetchStudents({
      student_id: null,
      full_name: filters.full_name,
      group_id: filters.group_id,
      address: filters.address,
      sort_by: sortConfig.key,
      sort_order: sortConfig.direction,
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage
    });
    // Создаем интервал для периодического обновления
    const interval = setInterval(() => {
      console.log('🔄 Автоматическое обновление данных...');
      fetchStudents({
        student_id: null,
        full_name: filters.full_name,
        group_id: filters.group_id,
        address: filters.address,
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
      <h2>студенты</h2>
      <div className="table-container">
        <div className="header-wrapper">
          <button
            onClick={handleCreate}
            className="create-button"
          >
            Создать студента
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
            data={students.map(student => ({
              ...student,
              group_id: getGroupName(student.group_id)
            }))}
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
          full_name: '',
          group_id: '',
          address: ''
        }}
        type="student"
        fields={studentFields}
        onUpdate={handleUpdate}
        onSave={handleCreateSubmit}
      />
      <DynamicModal
        isOpen={isEditing && !!selectedStudent}
        onClose={handleCloseModal}
        data={selectedStudent || {}}
        type="student"
        fields={studentFields}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onSave={handleSaveChanges}
      />
    </>
  );
};

export default Students;