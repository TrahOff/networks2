import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToken, setLoading, setError, setUserData, removeToken } from '../../redux/authSlice';
import '../../styles/profile.css';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector(state => state.auth.token);
    const userData = useSelector(state => state.auth.user);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formChanges, setFormChanges] = useState(false);
    const [formData, setFormData] = useState({
        username: userData?.username || '',
        full_name: userData?.full_name || '',
        email: userData?.email || '',
        password: userData?.password || '',
        originalPassword: userData?.password || '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        document.title = "Профиль";
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        loadUserProfile();
    }, [token, navigate]);

    const loadUserProfile = async () => {
        try {
            dispatch(setLoading(true));
            const response = await fetch('http://localhost:8000/protected-route', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке профиля');
            }

            const data = await response.json();
            const userData = data.current_user;
            dispatch(setUserData(userData));
            setFormData({
                username: userData.username,
                full_name: userData.full_name,
                email: userData.email,
                password: userData.password,
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            dispatch(setError(error.message || 'Ошибка при загрузке профиля'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let newPassword = '';
        if (name === 'confirmPassword' && value === formData.newPassword && value !== '') {
            newPassword = value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
            password: newPassword || prev.password
        }));

        const originalData = {
            username: userData?.username || '',
            full_name: userData?.full_name || '',
            email: userData?.email || '',
            password: userData?.password || ''
        };

        const hasBasicChanges = Object.keys(originalData).some(key =>
            originalData[key] !== formData[key]
        );
        setFormChanges(hasBasicChanges || (newPassword !== ''));
    };

    const handleUpdate = async () => {
        try {
            dispatch(setLoading(true));
            const response = await fetch('http://localhost:8000/users/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении профиля');
            }

            const data = await response.json();
            dispatch(setUserData(data));
            setFormChanges(false);
            setShowSuccessModal(true);

            const timer = setTimeout(() => {
                setShowSuccessModal(false);
            }, 3000);

            return () => clearTimeout(timer);
        } catch (error) {
            dispatch(setError(error.message || 'Ошибка при обновлении профиля'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        dispatch(setToken(null));
        dispatch(removeToken(true));
        navigate('/login', { replace: true });
    };

    const handleDelete = async () => {
        try {
            dispatch(setLoading(true));
            const response = await fetch('http://localhost:8000/users/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении профиля');
            }

            // Удаляем токен и очищаем Redux
            localStorage.removeItem('access_token');
            dispatch(setToken(null));
            dispatch(removeToken(true));

            // Перенаправляем на страницу входа
            navigate('/login', { replace: true });

        } catch (error) {
            dispatch(setError(error.message || 'Ошибка при удалении профиля'));
        } finally {
            dispatch(setLoading(false));
            setShowDeleteModal(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    return (
        <div className="profile-container">
            <h2>Профиль пользователя</h2>
            <div className="profile-info">
                <h3>Данные пользователя</h3>
                <form className="profile-form">
                    <div className="form-group">
                        <label htmlFor="username">Имя пользователя:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="full_name">Полное имя:</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">Новый пароль:</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Подтвердите пароль:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="form-control"
                        />
                    </div>
                </form>
                {showDeleteModal && (
                    <div className="notification-modal">
                        <div className="notification-content">
                            <h3>Подтверждение удаления</h3>
                            <p>Вы уверены, что хотите удалить свой профиль?</p>
                            <div className="modal-buttons">
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger"
                                >
                                    Удалить
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="profile-buttons">
                    <button
                        onClick={handleUpdate}
                        className="btn btn-secondary"
                        disabled={!formChanges}
                    >
                        Обновить
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn btn-danger"
                    >
                        Удалить
                    </button>
                </div>
                <button
                    onClick={handleLogout}
                    className="logout-button"
                >
                    Выйти
                </button>
            </div>

            {/* Модальное окно уведомления */}
            {showSuccessModal && (
                <div className="notification-modal">
                    <div className="notification-content">
                        <h3>Данные успешно обновлены!</h3>
                        <p>Ваши изменения сохранены.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;