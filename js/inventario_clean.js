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
        var newProductBtn = document.getElementById('newProductBtn');
        var exportInventoryBtn = document.getElementById('exportInventoryBtn');
        var generateReportBtn = document.getElementById('generateReportBtn');
        
        console.log('🔍 Buscando botón newProductBtn...', newProductBtn);
        
        if (newProductBtn) {
            console.log('✅ Botón newProductBtn encontrado, añadiendo event listener');
            var self = this;
            newProductBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🔥 CLICK detectado en botón Nuevo Producto');
                self.openProductModal();
            });
        } else {
            console.error('❌ Botón newProductBtn NO encontrado');
        }
        
        if (exportInventoryBtn) {
            var self = this;
            exportInventoryBtn.addEventListener('click', function() { self.exportInventory(); });
        }
        
        if (generateReportBtn) {
            var self = this;
            generateReportBtn.addEventListener('click', function() { self.generateExcelReport(); });
        }
        
        // Search
        var searchProducts = document.getElementById('searchProducts');
        if (searchProducts) {
            var self = this;
            searchProducts.addEventListener('input', function(e) { self.handleSearch(e.target.value); });
        }
        
        // Filters
        var categoryFilter = document.getElementById('categoryFilter');
        var stockStatusFilter = document.getElementById('stockStatusFilter');
        var priceFilter = document.getElementById('priceFilter');
        var sortFilter = document.getElementById('sortFilter');
        
        if (categoryFilter) {
            var self = this;
            categoryFilter.addEventListener('change', function(e) { self.applyFilter('category', e.target.value); });
        }
        if (stockStatusFilter) {
            var self = this;
            stockStatusFilter.addEventListener('change', function(e) { self.applyFilter('status', e.target.value); });
        }
        if (priceFilter) {
            var self = this;
            priceFilter.addEventListener('change', function(e) { self.applyFilter('price', e.target.value); });
        }
        if (sortFilter) {
            var self = this;
            sortFilter.addEventListener('change', function(e) { self.applySorting(e.target.value); });
        }
        
        // Product modal
        var closeModal = document.getElementById('closeModal');
        var cancelBtn = document.getElementById('cancelBtn');
        var saveProductBtn = document.getElementById('saveProductBtn');
        
        if (closeModal) {
            var self = this;
            closeModal.addEventListener('click', function() { self.closeProductModal(); });
        }
        if (cancelBtn) {
            var self = this;
            cancelBtn.addEventListener('click', function() { self.closeProductModal(); });
        }
        if (saveProductBtn) {
            var self = this;
            saveProductBtn.addEventListener('click', function(e) {
                e.preventDefault();
                self.saveProduct();
            });
        }
        
        // Close modal when clicking outside
        var productModal = document.getElementById('productModal');
        if (productModal) {
            var self = this;
            productModal.addEventListener('click', function(e) {
                if (e.target === productModal) {
                    self.closeProductModal();
                }
            });
        }
        
        // Keyboard event listeners
        var self = this;
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open modals
                if (productModal && productModal.classList.contains('active')) {
                    self.closeProductModal();
                }
            }
        });
        
        // Sidebar toggle
        var sidebarToggle = document.getElementById('sidebarToggle');
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        var sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('collapsed');
            });
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                sidebar.classList.toggle('mobile-open');
            });
        }
    }

    setupCalculations() {
        var purchasePrice = document.getElementById('purchasePrice');
        var shippingCost = document.getElementById('shippingCost');
        var profitMargin = document.getElementById('profitMargin');
        
        // Auto-calculate cost price and sale price
        var calculatePrices = function() {
            var purchase = parseFloat(purchasePrice.value) || 0;
            var shipping = parseFloat(shippingCost.value) || 0;
            var margin = parseFloat(profitMargin.value) || 60;
            
            var costPrice = purchase + shipping;
            var salePrice = costPrice + (costPrice * margin / 100);
            
            document.getElementById('costPrice').value = costPrice.toFixed(2);
            document.getElementById('salePrice').value = salePrice.toFixed(2);
        };
        
        purchasePrice.addEventListener('input', calculatePrices);
        shippingCost.addEventListener('input', calculatePrices);
        profitMargin.addEventListener('input', calculatePrices);
    }

    loadProducts() {
        try {
            var stored = localStorage.getItem('ash_ling_products');
            if (stored) {
                this.products = JSON.parse(stored);
                console.log('✅ Productos cargados desde localStorage: ' + this.products.length + ' productos');
            } else {
                console.log('⚠️ No hay productos en localStorage, generando productos de muestra');
                this.products = this.generateSampleProducts();
                console.log('✅ Productos de muestra generados: ' + this.products.length + ' productos');
                this.saveProducts();
            }
        } catch (error) {
            console.error('❌ Error al cargar productos:', error);
            this.products = this.generateSampleProducts();
            console.log('✅ Productos de muestra generados tras error: ' + this.products.length + ' productos');
            this.saveProducts();
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('ash_ling_products', JSON.stringify(this.products));
            console.log('Productos guardados: ' + this.products.length + ' productos en localStorage');
        } catch (error) {
            console.error('Error al guardar productos:', error);
            this.showNotification('Error al guardar productos', 'error');
        }
    }

    generateSampleProducts() {
        var categories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
        var productNames = {
            carteras: ['Cartera Elegante', 'Bolso de Mano', 'Cartera Ejecutiva', 'Bolso Casual', 'Cartera de Noche'],
            perfumes: ['Perfume Floral', 'Fragancia Masculina', 'Eau de Toilette', 'Perfume Premium', 'Colonia Fresca'],
            accesorios: ['Collar Dorado', 'Pulsera de Plata', 'Aretes Elegantes', 'Anillo Fashion', 'Reloj Moderno'],
            ropa_dama: ['Blusa Elegante', 'Vestido Casual', 'Falda Ejecutiva', 'Pantalón de Vestir', 'Chaqueta Formal'],
            ropa_caballero: ['Camisa Formal', 'Pantalón Ejecutivo', 'Traje Completo', 'Corbata Elegante', 'Chaleco Moderno']
        };
        
        var products = [];
        var id = 1;
        
        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            var names = productNames[category];
            for (var j = 0; j < names.length; j++) {
                var name = names[j];
                var purchasePrice = 50 + Math.random() * 200;
                var shippingCost = 5 + Math.random() * 15;
                var costPrice = purchasePrice + shippingCost;
                var profitMargin = 60;
                var salePrice = costPrice + (costPrice * profitMargin / 100);
                var stock = Math.floor(Math.random() * 100) + 1;
                
                products.push({
                    id: id,
                    code: 'ASH' + String(id).padStart(4, '0'),
                    name: name,
                    category: category,
                    purchasePrice: parseFloat(purchasePrice.toFixed(2)),
                    shippingCost: parseFloat(shippingCost.toFixed(2)),
                    costPrice: parseFloat(costPrice.toFixed(2)),
                    profitMargin: profitMargin,
                    salePrice: parseFloat(salePrice.toFixed(2)),
                    stock: stock,
                    minStock: 5,
                    description: 'Descripción del producto ' + name,
                    supplier: 'Proveedor ejemplo',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                id++;
            }
        }
        
        return products;
    }

    renderProducts() {
        console.log('🎨 Renderizando productos...');
        console.log('📊 Total productos en this.products: ' + this.products.length);
        
        var filteredProducts = this.getFilteredProducts();
        console.log('🔍 Productos después de filtrar: ' + filteredProducts.length);
        
        var tbody = document.getElementById('inventoryTableBody');
        console.log('📋 Elemento tbody encontrado:', tbody);
        
        if (!tbody) {
            console.error('❌ No se encontró el elemento inventoryTableBody');
            return;
        }
        
        tbody.innerHTML = '';
        console.log('🧹 Tabla limpiada, añadiendo productos...');
        
        if (filteredProducts.length === 0) {
            console.log('⚠️ No hay productos filtrados para mostrar');
            var emptyRow = document.createElement('tr');
            emptyRow.innerHTML = '<td colspan="12" style="text-align: center; padding: 20px;">No hay productos disponibles</td>';
            tbody.appendChild(emptyRow);
            return;
        }
        
        for (var i = 0; i < filteredProducts.length; i++) {
            var product = filteredProducts[i];
            console.log('➕ Añadiendo producto ' + (i + 1) + ': ' + product.name);
            try {
                var row = document.createElement('tr');
                
                // Crear HTML más simple y seguro
                row.innerHTML = [
                    '<td>' + (product.code || 'N/A') + '</td>',
                    '<td><strong>' + (product.name || 'Sin nombre') + '</strong><br><small>' + (product.description || '') + '</small></td>',
                    '<td><span class="category-badge ' + product.category + '">' + this.getCategoryName(product.category) + '</span></td>',
                    '<td>$' + (product.purchasePrice || 0).toFixed(2) + '</td>',
                    '<td>$' + (product.shippingCost || 0).toFixed(2) + '</td>',
                    '<td>$' + (product.costPrice || 0).toFixed(2) + '</td>',
                    '<td>' + (product.profitMargin || 0) + '%</td>',
                    '<td>$' + ((product.salePrice || 0) - (product.costPrice || 0)).toFixed(2) + '</td>',
                    '<td>$' + (product.salePrice || 0).toFixed(2) + '</td>',
                    '<td><span class="stock-quantity">' + (product.stock || 0) + '</span></td>',
                    '<td><span class="status">' + (product.stock > 0 ? 'EN STOCK' : 'VENDIDO') + '</span></td>',
                    '<td>' +
                        '<div class="action-buttons">' +
                            '<button class="btn-action btn-edit" onclick="window.inventoryManager.editProduct(' + product.id + ')" title="Editar">' +
                                '<i class="fas fa-edit"></i>' +
                            '</button>' +
                            '<button class="btn-action btn-delete" onclick="window.inventoryManager.deleteProduct(' + product.id + ')" title="Eliminar">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</td>'
                ].join('');
                
                tbody.appendChild(row);
                console.log('✅ Producto ' + product.name + ' añadido exitosamente');
            } catch (error) {
                console.error('❌ Error al renderizar producto ' + product.name + ':', error);
                console.log('📋 Datos del producto:', product);
            }
        }
        
        console.log('✅ Renderización completada. ' + filteredProducts.length + ' productos añadidos a la tabla');
    }

    getFilteredProducts() {
        console.log('🔍 Aplicando filtros a productos...');
        console.log('📋 Filtros actuales:', this.filters);
        
        var filtered = this.products.slice();
        console.log('📊 Productos iniciales: ' + filtered.length);
        
        // Apply category filter
        if (this.filters.category !== 'all') {
            var categoryFilter = this.filters.category;
            filtered = filtered.filter(function(product) { return product.category === categoryFilter; });
            console.log('📊 Después de filtro categoría "' + this.filters.category + '": ' + filtered.length);
        }
        
        // Apply status filter
        if (this.filters.status !== 'all') {
            var self = this;
            var statusFilter = this.filters.status;
            filtered = filtered.filter(function(product) {
                var status = self.getStockStatus(product);
                return status.value === statusFilter;
            });
            console.log('📊 Después de filtro estado "' + this.filters.status + '": ' + filtered.length);
        }
        
        // Apply price filter
        if (this.filters.price !== 'all') {
            var priceRange = this.filters.price.split('-');
            var min = priceRange[0].replace('+', '');
            var max = priceRange[1] ? priceRange[1] : null;
            filtered = filtered.filter(function(product) {
                if (max) {
                    return product.salePrice >= parseFloat(min) && product.salePrice <= parseFloat(max);
                } else {
                    return product.salePrice >= parseFloat(min);
                }
            });
            console.log('📊 Después de filtro precio "' + this.filters.price + '": ' + filtered.length);
        }
        
        // Apply search filter
        if (this.filters.search) {
            var search = this.filters.search.toLowerCase();
            filtered = filtered.filter(function(product) {
                return product.name.toLowerCase().indexOf(search) !== -1 ||
                       product.code.toLowerCase().indexOf(search) !== -1 ||
                       product.description.toLowerCase().indexOf(search) !== -1;
            });
            console.log('📊 Después de filtro búsqueda "' + this.filters.search + '": ' + filtered.length);
        }
        
        // Apply sorting
        var sortBy = this.sortBy;
        var sortDirection = this.sortDirection;
        filtered.sort(function(a, b) {
            var aVal = a[sortBy];
            var bVal = b[sortBy];
            
            if (sortBy === 'salePrice' || sortBy === 'stock') {
                aVal = parseFloat(aVal);
                bVal = parseFloat(bVal);
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        console.log('✅ Productos finales después de filtros y ordenamiento: ' + filtered.length);
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
        var categoryMap = {
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
        
        var totalProducts = 0;
        for (var i = 0; i < this.products.length; i++) {
            totalProducts += (this.products[i].stock || 0);
        }
        
        var inStockProducts = 0;
        var soldOutProducts = 0;
        for (var i = 0; i < this.products.length; i++) {
            if ((this.products[i].stock || 0) > 0) {
                inStockProducts++;
            } else {
                soldOutProducts++;
            }
        }
        
        // Calcular valor total con validación
        var totalValue = 0;
        for (var i = 0; i < this.products.length; i++) {
            var p = this.products[i];
            var costPrice = parseFloat(p.costPrice) || 0;
            var stock = parseInt(p.stock) || 0;
            var productValue = costPrice * stock;
            console.log('💰 ' + (p.name || 'Sin nombre') + ': $' + costPrice + ' × ' + stock + ' = $' + productValue);
            totalValue += productValue;
        }
        
        console.log('📈 Estadísticas calculadas:', {
            totalProducts: totalProducts,
            inStockProducts: inStockProducts,
            soldOutProducts: soldOutProducts,
            totalValue: totalValue
        });
        
        // Update stats display
        var statsElements = document.querySelectorAll('.inventory-stat p');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = totalProducts; // Total de unidades en stock
            statsElements[1].textContent = inStockProducts;
            statsElements[1].className = inStockProducts > 0 ? 'success' : '';
            statsElements[2].textContent = soldOutProducts;
            statsElements[2].className = soldOutProducts > 0 ? 'danger' : '';
            statsElements[3].textContent = '$' + (isNaN(totalValue) ? '0.00' : totalValue.toFixed(2));
        } else {
            console.error('❌ No se encontraron suficientes elementos de estadísticas');
        }
        
        // Update alerts
        this.updateAlerts(inStockProducts, soldOutProducts);
    }

    updateAlerts(inStock, soldOut) {
        var alertsContainer = document.querySelector('.alerts-container');
        if (!alertsContainer) return;
        
        alertsContainer.innerHTML = '';
        
        if (soldOut > 0) {
            var alert = document.createElement('div');
            alert.className = 'alert alert-danger';
            alert.innerHTML = 
                '<i class="fas fa-shopping-cart"></i>' +
                '<span><strong>' + soldOut + ' productos</strong> están vendidos y necesitan reabastecimiento.</span>' +
                '<button class="btn btn-sm" onclick="inventoryManager.showSoldOutProducts()">Ver Detalles</button>';
            alertsContainer.appendChild(alert);
        }
        
        if (inStock > 0) {
            var alert = document.createElement('div');
            alert.className = 'alert alert-success';
            alert.innerHTML = 
                '<i class="fas fa-check-circle"></i>' +
                '<span><strong>' + inStock + ' productos</strong> están disponibles en stock.</span>' +
                '<button class="btn btn-sm" onclick="inventoryManager.showInStockProducts()">Ver Detalles</button>';
            alertsContainer.appendChild(alert);
        }
    }

    openProductModal(product) {
        console.log('🚀 openProductModal ejecutándose...');
        this.currentProduct = product || null;
        var modal = document.getElementById('productModal');
        var modalTitle = document.getElementById('modalTitle');
        
        if (!modal) {
            console.error('❌ Modal no encontrado!');
            return;
        }
        
        if (!modalTitle) {
            console.error('❌ Modal title no encontrado!');
            return;
        }
        
        if (product) {
            modalTitle.textContent = 'Editar Producto - ' + product.name;
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
        setTimeout(function() {
            var firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeProductModal() {
        var modal = document.getElementById('productModal');
        modal.classList.remove('active');
        this.currentProduct = null;
    }

    generateProductCode() {
        var lastProduct = 0;
        for (var i = 0; i < this.products.length; i++) {
            var num = parseInt(this.products[i].code.substring(3));
            if (num > lastProduct) {
                lastProduct = num;
            }
        }
        
        var newCode = 'ASH' + String(lastProduct + 1).padStart(4, '0');
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
        var form = document.getElementById('productForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        var formData = new FormData(form);
        var productCode = formData.get('productCode');
        
        // Verificar si el código ya existe (solo para nuevos productos o si cambió el código)
        if (!this.currentProduct || (this.currentProduct && this.currentProduct.code !== productCode)) {
            var existingProduct = null;
            for (var i = 0; i < this.products.length; i++) {
                if (this.products[i].code === productCode) {
                    existingProduct = this.products[i];
                    break;
                }
            }
            if (existingProduct) {
                this.showNotification('Ya existe un producto con ese código', 'error');
                return;
            }
        }
        
        var productData = {
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
        
        console.log('Guardando producto:', productData);
        
        if (this.currentProduct) {
            // Update existing product
            var index = -1;
            for (var i = 0; i < this.products.length; i++) {
                if (this.products[i].id === this.currentProduct.id) {
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                // Merge current product with new data
                for (var key in productData) {
                    this.products[index][key] = productData[key];
                }
                console.log('Producto actualizado en índice:', index);
            }
        } else {
            // Create new product
            productData.id = Date.now();
            productData.createdAt = new Date().toISOString();
            this.products.push(productData);
            console.log('Nuevo producto agregado con ID:', productData.id);
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
        var numericId = parseInt(id);
        console.log('ID numérico:', numericId);
        
        var product = null;
        for (var i = 0; i < this.products.length; i++) {
            var p = this.products[i];
            console.log('Comparando: producto.id=' + p.id + ' (' + typeof p.id + ') con búsqueda=' + numericId + ' (' + typeof numericId + ')');
            if (parseInt(p.id) === numericId) {
                product = p;
                break;
            }
        }
        
        if (product) {
            console.log('✅ Producto encontrado para editar:', product.name);
            this.openProductModal(product);
        } else {
            console.error('❌ Producto NO encontrado con ID:', id);
            var availableIds = [];
            for (var i = 0; i < this.products.length; i++) {
                availableIds.push(this.products[i].id + ' (' + typeof this.products[i].id + ')');
            }
            console.log('📋 IDs disponibles:', availableIds);
            this.showNotification('Producto no encontrado', 'error');
        }
    }

    deleteProduct(id) {
        console.log('🔍 Debugging eliminación producto:');
        console.log('ID recibido:', id, 'Tipo:', typeof id);
        console.log('Productos actuales:', this.products.length);
        
        // Convertir ID a número para asegurar comparación correcta
        var numericId = parseInt(id);
        console.log('ID numérico:', numericId);
        
        var product = null;
        for (var i = 0; i < this.products.length; i++) {
            var p = this.products[i];
            console.log('Comparando: producto.id=' + p.id + ' (' + typeof p.id + ') con búsqueda=' + numericId + ' (' + typeof numericId + ')');
            if (parseInt(p.id) === numericId) {
                product = p;
                break;
            }
        }
        
        if (product) {
            console.log('✅ Producto encontrado:', product.name);
            var confirmMessage = '¿Está seguro de que desea eliminar el producto?\n\nCódigo: ' + product.code + '\nNombre: ' + product.name + '\nStock: ' + product.stock + '\n\nEsta acción no se puede deshacer.';
            
            if (confirm(confirmMessage)) {
                console.log('✅ Usuario confirmó eliminación');
                var originalLength = this.products.length;
                var newProducts = [];
                for (var i = 0; i < this.products.length; i++) {
                    if (parseInt(this.products[i].id) !== numericId) {
                        newProducts.push(this.products[i]);
                    }
                }
                this.products = newProducts;
                console.log('📊 Productos antes: ' + originalLength + ', después: ' + this.products.length);
                
                this.saveProducts();
                this.renderProducts();
                this.updateStats();
                this.showNotification('Producto eliminado exitosamente', 'success');
            } else {
                console.log('❌ Usuario canceló eliminación');
            }
        } else {
            console.error('❌ Producto NO encontrado con ID:', id);
            var availableIds = [];
            for (var i = 0; i < this.products.length; i++) {
                availableIds.push(this.products[i].id + ' (' + typeof this.products[i].id + ')');
            }
            console.log('📋 IDs disponibles:', availableIds);
            this.showNotification('Producto no encontrado', 'error');
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
        var products = this.getFilteredProducts();
        var csv = this.convertToCSV(products);
        this.downloadCSV(csv, 'inventario.csv');
    }

    convertToCSV(products) {
        var headers = [
            'Código', 'Producto', 'Categoría', 'Precio Compra', 'Flete', 
            'Precio Costo', '% Ganancia', 'Ganancia Adquirida', 'Precio Venta', 'Stock', 'Stock Mínimo', 'Estado'
        ];
        
        var rows = [];
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            rows.push([
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
        }
        
        var allRows = [headers].concat(rows);
        var csvContent = '';
        for (var i = 0; i < allRows.length; i++) {
            csvContent += allRows[i].join(',') + '\n';
        }
        return csvContent;
    }

    downloadCSV(csv, filename) {
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    generateExcelReport() {
        try {
            console.log('📊 Generando reporte Excel profesional...');
            
            // Verificar disponibilidad de XLSX
            if (typeof XLSX === 'undefined') {
                throw new Error('Librería XLSX no está cargada');
            }

            var todosLosProductos = this.products;
            var productosEnStock = [];
            for (var i = 0; i < this.products.length; i++) {
                if ((this.products[i].stock || 0) > 0) {
                    productosEnStock.push(this.products[i]);
                }
            }
            
            if (todosLosProductos.length === 0) {
                this.showNotification('No hay productos para generar el reporte', 'warning');
                return;
            }

            console.log('📦 Generando reporte para ' + todosLosProductos.length + ' productos (' + productosEnStock.length + ' en stock)');

            // Crear libro de trabajo
            var workbook = XLSX.utils.book_new();
            workbook.Props = {
                Title: "Reporte Ejecutivo ASH-LING",
                Subject: "Análisis de Inventario",
                Author: "Sistema ERP ASH-LING",
                Company: "ASH-LING",
                Category: "Inventarios",
                CreatedDate: new Date()
            };

            // === HOJA 1: RESUMEN EJECUTIVO ===
            var resumenData = [
                ['', '', '', 'ASH-LING FASHION & ACCESSORIES', '', '', ''],
                ['', '', '', 'REPORTE EJECUTIVO DE INVENTARIO', '', '', ''],
                [''],
                ['Fecha:', new Date().toLocaleDateString('es-ES')],
                ['Hora:', new Date().toLocaleTimeString('es-ES')],
                [''],
                ['MÉTRICAS PRINCIPALES', '', '', '', '', '', ''],
                [''],
                ['Indicador', 'Valor', 'Estado', '', '', '', ''],
                ['Total Productos', todosLosProductos.length, todosLosProductos.length > 50 ? 'EXCELENTE' : 'BUENO'],
                ['En Stock', productosEnStock.length, productosEnStock.length > 0 ? 'DISPONIBLE' : 'CRÍTICO'],
                ['Agotados', todosLosProductos.length - productosEnStock.length, 'REQUIERE ATENCIÓN'],
                ['Valor Inventario', '$' + this.calcularValorTotal().toFixed(2), 'ACTIVO']
            ];

            var resumenSheet = XLSX.utils.aoa_to_sheet(resumenData);
            resumenSheet['!cols'] = [
                { width: 15 }, { width: 15 }, { width: 25 }, { width: 30 },
                { width: 15 }, { width: 15 }, { width: 15 }
            ];
            XLSX.utils.book_append_sheet(workbook, resumenSheet, '📋 Resumen Ejecutivo');

            // === HOJA 2: INVENTARIO COMPLETO ===
            var inventarioData = [
                ['Código', 'Producto', 'Categoría', 'Precio Compra', 'Flete', 'Costo Total', 'Precio Venta', 'Ganancia', 'Stock', 'Estado', 'Valor Total']
            ];

            var self = this;
            for (var i = 0; i < todosLosProductos.length; i++) {
                var p = todosLosProductos[i];
                var ganancia = (p.salePrice || 0) - (p.costPrice || 0);
                var valorTotal = (p.costPrice || 0) * (p.stock || 0);
                inventarioData.push([
                    p.code || 'N/A',
                    p.name || 'Sin nombre',
                    self.getCategoryName(p.category),
                    (p.purchasePrice || 0).toFixed(2),
                    (p.shippingCost || 0).toFixed(2),
                    (p.costPrice || 0).toFixed(2),
                    (p.salePrice || 0).toFixed(2),
                    ganancia.toFixed(2),
                    p.stock || 0,
                    (p.stock || 0) > 0 ? 'EN STOCK' : 'AGOTADO',
                    valorTotal.toFixed(2)
                ]);
            }

            var inventarioSheet = XLSX.utils.aoa_to_sheet(inventarioData);
            inventarioSheet['!cols'] = [
                { width: 12 }, { width: 25 }, { width: 15 }, { width: 12 },
                { width: 8 }, { width: 12 }, { width: 12 }, { width: 12 },
                { width: 8 }, { width: 12 }, { width: 15 }
            ];
            inventarioSheet['!autofilter'] = { ref: 'A1:K' + inventarioData.length };
            XLSX.utils.book_append_sheet(workbook, inventarioSheet, '📦 Inventario Completo');

            // === HOJA 3: PRODUCTOS TOP ===
            var productosRentables = productosEnStock.slice().sort(function(a, b) {
                var gananciaA = ((a.salePrice || 0) - (a.costPrice || 0)) * (a.stock || 0);
                var gananciaB = ((b.salePrice || 0) - (b.costPrice || 0)) * (b.stock || 0);
                return gananciaB - gananciaA;
            }).slice(0, 10);

            var topData = [
                ['TOP 10 PRODUCTOS MÁS RENTABLES', '', '', '', '', ''],
                [''],
                ['Ranking', 'Producto', 'Stock', 'Ganancia Unit.', 'Ganancia Total', 'ROI %']
            ];

            for (var i = 0; i < productosRentables.length; i++) {
                var p = productosRentables[i];
                var gananciaUnitaria = (p.salePrice || 0) - (p.costPrice || 0);
                var gananciaTotal = gananciaUnitaria * (p.stock || 0);
                var roi = (p.costPrice || 0) > 0 ? (gananciaUnitaria / (p.costPrice || 0) * 100).toFixed(1) : 0;
                
                topData.push([
                    i + 1,
                    p.name || 'Sin nombre',
                    p.stock || 0,
                    '$' + gananciaUnitaria.toFixed(2),
                    '$' + gananciaTotal.toFixed(2),
                    roi + '%'
                ]);
            }

            var topSheet = XLSX.utils.aoa_to_sheet(topData);
            topSheet['!cols'] = [
                { width: 8 }, { width: 25 }, { width: 8 }, { width: 12 }, { width: 15 }, { width: 8 }
            ];
            XLSX.utils.book_append_sheet(workbook, topSheet, '🏆 Productos TOP');

            // === HOJA 4: ANÁLISIS POR CATEGORÍA ===
            var categorias = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
            var categoriaData = [
                ['ANÁLISIS POR CATEGORÍA', '', '', '', '', ''],
                [''],
                ['Categoría', 'Productos', 'En Stock', 'Stock Total', 'Valor USD', '% Total']
            ];

            var valorTotal = this.calcularValorTotal();
            for (var i = 0; i < categorias.length; i++) {
                var cat = categorias[i];
                var catProductos = [];
                var catStock = [];
                
                for (var j = 0; j < todosLosProductos.length; j++) {
                    if (todosLosProductos[j].category === cat) {
                        catProductos.push(todosLosProductos[j]);
                    }
                }
                
                for (var j = 0; j < productosEnStock.length; j++) {
                    if (productosEnStock[j].category === cat) {
                        catStock.push(productosEnStock[j]);
                    }
                }
                
                var totalStock = 0;
                for (var j = 0; j < catProductos.length; j++) {
                    totalStock += (catProductos[j].stock || 0);
                }
                
                var valorCat = 0;
                for (var j = 0; j < catProductos.length; j++) {
                    valorCat += ((catProductos[j].costPrice || 0) * (catProductos[j].stock || 0));
                }
                
                var porcentaje = valorTotal > 0 ? ((valorCat / valorTotal) * 100).toFixed(1) : 0;

                categoriaData.push([
                    self.getCategoryName(cat),
                    catProductos.length,
                    catStock.length,
                    totalStock,
                    '$' + valorCat.toFixed(2),
                    porcentaje + '%'
                ]);
            }

            var categoriaSheet = XLSX.utils.aoa_to_sheet(categoriaData);
            categoriaSheet['!cols'] = [
                { width: 20 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 8 }
            ];
            XLSX.utils.book_append_sheet(workbook, categoriaSheet, '📊 Por Categoría');

            // Generar archivo
            var timestamp = new Date().toISOString().split('T')[0];
            var fileName = 'ASH-LING_Reporte_Ejecutivo_' + timestamp + '.xls';
            
            XLSX.writeFile(workbook, fileName, { bookType: 'xls' });
            
            console.log('✅ Reporte Excel generado exitosamente');
            this.showNotification('📊 Reporte ejecutivo generado: ' + todosLosProductos.length + ' productos analizados', 'success');

        } catch (error) {
            console.error('❌ Error al generar reporte Excel:', error);
            this.showNotification('Error al generar el reporte: ' + error.message, 'error');
        }
    }

    calcularValorTotal() {
        var total = 0;
        for (var i = 0; i < this.products.length; i++) {
            var p = this.products[i];
            total += ((p.costPrice || 0) * (p.stock || 0));
        }
        return total;
    }

    diagnosticProducts() {
        console.log('🔍 DIAGNÓSTICO DE PRODUCTOS - Verificando funcionalidad');
        console.log('📦 Productos cargados:', this.products.length);
        
        if (this.products.length === 0) {
            console.log('⚠️ No hay productos, generando productos de muestra...');
            this.products = this.generateSampleProducts();
            this.saveProducts();
            this.renderProducts();
            this.updateStats();
        }
        
        // Probar edición
        if (this.products.length > 0) {
            var firstProduct = this.products[0];
            console.log('🧪 Probando edición del primer producto:', firstProduct.name, 'ID:', firstProduct.id);
            
            // Simular búsqueda de producto como lo hace el botón
            var foundProduct = null;
            for (var i = 0; i < this.products.length; i++) {
                if (parseInt(this.products[i].id) === parseInt(firstProduct.id)) {
                    foundProduct = this.products[i];
                    break;
                }
            }
            if (foundProduct) {
                console.log('✅ Producto encontrado correctamente para edición');
            } else {
                console.error('❌ Producto NO encontrado - hay problema con la comparación de IDs');
            }
        }
    }

    showNotification(message, type) {
        type = type || 'info';
        console.log('📢 ' + type.toUpperCase() + ': ' + message);
        
        // Crear elemento de notificación
        var notification = document.createElement('div');
        notification.className = 'notification ' + type;
        
        var icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        else if (type === 'error') icon = '❌';
        else if (type === 'warning') icon = '⚠️';
        
        notification.innerHTML = 
            '<div class="notification-content">' +
                '<span class="notification-icon">' + icon + '</span>' +
                '<span class="notification-message">' + message + '</span>' +
                '<button class="notification-close">&times;</button>' +
            '</div>';
        
        // Agregar estilos si no existen
        if (!document.getElementById('notificationStyles')) {
            var style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = 
                '.notification {' +
                    'position: fixed; top: 20px; right: 20px; min-width: 300px; max-width: 500px;' +
                    'padding: 15px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);' +
                    'z-index: 10000; animation: slideIn 0.3s ease-out;' +
                    'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;' +
                '}' +
                '.notification.success { background: #d4edda; color: #155724; border-left: 4px solid #28a745; }' +
                '.notification.error { background: #f8d7da; color: #721c24; border-left: 4px solid #dc3545; }' +
                '.notification.warning { background: #fff3cd; color: #856404; border-left: 4px solid #ffc107; }' +
                '.notification.info { background: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8; }' +
                '.notification-content { display: flex; align-items: center; gap: 10px; }' +
                '.notification-icon { font-size: 18px; }' +
                '.notification-message { flex: 1; font-weight: 500; }' +
                '.notification-close {' +
                    'background: none; border: none; font-size: 20px; cursor: pointer;' +
                    'color: inherit; opacity: 0.7; padding: 0; width: 24px; height: 24px;' +
                '}' +
                '.notification-close:hover { opacity: 1; }' +
                '@keyframes slideIn {' +
                    'from { transform: translateX(100%); opacity: 0; }' +
                    'to { transform: translateX(0); opacity: 1; }' +
                '}';
            document.head.appendChild(style);
        }
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Evento para cerrar
        var closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', function() {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(function() { 
                if (notification.parentNode) {
                    notification.remove(); 
                }
            }, 300);
        });
        
        // Auto-remover después de 5 segundos
        setTimeout(function() {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(function() { 
                    if (notification.parentNode) {
                        notification.remove(); 
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Funciones de utilidad y configuración global
function testButtonClick() {
    console.log('🧪 Función de prueba ejecutada');
    if (window.inventoryManager) {
        window.inventoryManager.openProductModal();
    }
}

function forceLoadProducts() {
    console.log('🚨 CARGA FORZADA DE PRODUCTOS');
    if (window.inventoryManager) {
        if (window.inventoryManager.products.length === 0) {
            window.inventoryManager.products = window.inventoryManager.generateSampleProducts();
            window.inventoryManager.saveProducts();
        }
        window.inventoryManager.renderProducts();
        window.inventoryManager.updateStats();
        console.log('✅ Productos cargados forzadamente');
    }
}

function diagnosticProducts() {
    console.log('🔍 DIAGNÓSTICO DE PRODUCTOS - Verificando funcionalidad');
    
    if (!window.inventoryManager) {
        console.error('❌ inventoryManager no está disponible');
        return;
    }
    
    window.inventoryManager.diagnosticProducts();
}

function showNotification(message, type) {
    if (window.inventoryManager) {
        window.inventoryManager.showNotification(message, type);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando sistema...');
    
    // Crear instancia global del manager
    window.inventoryManager = new InventoryManager();
    
    // Configurar funciones globales para debugging
    window.testButtonClick = testButtonClick;
    window.forceLoadProducts = forceLoadProducts;
    window.diagnosticProducts = diagnosticProducts;
    window.showNotification = showNotification;
    
    console.log('✅ Sistema inicializado exitosamente');
    
    // Configurar botón de respaldo
    setTimeout(function() {
        var newProductBtn = document.getElementById('newProductBtn');
        if (newProductBtn) {
            console.log('🔄 Configurando event listener de respaldo para botón');
            newProductBtn.onclick = function() {
                console.log('🔥 Click de respaldo detectado');
                window.testButtonClick();
            };
        }
    }, 100);
    
    // Forzar carga de productos después de un breve delay
    setTimeout(function() {
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
        setTimeout(function() {
            var tbody = document.getElementById('inventoryTableBody');
            if (tbody && tbody.children.length === 0) {
                console.log('🚨 Tabla sigue vacía, ejecutando función de emergencia...');
                window.forceLoadProducts();
            }
            
            // Ejecutar diagnóstico para verificar funcionamiento de botones
            console.log('🔧 Ejecutando diagnóstico de productos...');
            if (window.diagnosticProducts) {
                window.diagnosticProducts();
            }
        }, 1000);
    }, 500);
});
