import React from 'react';
import { 
    Dashboard, Business, Folder, People, VolunteerActivism, Description,
    Badge, SupervisorAccount, Loyalty, Group, Assessment, ReceiptLong, Tune,
    CheckCircle, MonetizationOn, Star, Search as SearchIcon
} from '@mui/icons-material';

// Define navigation items per role
export const roleNavigation = {
    ADMIN: [
        { header: 'General' },
        { text: 'Dashboard', icon: <Dashboard />, link: '/dashboard/admin' },
        { header: 'Main Management' },
        { text: 'Manage ONGs', icon: <Business />, link: '/admin/ongs' },
        { text: 'Manage Projects', icon: <Folder />, link: '/admin/projects' },
        { header: 'Workforce' },
        { text: 'Employees', icon: <Badge />, link: '/admin/employee' },
        { text: 'Volunteers', icon: <VolunteerActivism />, link: '/admin/volunteer' },
        { text: 'Representatives', icon: <SupervisorAccount />, link: '/admin/representative' },
        { header: 'Finance & Users' },
        { text: 'Donors', icon: <Loyalty />, link: '/admin/donors' },
        { text: 'Users', icon: <Group />, link: '/admin/usuarios' },
        { header: 'System' },
        { text: 'Reports', icon: <Assessment />, link: '/admin/reportes' },
        { text: 'Audit Logs', icon: <ReceiptLong />, link: '/admin/audit-logs' },
        { text: 'Config', icon: <Tune />, link: '/admin/config' },
    ],
    EMPLOYEE: [
        { header: 'Operations' },
        { text: 'Dashboard', icon: <Dashboard />, link: '/dashboard/employee' },
        { text: 'My Approvals', icon: <CheckCircle />, link: '/employee/aprobaciones' },
        { text: 'Projects', icon: <Folder />, link: '/employee/proyectos' },
        { text: 'Budgets', icon: <MonetizationOn />, link: '/employee/presupuestos' },
        { text: 'Staffing', icon: <VolunteerActivism />, link: '/employee/voluntarios' },
        { text: 'Donations', icon: <Loyalty />, link: '/employee/donaciones' },
        { text: 'Reports', icon: <Description />, link: '/employee/reportes' },
    ],
    REPRESENTATIVE: [
        { header: 'NGO Management' },
        { text: 'Dashboard', icon: <Dashboard />, link: '/dashboard/representative' },
        { text: 'My Projects', icon: <Folder />, link: '/representative/proyectos' },
        { text: 'Requests', icon: <CheckCircle />, link: '/representative/aprobaciones' },
        { text: 'Donations', icon: <Loyalty />, link: '/representative/donaciones' },
        { text: 'Reports', icon: <Description />, link: '/representative/reportes' },
        { text: 'My NGO', icon: <Business />, link: '/representative/mi-ong' },
    ],
    VOLUNTEER: [
        { header: 'My Activity' },
        { text: 'Dashboard', icon: <Dashboard />, link: '/dashboard/volunteer' },
        { text: 'My Projects', icon: <Folder />, link: '/volunteer/proyectos' },
        { text: 'Specialties', icon: <Star />, link: '/volunteer/especialidades' },
        { text: 'Explore', icon: <SearchIcon />, link: '/volunteer/explorar-proyectos' },
    ]
};