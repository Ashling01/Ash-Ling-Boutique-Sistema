// Facturación Management
class FacturacionManager {
    constructor() {
        this.invoices = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
        this.filters = {
            status: '',
            client: '',
            dateFrom: '',
            dateTo: '',
            search: ''
        };
        this.currentInvoice = null;
        this.itemCounter = 0;
        
        this.init();
    }

    init() {
        this.loadInvoices();
        this.setupEventListeners();
        this.populateFilters();
        this.renderInvoices();
        this.updateStats();
    }

    setupEventListeners() {
        // Main actions
        document.getElementById('newInvoiceBtn').addEventListener('click', () => this.openInvoiceModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportInvoices());
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Filters
        document.getElementById('statusFilter').addEventListener('change', (e) => this.applyFilter('status', e.target.value));
        document.getElementById('clientFilter').addEventListener('change', (e) => this.applyFilter('client', e.target.value));
        document.getElementById('dateFromFilter').addEventListener('change', (e) => this.applyFilter('dateFrom', e.target.value));
        document.getElementById('dateToFilter').addEventListener('change', (e) => this.applyFilter('dateTo', e.target.value));
        document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());
        
        // Modal actions
        document.getElementById('closeModal').addEventListener('click', () => this.closeInvoiceModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeInvoiceModal());
        document.getElementById('addItemBtn').addEventListener('click', () => this.addInvoiceItem());
        document.getElementById('saveInvoiceBtn').addEventListener('click', () => this.saveInvoice('draft'));
        document.getElementById('createInvoiceBtn').addEventListener('click', () => this.saveInvoice('pending'));
        
        // Pagination
        document.getElementById('prevPageBtn').addEventListener('click', () => this.previousPage());
        document.getElementById('nextPageBtn').addEventListener('click', () => this.nextPage());
        
        // Select all
        document.getElementById('selectAll').addEventListener('change', (e) => this.selectAllInvoices(e.target.checked));
        
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

    loadInvoices() {
        const stored = localStorage.getItem('ash_ling_invoices');
        if (stored) {
            this.invoices = JSON.parse(stored);
        } else {
            this.invoices = this.generateSampleInvoices();
            this.saveInvoices();
        }
    }

    saveInvoices() {
        localStorage.setItem('ash_ling_invoices', JSON.stringify(this.invoices));
    }

    generateSampleInvoices() {
        const dataManager = new DataManager();
        const clients = dataManager.getClients();
        const products = dataManager.getProducts();
        const invoices = [];
        
        for (let i = 1; i <= 25; i++) {
            const client = clients[Math.floor(Math.random() * clients.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));
            const dueDate = new Date(date);
            dueDate.setDate(dueDate.getDate() + 30);
            
            const itemCount = Math.floor(Math.random() * 5) + 1;
            const items = [];
            let subtotal = 0;
            
            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 10) + 1;
                const price = parseFloat(product.price);
                const total = quantity * price;
                
                items.push({
                    id: j + 1,
                    description: product.name,
                    quantity: quantity,
                    unitPrice: price,
                    total: total
                });
                
                subtotal += total;
            }
            
            const tax = subtotal * 0.16;
            const total = subtotal + tax;
            
            const statuses = ['pending', 'paid', 'overdue', 'cancelled'];
            const status = date < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                ? statuses[Math.floor(Math.random() * statuses.length)]
                : 'pending';
            
