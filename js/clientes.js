// Gestión de Clientes - Ash-Ling ERP
class ClientesManager {
    constructor() {
        this.clients = this.loadClients();
        this.initializeEventListeners();
        this.renderClients();
        this.updateStats();
    }

    // Cargar clientes desde localStorage
    loadClients() {
        const savedClients = localStorage.getItem('ash_ling_clients');
        if (savedClients) {
            return JSON.parse(savedClients);
        }
        
        // Datos de muestra si no hay clientes guardados
        return [
            {
                id: 'CLI001',
                nombre: 'María González',
                email: 'maria.gonzalez@email.com',
                telefono: '+1 234-567-8901',
                direccion: 'Av. Principal 123, Ciudad',
                fechaRegistro: '2024-01-15',
                totalCompras: 2850.50,
                estado: 'active',
                tipo: 'regular'
            },
            {
                id: 'CLI002',
                nombre: 'Carlos Rodríguez',
                email: 'carlos.rodriguez@email.com',
                telefono: '+1 234-567-8902',
                direccion: 'Calle Secundaria 456, Ciudad',
                fechaRegistro: '2024-02-20',
                totalCompras: 5420.75,
                estado: 'active',
                tipo: 'vip'
            },
            {
                id: 'CLI003',
                nombre: 'Ana Martínez',
                email: 'ana.martinez@email.com',
                telefono: '+1 234-567-8903',
                direccion: 'Plaza Central 789, Ciudad',
                fechaRegistro: '2024-03-10',
                totalCompras: 1250.00,
                estado: 'active',
                tipo: 'regular'
            },
            {
                id: 'CLI004',
                nombre: 'Luis Hernández',
                email: 'luis.hernandez@email.com',
                telefono: '+1 234-567-8904',
                direccion: 'Barrio Norte 321, Ciudad',
                fechaRegistro: '2024-01-05',
                totalCompras: 890.25,
                estado: 'inactive',
                tipo: 'regular'
            },
            {
                id: 'CLI005',
                nombre: 'Sofia López',
                email: 'sofia.lopez@email.com',
                telefono: '+1 234-567-8905',
                direccion: 'Zona Sur 654, Ciudad',
                fechaRegistro: '2024-03-25',
                totalCompras: 7850.00,
                estado: 'active',
                tipo: 'vip'
            }
        ];
    }

    // Guardar clientes en localStorage
    saveClients() {
        localStorage.setItem('ash_ling_clients', JSON.stringify(this.clients));
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Botón nuevo cliente
        document.getElementById('newClientBtn').addEventListener('click', () => {
            this.showClientModal();
        });

        // Búsqueda
        document.getElementById('searchClients').addEventListener('input', (e) => {
            this.filterClients(e.target.value);
        });

        // Filtros
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('dateFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('sortFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Exportar
        document.getElementById('exportClientsBtn').addEventListener('click', () => {
            this.exportClients();
        });

        // Sidebar toggle
        if (document.getElementById('sidebarToggle')) {
            document.getElementById('sidebarToggle').addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('collapsed');
            });
        }

