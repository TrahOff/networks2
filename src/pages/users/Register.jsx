import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '../../redux/authSlice';
import '../../styles/user_form.css';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Регистрация";
    }, []);

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            full_name: ''
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
            full_name: Yup.string()
                .min(3, 'Имя должно содержать минимум 3 символа')
                .max(100, 'Имя не должно превышать 100 символов')
                .required('Обязательное поле')
        }),
        onSubmit: async (values) => {
            try {
                dispatch(setLoading(true));
                const response = await fetch('http://localhost:8000/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Ошибка при регистрации');
                }

                setErrorMessage('');
                navigate('/login', {
                    state: { fromRegistration: true },
                    replace: true
                });
            } catch (error) {
                dispatch(setError(error.message));
                setErrorMessage(error.message || 'Ошибка при регистрации. Пожалуйста, проверьте введенные данные.');
            } finally {
                dispatch(setLoading(false));
            }
        },
    });

    return (
        <>
            <h2>Регистрация</h2>
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
                    <label htmlFor="full_name">Полное имя</label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.full_name}
                    />
                    {formik.touched.full_name && formik.errors.full_name ? (
                        <div style={{ color: 'red' }}>{formik.errors.full_name}</div>
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

                <button type="submit">Зарегистрироваться</button>
            </form>
            <Link to="/login">Авторизация</Link>
        </>
    );
};

export default Register;