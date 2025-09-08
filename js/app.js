// Ash-Ling ERP System JavaScript

class ERPSystem {
    constructor() {
        this.currentSection = 'dashboard';
        this.isSidebarOpen = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Navigation menu
        const menuLinks = document.querySelectorAll('.menu-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Responsive handling
        window.addEventListener('resize', () => this.handleResize());
        
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const isClickInsideSidebar = sidebar.contains(e.target);
                const isMenuToggle = e.target.closest('.mobile-menu-toggle');
                
                if (!isClickInsideSidebar && !isMenuToggle && this.isSidebarOpen) {
                    this.closeSidebar();
                }
            }
        });
    }

    navigateToSection(section) {
        // Hide current section
        const currentSection = document.querySelector('.content-section.active');
        if (currentSection) {
            currentSection.classList.remove('active');
        }

        // Show new section
        const newSection = document.getElementById(section);
        if (newSection) {
            newSection.classList.add('active');
        }

        // Update active menu item
        const currentMenuItem = document.querySelector('.menu-item.active');
        if (currentMenuItem) {
            currentMenuItem.classList.remove('active');
        }

        const newMenuItem = document.querySelector(`[data-section="${section}"]`).closest('.menu-item');
        if (newMenuItem) {
            newMenuItem.classList.add('active');
        }

        // Update page title
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = this.getSectionTitle(section);
        }

        this.currentSection = section;

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }

        // Load section-specific data
        this.loadSectionData(section);
    }

    getSectionTitle(section) {
        const titles = {
            dashboard: 'Dashboard',
            ventas: 'Ventas',
            clientes: 'Clientes',
            inventario: 'Inventario',
            facturacion: 'Facturación',
            finanzas: 'Finanzas',
            empleados: 'Empleados',
            reportes: 'Reportes',
            configuracion: 'Configuración'
        };
        return titles[section] || 'Dashboard';
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
            this.isSidebarOpen = sidebar.classList.contains('open');
        } else {
            // Desktop behavior can be implemented here
            console.log('Desktop sidebar toggle');
        }
    }

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
        this.isSidebarOpen = false;
    }

    handleResize() {
        if (window.innerWidth > 768) {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.remove('open');
            this.isSidebarOpen = true;
        }
    }

    handleSearch(query) {
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        // Implement search functionality here
        // This could search through clients, products, sales, etc.
    }

    initializeCharts() {
        // Gráfica de Ventas Semanales
        const weeklySalesCanvas = document.getElementById('weeklySalesChart');
        if (weeklySalesCanvas) {
            const ctx = weeklySalesCanvas.getContext('2d');
            
            this.weeklySalesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [{
                        label: 'Ventas Diarias ($)',
                        data: [15000, 18500, 22000, 19500, 25000, 30000, 12000],
                        borderColor: '#ff69b4',
                        backgroundColor: 'rgba(255, 105, 180, 0.1)',
                        borderWidth: 4,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#ffd700',
                        pointBorderColor: '#ff69b4',
                        pointBorderWidth: 3,
                        pointRadius: 8,
                        pointHoverRadius: 12,
                        pointHoverBackgroundColor: '#ffd700',
                        pointHoverBorderColor: '#ff69b4',
                        pointHoverBorderWidth: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 2,
                    layout: {
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#000000',
                            titleColor: '#ffd700',
                            bodyColor: '#ffffff',
                            borderColor: '#ff69b4',
                            borderWidth: 2,
                            cornerRadius: 10,
                            displayColors: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 105, 180, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#ff69b4',
                                font: {
                                    weight: 'bold'
                                },
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#000000',
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            hoverBackgroundColor: '#ffd700'
                        }
                    }
                }
            });
        }

        // Gráfica de Ventas por Categoría
        const categorySalesCanvas = document.getElementById('categorySalesChart');
        if (categorySalesCanvas) {
            const ctx = categorySalesCanvas.getContext('2d');
            
            this.categorySalesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Electrónicos', 'Hogar', 'Oficina', 'Moda', 'Deportes'],
                    datasets: [{
                        data: [45000, 28000, 32000, 18000, 22000],
                        backgroundColor: [
                            '#ff69b4',
                            '#ffd700',
                            '#000000',
                            '#ffb3d9',
                            '#ffe55c'
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 4,
                        hoverBorderWidth: 6,
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    aspectRatio: 1,
                    cutout: '60%',
                    layout: {
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#000000',
                                font: {
                                    weight: 'bold',
                                    size: 11
                                },
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: '#000000',
                            titleColor: '#ffd700',
                            bodyColor: '#ffffff',
                            borderColor: '#ff69b4',
                            borderWidth: 2,
                            cornerRadius: 10,
                            callbacks: {
                                label: function(context) {
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 2000
                    }
                }
            });
        }
    }

    loadInitialData() {
        // Simulate loading data
        this.updateStats();
        this.loadRecentActivity();
    }

    loadSectionData(section) {
        switch(section) {
            case 'ventas':
                this.loadSalesData();
                break;
            case 'clientes':
                this.loadClientsData();
                break;
            case 'inventario':
                this.loadInventoryData();
                break;
            default:
                break;
        }
    }

    updateStats() {
        // This would typically fetch real data from an API
        const stats = {
            sales: { value: 125430, change: 12.5 },
            orders: { value: 247, change: 8.2 },
            clients: { value: 1284, change: 15.3 },
            products: { value: 432, change: -2.1 }
        };

        // Update stat cards with animation
        this.animateValue('sales', stats.sales.value, '$');
        this.animateValue('orders', stats.orders.value);
        this.animateValue('clients', stats.clients.value);
        this.animateValue('products', stats.products.value);
    }

    animateValue(id, targetValue, prefix = '') {
        const element = document.querySelector(`[data-stat="${id}"] .stat-value`);
        if (!element) return;

        let currentValue = 0;
        const increment = targetValue / 100;
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = prefix + Math.floor(currentValue).toLocaleString();
        }, 20);
    }

    loadRecentActivity() {
        // Simulate recent activity updates
        const activities = [
            { icon: 'fas fa-shopping-cart', text: 'Nueva venta registrada', time: 'Hace 5 minutos' },
            { icon: 'fas fa-user-plus', text: 'Nuevo cliente registrado', time: 'Hace 15 minutos' },
            { icon: 'fas fa-exclamation-triangle', text: 'Stock bajo en producto X', time: 'Hace 1 hora' },
            { icon: 'fas fa-file-invoice', text: 'Factura #1234 generada', time: 'Hace 2 horas' }
        ];

        // Update activity list (this is already in HTML, but could be dynamic)
    }

    loadSalesData() {
        // Load sales table data
        console.log('Loading sales data...');
    }

    loadClientsData() {
        // Load clients table data
        console.log('Loading clients data...');
    }

    loadInventoryData() {
        // Load inventory data
        console.log('Loading inventory data...');
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES').format(new Date(date));
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Data management functions
    addClient(clientData) {
        // Add new client
        console.log('Adding client:', clientData);
        this.showNotification('Cliente agregado exitosamente', 'success');
    }

    addProduct(productData) {
        // Add new product
        console.log('Adding product:', productData);
        this.showNotification('Producto agregado exitosamente', 'success');
    }

    addSale(saleData) {
        // Add new sale
        console.log('Adding sale:', saleData);
        this.showNotification('Venta registrada exitosamente', 'success');
    }

    // Export functions
    exportToExcel(data, filename) {
        // Export data to Excel
        console.log('Exporting to Excel:', filename);
    }

    exportToPDF(data, filename) {
        // Export data to PDF
        console.log('Exporting to PDF:', filename);
    }
}

