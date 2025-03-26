import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../../styles/user_form.css';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        document.title = "Авторизация";
        
        const token = localStorage.getItem('access_token');
        console.log(token);
        if (token) {
            console.log('Токен загружен:', token);
        }
    }, []);

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .min(3, 'Имя пользователя должно содержать минимум 3 символа')
                .max(15, 'Имя пользователя не должно превышать 15 символов')
                .required('Обязательное поле'),
            email: Yup.string()
                .email('Неверный адрес электронной почты')
                .required('Обязательное поле'),
            password: Yup.string()
                .max(100, 'Пароль не должен превышать 100 символов')
                .required('Обязательное поле'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await fetch('http://localhost:8000/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                    credentials: 'include',
                });
                console.log(response);
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Ошибка при авторизации');
                }
        
                const data = await response.json();
                console.log('Успех:', data);
                
                localStorage.setItem('access_token', data.access_token);
                setErrorMessage('');
            } catch (error) {
                console.error('Ошибка:', error);
                setErrorMessage(error.message || 'Ошибка при авторизации. Пожалуйста, проверьте свои данные.');
            }
        },
    });

    return (
        <>
            <h2>Авторизация</h2>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <label htmlFor="username">Имя пользователя</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                    />
                    {formik.touched.username && formik.errors.username ? (
                        <div style={{ color: 'red' }}>{formik.errors.username}</div>
                    ) : null}
                </div>
                <div>
                    <label htmlFor="email">Электронная почта</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? (
                        <div style={{ color: 'red' }}>{formik.errors.email}</div>
                    ) : null}
                </div>
                <div>
                    <label htmlFor="password">Пароль</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div style={{ color: 'red' }}>{formik.errors.password}</div>
                    ) : null}
                </div>
                <button type="submit">Войти</button>
            </form>
            <a href="#">Регистрация</a>
        </>
    );
};

export default Login;
