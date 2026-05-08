import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authActions } from '../store';

const IDLE_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export const useIdleTimeout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const handleLogout = useCallback(() => {
    Cookies.remove('token');
    dispatch(authActions.logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);

  const resetTimer = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT_MS);
  }, [handleLogout]);

  useEffect(() => {
    resetTimer();
    IDLE_EVENTS.forEach(event =>
      window.addEventListener(event, resetTimer, { passive: true })
    );
    return () => {
      clearTimeout(timerRef.current);
      IDLE_EVENTS.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);
};
