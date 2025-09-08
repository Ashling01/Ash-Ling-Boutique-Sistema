// Gestión de Ventas - Ash-Ling ERP
class VentasManager {
    constructor() {
        this.sales = this.loadSales();
        this.clients = this.loadClients();
        this.products = this.loadProducts();
        
        console.log('VentasManager inicializado');
        console.log('Productos cargados:', this.products);
        console.log('Clientes cargados:', this.clients);
        
        // Verificar si los productos tienen la estructura correcta
        if (this.products.length === 0 || !this.products[0].hasOwnProperty('codigo')) {
            console.warn('Productos no tienen estructura correcta, reinicializando...');
            this.resetProductData();
        }
        
        this.initializeEventListeners();
        this.renderSales();
        this.updateStats();
        this.loadFilters();
    }

    // Reinicializar datos de productos
    resetProductData() {
        const defaultProducts = this.getDefaultProducts();
        localStorage.setItem('ash_ling_products', JSON.stringify(defaultProducts));
        this.products = defaultProducts;
        console.log('Productos reinicializados:', this.products);
    }

    // Cargar ventas desde localStorage
    loadSales() {
        const savedSales = localStorage.getItem('ash_ling_sales');
        if (savedSales) {
            return JSON.parse(savedSales);
        }
        
        // Datos de muestra si no hay ventas guardadas
        return [
            {
                id: 'VEN001',
                clientId: 'CLI001',
                clientName: 'María González',
                fecha: '2025-09-01',
                productos: [
                    { id: 'PROD001', codigo: 'CAR001', nombre: 'Cartera Elegante', cantidad: 1, precio: 250.00 }
                ],
                subtotal: 250.00,
                total: 250.00,
                metodoPago: 'credit_card',
                estado: 'completed',
                vendedor: 'Admin'
            },
            {
                id: 'VEN002',
                clientId: 'CLI002',
                clientName: 'Carlos Rodríguez',
                fecha: '2025-09-01',
                productos: [
                    { id: 'PROD002', codigo: 'PER001', nombre: 'Perfume Premium', cantidad: 2, precio: 180.00 },
                    { id: 'PROD003', codigo: 'ACC001', nombre: 'Accesorio Dorado', cantidad: 1, precio: 85.00 }
                ],
                subtotal: 445.00,
                total: 445.00,
                metodoPago: 'cash',
                estado: 'completed',
                vendedor: 'Admin'
            },
            {
                id: 'VEN003',
                clientId: 'CLI003',
                clientName: 'Ana Martínez',
                fecha: '2025-08-31',
                productos: [
                    { id: 'PROD004', codigo: 'VES001', nombre: 'Vestido de Dama', cantidad: 1, precio: 320.00 }
                ],
                subtotal: 320.00,
                total: 320.00,
                metodoPago: 'debit_card',
                estado: 'pending',
                vendedor: 'Admin'
            }
        ];
    }

    // Cargar clientes desde localStorage
    loadClients() {
        const savedClients = localStorage.getItem('ash_ling_clients');
        if (savedClients) {
            return JSON.parse(savedClients);
        }
        return [
            { id: 'CLI001', nombre: 'María González' },
            { id: 'CLI002', nombre: 'Carlos Rodríguez' },
            { id: 'CLI003', nombre: 'Ana Martínez' }
        ];
    }

    // Cargar productos desde localStorage
    loadProducts() {
        const savedProducts = localStorage.getItem('ash_ling_products');
        if (savedProducts) {
            try {
                const products = JSON.parse(savedProducts);
                console.log('Productos cargados desde localStorage:', products);
                return products;
            } catch (error) {
                console.error('Error al parsear productos desde localStorage:', error);
                return this.getDefaultProducts();
            }
        }
        console.log('No hay productos en localStorage, usando datos por defecto');
        return this.getDefaultProducts();
    }

    // Obtener productos por defecto
    getDefaultProducts() {
        return [
            { id: 'PROD001', codigo: 'CAR001', producto: 'Cartera Elegante', categoria: 'Carteras', precioVenta: 250.00, stock: 15 },
            { id: 'PROD002', codigo: 'PER001', producto: 'Perfume Premium', categoria: 'Perfumes', precioVenta: 180.00, stock: 8 },
            { id: 'PROD003', codigo: 'ACC001', producto: 'Accesorio Dorado', categoria: 'Accesorios', precioVenta: 85.00, stock: 20 },
            { id: 'PROD004', codigo: 'VES001', producto: 'Vestido de Dama', categoria: 'Ropa de Dama', precioVenta: 320.00, stock: 5 }
        ];
    }

