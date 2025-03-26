import React, { useEffect, useState } from 'react';
import '../styles/main_page.css';

const Home = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Главная страница";
        const fetchMessage = async () => {
            try {
                const response = await fetch('http://localhost:8000/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMessage(data.message);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchMessage();
    }, []);

    return (
        <>
            <h2>Добро пожаловать в моё приложение!</h2>
            {error ? (
                <p>Error: {error}</p>
            ) : (
                <p>{message}</p>
            )}
        </>
    );
};

export default Home;