        if (document.getElementById('mobileMenuToggle')) {
            document.getElementById('mobileMenuToggle').addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('mobile-open');
            });
        }
    }

    // Generar ID único para cliente
    generateClientId() {
        const maxId = this.clients.reduce((max, client) => {
            const num = parseInt(client.id.replace('CLI', ''));
            return num > max ? num : max;
        }, 0);
        return `CLI${String(maxId + 1).padStart(3, '0')}`;
    }

    // Mostrar modal de cliente
    showClientModal(client = null) {
        const isEdit = client !== null;
        const modalHTML = `
            <div class="modal active" id="clientModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="clientForm" class="modal-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="clientNombre">Nombre *</label>
                                <input type="text" id="clientNombre" name="nombre" required 
                                       value="${client ? client.nombre : ''}" placeholder="Nombre completo">
                            </div>
                            <div class="form-group">
                                <label for="clientEmail">Email *</label>
                                <input type="email" id="clientEmail" name="email" required 
                                       value="${client ? client.email : ''}" placeholder="correo@ejemplo.com">
                            </div>
                            <div class="form-group">
                                <label for="clientTelefono">Teléfono *</label>
                                <input type="tel" id="clientTelefono" name="telefono" required 
                                       value="${client ? client.telefono : ''}" placeholder="+1 234-567-8900">
                            </div>
                            <div class="form-group">
                                <label for="clientEstado">Estado</label>
                                <select id="clientEstado" name="estado">
                                    <option value="active" ${client && client.estado === 'active' ? 'selected' : ''}>Activo</option>
                                    <option value="inactive" ${client && client.estado === 'inactive' ? 'selected' : ''}>Inactivo</option>
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label for="clientDireccion">Dirección</label>
                                <input type="text" id="clientDireccion" name="direccion" 
                                       value="${client ? client.direccion : ''}" placeholder="Dirección completa">
                            </div>
                            <div class="form-group">
                                <label for="clientTipo">Tipo de Cliente</label>
                                <select id="clientTipo" name="tipo">
                                    <option value="regular" ${client && client.tipo === 'regular' ? 'selected' : ''}>Regular</option>
                                    <option value="vip" ${client && client.tipo === 'vip' ? 'selected' : ''}>VIP</option>
                                </select>
                            </div>
                            ${isEdit ? `
                            <div class="form-group">
                                <label for="clientTotalCompras">Total Compras</label>
                                <input type="number" id="clientTotalCompras" name="totalCompras" step="0.01" 
                                       value="${client.totalCompras}" placeholder="0.00">
                            </div>
                            ` : ''}
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${isEdit ? 'Actualizar' : 'Guardar'} Cliente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remover modal existente si hay uno
        const existingModal = document.getElementById('clientModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listener para el formulario
        document.getElementById('clientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveClient(isEdit ? client.id : null);
        });
    }

    // Guardar cliente
    saveClient(clientId = null) {
        const form = document.getElementById('clientForm');
        const formData = new FormData(form);
        
        const clientData = {
            id: clientId || this.generateClientId(),
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            direccion: formData.get('direccion'),
            estado: formData.get('estado'),
            tipo: formData.get('tipo'),
            fechaRegistro: clientId ? this.clients.find(c => c.id === clientId).fechaRegistro : new Date().toISOString().split('T')[0],
            totalCompras: clientId ? parseFloat(formData.get('totalCompras')) || 0 : 0
        };

        try {
            if (clientId) {
                // Actualizar cliente existente
                const index = this.clients.findIndex(c => c.id === clientId);
                if (index !== -1) {
                    this.clients[index] = clientData;
                }
            } else {
                // Agregar nuevo cliente
                this.clients.push(clientData);
            }

            this.saveClients();
            this.renderClients();
            this.updateStats();
            
            // Cerrar modal
            document.getElementById('clientModal').remove();
            
            // Mostrar notificación
            this.showNotification(`Cliente ${clientId ? 'actualizado' : 'creado'} exitosamente`, 'success');
            
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            this.showNotification('Error al guardar el cliente', 'error');
        }
    }

    // Eliminar cliente
    deleteClient(clientId) {
        if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            try {
                this.clients = this.clients.filter(c => c.id !== clientId);
                this.saveClients();
                this.renderClients();
                this.updateStats();
                this.showNotification('Cliente eliminado exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar cliente:', error);
                this.showNotification('Error al eliminar el cliente', 'error');
            }
        }
    }

    // Renderizar tabla de clientes
    renderClients(clientsToRender = null) {
        const clients = clientsToRender || this.clients;
        const tbody = document.getElementById('clientsTableBody');
        
        if (clients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-users"></i>
                            <p>No se encontraron clientes</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = clients.map(client => `
            <tr>
                <td>${client.id}</td>
                <td>${client.nombre}</td>
                <td>${client.email}</td>
                <td>${client.telefono}</td>
                <td>${client.direccion || 'No especificada'}</td>
                <td>${this.formatDate(client.fechaRegistro)}</td>
                <td>$${client.totalCompras.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>
                    <span class="status-badge status-${client.estado}">
                        ${client.estado === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    ${client.tipo === 'vip' ? '<span class="vip-badge">VIP</span>' : ''}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="window.clientesManager.showClientModal(${JSON.stringify(client).replace(/"/g, '&quot;')})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.clientesManager.deleteClient('${client.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action btn-view" onclick="window.clientesManager.viewClientDetails('${client.id}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Ver detalles del cliente
    viewClientDetails(clientId) {
        const client = this.clients.find(c => c.id === clientId);
        if (!client) return;

        const modalHTML = `
            <div class="modal active" id="clientDetailsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detalles del Cliente</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="client-details">
                        <div class="detail-section">
                            <h4>Información Personal</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>ID:</strong> ${client.id}
                                </div>
                                <div class="detail-item">
                                    <strong>Nombre:</strong> ${client.nombre}
                                </div>
                                <div class="detail-item">
                                    <strong>Email:</strong> ${client.email}
                                </div>
                                <div class="detail-item">
                                    <strong>Teléfono:</strong> ${client.telefono}
                                </div>
                                <div class="detail-item">
                                    <strong>Dirección:</strong> ${client.direccion || 'No especificada'}
                                </div>
                                <div class="detail-item">
                                    <strong>Fecha de Registro:</strong> ${this.formatDate(client.fechaRegistro)}
                                </div>
                                <div class="detail-item">
                                    <strong>Estado:</strong> 
                                    <span class="status-badge status-${client.estado}">
                                        ${client.estado === 'active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <div class="detail-item">
                                    <strong>Tipo:</strong> 
                                    ${client.tipo === 'vip' ? '<span class="vip-badge">VIP</span>' : 'Regular'}
                                </div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4>Información de Compras</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Total de Compras:</strong> 
                                    $${client.totalCompras.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="window.clientesManager.showClientModal(${JSON.stringify(client).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                            <i class="fas fa-edit"></i>
                            Editar Cliente
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Filtrar clientes por búsqueda
    filterClients(searchTerm) {
        const filtered = this.clients.filter(client => 
            client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.telefono.includes(searchTerm) ||
            client.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderClients(filtered);
    }

    // Aplicar filtros
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        const sortFilter = document.getElementById('sortFilter').value;

        let filtered = [...this.clients];

        // Filtro por estado
        if (statusFilter !== 'all') {
            if (statusFilter === 'vip') {
                filtered = filtered.filter(client => client.tipo === 'vip');
            } else {
                filtered = filtered.filter(client => client.estado === statusFilter);
            }
        }

        // Filtro por fecha
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            filtered = filtered.filter(client => new Date(client.fechaRegistro) >= filterDate);
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (sortFilter) {
                case 'name':
                    return a.nombre.localeCompare(b.nombre);
                case 'date':
                    return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
                case 'purchases':
                    return b.totalCompras - a.totalCompras;
                case 'value':
                    return b.totalCompras - a.totalCompras;
                default:
                    return 0;
            }
        });

        this.renderClients(filtered);
    }

    // Actualizar estadísticas
    updateStats() {
        const total = this.clients.length;
        const active = this.clients.filter(c => c.estado === 'active').length;
        const vip = this.clients.filter(c => c.tipo === 'vip').length;
        
        // Nuevos este mes
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const newThisMonth = this.clients.filter(c => new Date(c.fechaRegistro) >= thisMonth).length;

        // Actualizar elementos del DOM
        const statCards = document.querySelectorAll('.stat-card .stat-value');
        if (statCards.length >= 4) {
            statCards[0].textContent = total.toLocaleString();
            statCards[1].textContent = active.toLocaleString();
            statCards[2].textContent = newThisMonth.toLocaleString();
            statCards[3].textContent = vip.toLocaleString();
        }
    }

    // Exportar clientes
    exportClients() {
        const csv = this.convertToCSV(this.clients);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientes_ash_ling_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showNotification('Clientes exportados exitosamente', 'success');
    }

    // Convertir a CSV
    convertToCSV(data) {
        const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Fecha Registro', 'Total Compras', 'Estado', 'Tipo'];
        const csv = [
            headers.join(','),
            ...data.map(client => [
                client.id,
                `"${client.nombre}"`,
                client.email,
                client.telefono,
                `"${client.direccion || ''}"`,
                client.fechaRegistro,
                client.totalCompras,
                client.estado,
                client.tipo
            ].join(','))
        ].join('\n');
        return csv;
    }

    // Formatear fecha
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.clientesManager = new ClientesManager();
});