    // Guardar ventas en localStorage
    saveSales() {
        localStorage.setItem('ash_ling_sales', JSON.stringify(this.sales));
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Botón nueva venta
        document.getElementById('newSaleBtn').addEventListener('click', () => {
            this.showSaleModal();
        });

        // Búsqueda
        document.getElementById('searchSales').addEventListener('input', (e) => {
            this.filterSales(e.target.value);
        });

        // Filtros
        document.getElementById('periodFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('clientFilter').addEventListener('change', () => {
            this.applyFilters();
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

    // Generar ID único para venta
    generateSaleId() {
        const maxId = this.sales.reduce((max, sale) => {
            const num = parseInt(sale.id.replace('VEN', ''));
            return num > max ? num : max;
        }, 0);
        return `VEN${String(maxId + 1).padStart(3, '0')}`;
    }

    // Mostrar modal de venta
    showSaleModal(sale = null) {
        const isEdit = sale !== null;
        const modalHTML = `
            <div class="modal active" id="saleModal">
                <div class="modal-content large-modal">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Editar Venta' : 'Nueva Venta'}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form id="saleForm" class="modal-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="saleCliente">Cliente *</label>
                                <select id="saleCliente" name="clientId" required>
                                    <option value="">Seleccionar cliente...</option>
                                    ${this.clients.map(client => 
                                        `<option value="${client.id}" ${sale && sale.clientId === client.id ? 'selected' : ''}>${client.nombre}</option>`
                                    ).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="saleMetodoPago">Método de Pago *</label>
                                <select id="saleMetodoPago" name="metodoPago" required>
                                    <option value="cash" ${sale && sale.metodoPago === 'cash' ? 'selected' : ''}>Efectivo</option>
                                    <option value="credit_card" ${sale && sale.metodoPago === 'credit_card' ? 'selected' : ''}>Tarjeta de Crédito</option>
                                    <option value="debit_card" ${sale && sale.metodoPago === 'debit_card' ? 'selected' : ''}>Tarjeta de Débito</option>
                                    <option value="transfer" ${sale && sale.metodoPago === 'transfer' ? 'selected' : ''}>Transferencia</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="saleEstado">Estado</label>
                                <select id="saleEstado" name="estado">
                                    <option value="completed" ${sale && sale.estado === 'completed' ? 'selected' : ''}>Completada</option>
                                    <option value="pending" ${sale && sale.estado === 'pending' ? 'selected' : ''}>Pendiente</option>
                                    <option value="cancelled" ${sale && sale.estado === 'cancelled' ? 'selected' : ''}>Cancelada</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="saleVendedor">Vendedor</label>
                                <input type="text" id="saleVendedor" name="vendedor" 
                                       value="${sale ? sale.vendedor : 'Admin'}" placeholder="Nombre del vendedor">
                            </div>
                        </div>
                        
                        <div class="products-section">
                            <div class="section-header-small">
                                <h4>Productos</h4>
                                <button type="button" class="btn btn-secondary btn-small" onclick="window.ventasManager.addProductRow()">
                                    <i class="fas fa-plus"></i> Agregar Producto
                                </button>
                            </div>
                            <div id="productsContainer">
                                ${isEdit && sale.productos ? sale.productos.map((producto, index) => `
                                    <div class="product-row">
                                        <select name="producto" class="product-select" required>
                                            <option value="">Seleccionar producto...</option>
                                            ${this.products.filter(p => p.stock > 0).map(p => {
                                                const codigo = p.codigo || p.code || 'SIN_CODIGO';
                                                const nombre = p.producto || p.name || 'Producto sin nombre';
                                                const precio = p.precioVenta || p.salePrice || 0;
                                                return `<option value="${p.id}" data-price="${precio}" ${producto.id === p.id ? 'selected' : ''}>${codigo} - ${nombre} - $${precio.toFixed(2)}</option>`;
                                            }).join('')}
                                        </select>
                                        <input type="number" name="cantidad" placeholder="Cantidad" required min="1" value="${producto.cantidad}">
                                        <input type="number" name="precio" placeholder="Precio" required step="0.01" min="0" value="${producto.precio}">
                                        <input type="number" name="subtotal" placeholder="Subtotal" readonly value="${(producto.cantidad * producto.precio).toFixed(2)}">
                                        <button type="button" class="btn-remove" onclick="this.parentNode.remove(); window.ventasManager.calculateTotal();">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `).join('') : `
                                    <div class="product-row">
                                        <select name="producto" class="product-select" required>
                                            <option value="">Seleccionar producto...</option>
                                            ${this.products.filter(p => p.stock > 0).map(p => {
                                                const codigo = p.codigo || p.code || 'SIN_CODIGO';
                                                const nombre = p.producto || p.name || 'Producto sin nombre';
                                                const precio = p.precioVenta || p.salePrice || 0;
                                                return `<option value="${p.id}" data-price="${precio}">${codigo} - ${nombre} - $${precio.toFixed(2)}</option>`;
                                            }).join('')}
                                        </select>
                                        <input type="number" name="cantidad" placeholder="Cantidad" required min="1" value="1">
                                        <input type="number" name="precio" placeholder="Precio" required step="0.01" min="0">
                                        <input type="number" name="subtotal" placeholder="Subtotal" readonly>
                                        <button type="button" class="btn-remove" onclick="this.parentNode.remove(); window.ventasManager.calculateTotal();">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                `}
                            </div>
                        </div>
                        
                        <div class="sale-totals">
                            <div class="total-row">
                                <strong>Total: $<span id="saleTotal">0.00</span></strong>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i>
                                ${isEdit ? 'Actualizar' : 'Guardar'} Venta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Remover modal existente si hay uno
        const existingModal = document.getElementById('saleModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar nuevo modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Event listener para el formulario
        document.getElementById('saleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSale(isEdit ? sale.id : null);
        });

        // Configurar cálculos automáticos
        this.setupCalculations();

        // Calcular total inicial si es edición
        if (isEdit) {
            this.calculateTotal();
        }
    }

    // Agregar fila de producto
    addProductRow() {
        const container = document.getElementById('productsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'product-row';
        
        console.log('Productos disponibles para nueva fila:', this.products);
        
        newRow.innerHTML = `
            <select name="producto" class="product-select" required>
                <option value="">Seleccionar producto...</option>
                ${this.products.filter(p => p.stock > 0).map(p => {
                    const codigo = p.codigo || p.code || 'SIN_CODIGO';
                    const nombre = p.producto || p.name || 'Producto sin nombre';
                    const precio = p.precioVenta || p.salePrice || 0;
                    return `<option value="${p.id}" data-price="${precio}">${codigo} - ${nombre} - $${precio.toFixed(2)}</option>`;
                }).join('')}
            </select>
            <input type="number" name="cantidad" placeholder="Cantidad" required min="1" value="1">
            <input type="number" name="precio" placeholder="Precio" required step="0.01" min="0">
            <input type="number" name="subtotal" placeholder="Subtotal" readonly>
            <button type="button" class="btn-remove" onclick="this.parentNode.remove(); window.ventasManager.calculateTotal();">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(newRow);
        this.setupCalculations();
    }

    // Configurar cálculos automáticos
    setupCalculations() {
        const container = document.getElementById('productsContainer');
        if (!container) return;

        // Event listeners para cambios en productos
        container.addEventListener('change', (e) => {
            if (e.target.matches('.product-select')) {
                const row = e.target.closest('.product-row');
                const option = e.target.options[e.target.selectedIndex];
                const price = option.getAttribute('data-price');
                if (price) {
                    row.querySelector('[name="precio"]').value = price;
                }
                this.calculateRowTotal(row);
            }
        });

        container.addEventListener('input', (e) => {
            if (e.target.matches('[name="cantidad"], [name="precio"]')) {
                const row = e.target.closest('.product-row');
                this.calculateRowTotal(row);
            }
        });
    }

    // Calcular total de una fila
    calculateRowTotal(row) {
        const cantidad = parseFloat(row.querySelector('[name="cantidad"]').value) || 0;
        const precio = parseFloat(row.querySelector('[name="precio"]').value) || 0;
        const subtotal = cantidad * precio;
        row.querySelector('[name="subtotal"]').value = subtotal.toFixed(2);
        this.calculateTotal();
    }

    // Calcular total general
    calculateTotal() {
        const rows = document.querySelectorAll('.product-row');
        let total = 0;
        
        rows.forEach(row => {
            const subtotal = parseFloat(row.querySelector('[name="subtotal"]').value) || 0;
            total += subtotal;
        });

        document.getElementById('saleTotal').textContent = total.toFixed(2);
    }

    // Guardar venta
    saveSale(saleId = null) {
        const form = document.getElementById('saleForm');
        const formData = new FormData(form);
        
        // Obtener productos
        const productRows = document.querySelectorAll('.product-row');
        const productos = [];
        let total = 0;

        productRows.forEach(row => {
            const productoId = row.querySelector('[name="producto"]').value;
            const cantidad = parseInt(row.querySelector('[name="cantidad"]').value);
            const precio = parseFloat(row.querySelector('[name="precio"]').value);
            
            if (productoId && cantidad && precio) {
                const producto = this.products.find(p => p.id == productoId);
                productos.push({
                    id: productoId,
                    codigo: producto ? (producto.codigo || producto.code || 'SIN_CODIGO') : 'SIN_CODIGO',
                    nombre: producto ? (producto.producto || producto.name || 'Producto') : 'Producto',
                    cantidad: cantidad,
                    precio: precio
                });
                total += cantidad * precio;
            }
        });

        if (productos.length === 0) {
            this.showNotification('Debe agregar al menos un producto', 'error');
            return;
        }

        // ✅ VALIDAR STOCK DISPONIBLE antes de procesar la venta
        if (!saleId) { // Solo validar para ventas nuevas, no para ediciones
            const stockValidation = this.validateStockAvailability(productos);
            if (!stockValidation.isValid) {
                this.showNotification(stockValidation.message, 'error');
                return;
            }
        }

        const clientId = formData.get('clientId');
        const client = this.clients.find(c => c.id === clientId);

        const saleData = {
            id: saleId || this.generateSaleId(),
            clientId: clientId,
            clientName: client ? client.nombre : 'Cliente',
            fecha: new Date().toISOString().split('T')[0],
            productos: productos,
            subtotal: total,
            total: total,
            metodoPago: formData.get('metodoPago'),
            estado: formData.get('estado') || 'completed',
            vendedor: formData.get('vendedor') || 'Admin'
        };

        try {
            if (saleId) {
                // Actualizar venta existente
                const index = this.sales.findIndex(s => s.id === saleId);
                if (index !== -1) {
                    this.sales[index] = saleData;
                }
            } else {
                // Agregar nueva venta
                this.sales.push(saleData);
                
                // ✅ DESCONTAR DEL INVENTARIO - Solo para ventas nuevas
                console.log('🔄 Descontando productos del inventario...');
                this.updateInventoryStock(productos);
            }

            this.saveSales();
            this.renderSales();
            this.updateStats();
            
            // Cerrar modal
            document.getElementById('saleModal').remove();
            
            // Mostrar notificación
            this.showNotification(`Venta ${saleId ? 'actualizada' : 'creada'} exitosamente`, 'success');
            
        } catch (error) {
            console.error('Error al guardar venta:', error);
            this.showNotification('Error al guardar la venta', 'error');
        }
    }

    // Eliminar venta
    deleteSale(saleId) {
        if (confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
            try {
                this.sales = this.sales.filter(s => s.id !== saleId);
                this.saveSales();
                this.renderSales();
                this.updateStats();
                this.showNotification('Venta eliminada exitosamente', 'success');
            } catch (error) {
                console.error('Error al eliminar venta:', error);
                this.showNotification('Error al eliminar la venta', 'error');
            }
        }
    }

    // Ver detalles de venta
    viewSale(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        const modalHTML = `
            <div class="modal active" id="saleDetailsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detalles de Venta - ${sale.id}</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="sale-details">
                        <div class="detail-section">
                            <h4>Información General</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>ID Venta:</strong> ${sale.id}
                                </div>
                                <div class="detail-item">
                                    <strong>Cliente:</strong> ${sale.clientName}
                                </div>
                                <div class="detail-item">
                                    <strong>Fecha:</strong> ${this.formatDate(sale.fecha)}
                                </div>
                                <div class="detail-item">
                                    <strong>Vendedor:</strong> ${sale.vendedor}
                                </div>
                                <div class="detail-item">
                                    <strong>Método de Pago:</strong> ${this.getPaymentMethodText(sale.metodoPago)}
                                </div>
                                <div class="detail-item">
                                    <strong>Estado:</strong> 
                                    <span class="status ${sale.estado}">${this.getStatusText(sale.estado)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="detail-section">
                            <h4>Productos</h4>
                            <table class="detail-table">
                                <thead>
                                    <tr>
                                        <th>Código</th>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sale.productos.map(producto => `
                                        <tr>
                                            <td>${producto.codigo || 'N/A'}</td>
                                            <td>${producto.nombre}</td>
                                            <td>${producto.cantidad}</td>
                                            <td>$${producto.precio.toFixed(2)}</td>
                                            <td>$${(producto.cantidad * producto.precio).toFixed(2)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <div class="total-summary">
                                <strong>Total: $${sale.total.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                            Cerrar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="window.ventasManager.showSaleModal(${JSON.stringify(sale).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                            <i class="fas fa-edit"></i>
                            Editar Venta
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Renderizar tabla de ventas
    renderSales(salesToRender = null) {
        const sales = salesToRender || this.sales;
        const tbody = document.getElementById('salesTableBody');
        
        if (sales.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <p>No se encontraron ventas</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = sales.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.clientName}</td>
                <td>${this.formatDate(sale.fecha)}</td>
                <td>${sale.productos.length} productos</td>
                <td>$${sale.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>
                    <span class="status ${sale.estado}">
                        ${this.getStatusText(sale.estado)}
                    </span>
                </td>
                <td>${this.getPaymentMethodText(sale.metodoPago)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="window.ventasManager.viewSale('${sale.id}')" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="window.ventasManager.showSaleModal(${JSON.stringify(sale).replace(/"/g, '&quot;')})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.ventasManager.deleteSale('${sale.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action btn-print" onclick="window.ventasManager.printSale('${sale.id}')" title="Imprimir">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Imprimir venta
    printSale(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (!sale) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Factura - ${sale.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .details { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .total { text-align: right; font-size: 18px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Ash-Ling</h1>
                        <h2>Factura de Venta</h2>
                    </div>
                    <div class="details">
                        <p><strong>ID Venta:</strong> ${sale.id}</p>
                        <p><strong>Cliente:</strong> ${sale.clientName}</p>
                        <p><strong>Fecha:</strong> ${this.formatDate(sale.fecha)}</p>
                        <p><strong>Vendedor:</strong> ${sale.vendedor}</p>
                        <p><strong>Método de Pago:</strong> ${this.getPaymentMethodText(sale.metodoPago)}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${sale.productos.map(producto => `
                                <tr>
                                    <td>${producto.codigo || 'N/A'}</td>
                                    <td>${producto.nombre}</td>
                                    <td>${producto.cantidad}</td>
                                    <td>$${producto.precio.toFixed(2)}</td>
                                    <td>$${(producto.cantidad * producto.precio).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Total: $${sale.total.toFixed(2)}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // Filtrar ventas por búsqueda
    filterSales(searchTerm) {
        const filtered = this.sales.filter(sale => 
            sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderSales(filtered);
    }

    // Aplicar filtros
    applyFilters() {
        const periodFilter = document.getElementById('periodFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const clientFilter = document.getElementById('clientFilter').value;

        let filtered = [...this.sales];

        // Filtro por período
        if (periodFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (periodFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(sale => new Date(sale.fecha) >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(sale => new Date(sale.fecha) >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(sale => new Date(sale.fecha) >= filterDate);
                    break;
                case 'year':
                    filterDate.setFullYear(now.getFullYear() - 1);
                    filtered = filtered.filter(sale => new Date(sale.fecha) >= filterDate);
                    break;
            }
        }

        // Filtro por estado
        if (statusFilter !== 'all') {
            filtered = filtered.filter(sale => sale.estado === statusFilter);
        }

        // Filtro por cliente
        if (clientFilter !== 'all') {
            filtered = filtered.filter(sale => sale.clientId === clientFilter);
        }

        this.renderSales(filtered);
    }

    // Cargar filtros
    loadFilters() {
        const clientFilter = document.getElementById('clientFilter');
        
        // Limpiar opciones existentes excepto "Todos los clientes"
        while (clientFilter.children.length > 1) {
            clientFilter.removeChild(clientFilter.lastChild);
        }

        // Agregar opciones de clientes
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.nombre;
            clientFilter.appendChild(option);
        });
    }

    // Actualizar estadísticas
    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todaysSales = this.sales.filter(sale => sale.fecha === today && sale.estado === 'completed');
        
        const ventasHoy = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
        const ordenesHoy = todaysSales.length;
        const ticketPromedio = ordenesHoy > 0 ? ventasHoy / ordenesHoy : 0;

        // Actualizar elementos del DOM
        const statCards = document.querySelectorAll('.stat-card .stat-value');
        if (statCards.length >= 3) {
            statCards[0].textContent = `$${ventasHoy.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;
            statCards[1].textContent = ordenesHoy.toString();
            statCards[2].textContent = `$${ticketPromedio.toLocaleString('es-ES', { minimumFractionDigits: 0 })}`;
        }
    }

    // Obtener texto de estado
    getStatusText(status) {
        const statusMap = {
            'completed': 'Completada',
            'pending': 'Pendiente',
            'cancelled': 'Cancelada'
        };
        return statusMap[status] || status;
    }

    // Obtener texto de método de pago
    getPaymentMethodText(method) {
        const methodMap = {
            'cash': 'Efectivo',
            'credit_card': 'Tarjeta de Crédito',
            'debit_card': 'Tarjeta de Débito',
            'transfer': 'Transferencia'
        };
        return methodMap[method] || method;
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
    
    // Validar disponibilidad de stock antes de procesar venta
    validateStockAvailability(productosVendidos) {
        try {
            console.log('🔍 Validando disponibilidad de stock...');
            
            var inventoryProducts = this.loadInventoryProducts();
            var errores = [];
            
            productosVendidos.forEach(function(productoVendido) {
                var inventoryProduct = null;
                
                // Buscar el producto en el inventario
                if (productoVendido.id) {
                    inventoryProduct = inventoryProducts.find(function(p) {
                        return String(p.id) === String(productoVendido.id);
                    });
                }
                
                if (!inventoryProduct && productoVendido.codigo) {
                    inventoryProduct = inventoryProducts.find(function(p) {
                        return (p.code || p.codigo) === productoVendido.codigo;
                    });
                }
                
                if (!inventoryProduct && productoVendido.nombre) {
                    inventoryProduct = inventoryProducts.find(function(p) {
                        return (p.name || p.producto || p.nombre) === productoVendido.nombre;
                    });
                }
                
                if (inventoryProduct) {
                    var stockDisponible = inventoryProduct.stock || 0;
                    var cantidadSolicitada = productoVendido.cantidad || 0;
                    
                    console.log('📊 Validando:', {
                        producto: inventoryProduct.name || inventoryProduct.producto,
                        stockDisponible: stockDisponible,
                        cantidadSolicitada: cantidadSolicitada
                    });
                    
                    if (cantidadSolicitada > stockDisponible) {
                        errores.push({
                            producto: productoVendido.nombre,
                            stockDisponible: stockDisponible,
                            cantidadSolicitada: cantidadSolicitada
                        });
                    }
                } else {
                    console.warn('⚠️ Producto no encontrado en inventario durante validación:', productoVendido);
                    errores.push({
                        producto: productoVendido.nombre,
                        stockDisponible: 0,
                        cantidadSolicitada: productoVendido.cantidad,
                        noEncontrado: true
                    });
                }
            });
            
            if (errores.length > 0) {
                var mensaje = 'Stock insuficiente:\n';
                errores.forEach(function(error) {
                    if (error.noEncontrado) {
                        mensaje += '• ' + error.producto + ': Producto no encontrado en inventario\n';
                    } else {
                        mensaje += '• ' + error.producto + ': Solicitado ' + error.cantidadSolicitada + ', disponible ' + error.stockDisponible + '\n';
                    }
                });
                
                console.log('❌ Validación de stock falló:', errores);
                return {
                    isValid: false,
                    message: mensaje,
                    errors: errores
                };
            }
            
            console.log('✅ Validación de stock exitosa');
            return {
                isValid: true,
                message: 'Stock suficiente'
            };
            
        } catch (error) {
            console.error('❌ Error durante validación de stock:', error);
            return {
                isValid: false,
                message: 'Error al validar stock: ' + error.message
            };
        }
    }

    // Actualizar stock del inventario después de una venta
    updateInventoryStock(productosVendidos) {
        try {
            console.log('📦 Actualizando inventario con productos vendidos:', productosVendidos);
            
            // Cargar inventario actual
            var inventoryProducts = this.loadInventoryProducts();
            console.log('📋 Productos en inventario antes de descuento:', inventoryProducts.length);
            
            // Procesar cada producto vendido
            productosVendidos.forEach(function(productoVendido) {
                console.log('🔍 Procesando producto vendido:', productoVendido);
                
                // Buscar el producto en el inventario usando diferentes criterios
                var inventoryProduct = null;
                
                // Buscar por ID primero
                if (productoVendido.id) {
                    inventoryProduct = inventoryProducts.find(function(p) {
                        return String(p.id) === String(productoVendido.id);
                    });
                }
                
                // Si no se encuentra por ID, buscar por código
                if (!inventoryProduct && productoVendido.codigo) {
                    inventoryProduct = inventoryProducts.find(function(p) {
                        return (p.code || p.codigo) === productoVendido.codigo;
                    });
                }
                
                // Si no se encuentra por código, buscar por nombre
                if (!inventoryProduct && productoVendido.nombre) {
                    inventoryProduct = inventoryProducts.find(function(p) {
                        return (p.name || p.producto || p.nombre) === productoVendido.nombre;
                    });
                }
                
                if (inventoryProduct) {
                    var stockAnterior = inventoryProduct.stock || 0;
                    var cantidadVendida = productoVendido.cantidad || 0;
                    var nuevoStock = Math.max(0, stockAnterior - cantidadVendida);
                    
                    console.log('📊 Producto encontrado en inventario:');
                    console.log('   - Nombre:', inventoryProduct.name || inventoryProduct.producto);
                    console.log('   - Stock anterior:', stockAnterior);
                    console.log('   - Cantidad vendida:', cantidadVendida);
                    console.log('   - Nuevo stock:', nuevoStock);
                    
                    // Actualizar el stock
                    inventoryProduct.stock = nuevoStock;
                    inventoryProduct.updatedAt = new Date().toISOString();
                    
                    console.log('✅ Stock actualizado para:', inventoryProduct.name || inventoryProduct.producto);
                } else {
                    console.warn('⚠️ Producto no encontrado en inventario:', productoVendido);
                }
            });
            
            // Guardar inventario actualizado
            this.saveInventoryProducts(inventoryProducts);
            console.log('✅ Inventario actualizado y guardado exitosamente');
            
        } catch (error) {
            console.error('❌ Error al actualizar inventario:', error);
            this.showNotification('Error al actualizar el inventario: ' + error.message, 'error');
        }
    }
    
    // Cargar productos del inventario desde localStorage
    loadInventoryProducts() {
        try {
            var saved = localStorage.getItem('ash_ling_products');
            if (saved) {
                var products = JSON.parse(saved);
                console.log('📦 Productos de inventario cargados:', products.length);
                return products;
            }
        } catch (error) {
            console.error('Error al cargar productos del inventario:', error);
        }
        return [];
    }
    
    // Guardar productos del inventario en localStorage
    saveInventoryProducts(products) {
        try {
            localStorage.setItem('ash_ling_products', JSON.stringify(products));
            // Establecer timestamp de última actualización desde ventas
            localStorage.setItem('lastSaleUpdate', Date.now().toString());
            console.log('💾 Productos de inventario guardados:', products.length);
            
            // ✅ Refrescar productos locales para mantener sincronización
            this.refreshProductsFromInventory();
        } catch (error) {
            console.error('Error al guardar productos del inventario:', error);
            throw error;
        }
    }
    
    // Sincronizar productos del sistema de ventas con el inventario actualizado
    refreshProductsFromInventory() {
        try {
            var inventoryProducts = this.loadInventoryProducts();
            
            // Actualizar productos locales con datos del inventario
            this.products = inventoryProducts.map(function(invProduct) {
                return {
                    id: invProduct.id,
                    codigo: invProduct.code || invProduct.codigo || 'SIN_CODIGO',
                    producto: invProduct.name || invProduct.producto || 'Producto',
                    categoria: invProduct.category || invProduct.categoria || 'Sin categoría',
                    precioVenta: invProduct.salePrice || invProduct.precioVenta || 0,
                    stock: invProduct.stock || 0
                };
            });
            
            console.log('🔄 Productos sincronizados con inventario:', this.products.length);
        } catch (error) {
            console.error('Error al sincronizar productos:', error);
        }
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
    window.ventasManager = new VentasManager();
});
