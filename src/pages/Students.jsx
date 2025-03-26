import React, { useEffect, useState, useMemo } from 'react';
import '../styles/table.css';
import DynamicTable from '../components/DynamicTable';
import DynamicFilterForm from '../components/DynamicFylterForm';
import DynamicPagination from '../components/DynamicPagination';
import DynamicItemsPerPage from '../components/DynamicItemsPerPage';

const Students = () => {
  const [students, setStudents] = useState([]);
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
  const filterFields = useMemo(() => [
    { key: 'full_name', label: 'Полное имя', type: 'text', placeholder: 'Полное имя' },
    { key: 'group_id', label: 'ID группы', type: 'text', placeholder: 'ID группы' },
    { key: 'address', label: 'Адрес', type: 'text', placeholder: 'Адрес' }
  ], []);

  const tableHeaders = useMemo(() => [
    { key: 'id', label: '№', sortable: true },
    { key: 'full_name', label: 'Полное имя', sortable: true },
    { key: 'group_id', label: 'ID группы', sortable: true },
    { key: 'address', label: 'Адрес', sortable: true }
  ], []);

  const getWordForm = (number) => {
    if (number === 1) return 'запись';
    if (number >= 2 && number <= 4) return 'записи';
    return 'записей';
  };

  const fetchStudents = async (params) => {
    setError(null);
    try {
      const url = new URL('http://localhost:8000/students');
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });

      console.log('URL:', url.toString());
      console.log('Параметры:', Object.fromEntries(url.searchParams));

      const response = await fetch(url.toString(), {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Произошла ошибка');
      }

      const data = await response.json();
      console.log('Полученные данные:', data);

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

  useEffect(() => {
    document.title = "студенты";
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
      <h2>студенты</h2>
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
            data={students}
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

export default Students;