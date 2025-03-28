import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { setToken, setLoading, setError } from '../../redux/authSlice';
import '../../styles/user_form.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = "Авторизация";
        const token = localStorage.getItem('access_token');
        if (token) {
            dispatch(setToken(token));
            navigate('/profile', { replace: true });
        }

        const fromRegistration = location.state?.fromRegistration;
        if (fromRegistration) {
            setShowRegistrationSuccess(true);
            const timer = setTimeout(() => {
                setShowRegistrationSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [dispatch, location.state]);

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
                dispatch(setLoading(true));
                const response = await fetch('http://localhost:8000/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Ошибка при авторизации');
                }

                const data = await response.json();
                dispatch(setToken(data.access_token));
                setErrorMessage('');
                navigate('/profile', { replace: true });
            } catch (error) {
                dispatch(setError(error.message));
                setErrorMessage(error.message || 'Ошибка при авторизации. Пожалуйста, проверьте свои данные.');
            } finally {
                dispatch(setLoading(false));
            }
        },
    });

    return (
        <>
            <h2>Авторизация</h2>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

            {/* Модальное окно уведомления */}
            {showRegistrationSuccess && (
                <div className="notification-modal">
                    <div className={`notification-content ${showRegistrationSuccess ? '' : 'exiting'}`}>
                        <h3>Регистрация успешна!</h3>
                        <p>Теперь вы можете войти в систему.</p>
                    </div>
                </div>
            )}

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

                <button type="submit">Авторизоваться</button>
            </form>
            <Link to="/register">Регистрация</Link>
        </>
    );
};

export default Login;