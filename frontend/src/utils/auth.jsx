export const ROLES = {
    DIRECTOR: 1,
    SUBDIRECTOR: 2,
    COORDINADOR: 3,
    EMPLEADO: 4,
    ESTUDIANTE: 5
};

// Si no hay usuario en localStorage, por defecto es ESTUDIANTE (5)
export const getUserRole = () => {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?.rol !== undefined ? Number(user.rol) : ROLES.ESTUDIANTE;
    } catch (error) {
        return ROLES.ESTUDIANTE;
    }
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || '';
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Función auxiliar para probar roles desde la consola del navegador
export const setTestRole = (rolId) => {
    localStorage.setItem('user', JSON.stringify({ rol: rolId }));
    window.location.reload();
};