// Modal functionality
class Modal {
    constructor() {
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modal = modal;
        
        // Event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
    }

    open(title, content, buttons = []) {
        this.modal.querySelector('.modal-title').textContent = title;
        this.modal.querySelector('.modal-body').innerHTML = content;
        
        const footer = this.modal.querySelector('.modal-footer');
        footer.innerHTML = '';
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `btn ${button.class || 'btn-primary'}`;
            btn.textContent = button.text;
            btn.addEventListener('click', button.onClick);
            footer.appendChild(btn);
        });
        
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Form validation
class FormValidator {
    static validate(form) {
        const errors = [];
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                errors.push(`${input.dataset.label || input.name} es requerido`);
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
            
            // Email validation
            if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    errors.push('El email no tiene un formato válido');
                    input.classList.add('error');
                }
            }
            
            // Phone validation
            if (input.type === 'tel' && input.value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                    errors.push('El teléfono no tiene un formato válido');
                    input.classList.add('error');
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.erpSystem = new ERPSystem();
    window.modal = new Modal();
    
    // Add some demo button functionality
    const newSaleButtons = document.querySelectorAll('button:contains("Nueva Venta")');
    newSaleButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.modal.open(
                'Nueva Venta',
                `
                <form id="newSaleForm">
                    <div class="form-group">
                        <label>Cliente</label>
                        <select required data-label="Cliente">
                            <option value="">Seleccionar cliente...</option>
                            <option value="1">Juan Pérez</option>
                            <option value="2">María González</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Producto</label>
                        <select required data-label="Producto">
                            <option value="">Seleccionar producto...</option>
                            <option value="1">Producto A</option>
                            <option value="2">Producto B</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cantidad</label>
                        <input type="number" required data-label="Cantidad" min="1">
                    </div>
                    <div class="form-group">
                        <label>Precio Unitario</label>
                        <input type="number" required data-label="Precio" step="0.01" min="0">
                    </div>
                </form>
                `,
                [
                    {
                        text: 'Cancelar',
                        class: 'btn-secondary',
                        onClick: () => window.modal.close()
                    },
                    {
                        text: 'Guardar Venta',
                        class: 'btn-primary',
                        onClick: () => {
                            const form = document.getElementById('newSaleForm');
                            const validation = FormValidator.validate(form);
                            
                            if (validation.isValid) {
                                // Process the sale
                                window.erpSystem.addSale(new FormData(form));
                                window.modal.close();
                            } else {
                                alert('Por favor, corrija los errores en el formulario:\n' + validation.errors.join('\n'));
                            }
                        }
                    }
                ]
            );
        });
    });
});

// Global utility functions
window.ERPUtils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    formatDate: (date) => {
        return new Intl.DateTimeFormat('es-ES').format(new Date(date));
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
