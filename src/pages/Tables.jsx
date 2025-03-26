import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/list.css';

const Tables = () => {
    const [tables, setTables] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Таблицы";
        const fetchTables = async () => {
            try {
                const response = await fetch('http://localhost:8000/tables');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(data.tables);
                setTables(data.tables);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchTables();
    }, []);

    return (
        <>
            <h2>Таблицы</h2>
            {error ? (
                <p className="error">Ошибка: {error}</p>
            ) : (
                <ul>
                    {tables.map((table, index) => (
                        <li key={index}>
                            <Link to={`/${table}`}>{table}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
};

export default Tables;
