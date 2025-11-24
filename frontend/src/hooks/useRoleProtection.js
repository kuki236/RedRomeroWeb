import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to check user role from localStorage and enforce route access.
 * If the role does not match the requirement, the user is redirected to the login page.
 * @param {string} requiredRole - The role string required for access (e.g., 'ADMIN').
 */
export const useRoleProtection = (requiredRole) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Read role from local storage
        const userRole = localStorage.getItem('role');
        
        // If no role is found or the role does not match, redirect to login
        if (!userRole || userRole !== requiredRole) {
            console.warn(`Access denied. Role: ${userRole} tried to access ${requiredRole} dashboard.`);
            navigate('/', { replace: true }); 
        }
    }, [navigate, requiredRole]);
};