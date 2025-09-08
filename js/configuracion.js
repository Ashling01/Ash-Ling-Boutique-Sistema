// Configuracion Management
class ConfiguracionManager {
    constructor() {
        this.currentTab = 'company';
        this.users = [];
        this.settings = {};
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadUsers();
        this.setupEventListeners();
        this.renderUsers();
        this.populateSettings();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Save buttons
        document.getElementById('saveCompanyBtn').addEventListener('click', () => this.saveCompanySettings());
        document.getElementById('saveSystemBtn').addEventListener('click', () => this.saveSystemSettings());
        document.getElementById('saveSecurityBtn').addEventListener('click', () => this.saveSecuritySettings());

        // User management
        document.getElementById('addUserBtn').addEventListener('click', () => this.openUserModal());
        document.getElementById('closeUserModal').addEventListener('click', () => this.closeUserModal());
        document.getElementById('cancelUserBtn').addEventListener('click', () => this.closeUserModal());
        document.getElementById('saveUserBtn').addEventListener('click', () => this.saveUser());

        // Backup actions
        document.getElementById('createBackupBtn').addEventListener('click', () => this.createBackup());

        // Logo upload
        document.getElementById('logoFile').addEventListener('change', (e) => this.handleLogoUpload(e));

        // Two-factor authentication
        document.getElementById('twoFactorAuth').addEventListener('change', (e) => {
            const qrSection = document.querySelector('.qr-code-section');
            qrSection.style.display = e.target.checked ? 'block' : 'none';
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchSettings(e.target.value));

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

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding panel
        document.querySelectorAll('.settings-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-panel`).classList.add('active');

        this.currentTab = tabName;
    }

    loadSettings() {
        const stored = localStorage.getItem('ash_ling_settings');
        if (stored) {
            this.settings = JSON.parse(stored);
        } else {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
        }
    }

    saveSettings() {
        localStorage.setItem('ash_ling_settings', JSON.stringify(this.settings));
    }

    getDefaultSettings() {
        return {
            company: {
                name: 'Ash-Ling',
                ruc: '20123456789',
                email: 'info@ash-ling.com',
                phone: '+1 (555) 123-4567',
                address: '123 Business Street, Suite 100, Business City, BC 12345',
                website: 'https://www.ash-ling.com',
                industry: 'retail',
                taxRate: 16,
                currency: 'USD',
                fiscalYear: 'calendar',
                invoicePrefix: 'INV'
            },
            system: {
                language: 'es',
                timezone: 'America/Mexico_City',
                dateFormat: 'DD/MM/YYYY',
                numberFormat: '1,234.56',
                emailNotifications: true,
                stockAlerts: true,
                dueDateReminders: true,
                defaultReportFormat: 'pdf',
                autoReportFrequency: 'none'
            },
            security: {
                minPasswordLength: 8,
                requireUppercase: true,
                requireNumbers: true,
                requireSymbols: false,
                twoFactorAuth: false,
                sessionTimeout: 60,
                lockoutEnabled: true,
                maxLoginAttempts: 5
            },
            backup: {
                autoBackup: true,
                frequency: 'daily',
                time: '03:00',
                retentionPeriod: 30
            }
        };
    }

    populateSettings() {
        // Company settings
        const company = this.settings.company;
        document.getElementById('companyName').value = company.name;
        document.getElementById('companyRuc').value = company.ruc;
        document.getElementById('companyEmail').value = company.email;
        document.getElementById('companyPhone').value = company.phone;
        document.getElementById('companyAddress').value = company.address;
        document.getElementById('companyWebsite').value = company.website;
        document.getElementById('companyIndustry').value = company.industry;
        document.getElementById('taxRate').value = company.taxRate;
        document.getElementById('currency').value = company.currency;
        document.getElementById('fiscalYear').value = company.fiscalYear;
        document.getElementById('invoicePrefix').value = company.invoicePrefix;

        // System settings
        const system = this.settings.system;
        document.getElementById('language').value = system.language;
        document.getElementById('timezone').value = system.timezone;
        document.getElementById('dateFormat').value = system.dateFormat;
        document.getElementById('numberFormat').value = system.numberFormat;
        document.getElementById('emailNotifications').checked = system.emailNotifications;
        document.getElementById('stockAlerts').checked = system.stockAlerts;
        document.getElementById('dueDateReminders').checked = system.dueDateReminders;
        document.getElementById('defaultReportFormat').value = system.defaultReportFormat;
        document.getElementById('autoReportFrequency').value = system.autoReportFrequency;

        // Backup settings
        const backup = this.settings.backup;
        document.getElementById('autoBackup').checked = backup.autoBackup;
        document.getElementById('backupFrequency').value = backup.frequency;
        document.getElementById('backupTime').value = backup.time;
        document.getElementById('retentionPeriod').value = backup.retentionPeriod;
    }

    saveCompanySettings() {
        const formData = new FormData(document.getElementById('companyForm'));
        
        this.settings.company = {
            name: formData.get('companyName'),
            ruc: formData.get('companyRuc'),
            email: formData.get('companyEmail'),
            phone: formData.get('companyPhone'),
            address: formData.get('companyAddress'),
            website: formData.get('companyWebsite'),
            industry: formData.get('companyIndustry'),
            taxRate: parseFloat(formData.get('taxRate')),
            currency: formData.get('currency'),
            fiscalYear: formData.get('fiscalYear'),
            invoicePrefix: formData.get('invoicePrefix')
        };

        this.saveSettings();
        this.showNotification('Configuración de empresa guardada exitosamente', 'success');
    }

    saveSystemSettings() {
        const formData = new FormData(document.getElementById('systemForm'));
        
        this.settings.system = {
            language: formData.get('language'),
            timezone: formData.get('timezone'),
            dateFormat: formData.get('dateFormat'),
            numberFormat: formData.get('numberFormat'),
            emailNotifications: document.getElementById('emailNotifications').checked,
            stockAlerts: document.getElementById('stockAlerts').checked,
            dueDateReminders: document.getElementById('dueDateReminders').checked,
            defaultReportFormat: formData.get('defaultReportFormat'),
            autoReportFrequency: formData.get('autoReportFrequency')
        };

        this.saveSettings();
        this.showNotification('Configuración del sistema guardada exitosamente', 'success');
    }

    saveSecuritySettings() {
        this.settings.security = {
            minPasswordLength: parseInt(document.querySelector('.security-settings .setting-input').value),
            requireUppercase: document.querySelector('.security-settings .toggle-switch:nth-of-type(1) input').checked,
            requireNumbers: document.querySelector('.security-settings .toggle-switch:nth-of-type(2) input').checked,
            requireSymbols: document.querySelector('.security-settings .toggle-switch:nth-of-type(3) input').checked,
            twoFactorAuth: document.getElementById('twoFactorAuth').checked,
            sessionTimeout: parseInt(document.querySelectorAll('.security-settings .setting-input')[1].value),
            lockoutEnabled: document.querySelectorAll('.security-settings .toggle-switch')[4].querySelector('input').checked,
            maxLoginAttempts: parseInt(document.querySelectorAll('.security-settings .setting-input')[2].value)
        };

        this.saveSettings();
        this.showNotification('Configuración de seguridad guardada exitosamente', 'success');
    }

    loadUsers() {
        const stored = localStorage.getItem('ash_ling_system_users');
        if (stored) {
            this.users = JSON.parse(stored);
        } else {
            this.users = this.generateSampleUsers();
            this.saveUsers();
        }
    }

    saveUsers() {
        localStorage.setItem('ash_ling_system_users', JSON.stringify(this.users));
    }

    generateSampleUsers() {
        return [
            {
                id: 1,
                name: 'Administrador',
                email: 'admin@ash-ling.com',
                role: 'admin',
                status: 'active',
                lastLogin: '2025-09-01T10:30:00',
                createdAt: '2025-01-01T00:00:00'
            },
            {
                id: 2,
                name: 'María González',
                email: 'maria.gonzalez@ash-ling.com',
                role: 'manager',
                status: 'active',
                lastLogin: '2025-08-31T16:45:00',
                createdAt: '2025-02-15T00:00:00'
            },
            {
                id: 3,
                name: 'Carlos Rodríguez',
                email: 'carlos.rodriguez@ash-ling.com',
                role: 'sales',
                status: 'active',
                lastLogin: '2025-08-30T14:20:00',
                createdAt: '2025-03-01T00:00:00'
            },
            {
                id: 4,
                name: 'Ana Martínez',
                email: 'ana.martinez@ash-ling.com',
                role: 'accountant',
                status: 'inactive',
                lastLogin: '2025-08-15T09:15:00',
                createdAt: '2025-04-10T00:00:00'
            }
        ];
    }

    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <img src="https://via.placeholder.com/32" alt="${user.name}" class="user-avatar-small">
                        <span>${user.name}</span>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="role-badge ${user.role}">${this.getRoleText(user.role)}</span></td>
                <td><span class="status ${user.status}">${this.getStatusText(user.status)}</span></td>
                <td>${this.formatDateTime(user.lastLogin)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="configuracionManager.editUser(${user.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="configuracionManager.resetPassword(${user.id})" title="Resetear Contraseña">
                            <i class="fas fa-key"></i>
                        </button>
                        <button class="btn-icon" onclick="configuracionManager.deleteUser(${user.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    openUserModal(user = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        
        if (user) {
            title.textContent = 'Editar Usuario';
            this.populateUserForm(user);
        } else {
            title.textContent = 'Nuevo Usuario';
            this.resetUserForm();
        }
        
        modal.classList.add('active');
        this.currentUser = user;
    }

    closeUserModal() {
        const modal = document.getElementById('userModal');
        modal.classList.remove('active');
        this.currentUser = null;
    }

    resetUserForm() {
        document.getElementById('userForm').reset();
    }

    populateUserForm(user) {
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
    }

    saveUser() {
        const form = document.getElementById('userForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const userData = {
            name: formData.get('userName'),
            email: formData.get('userEmail'),
            role: formData.get('userRole'),
            status: formData.get('userStatus')
        };

        if (this.currentUser) {
            // Update existing user
            const index = this.users.findIndex(u => u.id === this.currentUser.id);
            this.users[index] = { ...this.currentUser, ...userData };
        } else {
            // Create new user
            userData.id = Date.now();
            userData.lastLogin = null;
            userData.createdAt = new Date().toISOString();
            this.users.push(userData);
        }

        this.saveUsers();
        this.renderUsers();
        this.closeUserModal();
        
        this.showNotification(
            this.currentUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
            'success'
        );
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.openUserModal(user);
        }
    }

    resetPassword(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user && confirm(`¿Resetear la contraseña de ${user.name}?`)) {
            this.showNotification(`Contraseña reseteada para ${user.name}. Nueva contraseña temporal enviada por email.`, 'success');
        }
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user && confirm(`¿Eliminar el usuario ${user.name}?`)) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.renderUsers();
            this.showNotification('Usuario eliminado exitosamente', 'success');
        }
    }

    handleLogoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                this.showNotification('El archivo es demasiado grande. Máximo 2MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('currentLogo').src = e.target.result;
                this.showNotification('Logo actualizado exitosamente', 'success');
            };
            reader.readAsDataURL(file);
        }
    }

    createBackup() {
        // Simulate backup creation
        const backupData = {
            timestamp: new Date().toISOString(),
            data: {
                settings: this.settings,
                users: this.users,
                // Include other system data
            }
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ash-ling-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Respaldo creado y descargado exitosamente', 'success');
    }

    searchSettings(query) {
        const searchTerm = query.toLowerCase();
        const panels = document.querySelectorAll('.settings-panel');
        
        panels.forEach(panel => {
            const content = panel.textContent.toLowerCase();
            const tab = document.querySelector(`[data-tab="${panel.id.replace('-panel', '')}"]`);
            
            if (content.includes(searchTerm) || searchTerm === '') {
                tab.style.display = 'flex';
            } else {
                tab.style.display = 'none';
            }
        });
    }

    // Utility methods
    getRoleText(role) {
        const roleMap = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'sales': 'Vendedor',
            'accountant': 'Contador'
        };
        return roleMap[role] || role;
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Activo',
            'inactive': 'Inactivo'
        };
        return statusMap[status] || status;
    }

    formatDateTime(dateString) {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
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
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--primary-color)'};
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
    window.configuracionManager = new ConfiguracionManager();
});
