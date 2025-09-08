// Reportes Management
class ReportesManager {
    constructor() {
        this.currentCategory = 'all';
        this.dateRange = {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
        };
        this.recentReports = [];
        
        this.init();
    }

    init() {
        this.loadRecentReports();
        this.setupEventListeners();
        this.renderReports();
        this.renderRecentReports();
        this.setDefaultDates();
    }

    setupEventListeners() {
        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderReports();
            });
        });

        // Quick date ranges
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const range = e.target.dataset.range;
                this.setDateRange(range);
            });
        });

        // Custom date range
        document.getElementById('applyRange').addEventListener('click', () => {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            if (startDate && endDate) {
                this.dateRange = { start: startDate, end: endDate };
            }
        });

        // Modal actions
        document.getElementById('customReportBtn').addEventListener('click', () => this.openCustomReportModal());
        document.getElementById('closeCustomModal').addEventListener('click', () => this.closeCustomReportModal());
        document.getElementById('cancelCustomBtn').addEventListener('click', () => this.closeCustomReportModal());
        document.getElementById('generateCustomBtn').addEventListener('click', () => this.generateCustomReport());

        document.getElementById('closeReportModal').addEventListener('click', () => this.closeReportModal());
        document.getElementById('printReportBtn').addEventListener('click', () => this.printReport());
        document.getElementById('downloadReportBtn').addEventListener('click', () => this.downloadCurrentReport());

        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearReportHistory());

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => this.searchReports(e.target.value));

        // Report type change in custom modal
        document.getElementById('reportType').addEventListener('change', (e) => this.updateReportFields(e.target.value));

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

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = today;
        document.getElementById('customStartDate').value = today;
        document.getElementById('customEndDate').value = today;
    }

    setDateRange(range) {
        const today = new Date();
        let startDate, endDate = today;

        switch (range) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'quarter':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                break;
            case 'year':
                startDate = new Date(today.getFullYear(), 0, 1);
                break;
            case 'custom':
                document.getElementById('customRange').style.display = 'flex';
                return;
        }

        if (range !== 'custom') {
            document.getElementById('customRange').style.display = 'none';
            this.dateRange = {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            };
        }
    }

    renderReports() {
        const reports = document.querySelectorAll('.report-card');
        reports.forEach(report => {
            if (this.currentCategory === 'all' || report.dataset.category === this.currentCategory) {
                report.style.display = 'block';
            } else {
                report.style.display = 'none';
            }
        });
    }

    searchReports(query) {
        const reports = document.querySelectorAll('.report-card');
        const searchTerm = query.toLowerCase();

        reports.forEach(report => {
            const title = report.querySelector('h3').textContent.toLowerCase();
            const description = report.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                report.style.display = 'block';
            } else {
                report.style.display = 'none';
            }
        });
    }

    generateReport(reportType) {
        const reportData = this.getReportData(reportType);
        this.showReportModal(reportType, reportData);
        this.addToRecentReports(reportType);
    }

    getReportData(reportType) {
        const dataManager = new DataManager();
        
        switch (reportType) {
            case 'sales':
                return this.generateSalesReport(dataManager);
            case 'product-sales':
                return this.generateProductSalesReport(dataManager);
            case 'profit-loss':
                return this.generateProfitLossReport();
            case 'cash-flow':
                return this.generateCashFlowReport();
            case 'inventory-status':
                return this.generateInventoryReport(dataManager);
            case 'low-stock':
                return this.generateLowStockReport(dataManager);
            case 'customer-analysis':
                return this.generateCustomerAnalysisReport(dataManager);
            case 'top-customers':
                return this.generateTopCustomersReport(dataManager);
            case 'payroll':
                return this.generatePayrollReport();
            case 'attendance':
                return this.generateAttendanceReport();
            default:
                return { title: 'Reporte no encontrado', content: 'El tipo de reporte solicitado no está disponible.' };
        }
    }

    generateSalesReport(dataManager) {
        const sales = dataManager.getSales();
        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const avgSale = totalSales / sales.length || 0;
        
        const content = `
            <div class="report-summary">
                <h4>Resumen de Ventas (${this.dateRange.start} - ${this.dateRange.end})</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total de Ventas:</span>
                        <span class="stat-value">$${totalSales.toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Número de Transacciones:</span>
                        <span class="stat-value">${sales.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Venta Promedio:</span>
                        <span class="stat-value">$${avgSale.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div class="report-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Total</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sales.slice(0, 10).map(sale => `
                            <tr>
                                <td>#${sale.id}</td>
                                <td>${sale.customer}</td>
                                <td>${this.formatDate(sale.date)}</td>
                                <td>$${sale.total.toFixed(2)}</td>
                                <td><span class="status ${sale.status}">${this.getStatusText(sale.status)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        return {
            title: 'Reporte de Ventas',
            content: content,
            type: 'sales'
        };
    }

    generateProductSalesReport(dataManager) {
        const products = dataManager.getProducts();
        const productSales = products.map(product => ({
            ...product,
            sales: Math.floor(Math.random() * 100) + 10,
            revenue: Math.floor(Math.random() * 5000) + 1000
        })).sort((a, b) => b.revenue - a.revenue);

        const content = `
            <div class="report-summary">
                <h4>Ventas por Producto (${this.dateRange.start} - ${this.dateRange.end})</h4>
            </div>
            <div class="report-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Unidades Vendidas</th>
                            <th>Ingresos</th>
                            <th>Precio Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productSales.slice(0, 15).map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td>${product.sales}</td>
                                <td>$${product.revenue.toFixed(2)}</td>
                                <td>$${(product.revenue / product.sales).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        return {
            title: 'Ventas por Producto',
            content: content,
            type: 'product-sales'
        };
    }

    generateProfitLossReport() {
        const revenue = 125430;
        const expenses = 87650;
        const profit = revenue - expenses;
        const margin = (profit / revenue) * 100;

        const content = `
            <div class="report-summary">
                <h4>Estado de Resultados (${this.dateRange.start} - ${this.dateRange.end})</h4>
                <div class="financial-summary">
                    <div class="financial-item positive">
                        <span class="financial-label">Ingresos Totales:</span>
                        <span class="financial-value">$${revenue.toFixed(2)}</span>
                    </div>
                    <div class="financial-item negative">
                        <span class="financial-label">Gastos Totales:</span>
                        <span class="financial-value">$${expenses.toFixed(2)}</span>
                    </div>
                    <div class="financial-item profit">
                        <span class="financial-label">Utilidad Neta:</span>
                        <span class="financial-value">$${profit.toFixed(2)}</span>
                    </div>
                    <div class="financial-item">
                        <span class="financial-label">Margen de Ganancia:</span>
                        <span class="financial-value">${margin.toFixed(2)}%</span>
                    </div>
                </div>
            </div>
            <div class="report-details">
                <h5>Desglose de Ingresos</h5>
                <ul class="breakdown-list">
                    <li>Ventas de Productos: $98,500.00</li>
                    <li>Servicios: $22,850.00</li>
                    <li>Otros Ingresos: $4,080.00</li>
                </ul>
                <h5>Desglose de Gastos</h5>
                <ul class="breakdown-list">
                    <li>Costo de Ventas: $45,200.00</li>
                    <li>Gastos Operativos: $28,750.00</li>
                    <li>Marketing: $8,950.00</li>
                    <li>Administración: $4,750.00</li>
                </ul>
            </div>
        `;

        return {
            title: 'Estado de Resultados',
            content: content,
            type: 'profit-loss'
        };
    }

    generateInventoryReport(dataManager) {
        const products = dataManager.getProducts();
        const totalValue = products.reduce((sum, product) => sum + (product.stock * product.price), 0);
        const lowStockItems = products.filter(product => product.stock < 20).length;

        const content = `
            <div class="report-summary">
                <h4>Estado de Inventario (${new Date().toLocaleDateString('es-ES')})</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total de Productos:</span>
                        <span class="stat-value">${products.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Valor Total del Inventario:</span>
                        <span class="stat-value">$${totalValue.toFixed(2)}</span>
                    </div>
                    <div class="stat-item warning">
                        <span class="stat-label">Productos con Stock Bajo:</span>
                        <span class="stat-value">${lowStockItems}</span>
                    </div>
                </div>
            </div>
            <div class="report-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock</th>
                            <th>Precio Unitario</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.slice(0, 20).map(product => `
                            <tr>
                                <td>${product.sku}</td>
                                <td>${product.name}</td>
                                <td>${product.category}</td>
                                <td class="${product.stock < 20 ? 'warning' : ''}">${product.stock}</td>
                                <td>$${product.price.toFixed(2)}</td>
                                <td>$${(product.stock * product.price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        return {
            title: 'Estado de Inventario',
            content: content,
            type: 'inventory-status'
        };
    }

    generateCustomerAnalysisReport(dataManager) {
        const clients = dataManager.getClients();
        const totalClients = clients.length;
        const activeClients = clients.filter(client => client.status === 'active').length;
        const avgPurchases = 4.2;

        const content = `
            <div class="report-summary">
                <h4>Análisis de Clientes (${this.dateRange.start} - ${this.dateRange.end})</h4>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total de Clientes:</span>
                        <span class="stat-value">${totalClients}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Clientes Activos:</span>
                        <span class="stat-value">${activeClients}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Compras Promedio:</span>
                        <span class="stat-value">${avgPurchases}</span>
                    </div>
                </div>
            </div>
            <div class="report-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.slice(0, 15).map(client => `
                            <tr>
                                <td>${client.name}</td>
                                <td>${client.email}</td>
                                <td>${client.phone}</td>
                                <td>${client.type}</td>
                                <td><span class="status ${client.status}">${this.getStatusText(client.status)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        return {
            title: 'Análisis de Clientes',
            content: content,
            type: 'customer-analysis'
        };
    }

    showReportModal(reportType, reportData) {
        const modal = document.getElementById('reportModal');
        const title = document.getElementById('reportModalTitle');
        const content = document.getElementById('reportContent');
        
        title.textContent = reportData.title;
        content.innerHTML = reportData.content;
        
        modal.classList.add('active');
        this.currentReportType = reportType;
        this.currentReportData = reportData;
    }

    closeReportModal() {
        const modal = document.getElementById('reportModal');
        modal.classList.remove('active');
    }

    openCustomReportModal() {
        const modal = document.getElementById('customReportModal');
        modal.classList.add('active');
    }

    closeCustomReportModal() {
        const modal = document.getElementById('customReportModal');
        modal.classList.remove('active');
    }

    updateReportFields(reportType) {
        const fieldsContainer = document.getElementById('reportFields');
        const fields = this.getReportFields(reportType);
        
        fieldsContainer.innerHTML = fields.map(field => `
            <label class="checkbox-label">
                <input type="checkbox" name="fields" value="${field.value}" checked>
                <span class="checkmark"></span>
                ${field.label}
            </label>
        `).join('');
    }

    getReportFields(reportType) {
        const fieldMaps = {
            sales: [
                { value: 'id', label: 'ID de Venta' },
                { value: 'customer', label: 'Cliente' },
                { value: 'date', label: 'Fecha' },
                { value: 'total', label: 'Total' },
                { value: 'status', label: 'Estado' }
            ],
            financial: [
                { value: 'revenue', label: 'Ingresos' },
                { value: 'expenses', label: 'Gastos' },
                { value: 'profit', label: 'Ganancia' },
                { value: 'margin', label: 'Margen' }
            ],
            inventory: [
                { value: 'sku', label: 'SKU' },
                { value: 'name', label: 'Nombre' },
                { value: 'category', label: 'Categoría' },
                { value: 'stock', label: 'Stock' },
                { value: 'price', label: 'Precio' }
            ],
            customers: [
                { value: 'name', label: 'Nombre' },
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Teléfono' },
                { value: 'type', label: 'Tipo' },
                { value: 'status', label: 'Estado' }
            ]
        };
        
        return fieldMaps[reportType] || [];
    }

    generateCustomReport() {
        const form = document.getElementById('customReportForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const reportName = formData.get('reportName');
        const reportType = formData.get('reportType');
        
        // Simulate custom report generation
        const reportData = {
            title: reportName,
            content: `<div class="custom-report"><h4>${reportName}</h4><p>Reporte personalizado generado exitosamente.</p></div>`,
            type: 'custom'
        };
        
        this.showReportModal('custom', reportData);
        this.addToRecentReports('custom', reportName);
        this.closeCustomReportModal();
        
        this.showNotification('Reporte personalizado generado exitosamente', 'success');
    }

    downloadReport(reportType) {
        const reportData = this.getReportData(reportType);
        this.downloadReportFile(reportData, 'pdf');
        this.addToRecentReports(reportType);
    }

    downloadCurrentReport() {
        if (this.currentReportData) {
            this.downloadReportFile(this.currentReportData, 'pdf');
        }
    }

    downloadReportFile(reportData, format) {
        // Simulate file download
        const blob = new Blob([this.convertReportToText(reportData)], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportData.title.replace(/\s+/g, '_')}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification(`Reporte descargado como ${format.toUpperCase()}`, 'success');
    }

    convertReportToText(reportData) {
        // Simple conversion to text format
        const div = document.createElement('div');
        div.innerHTML = reportData.content;
        return div.textContent || div.innerText || '';
    }

    printReport() {
        if (this.currentReportData) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${this.currentReportData.title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-summary { margin-bottom: 20px; }
                        .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
                        .stat-item { padding: 10px; border: 1px solid #ddd; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                        th { background-color: #f5f5f5; }
                    </style>
                </head>
                <body>
                    <h1>${this.currentReportData.title}</h1>
                    ${this.currentReportData.content}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    addToRecentReports(reportType, customName = null) {
        const reportNames = {
            'sales': 'Reporte de Ventas',
            'product-sales': 'Ventas por Producto',
            'profit-loss': 'Estado de Resultados',
            'cash-flow': 'Flujo de Caja',
            'inventory-status': 'Estado de Inventario',
            'low-stock': 'Productos con Stock Bajo',
            'customer-analysis': 'Análisis de Clientes',
            'top-customers': 'Top Clientes',
            'payroll': 'Reporte de Nómina',
            'attendance': 'Asistencia y Vacaciones',
            'custom': customName || 'Reporte Personalizado'
        };
        
        const report = {
            id: Date.now(),
            name: reportNames[reportType] || reportType,
            type: reportType,
            date: new Date().toISOString(),
            status: 'completed'
        };
        
        this.recentReports.unshift(report);
        this.recentReports = this.recentReports.slice(0, 10); // Keep only last 10
        this.saveRecentReports();
        this.renderRecentReports();
    }

    loadRecentReports() {
        const stored = localStorage.getItem('ash_ling_recent_reports');
        if (stored) {
            this.recentReports = JSON.parse(stored);
        }
    }

    saveRecentReports() {
        localStorage.setItem('ash_ling_recent_reports', JSON.stringify(this.recentReports));
    }

    renderRecentReports() {
        const container = document.getElementById('recentReportsList');
        
        if (this.recentReports.length === 0) {
            container.innerHTML = '<p class="no-reports">No hay reportes recientes</p>';
            return;
        }
        
        container.innerHTML = this.recentReports.map(report => `
            <div class="recent-report-item">
                <div class="report-info">
                    <h5>${report.name}</h5>
                    <span class="report-date">${this.formatDate(report.date)}</span>
                </div>
                <div class="report-actions">
                    <button class="btn-icon" onclick="reportesManager.regenerateReport('${report.type}')" title="Regenerar">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="btn-icon" onclick="reportesManager.downloadReport('${report.type}')" title="Descargar">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="reportesManager.removeRecentReport(${report.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    regenerateReport(reportType) {
        this.generateReport(reportType);
    }

    removeRecentReport(reportId) {
        this.recentReports = this.recentReports.filter(report => report.id !== reportId);
        this.saveRecentReports();
        this.renderRecentReports();
    }

    clearReportHistory() {
        if (confirm('¿Está seguro de que desea limpiar el historial de reportes?')) {
            this.recentReports = [];
            this.saveRecentReports();
            this.renderRecentReports();
            this.showNotification('Historial de reportes limpiado', 'success');
        }
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    getStatusText(status) {
        const statusMap = {
            'active': 'Activo',
            'inactive': 'Inactivo',
            'completed': 'Completada',
            'pending': 'Pendiente',
            'cancelled': 'Cancelada'
        };
        return statusMap[status] || status;
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

// Global functions for onclick handlers
function generateReport(reportType) {
    window.reportesManager.generateReport(reportType);
}

function downloadReport(reportType) {
    window.reportesManager.downloadReport(reportType);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reportesManager = new ReportesManager();
});