            invoices.push({
                id: i,
                number: `INV-${String(i).padStart(4, '0')}`,
                clientId: client.id,
                clientName: client.name,
                date: date.toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0],
                items: items,
                subtotal: subtotal,
                tax: tax,
                total: total,
                status: status,
                notes: Math.random() > 0.7 ? 'Factura con descuento especial aplicado.' : '',
                createdAt: date.toISOString()
            });
        }
        
        return invoices;
    }

    renderInvoices() {
        const filteredInvoices = this.getFilteredInvoices();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
        
        const tbody = document.getElementById('invoicesTableBody');
        tbody.innerHTML = '';
        
        paginatedInvoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="invoice-checkbox" data-id="${invoice.id}"></td>
                <td><strong>${invoice.number}</strong></td>
                <td>${invoice.clientName}</td>
                <td>${this.formatDate(invoice.date)}</td>
                <td>${this.formatDate(invoice.dueDate)}</td>
                <td><strong>$${invoice.total.toFixed(2)}</strong></td>
                <td><span class="status ${invoice.status}">${this.getStatusText(invoice.status)}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="facturacionManager.viewInvoice(${invoice.id})" title="Ver">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon" onclick="facturacionManager.editInvoice(${invoice.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon" onclick="facturacionManager.printInvoice(${invoice.id})" title="Imprimir">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn-icon" onclick="facturacionManager.deleteInvoice(${invoice.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.updatePagination(filteredInvoices.length);
        this.updatePaginationInfo(filteredInvoices.length, startIndex, Math.min(endIndex, filteredInvoices.length));
    }

    getFilteredInvoices() {
        let filtered = [...this.invoices];
        
        // Apply filters
        if (this.filters.status) {
            filtered = filtered.filter(invoice => invoice.status === this.filters.status);
        }
        
        if (this.filters.client) {
            filtered = filtered.filter(invoice => invoice.clientId.toString() === this.filters.client);
        }
        
        if (this.filters.dateFrom) {
            filtered = filtered.filter(invoice => invoice.date >= this.filters.dateFrom);
        }
        
        if (this.filters.dateTo) {
            filtered = filtered.filter(invoice => invoice.date <= this.filters.dateTo);
        }
        
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(invoice => 
                invoice.number.toLowerCase().includes(search) ||
                invoice.clientName.toLowerCase().includes(search)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            if (this.sortColumn === 'total' || this.sortColumn === 'subtotal' || this.sortColumn === 'tax') {
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
        
        document.getElementById('totalInvoices').textContent = stats.total;
        document.getElementById('totalBilled').textContent = `$${stats.totalBilled.toFixed(2)}`;
        document.getElementById('pendingInvoices').textContent = stats.pending;
        document.getElementById('paidInvoices').textContent = stats.paid;
    }

    calculateStats() {
        const total = this.invoices.length;
        const totalBilled = this.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
        const pending = this.invoices.filter(invoice => invoice.status === 'pending').length;
        const paid = this.invoices.filter(invoice => invoice.status === 'paid').length;
        
        return { total, totalBilled, pending, paid };
    }

    populateFilters() {
        const dataManager = new DataManager();
        const clients = dataManager.getClients();
        const clientFilter = document.getElementById('clientFilter');
        
        clientFilter.innerHTML = '<option value="">Todos los clientes</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientFilter.appendChild(option);
        });
    }

    openInvoiceModal(invoice = null) {
        this.currentInvoice = invoice;
        const modal = document.getElementById('invoiceModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (invoice) {
            modalTitle.textContent = `Editar Factura ${invoice.number}`;
            this.populateInvoiceForm(invoice);
        } else {
            modalTitle.textContent = 'Nueva Factura';
            this.resetInvoiceForm();
            this.generateInvoiceNumber();
        }
        
        this.populateClientSelect();
        modal.classList.add('active');
    }

    closeInvoiceModal() {
        const modal = document.getElementById('invoiceModal');
        modal.classList.remove('active');
        this.currentInvoice = null;
        this.itemCounter = 0;
    }

    generateInvoiceNumber() {
        const lastInvoice = this.invoices.reduce((max, invoice) => {
            const num = parseInt(invoice.number.split('-')[1]);
            return num > max ? num : max;
        }, 0);
        
        const newNumber = `INV-${String(lastInvoice + 1).padStart(4, '0')}`;
        document.getElementById('invoiceNumber').value = newNumber;
    }

    populateClientSelect() {
        const dataManager = new DataManager();
        const clients = dataManager.getClients();
        const clientSelect = document.getElementById('clientSelect');
        
        clientSelect.innerHTML = '<option value="">Seleccionar cliente...</option>';
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.name} - ${client.email}`;
            clientSelect.appendChild(option);
        });
    }

    resetInvoiceForm() {
        document.getElementById('invoiceForm').reset();
        document.getElementById('invoiceDate').value = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('invoiceDueDate').value = dueDate.toISOString().split('T')[0];
        
        const itemsBody = document.getElementById('invoiceItemsBody');
        itemsBody.innerHTML = '';
        this.addInvoiceItem();
        this.updateInvoiceTotals();
    }

    populateInvoiceForm(invoice) {
        document.getElementById('invoiceNumber').value = invoice.number;
        document.getElementById('invoiceDate').value = invoice.date;
        document.getElementById('invoiceDueDate').value = invoice.dueDate;
        document.getElementById('clientSelect').value = invoice.clientId;
        document.getElementById('invoiceNotes').value = invoice.notes || '';
        
        const itemsBody = document.getElementById('invoiceItemsBody');
        itemsBody.innerHTML = '';
        
        invoice.items.forEach(item => {
            this.addInvoiceItem(item);
        });
        
        this.updateInvoiceTotals();
    }

    addInvoiceItem(item = null) {
        this.itemCounter++;
        const itemsBody = document.getElementById('invoiceItemsBody');
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <input type="text" class="form-input item-description" 
                       placeholder="Descripción del producto/servicio" 
                       value="${item ? item.description : ''}" required>
            </td>
            <td>
                <input type="number" class="form-input item-quantity" 
                       min="1" step="1" 
                       value="${item ? item.quantity : 1}" required>
            </td>
            <td>
                <input type="number" class="form-input item-price" 
                       min="0" step="0.01" 
                       value="${item ? item.unitPrice : 0}" required>
            </td>
            <td>
                <span class="item-total">$0.00</span>
            </td>
            <td>
                <button type="button" class="btn-icon remove-item" onclick="this.closest('tr').remove(); facturacionManager.updateInvoiceTotals();">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        itemsBody.appendChild(row);
        
        // Add event listeners
        row.querySelector('.item-quantity').addEventListener('input', () => this.updateInvoiceTotals());
        row.querySelector('.item-price').addEventListener('input', () => this.updateInvoiceTotals());
        
        this.updateInvoiceTotals();
    }

    updateInvoiceTotals() {
        const rows = document.querySelectorAll('#invoiceItemsBody tr');
        let subtotal = 0;
        
        rows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const total = quantity * price;
            
            row.querySelector('.item-total').textContent = `$${total.toFixed(2)}`;
            subtotal += total;
        });
        
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        
        document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('taxAmount').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    }

    saveInvoice(status) {
        const form = document.getElementById('invoiceForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const items = this.getInvoiceItems();
        
        if (items.length === 0) {
            alert('Debe agregar al menos un producto o servicio.');
            return;
        }
        
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        
        const invoiceData = {
            number: formData.get('number'),
            clientId: parseInt(formData.get('clientId')),
            clientName: this.getClientName(formData.get('clientId')),
            date: formData.get('date'),
            dueDate: formData.get('dueDate'),
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total,
            status: status,
            notes: formData.get('notes') || '',
            updatedAt: new Date().toISOString()
        };
        
        if (this.currentInvoice) {
            // Update existing invoice
            const index = this.invoices.findIndex(inv => inv.id === this.currentInvoice.id);
            this.invoices[index] = { ...this.currentInvoice, ...invoiceData };
        } else {
            // Create new invoice
            invoiceData.id = Date.now();
            invoiceData.createdAt = new Date().toISOString();
            this.invoices.unshift(invoiceData);
        }
        
        this.saveInvoices();
        this.renderInvoices();
        this.updateStats();
        this.closeInvoiceModal();
        
        // Show success message
        this.showNotification(
            this.currentInvoice ? 'Factura actualizada exitosamente' : 'Factura creada exitosamente',
            'success'
        );
    }

    getInvoiceItems() {
        const rows = document.querySelectorAll('#invoiceItemsBody tr');
        const items = [];
        
        rows.forEach((row, index) => {
            const description = row.querySelector('.item-description').value.trim();
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const unitPrice = parseFloat(row.querySelector('.item-price').value) || 0;
            
            if (description && quantity > 0 && unitPrice >= 0) {
                items.push({
                    id: index + 1,
                    description: description,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    total: quantity * unitPrice
                });
            }
        });
        
        return items;
    }

    getClientName(clientId) {
        const dataManager = new DataManager();
        const client = dataManager.getClients().find(c => c.id.toString() === clientId);
        return client ? client.name : 'Cliente Desconocido';
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendiente',
            'paid': 'Pagada',
            'overdue': 'Vencida',
            'cancelled': 'Cancelada',
            'draft': 'Borrador'
        };
        return statusMap[status] || status;
    }

    viewInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice) {
            // Implement invoice preview/view functionality
            alert(`Ver factura ${invoice.number}`);
        }
    }

    editInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice) {
            this.openInvoiceModal(invoice);
        }
    }

    printInvoice(id) {
        const invoice = this.invoices.find(inv => inv.id === id);
        if (invoice) {
            // Implement print functionality
            alert(`Imprimir factura ${invoice.number}`);
        }
    }

    deleteInvoice(id) {
        if (confirm('¿Está seguro de que desea eliminar esta factura?')) {
            this.invoices = this.invoices.filter(inv => inv.id !== id);
            this.saveInvoices();
            this.renderInvoices();
            this.updateStats();
            this.showNotification('Factura eliminada exitosamente', 'success');
        }
    }

    exportInvoices() {
        const filteredInvoices = this.getFilteredInvoices();
        const csv = this.convertToCSV(filteredInvoices);
        this.downloadCSV(csv, 'facturas.csv');
    }

    convertToCSV(invoices) {
        const headers = ['Número', 'Cliente', 'Fecha', 'Vencimiento', 'Subtotal', 'Impuestos', 'Total', 'Estado'];
        const rows = invoices.map(invoice => [
            invoice.number,
            invoice.clientName,
            invoice.date,
            invoice.dueDate,
            invoice.subtotal.toFixed(2),
            invoice.tax.toFixed(2),
            invoice.total.toFixed(2),
            this.getStatusText(invoice.status)
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

    handleSearch(query) {
        this.filters.search = query;
        this.currentPage = 1;
        this.renderInvoices();
    }

    applyFilter(filterType, value) {
        this.filters[filterType] = value;
        this.currentPage = 1;
        this.renderInvoices();
    }

    clearFilters() {
        this.filters = {
            status: '',
            client: '',
            dateFrom: '',
            dateTo: '',
            search: ''
        };
        
        // Reset filter inputs
        document.getElementById('statusFilter').value = '';
        document.getElementById('clientFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('searchInput').value = '';
        
        this.currentPage = 1;
        this.renderInvoices();
    }

    selectAllInvoices(checked) {
        const checkboxes = document.querySelectorAll('.invoice-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
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
        this.renderInvoices();
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderInvoices();
        }
    }

    nextPage() {
        const totalPages = Math.ceil(this.getFilteredInvoices().length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderInvoices();
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
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

// Table sorting function
function sortTable(column) {
    if (facturacionManager.sortColumn === column) {
        facturacionManager.sortDirection = facturacionManager.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        facturacionManager.sortColumn = column;
        facturacionManager.sortDirection = 'asc';
    }
    
    facturacionManager.renderInvoices();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.facturacionManager = new FacturacionManager();
});
