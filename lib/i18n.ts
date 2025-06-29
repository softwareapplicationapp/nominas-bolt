export const languages = {
  en: 'English',
  es: 'Español'
} as const;

export type Language = keyof typeof languages;

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    employees: 'Employees',
    attendance: 'Attendance',
    leaves: 'Leave Management',
    payroll: 'Payroll',
    projects: 'Projects',
    reports: 'Reports',
    settings: 'Settings',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    department: 'Department',
    position: 'Position',
    location: 'Location',
    notes: 'Notes',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    login: 'Login',
    register: 'Register',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    totalEmployees: 'Total Employees',
    presentToday: 'Present Today',
    pendingLeaves: 'Pending Leaves',
    monthlyPayroll: 'Monthly Payroll',
    recentActivities: 'Recent Activities',
    quickActions: 'Quick Actions',
    systemHealth: 'System Health',
    
    // Employees
    employeeManagement: 'Employee Management',
    addEmployee: 'Add Employee',
    editEmployee: 'Edit Employee',
    firstName: 'First Name',
    lastName: 'Last Name',
    startDate: 'Start Date',
    salary: 'Salary',
    employeeId: 'Employee ID',
    active: 'Active',
    inactive: 'Inactive',
    
    // Attendance
    attendanceTracking: 'Attendance Tracking',
    checkIn: 'Check In',
    checkOut: 'Check Out',
    totalHours: 'Total Hours',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    halfDay: 'Half Day',
    attendanceRate: 'Attendance Rate',
    
    // Leaves
    leaveManagement: 'Leave Management',
    requestLeave: 'Request Leave',
    leaveType: 'Leave Type',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    vacation: 'Vacation',
    sick: 'Sick Leave',
    personal: 'Personal',
    emergency: 'Emergency',
    maternity: 'Maternity',
    paternity: 'Paternity',
    
    // Settings
    personalSettings: 'Personal Settings',
    companySettings: 'Company Settings',
    notificationSettings: 'Notification Settings',
    securitySettings: 'Security Settings',
    language: 'Language',
    theme: 'Theme',
    timezone: 'Timezone',
    currency: 'Currency',
    
    // Messages
    saveSuccess: 'Settings saved successfully!',
    saveError: 'Failed to save settings',
    deleteConfirm: 'Are you sure you want to delete this item?',
    loginSuccess: 'Welcome back to ArcusHR!',
    loginError: 'Login failed',
    
    // Employee Portal
    myProfile: 'My Profile',
    myAttendance: 'My Attendance',
    myLeaves: 'My Leave Requests',
    myPayslips: 'My Payslips',
    employeePortal: 'Employee Portal',
    
    // Time
    hours: 'hours',
    days: 'days',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    
    // Company
    companyName: 'Company Name',
    industry: 'Industry',
    address: 'Address',
    website: 'Website',
    workingHours: 'Working Hours',
    workingDays: 'Working Days',
  },
  es: {
    // Navigation
    dashboard: 'Panel de Control',
    employees: 'Empleados',
    attendance: 'Asistencia',
    leaves: 'Gestión de Permisos',
    payroll: 'Nómina',
    projects: 'Proyectos',
    reports: 'Reportes',
    settings: 'Configuración',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    create: 'Crear',
    update: 'Actualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando',
    actions: 'Acciones',
    status: 'Estado',
    date: 'Fecha',
    name: 'Nombre',
    email: 'Correo',
    phone: 'Teléfono',
    department: 'Departamento',
    position: 'Cargo',
    location: 'Ubicación',
    notes: 'Notas',
    
    // Auth
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar Sesión',
    login: 'Acceder',
    register: 'Registrar',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    
    // Dashboard
    welcomeBack: 'Bienvenido de vuelta',
    totalEmployees: 'Total de Empleados',
    presentToday: 'Presentes Hoy',
    pendingLeaves: 'Permisos Pendientes',
    monthlyPayroll: 'Nómina Mensual',
    recentActivities: 'Actividades Recientes',
    quickActions: 'Acciones Rápidas',
    systemHealth: 'Estado del Sistema',
    
    // Employees
    employeeManagement: 'Gestión de Empleados',
    addEmployee: 'Agregar Empleado',
    editEmployee: 'Editar Empleado',
    firstName: 'Nombre',
    lastName: 'Apellido',
    startDate: 'Fecha de Inicio',
    salary: 'Salario',
    employeeId: 'ID de Empleado',
    active: 'Activo',
    inactive: 'Inactivo',
    
    // Attendance
    attendanceTracking: 'Control de Asistencia',
    checkIn: 'Marcar Entrada',
    checkOut: 'Marcar Salida',
    totalHours: 'Horas Totales',
    present: 'Presente',
    absent: 'Ausente',
    late: 'Tarde',
    halfDay: 'Medio Día',
    attendanceRate: 'Tasa de Asistencia',
    
    // Leaves
    leaveManagement: 'Gestión de Permisos',
    requestLeave: 'Solicitar Permiso',
    leaveType: 'Tipo de Permiso',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    reason: 'Motivo',
    approve: 'Aprobar',
    reject: 'Rechazar',
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    vacation: 'Vacaciones',
    sick: 'Enfermedad',
    personal: 'Personal',
    emergency: 'Emergencia',
    maternity: 'Maternidad',
    paternity: 'Paternidad',
    
    // Settings
    personalSettings: 'Configuración Personal',
    companySettings: 'Configuración de Empresa',
    notificationSettings: 'Configuración de Notificaciones',
    securitySettings: 'Configuración de Seguridad',
    language: 'Idioma',
    theme: 'Tema',
    timezone: 'Zona Horaria',
    currency: 'Moneda',
    
    // Messages
    saveSuccess: '¡Configuración guardada exitosamente!',
    saveError: 'Error al guardar la configuración',
    deleteConfirm: '¿Estás seguro de que quieres eliminar este elemento?',
    loginSuccess: '¡Bienvenido de vuelta a ArcusHR!',
    loginError: 'Error al iniciar sesión',
    
    // Employee Portal
    myProfile: 'Mi Perfil',
    myAttendance: 'Mi Asistencia',
    myLeaves: 'Mis Solicitudes de Permiso',
    myPayslips: 'Mis Recibos de Pago',
    employeePortal: 'Portal del Empleado',
    
    // Time
    hours: 'horas',
    days: 'días',
    today: 'Hoy',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    
    // Company
    companyName: 'Nombre de la Empresa',
    industry: 'Industria',
    address: 'Dirección',
    website: 'Sitio Web',
    workingHours: 'Horario de Trabajo',
    workingDays: 'Días Laborales',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;