// Inventory Management System
class InventoryManager {
    constructor() {
        console.log('🏗️ Inicializando InventoryManager...');
        this.products = [];
        this.currentProduct = null;
        this.currentPage = 1;
        this.itemsPerPage = 15;
        this.filters = {
            category: 'all',
            status: 'all',
            price: 'all',
            search: ''
        };
        this.sortBy = 'name';
        this.sortDirection = 'asc';
        
        this.init();
    }

    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
        this.updateStats();
        this.setupCalculations();
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        // Main buttons
        const newProductBtn = document.getElementById('newProductBtn');
        const exportInventoryBtn = document.getElementById('exportInventoryBtn');
        const generateReportBtn = document.getElementById('generateReportBtn');
        
        console.log('🔍 Buscando botón newProductBtn...', newProductBtn);
        
        if (newProductBtn) {
            console.log('✅ Botón newProductBtn encontrado, añadiendo event listener');
            newProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔥 CLICK detectado en botón Nuevo Producto');
                this.openProductModal();
            });
        } else {
            console.error('❌ Botón newProductBtn NO encontrado');
        }
        
        if (exportInventoryBtn) {
            exportInventoryBtn.addEventListener('click', () => this.exportInventory());
        }
        
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => this.generateExcelReport());
        }
        
        // Search
        const searchProducts = document.getElementById('searchProducts');
        if (searchProducts) {
            searchProducts.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        const stockStatusFilter = document.getElementById('stockStatusFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => this.applyFilter('category', e.target.value));
        }
        if (stockStatusFilter) {
            stockStatusFilter.addEventListener('change', (e) => this.applyFilter('status', e.target.value));
        }
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => this.applyFilter('price', e.target.value));
        }
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => this.applySorting(e.target.value));
        }
        
        // Product modal
        const closeModal = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const saveProductBtn = document.getElementById('saveProductBtn');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeProductModal());
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeProductModal());
        }
        if (saveProductBtn) {
            saveProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }
        
        // Close modal when clicking outside
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.addEventListener('click', (e) => {
                if (e.target === productModal) {
                    this.closeProductModal();
                }
            });
        }
        
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals
                if (productModal && productModal.classList.contains('active')) {
                    this.closeProductModal();
                }
            }
        });
        
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

    setupCalculations() {
        const purchasePrice = document.getElementById('purchasePrice');
        const shippingCost = document.getElementById('shippingCost');
        const profitMargin = document.getElementById('profitMargin');
        
        // Auto-calculate cost price and sale price
        const calculatePrices = () => {
            const purchase = parseFloat(purchasePrice.value) || 0;
            const shipping = parseFloat(shippingCost.value) || 0;
            const margin = parseFloat(profitMargin.value) || 60;
            
            const costPrice = purchase + shipping;
            const salePrice = costPrice + (costPrice * margin / 100);
            
            document.getElementById('costPrice').value = costPrice.toFixed(2);
            document.getElementById('salePrice').value = salePrice.toFixed(2);
        };
        
        purchasePrice.addEventListener('input', calculatePrices);
        shippingCost.addEventListener('input', calculatePrices);
        profitMargin.addEventListener('input', calculatePrices);
    }

    loadProducts() {
        try {
            const stored = localStorage.getItem('ash_ling_products');
            if (stored) {
                this.products = JSON.parse(stored);
                console.log(`✅ Productos cargados desde localStorage: ${this.products.length} productos`); // Debug
            } else {
                console.log('⚠️ No hay productos en localStorage, generando productos de muestra'); // Debug
                this.products = this.generateSampleProducts();
                console.log(`✅ Productos de muestra generados: ${this.products.length} productos`); // Debug
                this.saveProducts();
            }
        } catch (error) {
            console.error('❌ Error al cargar productos:', error);
            this.products = this.generateSampleProducts();
            console.log(`✅ Productos de muestra generados tras error: ${this.products.length} productos`); // Debug
            this.saveProducts();
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('ash_ling_products', JSON.stringify(this.products));
            console.log(`Productos guardados: ${this.products.length} productos en localStorage`); // Debug
        } catch (error) {
            console.error('Error al guardar productos:', error);
            this.showNotification('Error al guardar productos', 'error');
        }
    }

    generateSampleProducts() {
        const categories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
        const productNames = {
            carteras: ['Cartera Elegante', 'Bolso de Mano', 'Cartera Ejecutiva', 'Bolso Casual', 'Cartera de Noche'],
            perfumes: ['Perfume Floral', 'Fragancia Masculina', 'Eau de Toilette', 'Perfume Premium', 'Colonia Fresca'],
            accesorios: ['Collar Dorado', 'Pulsera de Plata', 'Aretes Elegantes', 'Anillo Fashion', 'Reloj Moderno'],
            ropa_dama: ['Blusa Elegante', 'Vestido Casual', 'Falda Ejecutiva', 'Pantalón de Vestir', 'Chaqueta Formal'],
            ropa_caballero: ['Camisa Formal', 'Pantalón Ejecutivo', 'Traje Completo', 'Corbata Elegante', 'Chaleco Moderno']
        };
        
        const products = [];
        let id = 1;
        
        categories.forEach(category => {
            productNames[category].forEach((name, index) => {
                const purchasePrice = 50 + Math.random() * 200;
                const shippingCost = 5 + Math.random() * 15;
                const costPrice = purchasePrice + shippingCost;
                const profitMargin = 60;
                const salePrice = costPrice + (costPrice * profitMargin / 100);
                const stock = Math.floor(Math.random() * 100) + 1;
                
                products.push({
                    id: id,
                    code: `ASH${String(id).padStart(4, '0')}`,
                    name: name,
                    category: category,
                    purchasePrice: parseFloat(purchasePrice.toFixed(2)),
                    shippingCost: parseFloat(shippingCost.toFixed(2)),
                    costPrice: parseFloat(costPrice.toFixed(2)),
                    profitMargin: profitMargin,
                    salePrice: parseFloat(salePrice.toFixed(2)),
                    stock: stock,
                    minStock: 5,
                    description: `Descripción del producto ${name}`,
                    supplier: 'Proveedor ejemplo',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                id++;
            });
        });
        
        return products;
    }

    renderProducts() {
        console.log('🎨 Renderizando productos...');
        console.log(`📊 Total productos en this.products: ${this.products.length}`);
        
        const filteredProducts = this.getFilteredProducts();
        console.log(`🔍 Productos después de filtrar: ${filteredProducts.length}`);
        
        const tbody = document.getElementById('inventoryTableBody');
        console.log('📋 Elemento tbody encontrado:', tbody);
        
        if (!tbody) {
            console.error('❌ No se encontró el elemento inventoryTableBody');
            return;
        }
        
        tbody.innerHTML = '';
        console.log('🧹 Tabla limpiada, añadiendo productos...');
        
        if (filteredProducts.length === 0) {
            console.log('⚠️ No hay productos filtrados para mostrar');
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="12" style="text-align: center; padding: 20px;">No hay productos disponibles</td>';
            tbody.appendChild(emptyRow);
            return;
        }
        
        filteredProducts.forEach((product, index) => {
            console.log(`➕ Añadiendo producto ${index + 1}: ${product.name}`);
            try {
                const row = document.createElement('tr');
                
                // Crear HTML más simple y seguro
                row.innerHTML = [
                    `<td>${product.code || 'N/A'}</td>`,
                    `<td><strong>${product.name || 'Sin nombre'}</strong><br><small>${product.description || ''}</small></td>`,
                    `<td><span class="category-badge ${product.category}">${this.getCategoryName(product.category)}</span></td>`,
                    `<td>$${(product.purchasePrice || 0).toFixed(2)}</td>`,
                    `<td>$${(product.shippingCost || 0).toFixed(2)}</td>`,
                    `<td>$${(product.costPrice || 0).toFixed(2)}</td>`,
                    `<td>${product.profitMargin || 0}%</td>`,
                    `<td>$${((product.salePrice || 0) - (product.costPrice || 0)).toFixed(2)}</td>`,
                    `<td>$${(product.salePrice || 0).toFixed(2)}</td>`,
                    `<td><span class="stock-quantity">${product.stock || 0}</span></td>`,
                    `<td><span class="status">${product.stock > 0 ? 'EN STOCK' : 'VENDIDO'}</span></td>`,
                    `<td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="window.inventoryManager.editProduct(${product.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" onclick="window.inventoryManager.deleteProduct(${product.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>`
                ].join('');
                
                tbody.appendChild(row);
                console.log(`✅ Producto ${product.name} añadido exitosamente`);
            } catch (error) {
                console.error(`❌ Error al renderizar producto ${product.name}:`, error);
                console.log('📋 Datos del producto:', product);
            }
        });
        
        console.log(`✅ Renderización completada. ${filteredProducts.length} productos añadidos a la tabla`);
    }

    getFilteredProducts() {
        console.log('🔍 Aplicando filtros a productos...');
        console.log(`📋 Filtros actuales:`, this.filters);
        
        let filtered = [...this.products];
        console.log(`📊 Productos iniciales: ${filtered.length}`);
        
        // Apply category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(product => product.category === this.filters.category);
            console.log(`📊 Después de filtro categoría '${this.filters.category}': ${filtered.length}`);
        }
        
        // Apply status filter
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(product => {
                const status = this.getStockStatus(product);
                return status.value === this.filters.status;
            });
            console.log(`📊 Después de filtro estado '${this.filters.status}': ${filtered.length}`);
        }
        
        // Apply price filter
        if (this.filters.price !== 'all') {
            const [min, max] = this.filters.price.split('-').map(p => p.replace('+', ''));
            filtered = filtered.filter(product => {
                if (max) {
                    return product.salePrice >= parseFloat(min) && product.salePrice <= parseFloat(max);
                } else {
                    return product.salePrice >= parseFloat(min);
                }
            });
            console.log(`📊 Después de filtro precio '${this.filters.price}': ${filtered.length}`);
        }
        
        // Apply search filter
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(search) ||
                product.code.toLowerCase().includes(search) ||
                product.description.toLowerCase().includes(search)
            );
            console.log(`📊 Después de filtro búsqueda '${this.filters.search}': ${filtered.length}`);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[this.sortBy];
            let bVal = b[this.sortBy];
            
            if (this.sortBy === 'salePrice' || this.sortBy === 'stock') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }
            
            if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        console.log(`✅ Productos finales después de filtros y ordenamiento: ${filtered.length}`);
        return filtered;
    }

    getStockStatus(product) {
        if (product.stock === 0) {
            return { value: 'sold_out', class: 'danger', text: 'VENDIDO' };
        } else {
            return { value: 'in_stock', class: 'success', text: 'EN STOCK' };
        }
    }

    getCategoryName(category) {
        const categoryMap = {
            'carteras': 'Carteras',
            'perfumes': 'Perfumes',
            'accesorios': 'Accesorios',
            'ropa_dama': 'Ropa de Dama',
            'ropa_caballero': 'Ropa de Caballero'
        };
        return categoryMap[category] || category;
    }

    updateStats() {
        console.log('📊 Actualizando estadísticas...');
        console.log('📦 Productos para calcular:', this.products.length);
        
        const totalProducts = this.products.reduce((sum, p) => sum + (p.stock || 0), 0); // Suma de todas las cantidades en stock
        const inStockProducts = this.products.filter(p => (p.stock || 0) > 0).length;
        const soldOutProducts = this.products.filter(p => (p.stock || 0) === 0).length;
        
        // Calcular valor total con validación
        const totalValue = this.products.reduce((sum, p) => {
            const costPrice = parseFloat(p.costPrice) || 0;
            const stock = parseInt(p.stock) || 0;
            const productValue = costPrice * stock;
            console.log(`💰 ${p.name || 'Sin nombre'}: $${costPrice} × ${stock} = $${productValue}`);
            return sum + productValue;
        }, 0);
        
        console.log(`📈 Estadísticas calculadas:`, {
            totalProducts,
            inStockProducts,
            soldOutProducts,
            totalValue
        });
        
        // Update stats display
        const statsElements = document.querySelectorAll('.inventory-stat p');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = totalProducts; // Total de unidades en stock
            statsElements[1].textContent = inStockProducts;
            statsElements[1].className = inStockProducts > 0 ? 'success' : '';
            statsElements[2].textContent = soldOutProducts;
            statsElements[2].className = soldOutProducts > 0 ? 'danger' : '';
            statsElements[3].textContent = `$${isNaN(totalValue) ? '0.00' : totalValue.toFixed(2)}`;
        } else {
            console.error('❌ No se encontraron suficientes elementos de estadísticas');
        }
        
        // Update alerts
        this.updateAlerts(inStockProducts, soldOutProducts);
    }

    updateAlerts(inStock, soldOut) {
        const alertsContainer = document.querySelector('.alerts-container');
        if (!alertsContainer) return;
        
        alertsContainer.innerHTML = '';
        
        if (soldOut > 0) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                <span><strong>${soldOut} productos</strong> están vendidos y necesitan reabastecimiento.</span>
                <button class="btn btn-sm" onclick="inventoryManager.showSoldOutProducts()">Ver Detalles</button>
            `;
            alertsContainer.appendChild(alert);
        }
        
        if (inStock > 0) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-success';
            alert.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span><strong>${inStock} productos</strong> están disponibles en stock.</span>
                <button class="btn btn-sm" onclick="inventoryManager.showInStockProducts()">Ver Detalles</button>
            `;
            alertsContainer.appendChild(alert);
        }
    }

    openProductModal(product = null) {
        console.log('🚀 openProductModal ejecutándose...');
        this.currentProduct = product;
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        
        if (!modal) {
            console.error('❌ Modal no encontrado!');
            return;
        }
        
        if (!modalTitle) {
            console.error('❌ Modal title no encontrado!');
            return;
        }
        
        if (product) {
            modalTitle.textContent = `Editar Producto - ${product.name}`;
            this.populateProductForm(product);
        } else {
            modalTitle.textContent = 'Nuevo Producto';
            this.resetProductForm();
            this.generateProductCode();
        }
        
        // Mostrar modal
        modal.classList.add('active');
        console.log('✅ Modal abierto exitosamente');
        
        // Focus en primer input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeProductModal() {
        const modal = document.getElementById('productModal');
        modal.classList.remove('active');
        this.currentProduct = null;
    }

    generateProductCode() {
        const lastProduct = this.products.reduce((max, product) => {
            const num = parseInt(product.code.substring(3));
            return num > max ? num : max;
        }, 0);
        
        const newCode = `ASH${String(lastProduct + 1).padStart(4, '0')}`;
        document.getElementById('productCode').value = newCode;
    }

    resetProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('profitMargin').value = '60';
        document.getElementById('shippingCost').value = '0';
        document.getElementById('minStock').value = '5';
        document.getElementById('costPrice').value = '';
        document.getElementById('salePrice').value = '';
    }

    populateProductForm(product) {
        document.getElementById('productCode').value = product.code;
        document.getElementById('productName').value = product.name;
        document.getElementById('category').value = product.category;
        document.getElementById('purchasePrice').value = product.purchasePrice;
        document.getElementById('shippingCost').value = product.shippingCost;
        document.getElementById('costPrice').value = product.costPrice;
        document.getElementById('profitMargin').value = product.profitMargin;
        document.getElementById('salePrice').value = product.salePrice;
        document.getElementById('stock').value = product.stock;
        document.getElementById('minStock').value = product.minStock;
        document.getElementById('description').value = product.description || '';
        document.getElementById('supplier').value = product.supplier || '';
    }

    saveProduct() {
        const form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const productCode = formData.get('productCode');
        
        // Verificar si el código ya existe (solo para nuevos productos o si cambió el código)
        if (!this.currentProduct || (this.currentProduct && this.currentProduct.code !== productCode)) {
            const existingProduct = this.products.find(p => p.code === productCode);
            if (existingProduct) {
                this.showNotification('Ya existe un producto con ese código', 'error');
                return;
            }
        }
        
        const productData = {
            code: productCode,
            name: formData.get('productName'),
            category: formData.get('category'),
            purchasePrice: parseFloat(formData.get('purchasePrice')),
            shippingCost: parseFloat(formData.get('shippingCost')) || 0,
            costPrice: parseFloat(formData.get('costPrice')),
            profitMargin: parseFloat(formData.get('profitMargin')),
            salePrice: parseFloat(formData.get('salePrice')),
            stock: parseInt(formData.get('stock')),
            minStock: parseInt(formData.get('minStock')) || 5,
            description: formData.get('description') || '',
            supplier: formData.get('supplier') || '',
            updatedAt: new Date().toISOString()
        };
        
        console.log('Guardando producto:', productData); // Debug
        
        if (this.currentProduct) {
            // Update existing product
            const index = this.products.findIndex(p => p.id === this.currentProduct.id);
            if (index !== -1) {
                this.products[index] = { ...this.currentProduct, ...productData };
                console.log('Producto actualizado en índice:', index); // Debug
            }
        } else {
            // Create new product
            productData.id = Date.now();
            productData.createdAt = new Date().toISOString();
            this.products.push(productData);
            console.log('Nuevo producto agregado con ID:', productData.id); // Debug
        }
        
        this.saveProducts();
        this.renderProducts();
        this.updateStats();
        this.closeProductModal();
        
        this.showNotification(
            this.currentProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
            'success'
        );
    }

    editProduct(id) {
        console.log('🔍 Debugging edición producto:');
        console.log('ID recibido:', id, 'Tipo:', typeof id);
        
        // Convertir ID a número para asegurar comparación correcta
        const numericId = parseInt(id);
        console.log('ID numérico:', numericId);
        
        const product = this.products.find(p => {
            console.log(`Comparando: producto.id=${p.id} (${typeof p.id}) con búsqueda=${numericId} (${typeof numericId})`);
            return parseInt(p.id) === numericId;
        });
        
        if (product) {
            console.log('✅ Producto encontrado para editar:', product.name);
            this.openProductModal(product);
        } else {
            console.error('❌ Producto NO encontrado con ID:', id);
            console.log('📋 IDs disponibles:', this.products.map(p => `${p.id} (${typeof p.id})`));
            this.showNotification('Producto no encontrado', 'error');
        }
    }

    deleteProduct(id) {
        console.log('🔍 Debugging eliminación producto:');
        console.log('ID recibido:', id, 'Tipo:', typeof id);
        console.log('Productos actuales:', this.products.length);
        
        // Convertir ID a número para asegurar comparación correcta
        const numericId = parseInt(id);
        console.log('ID numérico:', numericId);
        
        const product = this.products.find(p => {
            console.log(`Comparando: producto.id=${p.id} (${typeof p.id}) con búsqueda=${numericId} (${typeof numericId})`);
            return parseInt(p.id) === numericId;
        });
        
        if (product) {
            console.log('✅ Producto encontrado:', product.name);
            const confirmMessage = `¿Está seguro de que desea eliminar el producto?\n\nCódigo: ${product.code}\nNombre: ${product.name}\nStock: ${product.stock}\n\nEsta acción no se puede deshacer.`;
            
            if (confirm(confirmMessage)) {
                console.log('✅ Usuario confirmó eliminación');
                const originalLength = this.products.length;
                this.products = this.products.filter(p => parseInt(p.id) !== numericId);
                console.log(`📊 Productos antes: ${originalLength}, después: ${this.products.length}`);
                
                this.saveProducts();
                this.renderProducts();
                this.updateStats();
                this.showNotification('Producto eliminado exitosamente', 'success');
            } else {
                console.log('❌ Usuario canceló eliminación');
            }
        } else {
            console.error('❌ Producto NO encontrado con ID:', id);
            console.log('📋 IDs disponibles:', this.products.map(p => `${p.id} (${typeof p.id})`));
            this.showNotification('Producto no encontrado', 'error');
        }
    }

    openStockAdjustmentModal() {
        const modal = document.getElementById('stockAdjustmentModal');
        const productSelect = document.getElementById('productSelect');
        
        // Populate product select
        productSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
        this.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.code} - ${product.name}`;
            productSelect.appendChild(option);
        });
        
        modal.classList.add('active');
    }

    closeStockAdjustmentModal() {
        const modal = document.getElementById('stockAdjustmentModal');
        modal.classList.remove('active');
        document.getElementById('stockForm').reset();
    }

    updateCurrentStock(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            document.getElementById('currentStock').value = product.stock;
        }
    }

    saveStockAdjustment() {
        const form = document.getElementById('stockForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const productId = parseInt(document.getElementById('productSelect').value);
        const adjustmentType = document.getElementById('adjustmentType').value;
        const quantity = parseInt(document.getElementById('adjustmentQuantity').value);
        const reason = document.getElementById('adjustmentReason').value;
        
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        let newStock = product.stock;
        
        switch (adjustmentType) {
            case 'add':
                newStock += quantity;
                break;
            case 'subtract':
                newStock = Math.max(0, newStock - quantity);
                break;
            case 'set':
                newStock = quantity;
                break;
        }
        
        product.stock = newStock;
        product.updatedAt = new Date().toISOString();
        
        this.saveProducts();
        this.renderProducts();
        this.updateStats();
        this.closeStockAdjustmentModal();
        
        this.showNotification('Ajuste de stock realizado exitosamente', 'success');
    }

    quickStockAdjustment(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.openStockAdjustmentModal();
            document.getElementById('productSelect').value = id;
            this.updateCurrentStock(id);
        }
    }

    handleSearch(query) {
        this.filters.search = query;
        this.renderProducts();
    }

    applyFilter(filterType, value) {
        this.filters[filterType] = value;
        this.renderProducts();
    }

    applySorting(sortBy) {
        if (this.sortBy === sortBy) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = sortBy;
            this.sortDirection = 'asc';
        }
        this.renderProducts();
    }

    showInStockProducts() {
        this.filters.status = 'in_stock';
        document.getElementById('stockStatusFilter').value = 'in_stock';
        this.renderProducts();
    }

    showSoldOutProducts() {
        this.filters.status = 'sold_out';
        document.getElementById('stockStatusFilter').value = 'sold_out';
        this.renderProducts();
    }

    exportInventory() {
        const products = this.getFilteredProducts();
        const csv = this.convertToCSV(products);
        this.downloadCSV(csv, 'inventario.csv');
    }

    convertToCSV(products) {
        const headers = [
            'Código', 'Producto', 'Categoría', 'Precio Compra', 'Flete', 
            'Precio Costo', '% Ganancia', 'Ganancia Adquirida', 'Precio Venta', 'Stock', 'Stock Mínimo', 'Estado'
        ];
        
        const rows = products.map(product => [
            product.code,
            product.name,
            this.getCategoryName(product.category),
            product.purchasePrice.toFixed(2),
            product.shippingCost.toFixed(2),
            product.costPrice.toFixed(2),
            product.profitMargin + '%',
            (product.salePrice - product.costPrice).toFixed(2),
            product.salePrice.toFixed(2),
            product.stock,
            product.minStock,
            this.getStockStatus(product).text
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

    generateExcelReport() {
        try {
            console.log('📊 Generando reporte Excel profesional y elegante...');
            
            // Verificar que XLSX esté disponible
            if (typeof XLSX === 'undefined') {
                throw new Error('Librería XLSX no está cargada');
            }
            
            // Filtrar productos en stock
            const productosEnStock = this.products.filter(p => (p.stock || 0) > 0);
            const todosLosProductos = this.products;
            
            if (todosLosProductos.length === 0) {
                this.showNotification('No hay productos para generar el reporte', 'warning');
                return;
            }
            
            console.log(`📦 Generando reporte para ${todosLosProductos.length} productos total (${productosEnStock.length} en stock)`);
            
            // Crear libro de trabajo con propiedades profesionales
            const workbook = XLSX.utils.book_new();
            workbook.Props = {
                Title: "Reporte Ejecutivo de Inventario ASH-LING",
                Subject: "Análisis Completo de Inventario y Rentabilidad",
                Author: "Sistema ERP ASH-LING",
                Manager: "Administración Ejecutiva",
                Company: "ASH-LING Fashion & Accessories",
                Category: "Reportes Ejecutivos",
                Keywords: "inventario, análisis, rentabilidad, stock, productos, finanzas, business intelligence",
                Comments: "Reporte ejecutivo generado automáticamente con análisis completo de inventario, métricas de rentabilidad y recomendaciones estratégicas",
                LastAuthor: "Sistema Automatizado BI",
                CreatedDate: new Date(),
                ModifiedDate: new Date()
            };

            // === PORTADA EJECUTIVA ===
            this.createCoverSheet(workbook);
            
            // === DASHBOARD EJECUTIVO ===
            this.createExecutiveDashboard(workbook, todosLosProductos, productosEnStock);
            
            // === INVENTARIO MAESTRO ===
            this.createMasterInventory(workbook, todosLosProductos);
            
            // === ANÁLISIS DE RENTABILIDAD ===
            this.createProfitabilityAnalysis(workbook, productosEnStock);
            
            // === PRODUCTOS EN STOCK ===
            this.createStockAnalysis(workbook, productosEnStock);
            
            // === ALERTAS Y RECOMENDACIONES ===
            this.createAlertsAndRecommendations(workbook, todosLosProductos);
            
            // === TENDENCIAS Y PROYECCIONES ===
            this.createTrendsAndProjections(workbook, todosLosProductos);
            
            // Generar archivo con nombre profesional
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `ASH-LING_Reporte_Ejecutivo_Inventario_${timestamp}.xls`;
            
            // Escribir archivo en formato XLS para máxima compatibilidad
            XLSX.writeFile(workbook, fileName, { 
                bookType: 'xls',
                compression: true
            });
            
            console.log('✅ Reporte Excel XLS profesional generado exitosamente');
            this.showNotification(`📊 Reporte ejecutivo generado: ${todosLosProductos.length} productos analizados`, 'success');
            
        } catch (error) {
            console.error('❌ Error al generar reporte Excel:', error);
            this.showNotification('Error al generar el reporte: ' + error.message, 'error');
        }
    }

    // === CREAR PORTADA EJECUTIVA ===
    createCoverSheet(workbook) {
        const coverData = [
            [''],
            [''],
            ['', '', '', '', 'ASH-LING FASHION & ACCESSORIES', '', '', ''],
            ['', '', '', '', 'REPORTE EJECUTIVO DE INVENTARIO', '', '', ''],
            [''],
            ['', '', '', '', '📊 ANÁLISIS COMPLETO DE INVENTARIO', '', '', ''],
            ['', '', '', '', '💰 MÉTRICAS DE RENTABILIDAD', '', '', ''],
            ['', '', '', '', '📈 PROYECCIONES ESTRATÉGICAS', '', '', ''],
            [''],
            [''],
            ['', '', 'Información del Reporte', '', '', '', '', ''],
            [''],
            ['', '', 'Fecha de Generación:', new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })],
            ['', '', 'Hora:', new Date().toLocaleTimeString('es-ES')],
            ['', '', 'Sistema:', 'ERP ASH-LING v2.0'],
            ['', '', 'Productos Analizados:', this.products.length],
            ['', '', 'Período:', 'Inventario Actual'],
            ['', '', 'Moneda:', 'Dólares USD ($)'],
            [''],
            [''],
            ['', '', 'Contenido del Reporte', '', '', '', '', ''],
            [''],
            ['', '', '1. Dashboard Ejecutivo - KPIs y métricas clave'],
            ['', '', '2. Inventario Maestro - Base de datos completa'],
            ['', '', '3. Análisis de Rentabilidad - TOP productos y ROI'],
            ['', '', '4. Productos en Stock - Disponibilidad actual'],
            ['', '', '5. Alertas y Recomendaciones - Acciones sugeridas'],
            ['', '', '6. Tendencias y Proyecciones - Análisis predictivo'],
            [''],
            [''],
            ['', '', '', '', '© 2025 ASH-LING. Todos los derechos reservados.', '', '', '']
        ];

        const coverSheet = XLSX.utils.aoa_to_sheet(coverData);
        
        // Configurar anchos de columnas
        coverSheet['!cols'] = [
            { width: 5 }, { width: 5 }, { width: 15 }, { width: 15 }, 
            { width: 40 }, { width: 15 }, { width: 10 }, { width: 10 }
        ];

        // Combinar celdas para títulos
        if (!coverSheet['!merges']) coverSheet['!merges'] = [];
        coverSheet['!merges'].push(
            { s: { r: 2, c: 4 }, e: { r: 2, c: 6 } }, // Título empresa
            { s: { r: 3, c: 4 }, e: { r: 3, c: 6 } }, // Subtítulo
            { s: { r: 5, c: 4 }, e: { r: 5, c: 6 } }, // Análisis
            { s: { r: 6, c: 4 }, e: { r: 6, c: 6 } }, // Métricas
            { s: { r: 7, c: 4 }, e: { r: 7, c: 6 } }  // Proyecciones
        );

        XLSX.utils.book_append_sheet(workbook, coverSheet, '📋 Portada Ejecutiva');
    }

    // === DASHBOARD EJECUTIVO ===
    createExecutiveDashboard(workbook, todosProductos, productosStock) {
        const totalUnidades = todosProductos.reduce((sum, p) => sum + (p.stock || 0), 0);
        const valorInventario = todosProductos.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0);
        const productosSinStock = todosProductos.filter(p => (p.stock || 0) === 0);
        const productosStockBajo = todosProductos.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStock || 5));
        const promedioGanancia = productosStock.length > 0 ? 
            productosStock.reduce((sum, p) => sum + ((p.salePrice || 0) - (p.costPrice || 0)), 0) / productosStock.length : 0;

        const dashboardData = [
            ['', '', '', '🎯 DASHBOARD EJECUTIVO ASH-LING', '', '', '', ''],
            ['', '', '', `Actualizado: ${new Date().toLocaleString('es-ES')}`, '', '', '', ''],
            [''],
            ['📊 INDICADORES CLAVE DE RENDIMIENTO (KPIs)', '', '', '', '', '', '', ''],
            [''],
            ['KPI', 'Valor Actual', 'Meta', 'Estado', 'Variación', 'Tendencia', 'Acción', ''],
            ['Total Productos', todosProductos.length, '100+', 
             todosProductos.length >= 100 ? '🟢 ÓPTIMO' : todosProductos.length >= 50 ? '🟡 BUENO' : '🔴 BAJO',
             `${todosProductos.length - 100} vs meta`, 
             todosProductos.length >= 50 ? '📈 Creciendo' : '� Bajo meta',
             todosProductos.length < 50 ? 'Ampliar catálogo' : 'Mantener diversidad', ''],
            
            ['Productos en Stock', productosStock.length, '80% del total', 
             (productosStock.length / todosProductos.length) >= 0.8 ? '🟢 EXCELENTE' : '🟡 REGULAR',
             `${Math.round((productosStock.length / todosProductos.length) * 100)}%`,
             '📊 Estable', 'Mantener niveles', ''],
            
            ['Valor Inventario', `$${valorInventario.toLocaleString('en-US', {minimumFractionDigits: 2})}`, '$100,000+',
             valorInventario >= 100000 ? '🟢 ALTO' : valorInventario >= 50000 ? '🟡 MEDIO' : '🔴 BAJO',
             valorInventario >= 50000 ? '+' + Math.round((valorInventario - 50000) / 1000) + 'K' : 'Bajo meta',
             '💰 En crecimiento', 'Optimizar rotación', ''],
            
            ['Rotación Stock', `${productosSinStock.length} agotados`, '<5% del total',
             (productosSinStock.length / todosProductos.length) <= 0.05 ? '🟢 EXCELENTE' : '🟡 REVISAR',
             `${Math.round((productosSinStock.length / todosProductos.length) * 100)}%`,
             '🔄 Normal', productosSinStock.length > 10 ? 'Reabastecer urgente' : 'Monitorear', ''],
            
            ['Ganancia Promedio', `$${promedioGanancia.toFixed(2)}`, '$20+',
             promedioGanancia >= 20 ? '🟢 RENTABLE' : '🟡 MEJORAR',
             promedioGanancia >= 20 ? `+$${(promedioGanancia - 20).toFixed(2)}` : `$${(20 - promedioGanancia).toFixed(2)} bajo meta`,
             '📈 Positiva', promedioGanancia < 20 ? 'Revisar márgenes' : 'Mantener', ''],
            [''],
            ['💼 ANÁLISIS POR CATEGORÍAS', '', '', '', '', '', '', ''],
            [''],
            ['Categoría', 'Productos', 'En Stock', 'Stock Total', 'Valor USD', '% Inventario', 'Performance', 'Recomendación']
        ];

        // Análisis por categorías
        const categories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
        categories.forEach(cat => {
            const catProductos = todosProductos.filter(p => p.category === cat);
            const catStock = productosStock.filter(p => p.category === cat);
            const totalStock = catProductos.reduce((sum, p) => sum + (p.stock || 0), 0);
            const valorCat = catProductos.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0);
            const porcentaje = valorInventario > 0 ? ((valorCat / valorInventario) * 100).toFixed(1) : 0;
            
            let performance = '🟢 EXCELENTE';
            let recomendacion = 'Mantener estrategia';
            if (catStock.length < catProductos.length * 0.7) {
                performance = '🟡 REGULAR';
                recomendacion = 'Reabastecer productos';
            }
            if (totalStock < 10) {
                performance = '🔴 CRÍTICO';
                recomendacion = 'Urgente: Aumentar stock';
            }

            dashboardData.push([
                this.getCategoryName(cat),
                catProductos.length,
                catStock.length,
                totalStock,
                `$${valorCat.toLocaleString('en-US', {minimumFractionDigits: 2})}`,
                `${porcentaje}%`,
                performance,
                recomendacion
            ]);
        });

        // Totales y resumen
        dashboardData.push(['']);
        dashboardData.push(['🎯 RESUMEN EJECUTIVO', '', '', '', '', '', '', '']);
        dashboardData.push(['']);
        dashboardData.push(['• Total de productos en catálogo:', todosProductos.length, '', '', '', '', '', '']);
        dashboardData.push(['• Productos disponibles para venta:', productosStock.length, '', '', '', '', '', '']);
        dashboardData.push(['• Valor total del inventario:', `$${valorInventario.toLocaleString('en-US', {minimumFractionDigits: 2})}`, '', '', '', '', '', '']);
        dashboardData.push(['• Productos que requieren atención:', productosSinStock.length + productosStockBajo.length, '', '', '', '', '', '']);

        const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);
        
        // Configurar columnas
        dashboardSheet['!cols'] = [
            { width: 20 }, { width: 15 }, { width: 12 }, { width: 15 }, 
            { width: 15 }, { width: 15 }, { width: 20 }, { width: 20 }
        ];

        // Aplicar filtros automáticos
        dashboardSheet['!autofilter'] = { ref: 'A15:H' + (15 + categories.length) };

        // Combinar celdas para títulos
        if (!dashboardSheet['!merges']) dashboardSheet['!merges'] = [];
        dashboardSheet['!merges'].push(
            { s: { r: 0, c: 3 }, e: { r: 0, c: 6 } }, // Título principal
            { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } }, // KPIs
            { s: { r: 13, c: 0 }, e: { r: 13, c: 7 } } // Análisis categorías
        );

        XLSX.utils.book_append_sheet(workbook, dashboardSheet, '📊 Dashboard Ejecutivo');
    }
            
            // === HOJA 1: RESUMEN DE PRODUCTOS EN STOCK ===
            const summaryData = [
                ['', '', '', 'ASH-LING', 'REPORTE DE PRODUCTOS EN STOCK', '', '', ''],
                ['', '', '', 'Fecha:', new Date().toLocaleString('es-ES'), '', '', '', ''],
                ['', '', '', 'Total Productos Disponibles:', productosEnStock.length, '', '', '', ''],
                [''],
                ['RESUMEN DE PRODUCTOS DISPONIBLES', '', '', '', '', '', '', ''],
                [''],
                ['Métrica', 'Valor', 'Detalle', '', '', '', '', ''],
                ['Productos con Stock', productosEnStock.length, 'Unidades disponibles para venta'],
                ['Total Unidades', productosEnStock.reduce((sum, p) => sum + (p.stock || 0), 0), 'Suma de todas las unidades'],
                ['Valor Total Stock', '$' + productosEnStock.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0).toLocaleString('es-ES', {minimumFractionDigits: 2}), 'Valor total del inventario disponible'],
                ['Producto Más Stock', productosEnStock.sort((a, b) => (b.stock || 0) - (a.stock || 0))[0]?.name || 'N/A', 'Mayor cantidad en inventario'],
                ['Promedio Stock', Math.round(productosEnStock.reduce((sum, p) => sum + (p.stock || 0), 0) / productosEnStock.length), 'Promedio de unidades por producto'],
                [''],
                ['ANÁLISIS POR CATEGORÍAS - SOLO PRODUCTOS EN STOCK', '', '', '', '', '', '', ''],
                ['Categoría', 'Productos', 'Stock Total', 'Valor Inventario', '% del Total', 'Promedio Precio', 'Estado', 'Stock Promedio']
            ];
            
            // Análisis detallado por categorías solo productos en stock
            const categories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
            const totalInventoryValue = productosEnStock.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0);
            
            categories.forEach(cat => {
                const catProductsEnStock = productosEnStock.filter(p => p.category === cat);
                if (catProductsEnStock.length > 0) {
                    const catStock = catProductsEnStock.reduce((sum, p) => sum + (p.stock || 0), 0);
                    const catValue = catProductsEnStock.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0);
                    const avgPrice = catProductsEnStock.reduce((sum, p) => sum + (p.salePrice || 0), 0) / catProductsEnStock.length;
                    const avgStock = Math.round(catStock / catProductsEnStock.length);
                    const percentage = totalInventoryValue > 0 ? ((catValue / totalInventoryValue) * 100).toFixed(1) : 0;
                    const status = catStock > 50 ? 'EXCELENTE' : catStock > 20 ? 'BUENO' : 'REGULAR';
                    
                    summaryData.push([
                        this.getCategoryName(cat),
                        catProductsEnStock.length,
                        catStock,
                        '$' + catValue.toLocaleString('es-ES', {minimumFractionDigits: 2}),
                        percentage + '%',
                        '$' + avgPrice.toLocaleString('es-ES', {minimumFractionDigits: 2}),
                        status,
                        avgStock + ' unid/prod'
                    ]);
                }
            });
            
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            
            // Configurar rangos para tablas dinámicas
            summarySheet['!ref'] = 'A1:H' + (summaryData.length);
            summarySheet['!autofilter'] = { ref: 'A14:H' + (summaryData.length) }; // Tabla dinámica para categorías
            
            // Estilos profesionales
            summarySheet['!cols'] = [
                { width: 20 }, { width: 12 }, { width: 15 }, { width: 18 }, 
                { width: 12 }, { width: 15 }, { width: 12 }, { width: 15 }
            ];
            
            // Combinar celdas para el título
            if (!summarySheet['!merges']) summarySheet['!merges'] = [];
            summarySheet['!merges'].push({ s: { r: 0, c: 3 }, e: { r: 0, c: 6 } }); // Título principal
            
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen Stock Disponible');
            
            // === HOJA 2: DETALLE DE PRODUCTOS EN STOCK ===
            const detailData = [
                [
                    'Código', 'Producto', 'Categoría', 'Descripción', 'Proveedor',
                    'Precio Compra', 'Flete', 'Costo Total', 'Precio Venta', 'Ganancia Unit.',
                    'Stock Actual', 'Stock Mínimo', 'Valor Total', 'ROI %', 'Días Stock', 'Estado Stock'
                ]
            ];
            
            productosEnStock.forEach(product => {
                const gananciaUnitaria = (product.salePrice || 0) - (product.costPrice || 0);
                const valorTotal = (product.costPrice || 0) * (product.stock || 0);
                const roi = (product.costPrice || 0) > 0 ? ((gananciaUnitaria / (product.costPrice || 0)) * 100).toFixed(1) : 0;
                const fechaCreacion = product.createdAt ? new Date(product.createdAt) : new Date();
                const diasStock = Math.floor((new Date() - fechaCreacion) / (1000 * 60 * 60 * 24));
                
                let estadoStock = 'NORMAL';
                if ((product.stock || 0) > (product.minStock || 5) * 3) estadoStock = 'EXCESO';
                else if ((product.stock || 0) <= (product.minStock || 5)) estadoStock = 'BAJO';
                
                detailData.push([
                    product.code || 'N/A',
                    product.name || 'Sin nombre',
                    this.getCategoryName(product.category),
                    product.description || 'Sin descripción',
                    product.supplier || 'Sin proveedor',
                    product.purchasePrice || 0,
                    product.shippingCost || 0,
                    product.costPrice || 0,
                    product.salePrice || 0,
                    gananciaUnitaria.toFixed(2),
                    product.stock || 0,
                    product.minStock || 5,
                    valorTotal.toFixed(2),
                    roi + '%',
                    diasStock,
                    estadoStock
                ]);
            });
            
            const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
            
            // Configurar como tabla con filtros automáticos
            detailSheet['!ref'] = 'A1:P' + detailData.length;
            detailSheet['!autofilter'] = { ref: 'A1:P' + detailData.length };
            
            // Configurar anchos optimizados
            detailSheet['!cols'] = [
                { width: 12 }, { width: 25 }, { width: 15 }, { width: 30 }, { width: 20 },
                { width: 12 }, { width: 8 }, { width: 12 }, { width: 12 }, { width: 12 },
                { width: 10 }, { width: 10 }, { width: 15 }, { width: 8 }, { width: 10 }, { width: 12 }
            ];
            
            XLSX.utils.book_append_sheet(workbook, detailSheet, 'Productos en Stock');
            
            // === HOJA 3: ANÁLISIS DE RENTABILIDAD ===
            const profitabilityData = [
                ['ANÁLISIS DE RENTABILIDAD - PRODUCTOS EN STOCK', '', '', '', '', '', ''],
                [''],
                ['TOP 10 PRODUCTOS MÁS RENTABLES', '', '', '', '', '', ''],
                ['Ranking', 'Producto', 'Stock', 'Ganancia Unitaria', 'Ganancia Total', 'ROI %', 'Estado']
            ];
            
            // Top 10 más rentables con stock
            const productosRentables = [...productosEnStock]
                .map(p => ({
                    ...p,
                    gananciaUnitaria: (p.salePrice || 0) - (p.costPrice || 0),
                    gananciaTotal: ((p.salePrice || 0) - (p.costPrice || 0)) * (p.stock || 0),
                    roi: (p.costPrice || 0) > 0 ? (((p.salePrice || 0) - (p.costPrice || 0)) / (p.costPrice || 0)) * 100 : 0
                }))
                .sort((a, b) => b.gananciaTotal - a.gananciaTotal)
                .slice(0, 10);
            
            productosRentables.forEach((product, index) => {
                const estado = product.stock > (product.minStock || 5) ? 'Disponible' : 'Stock Bajo';
                profitabilityData.push([
                    index + 1,
                    product.name || 'Sin nombre',
                    product.stock || 0,
                    '$' + product.gananciaUnitaria.toFixed(2),
                    '$' + product.gananciaTotal.toFixed(2),
                    product.roi.toFixed(1) + '%',
                    estado
                ]);
            });
            
            profitabilityData.push(['']);
            profitabilityData.push(['PRODUCTOS CON STOCK ALTO (>20 unidades)', '', '', '', '', '', '']);
            profitabilityData.push(['Producto', 'Stock', 'Valor Inventario', 'Rotación Estimada', 'Días Stock', 'Recomendación', '']);
            
            const stockAlto = productosEnStock.filter(p => (p.stock || 0) > 20);
            stockAlto.forEach(product => {
                const valorInventario = (product.costPrice || 0) * (product.stock || 0);
                const fechaCreacion = product.createdAt ? new Date(product.createdAt) : new Date();
                const diasStock = Math.floor((new Date() - fechaCreacion) / (1000 * 60 * 60 * 24));
                const rotacionEstimada = diasStock > 0 ? Math.round((product.stock || 0) / (diasStock / 30)) : 'N/A';
                
                let recomendacion = 'Mantener';
                if (diasStock > 90 && (product.stock || 0) > 30) recomendacion = 'Promoción';
                else if (diasStock > 60) recomendacion = 'Monitorear';
                
                profitabilityData.push([
                    product.name || 'Sin nombre',
                    product.stock || 0,
                    '$' + valorInventario.toFixed(2),
                    rotacionEstimada + '/mes',
                    diasStock + ' días',
                    recomendacion,
                    ''
                ]);
            });
            
            const profitabilitySheet = XLSX.utils.aoa_to_sheet(profitabilityData);
            profitabilitySheet['!cols'] = [
                { width: 8 }, { width: 25 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 15 }
            ];
            
            // Aplicar filtros automáticos
            if (productosRentables.length > 0) {
                profitabilitySheet['!autofilter'] = { ref: 'A4:G' + (4 + productosRentables.length) };
            }
            
            XLSX.utils.book_append_sheet(workbook, profitabilitySheet, 'Análisis Rentabilidad');
            
            // Configurar propiedades del libro
            workbook.Props = {
                Title: "Reporte de Productos en Stock - ASH-LING",
                Subject: "Análisis de Productos Disponibles",
                Author: "Sistema ERP ASH-LING",
                Manager: "Administración",
                Company: "ASH-LING",
                Category: "Inventarios - Solo Stock Disponible",
                Keywords: "inventario, stock, productos disponibles, análisis",
                Comments: "Reporte enfocado únicamente en productos con stock disponible para venta",
                LastAuthor: "Sistema Automatizado",
                CreatedDate: new Date()
            };
            
            // Generar archivo en formato XLSX
            const fileName = `ASH-LING-Productos-Stock-${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
            
            console.log(`✅ Reporte Excel XLSX generado exitosamente: ${productosEnStock.length} productos en stock`);
            this.showNotification(`📊 Reporte generado: ${productosEnStock.length} productos con stock disponible`, 'success');
            
        } catch (error) {
            console.error('❌ Error al generar reporte Excel:', error);
            this.showNotification('Error al generar el reporte profesional: ' + error.message, 'error');
        }
    }

    // Función de diagnóstico para debugging
    diagnosticProducts() {
        console.log('🔧 DIAGNÓSTICO DE PRODUCTOS:');
        console.log('Total productos:', this.products.length);
        console.log('Productos cargados:', this.products);
        
        this.products.forEach((product, index) => {
            console.log(`Producto ${index + 1}:`, {
                id: product.id,
                idType: typeof product.id,
                name: product.name,
                code: product.code
            });
        });
        
        console.log('window.inventoryManager:', window.inventoryManager ? 'EXISTE' : 'NO EXISTE');
        
        // Probar primer producto
        if (this.products.length > 0) {
            const firstProduct = this.products[0];
            console.log('🧪 Probando primer producto:', firstProduct.name);
            console.log('ID:', firstProduct.id, 'Tipo:', typeof firstProduct.id);
            
            // Simular clic en botón editar
            console.log('Probando editProduct...');
            try {
                this.editProduct(firstProduct.id);
                console.log('✅ editProduct funcionó');
            } catch (error) {
                console.error('❌ Error en editProduct:', error);
            }
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        let backgroundColor;
        switch (type) {
            case 'success':
                backgroundColor = '#10b981'; // Verde
                break;
            case 'error':
                backgroundColor = '#ef4444'; // Rojo
                break;
            case 'warning':
                backgroundColor = '#f59e0b'; // Amarillo
                break;
            default:
                backgroundColor = 'var(--primary-color)'; // Negro/Primario
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${backgroundColor};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Global functions for onclick events
window.showInStockProducts = () => inventoryManager.showInStockProducts();
window.showSoldOutProducts = () => inventoryManager.showSoldOutProducts();

// Función de prueba para el botón
window.testButtonClick = () => {
    console.log('🧪 Función de prueba ejecutada desde window.testButtonClick');
    
    // Forzar apertura del modal directamente
    const modal = document.getElementById('productModal');
    if (modal) {
        console.log('✅ Modal encontrado, añadiendo clase active...');
        modal.classList.add('active');
        console.log('✅ Clase active añadida, modal debería estar visible');
        
        // Verificar título
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Nuevo Producto';
        }
        
        // Reset form
        const form = document.getElementById('productForm');
        if (form) {
            form.reset();
            // Establecer valores por defecto
            const profitMargin = document.getElementById('profitMargin');
            const shippingCost = document.getElementById('shippingCost');
            const minStock = document.getElementById('minStock');
            if (profitMargin) profitMargin.value = '60';
            if (shippingCost) shippingCost.value = '0';
            if (minStock) minStock.value = '5';
        }
        
        return true;
    } else {
        console.error('❌ Modal no encontrado');
        return false;
    }
};

// Función simple para abrir modal
window.openModal = () => {
    console.log('🔓 Abriendo modal...');
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('active');
        console.log('✅ Modal abierto');
    } else {
        console.error('❌ Modal no encontrado');
    }
};

// Función de prueba para editar
window.testEdit = () => {
    console.log('🔧 Probando función de editar...');
    if (window.inventoryManager && window.inventoryManager.products.length > 0) {
        const firstProduct = window.inventoryManager.products[0];
        console.log('📝 Editando producto:', firstProduct.name);
        window.inventoryManager.editProduct(firstProduct.id);
        return true;
    } else {
        console.error('❌ No hay productos para editar');
        return false;
    }
};

// Función de prueba para eliminar
window.testDelete = () => {
    console.log('🗑️ Probando función de eliminar...');
    if (window.inventoryManager && window.inventoryManager.products.length > 0) {
        const lastProduct = window.inventoryManager.products[window.inventoryManager.products.length - 1];
        console.log('🗑️ Eliminando producto:', lastProduct.name);
        window.inventoryManager.deleteProduct(lastProduct.id);
        return true;
    } else {
        console.error('❌ No hay productos para eliminar');
        return false;
    }
};

// Función para verificar categorías
window.checkCategories = () => {
    console.log('🏷️ Verificando categorías de productos...');
    if (window.inventoryManager && window.inventoryManager.products.length > 0) {
        window.inventoryManager.products.forEach(product => {
            const categoryName = window.inventoryManager.getCategoryName(product.category);
            console.log(`📦 ${product.name}: ${product.category} → ${categoryName}`);
        });
        return true;
    } else {
        console.error('❌ No hay productos para verificar');
        return false;
    }
};

// Función para verificar cálculos de estadísticas
window.checkStats = () => {
    console.log('📊 Verificando cálculos de estadísticas...');
    if (window.inventoryManager && window.inventoryManager.products.length > 0) {
        let totalUnits = 0;
        let totalValue = 0;
        let inStock = 0;
        let soldOut = 0;
        
        window.inventoryManager.products.forEach(product => {
            const stock = parseInt(product.stock) || 0;
            const costPrice = parseFloat(product.costPrice) || 0;
            const productValue = costPrice * stock;
            
            totalUnits += stock;
            totalValue += productValue;
            
            if (stock > 0) inStock++;
            else soldOut++;
            
            console.log(`📦 ${product.name}: Stock=${stock}, Costo=$${costPrice}, Valor=$${productValue.toFixed(2)}`);
        });
        
        console.log(`📈 Totales calculados:`);
        console.log(`   Total unidades: ${totalUnits}`);
        console.log(`   En stock: ${inStock} productos`);
        console.log(`   Vendidos: ${soldOut} productos`);
        console.log(`   Valor total: $${totalValue.toFixed(2)}`);
        
        // Forzar actualización
        window.inventoryManager.updateStats();
        
        return { totalUnits, totalValue, inStock, soldOut };
    } else {
        console.error('❌ No hay productos para verificar');
        return null;
    }
};

// Función de debug para productos
window.debugProducts = () => {
    console.log('🔧 Función de debug para productos');
    if (window.inventoryManager) {
        console.log('📊 Productos en memoria:', window.inventoryManager.products.length);
        console.log('📋 Lista de productos:', window.inventoryManager.products);
        console.log('🔍 Filtros actuales:', window.inventoryManager.filters);
        
        // Forzar renderización
        console.log('🔄 Forzando renderización...');
        window.inventoryManager.renderProducts();
        
        return window.inventoryManager.products;
    } else {
        console.error('❌ inventoryManager no disponible');
        return null;
    }
};

// Función para resetear productos de muestra
window.resetSampleProducts = () => {
    console.log('🔄 Reseteando productos de muestra...');
    if (window.inventoryManager) {
        // Limpiar localStorage
        localStorage.removeItem('ash_ling_products');
        console.log('🧹 localStorage limpiado');
        
        // Regenerar productos de muestra
        window.inventoryManager.products = window.inventoryManager.generateSampleProducts();
        console.log(`✅ ${window.inventoryManager.products.length} productos de muestra generados`);
        
        // Guardar en localStorage
        window.inventoryManager.saveProducts();
        console.log('💾 Productos guardados en localStorage');
        
        // Renderizar
        window.inventoryManager.renderProducts();
        console.log('🎨 Productos renderizados en tabla');
        
        // Actualizar estadísticas
        window.inventoryManager.updateStats();
        console.log('📊 Estadísticas actualizadas');
        
        return window.inventoryManager.products;
    } else {
        console.error('❌ inventoryManager no disponible');
        return null;
    }
};

// Función de emergencia para cargar productos
window.forceLoadProducts = () => {
    console.log('� FUNCIÓN DE EMERGENCIA: Forzando carga de productos');
    
    // Limpiar todo
    localStorage.removeItem('ash_ling_products');
    
    // Crear productos de muestra directamente
    const sampleProducts = [
        {
            id: 1,
            code: 'ASH0001',
            name: 'Cartera Elegante',
            category: 'carteras',
            purchasePrice: 50.00,
            shippingCost: 5.00,
            costPrice: 55.00,
            profitMargin: 60,
            salePrice: 88.00,
            stock: 15,
            minStock: 5,
            description: 'Cartera elegante para dama',
            supplier: 'Proveedor A'
        },
        {
            id: 2,
            code: 'ASH0002',
            name: 'Perfume Floral',
            category: 'perfumes',
            purchasePrice: 30.00,
            shippingCost: 3.00,
            costPrice: 33.00,
            profitMargin: 70,
            salePrice: 56.10,
            stock: 25,
            minStock: 5,
            description: 'Perfume con fragancia floral',
            supplier: 'Proveedor B'
        },
        {
            id: 3,
            code: 'ASH0003',
            name: 'Collar Dorado',
            category: 'accesorios',
            purchasePrice: 20.00,
            shippingCost: 2.00,
            costPrice: 22.00,
            profitMargin: 80,
            salePrice: 39.60,
            stock: 8,
            minStock: 5,
            description: 'Collar dorado elegante',
            supplier: 'Proveedor C'
        }
    ];
    
    // Insertar productos directamente en la tabla
    const tbody = document.getElementById('inventoryTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        
        sampleProducts.forEach(product => {
            const row = document.createElement('tr');
            // Obtener nombre de categoría
            const categoryMap = {
                'carteras': 'Carteras',
                'perfumes': 'Perfumes',
                'accesorios': 'Accesorios',
                'ropa_dama': 'Ropa de Dama',
                'ropa_caballero': 'Ropa de Caballero'
            };
            const categoryName = categoryMap[product.category] || product.category;
            
            row.innerHTML = `
                <td>${product.code}</td>
                <td><strong>${product.name}</strong><br><small>${product.description}</small></td>
                <td><span class="category-badge ${product.category}">${categoryName}</span></td>
                <td>$${product.purchasePrice.toFixed(2)}</td>
                <td>$${product.shippingCost.toFixed(2)}</td>
                <td>$${product.costPrice.toFixed(2)}</td>
                <td>${product.profitMargin}%</td>
                <td>$${(product.salePrice - product.costPrice).toFixed(2)}</td>
                <td>$${product.salePrice.toFixed(2)}</td>
                <td><span class="stock-quantity success">${product.stock}</span></td>
                <td><span class="status success">EN STOCK</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" onclick="window.inventoryManager.editProduct(${product.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="window.inventoryManager.deleteProduct(${product.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Productos de emergencia cargados directamente en la tabla');
        
        // Guardar productos en el inventoryManager también
        if (window.inventoryManager) {
            window.inventoryManager.products = sampleProducts;
            window.inventoryManager.saveProducts();
            console.log('💾 Productos guardados en inventoryManager');
            
            // Actualizar estadísticas usando el método correcto
            window.inventoryManager.updateStats();
        } else {
            // Actualizar estadísticas manualmente si no hay inventoryManager
            const totalUnits = sampleProducts.reduce((sum, p) => sum + p.stock, 0);
            const totalValue = sampleProducts.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
            
            const statsElements = document.querySelectorAll('.inventory-stat p');
            if (statsElements.length >= 4) {
                statsElements[0].textContent = totalUnits; // Total unidades
                statsElements[1].textContent = sampleProducts.length;  // En stock
                statsElements[2].textContent = '0';  // Vendidos
                statsElements[3].textContent = `$${totalValue.toFixed(2)}`; // Valor total
            }
        }
        
        return true;
    }
    return false;
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 DOM cargado, inicializando InventoryManager...');
    window.inventoryManager = new InventoryManager();
    console.log('✅ InventoryManager inicializado y asignado a window.inventoryManager');
    
    // Configurar botón de respaldo
    setTimeout(() => {
        const newProductBtn = document.getElementById('newProductBtn');
        if (newProductBtn) {
            console.log('🔄 Configurando event listener de respaldo para botón');
            newProductBtn.onclick = () => {
                console.log('🔥 Click de respaldo detectado');
                window.testButtonClick();
            };
        }
    }, 100);
    
    // Forzar carga de productos después de un breve delay
    setTimeout(() => {
        console.log('🔄 Forzando carga y renderización de productos...');
        if (window.inventoryManager.products.length === 0) {
            console.log('⚠️ No hay productos, generando productos de muestra...');
            window.inventoryManager.products = window.inventoryManager.generateSampleProducts();
            window.inventoryManager.saveProducts();
        }
        window.inventoryManager.renderProducts();
        window.inventoryManager.updateStats();
        console.log('✅ Carga forzada completada');
        
        // Verificar si la tabla sigue vacía después de 1 segundo
        setTimeout(() => {
            const tbody = document.getElementById('inventoryTableBody');
            if (tbody && tbody.children.length === 0) {
                console.log('🚨 Tabla sigue vacía, ejecutando función de emergencia...');
                window.forceLoadProducts();
            }
            
            // Ejecutar diagnóstico para verificar funcionamiento de botones
            console.log('🔧 Ejecutando diagnóstico de productos...');
            if (window.inventoryManager && window.inventoryManager.diagnosticProducts) {
                window.inventoryManager.diagnosticProducts();
            }
        }, 1000);
    }, 500);
});
