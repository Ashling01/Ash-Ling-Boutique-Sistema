// Empleados Management
class EmpleadosManager {
    constructor() {
        this.employees = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.sortColumn = 'firstName';
        this.sortDirection = 'asc';
        this.filters = {
            department: '',
            status: '',
            position: '',
            search: ''
        };
        this.currentEmployee = null;
        
        this.init();
    }

    init() {
        this.loadEmployees();
        this.setupEventListeners();
        this.renderEmployees();
        this.updateStats();
    }

    setupEventListeners() {
        // Main actions
        document.getElementById('newEmployeeBtn').addEventListener('click', () => this.openEmployeeModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportEmployees());
        document.getElementById('payrollBtn').addEventListener('click', () => this.processPayroll());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Filters
        document.getElementById('departmentFilter').addEventListener('change', (e) => this.applyFilter('department', e.target.value));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.applyFilter('status', e.target.value));
        document.getElementById('positionFilter').addEventListener('change', (e) => this.applyFilter('position', e.target.value));
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());
        
        // Modal actions
        document.getElementById('closeModal').addEventListener('click', () => this.closeEmployeeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeEmployeeModal());
        document.getElementById('saveEmployeeBtn').addEventListener('click', () => this.saveEmployee());
        
        // Detail modal
        document.getElementById('closeDetailModal').addEventListener('click', () => this.closeDetailModal());
        document.getElementById('closeDetailBtn').addEventListener('click', () => this.closeDetailModal());
        document.getElementById('editEmployeeBtn').addEventListener('click', () => this.editFromDetail());
        
        // Pagination
        document.getElementById('prevPageBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPageBtn').addEventListener('click', () => this.nextPage());
        
        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }
    }

    loadEmployees() {
        const stored = localStorage.getItem('ash_ling_employees');
        if (stored) {
            this.employees = JSON.parse(stored);
        } else {
            this.employees = this.generateSampleEmployees();
            this.saveEmployees();
        }
    }

    saveEmployees() {
        localStorage.setItem('ash_ling_employees', JSON.stringify(this.employees));
    }

    generateSampleEmployees() {
        const departments = ['ventas', 'marketing', 'desarrollo', 'administracion', 'recursos_humanos'];
        const positions = ['manager', 'supervisor', 'employee', 'intern'];
        const statuses = ['active', 'inactive', 'vacation', 'medical_leave'];
        
        const firstNames = ['Ana', 'Carlos', 'María', 'José', 'Carmen', 'Miguel', 'Elena', 'Francisco', 'Isabel', 'Antonio', 'Laura', 'Rafael', 'Sofía', 'Diego', 'Patricia'];
        const lastNames = ['García', 'Rodríguez', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Cruz', 'Torres', 'Flores', 'Morales', 'Jiménez', 'Ruiz', 'Herrera'];
        
        const employees = [];
        
        for (let i = 1; i <= 25; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const department = departments[Math.floor(Math.random() * departments.length)];
            const position = positions[Math.floor(Math.random() * positions.length)];
            const status = i <= 20 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)];
            
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365 * 3));
            
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - (25 + Math.floor(Math.random() * 20)));
            
            let salary;
            switch (position) {
                case 'manager': salary = 8000 + Math.random() * 4000; break;
                case 'supervisor': salary = 6000 + Math.random() * 2000; break;
                case 'employee': salary = 3000 + Math.random() * 3000; break;
                case 'intern': salary = 1500 + Math.random() * 1000; break;
                default: salary = 4000;
            }
            
            employees.push({
                id: i,
                employeeId: `EMP${String(i).padStart(4, '0')}`,
                firstName: firstName,
                lastName: lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ash-ling.com`,
                phone: `+52 55 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
                birthDate: birthDate.toISOString().split('T')[0],
                nationalId: `${Math.floor(Math.random() * 900000000) + 100000000}`,
                address: `Calle ${Math.floor(Math.random() * 200) + 1}, Col. Centro, Ciudad de México`,
                startDate: startDate.toISOString().split('T')[0],
                department: department,
                position: position,
                salary: parseFloat(salary.toFixed(2)),
                contractType: Math.random() > 0.8 ? 'part_time' : 'full_time',
                supervisor: i > 5 ? Math.floor(Math.random() * 5) + 1 : null,
                status: status,
                emergencyName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                emergencyPhone: `+52 55 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
                emergencyRelation: ['Esposo/a', 'Padre', 'Madre', 'Hermano/a', 'Hijo/a'][Math.floor(Math.random() * 5)],
                notes: Math.random() > 0.7 ? 'Empleado destacado con excelente desempeño.' : '',
                createdAt: startDate.toISOString()
            });
        }
        
        return employees;
    }

    renderEmployees() {
        const filteredEmployees = this.getFilteredEmployees();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);
        
        const grid = document.getElementById('employeesGrid');
        grid.innerHTML = '';
        
        paginatedEmployees.forEach(employee => {
            const card = document.createElement('div');
            card.className = 'employee-card';
            card.innerHTML = `
                <div class="employee-header">
                    <img src="https://via.placeholder.com/80" alt="${employee.firstName}" class="employee-avatar">
                    <div class="employee-info">
                        <h3>${employee.firstName} ${employee.lastName}</h3>
                        <p class="employee-title">${this.getPositionText(employee.position)}</p>
                        <p class="employee-department">${this.getDepartmentText(employee.department)}</p>
                    </div>
                    <span class="status ${employee.status}">${this.getStatusText(employee.status)}</span>
                </div>
                <div class="employee-details">
                    <div class="detail-item">
                        <i class="fas fa-id-card"></i>
                        <span>${employee.employeeId}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${employee.email}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${employee.phone}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Desde ${this.formatDate(employee.startDate)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>$${employee.salary.toFixed(2)}</span>
                    </div>
                </div>
                <div class="employee-actions">
                    <button class="btn btn-outline btn-sm" onclick="empleadosManager.viewEmployee(${employee.id})">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="empleadosManager.editEmployee(${employee.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="empleadosManager.deleteEmployee(${employee.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
        
        this.updatePagination(filteredEmployees.length);
        this.updatePaginationInfo(filteredEmployees.length, startIndex, Math.min(endIndex, filteredEmployees.length));
    }

    getFilteredEmployees() {
        let filtered = [...this.employees];
        
        // Apply filters
        if (this.filters.department) {
            filtered = filtered.filter(emp => emp.department === this.filters.department);
        }
        
        if (this.filters.status) {
            filtered = filtered.filter(emp => emp.status === this.filters.status);
        }
        
        if (this.filters.position) {
            filtered = filtered.filter(emp => emp.position === this.filters.position);
        }
        
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(emp => 
                emp.firstName.toLowerCase().includes(search) ||
                emp.lastName.toLowerCase().includes(search) ||
                emp.email.toLowerCase().includes(search) ||
                emp.employeeId.toLowerCase().includes(search)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            if (this.sortColumn === 'salary') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }

    updateStats() {
        const stats = this.calculateStats();
        
        document.getElementById('totalEmployees').textContent = stats.total;
        document.getElementById('activeEmployees').textContent = stats.active;
        document.getElementById('onVacation').textContent = stats.vacation;
        document.getElementById('monthlyPayroll').textContent = `$${stats.payroll.toFixed(2)}`;
    }

    calculateStats() {
        const total = this.employees.length;
        const active = this.employees.filter(emp => emp.status === 'active').length;
        const vacation = this.employees.filter(emp => emp.status === 'vacation').length;
        const payroll = this.employees
            .filter(emp => emp.status === 'active')
            .reduce((sum, emp) => sum + emp.salary, 0);
        
        return { total, active, vacation, payroll };
    }

    openEmployeeModal(employee = null) {
        this.currentEmployee = employee;
        const modal = document.getElementById('employeeModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (employee) {
            modalTitle.textContent = `Editar Empleado - ${employee.firstName} ${employee.lastName}`;
            this.populateEmployeeForm(employee);
        } else {
            modalTitle.textContent = 'Nuevo Empleado';
            this.resetEmployeeForm();
            this.generateEmployeeId();
        }
        
        this.populateSupervisorSelect();
        modal.classList.add('active');
    }

    closeEmployeeModal() {
        const modal = document.getElementById('employeeModal');
        modal.classList.remove('active');
        this.currentEmployee = null;
    }

    generateEmployeeId() {
        const lastEmployee = this.employees.reduce((max, emp) => {
            const num = parseInt(emp.employeeId.substring(3));
            return num > max ? num : max;
        }, 0);
        
        const newId = `EMP${String(lastEmployee + 1).padStart(4, '0')}`;
        document.getElementById('employeeId').value = newId;
    }

    populateSupervisorSelect() {
        const supervisorSelect = document.getElementById('supervisor');
        const supervisors = this.employees.filter(emp => 
            emp.position === 'manager' || emp.position === 'supervisor'
        );
        
        supervisorSelect.innerHTML = '<option value="">Sin supervisor...</option>';
        supervisors.forEach(supervisor => {
            const option = document.createElement('option');
            option.value = supervisor.id;
            option.textContent = `${supervisor.firstName} ${supervisor.lastName} - ${this.getPositionText(supervisor.position)}`;
            supervisorSelect.appendChild(option);
        });
    }

    resetEmployeeForm() {
        document.getElementById('employeeForm').reset();
        document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
    }

    populateEmployeeForm(employee) {
        document.getElementById('employeeId').value = employee.employeeId;
        document.getElementById('firstName').value = employee.firstName;
        document.getElementById('lastName').value = employee.lastName;
        document.getElementById('email').value = employee.email;
        document.getElementById('phone').value = employee.phone;
        document.getElementById('birthDate').value = employee.birthDate;
        document.getElementById('nationalId').value = employee.nationalId;
        document.getElementById('address').value = employee.address;
        document.getElementById('startDate').value = employee.startDate;
        document.getElementById('department').value = employee.department;
        document.getElementById('position').value = employee.position;
        document.getElementById('salary').value = employee.salary;
        document.getElementById('contractType').value = employee.contractType;
        document.getElementById('supervisor').value = employee.supervisor || '';
        document.getElementById('status').value = employee.status;
        document.getElementById('emergencyName').value = employee.emergencyName;
        document.getElementById('emergencyPhone').value = employee.emergencyPhone;
        document.getElementById('emergencyRelation').value = employee.emergencyRelation;
        document.getElementById('notes').value = employee.notes || '';
    }

    saveEmployee() {
        const form = document.getElementById('employeeForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const employeeData = {
            employeeId: formData.get('employeeId'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            birthDate: formData.get('birthDate'),
            nationalId: formData.get('nationalId'),
            address: formData.get('address'),
            startDate: formData.get('startDate'),
            department: formData.get('department'),
            position: formData.get('position'),
            salary: parseFloat(formData.get('salary')),
            contractType: formData.get('contractType'),
            supervisor: formData.get('supervisor') ? parseInt(formData.get('supervisor')) : null,
            status: formData.get('status'),
            emergencyName: formData.get('emergencyName'),
            emergencyPhone: formData.get('emergencyPhone'),
            emergencyRelation: formData.get('emergencyRelation'),
            notes: formData.get('notes') || '',
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentEmployee) {
            // Update existing employee
            const index = this.employees.findIndex(emp => emp.id === this.currentEmployee.id);
            this.employees[index] = { ...this.currentEmployee, ...employeeData };
        } else {
            // Create new employee
            employeeData.id = Date.now();
            employeeData.createdAt = new Date().toISOString();
            this.employees.push(employeeData);
        }
        
        this.saveEmployees();
        this.renderEmployees();
        this.updateStats();
        this.closeEmployeeModal();
        
        // Show success message
        this.showNotification(
            this.currentEmployee ? 'Empleado actualizado exitosamente' : 'Empleado creado exitosamente',
            'success'
        );
    }

    viewEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.showEmployeeDetail(employee);
        }
    }

    showEmployeeDetail(employee) {
        const modal = document.getElementById('employeeDetailModal');
        const title = document.getElementById('detailModalTitle');
        const content = document.getElementById('employeeDetailContent');
        
        title.textContent = `${employee.firstName} ${employee.lastName}`;
        
        content.innerHTML = `
            <div class="employee-detail-grid">
                <div class="detail-section">
                    <h4>Información Personal</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>ID Empleado:</label>
                            <span>${employee.employeeId}</span>
                        </div>
                        <div class="detail-item">
                            <label>Nombre Completo:</label>
                            <span>${employee.firstName} ${employee.lastName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Email:</label>
                            <span>${employee.email}</span>
                        </div>
                        <div class="detail-item">
                            <label>Teléfono:</label>
                            <span>${employee.phone}</span>
                        </div>
                        <div class="detail-item">
                            <label>Fecha de Nacimiento:</label>
                            <span>${this.formatDate(employee.birthDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Cédula:</label>
                            <span>${employee.nationalId}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Dirección:</label>
                            <span>${employee.address}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Información Laboral</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Fecha de Inicio:</label>
                            <span>${this.formatDate(employee.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Departamento:</label>
                            <span>${this.getDepartmentText(employee.department)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Posición:</label>
                            <span>${this.getPositionText(employee.position)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Salario:</label>
                            <span>$${employee.salary.toFixed(2)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Tipo de Contrato:</label>
                            <span>${this.getContractTypeText(employee.contractType)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Estado:</label>
                            <span class="status ${employee.status}">${this.getStatusText(employee.status)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Supervisor:</label>
                            <span>${this.getSupervisorName(employee.supervisor)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Contacto de Emergencia</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Nombre:</label>
                            <span>${employee.emergencyName}</span>
                        </div>
                        <div class="detail-item">
                            <label>Teléfono:</label>
                            <span>${employee.emergencyPhone}</span>
                        </div>
                        <div class="detail-item">
                            <label>Relación:</label>
                            <span>${employee.emergencyRelation}</span>
                        </div>
                    </div>
                </div>
                
                ${employee.notes ? `
                <div class="detail-section">
                    <h4>Notas</h4>
                    <p class="notes-text">${employee.notes}</p>
                </div>
                ` : ''}
            </div>
        `;
        
        modal.classList.add('active');
        this.currentDetailEmployee = employee;
    }

    closeDetailModal() {
        const modal = document.getElementById('employeeDetailModal');
        modal.classList.remove('active');
        this.currentDetailEmployee = null;
    }

    editFromDetail() {
        if (this.currentDetailEmployee) {
            this.closeDetailModal();
            this.editEmployee(this.currentDetailEmployee.id);
        }
    }

    editEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.openEmployeeModal(employee);
        }
    }

    deleteEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee && confirm(`¿Está seguro de que desea eliminar a ${employee.firstName} ${employee.lastName}?`)) {
            this.employees = this.employees.filter(emp => emp.id !== id);
            this.saveEmployees();
            this.renderEmployees();
            this.updateStats();
            this.showNotification('Empleado eliminado exitosamente', 'success');
        }
    }

    exportEmployees() {
        const filteredEmployees = this.getFilteredEmployees();
        const csv = this.convertToCSV(filteredEmployees);
        this.downloadCSV(csv, 'empleados.csv');
    }

    convertToCSV(employees) {
        const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Departamento', 'Posición', 'Salario', 'Estado'];
        const rows = employees.map(emp => [
            emp.employeeId,
            emp.firstName,
            emp.lastName,
            emp.email,
            emp.phone,
            this.getDepartmentText(emp.department),
            this.getPositionText(emp.position),
            emp.salary.toFixed(2),
            this.getStatusText(emp.status)
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    processPayroll() {
        const activeEmployees = this.employees.filter(emp => emp.status === 'active');
        const totalPayroll = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);
        
        this.showNotification(`Nómina procesada para ${activeEmployees.length} empleados. Total: $${totalPayroll.toFixed(2)}`, 'success');
    }

    handleSearch(query) {
        this.filters.search = query;
        this.currentPage = 1;
        this.renderEmployees();
    }

    applyFilter(filterType, value) {
        this.filters[filterType] = value;
        this.currentPage = 1;
        this.renderEmployees();
    }

    clearFilters() {
        this.filters = {
            department: '',
            status: '',
            position: '',
            search: ''
        };
        
        // Reset filter inputs
        document.getElementById('departmentFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('positionFilter').value = '';
        document.getElementById('searchInput').value = '';
        
        this.currentPage = 1;
        this.renderEmployees();
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    getDepartmentText(department) {
        const departmentMap = {
            'ventas': 'Ventas',
            'marketing': 'Marketing',
            'desarrollo': 'Desarrollo',
            'administracion': 'Administración',
            'recursos_humanos': 'Recursos Humanos'
        };
        return departmentMap[department] || department;
    }

    getPositionText(position) {
        const positionMap = {
            'manager': 'Gerente',
            'supervisor': 'Supervisor',
            'employee': 'Empleado',
            'intern': 'Practicante'
        };
        return positionMap[position] || position;
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Activo',
            'inactive': 'Inactivo',
            'vacation': 'En Vacaciones',
            'medical_leave': 'Licencia Médica'
        };
        return statusMap[status] || status;
    }

    getContractTypeText(contractType) {
        const typeMap = {
            'full_time': 'Tiempo Completo',
            'part_time': 'Medio Tiempo',
            'contractor': 'Contratista',
            'intern': 'Practicante'
        };
        return typeMap[contractType] || contractType;
    }

    getSupervisorName(supervisorId) {
        if (!supervisorId) return 'Sin supervisor';
        const supervisor = this.employees.find(emp => emp.id === supervisorId);
        return supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'No encontrado';
    }

    // Pagination methods
    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const paginationNumbers = document.getElementById('paginationNumbers');
        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        
        // Update button states
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        
        // Generate page numbers
        paginationNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `pagination-btn ${i === this.currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => this.goToPage(i));
                paginationNumbers.appendChild(pageBtn);
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'pagination-ellipsis';
                paginationNumbers.appendChild(ellipsis);
            }
        }
    }

    updatePaginationInfo(totalItems, start, end) {
        document.getElementById('showingStart').textContent = totalItems > 0 ? start + 1 : 0;
        document.getElementById('showingEnd').textContent = end;
        document.getElementById('totalRecords').textContent = totalItems;
    }

    goToPage(page) {
        this.currentPage = page;
        this.renderEmployees();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderEmployees();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.getFilteredEmployees().length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderEmployees();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.empleadosManager = new EmpleadosManager();
});
