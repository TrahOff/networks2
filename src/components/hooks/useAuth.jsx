import { useSelector, useDispatch } from 'react-redux';
import { setToken, clearToken, setError, clearError } from '../store/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const { token, isAuthenticated, error } = useSelector(state => state.auth);

    const handleToken = (token) => {
        if (token) {
            dispatch(setToken(token));
            localStorage.setItem('auth_token', token);
        } else {
            dispatch(clearToken());
            localStorage.removeItem('auth_token');
        }
    };

    const handleError = (error) => {
        dispatch(setError(error));
        setTimeout(() => dispatch(clearError()), 5000);
    };

    return {
        token,
        isAuthenticated,
        error,
        handleToken,
        handleError
    };
};