// Dashboard JavaScript - Ash-Ling ERP
class DashboardManager {
    constructor() {
        console.log('🚀 Inicializando DashboardManager...');
        this.data = {
            products: [],
            sales: [],
            clients: []
        };
        this.initializeData();
        this.setupFirebaseRealTimeSync();
        this.setupSyncButton();
    }

    initializeData() {
        var self = this;
        console.log('🔄 Cargando datos del dashboard desde Firebase...');
        
        // Verificar si Firebase está disponible
        if (window.FirebaseService && window.FirebaseService.isReady()) {
            console.log('✅ Firebase disponible, cargando datos de la nube...');
            this.loadFromFirebase();
        } else {
            console.log('ℹ️ Firebase no disponible, cargando desde localStorage...');
            this.loadFromLocalStorage();
            
            // Intentar conectar Firebase después
            setTimeout(function() {
                if (window.FirebaseService && window.FirebaseService.isReady()) {
                    console.log('🔄 Firebase ahora disponible para dashboard...');
                    self.loadFromFirebase();
                }
            }, 3000);
        }
    }
    
    loadFromFirebase() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            var loadedCount = 0;
            var totalLoads = 3;
            var hasError = false;
            
            console.log('⬇️ Cargando datos desde Firebase...');
            
            function checkComplete() {
                loadedCount++;
                if (loadedCount === totalLoads) {
                    if (hasError) {
                        reject(new Error('Error al cargar algunos datos desde Firebase'));
                    } else {
                        self.finishInitialization();
                        resolve();
                    }
                }
            }
            
            // Cargar productos
            window.FirebaseService.loadInventoryProducts(function(error, products) {
                if (!error && products) {
                    console.log('✅ Productos cargados:', products.length);
                    self.data.products = products;
                } else {
                    console.log('ℹ️ Cargando productos desde localStorage...');
                    self.data.products = JSON.parse(localStorage.getItem('ash_ling_products') || '[]');
                    hasError = true;
                }
                checkComplete();
            });
            
            // Cargar ventas
            window.FirebaseService.loadSales(100, function(error, sales) {
                if (!error && sales) {
                    console.log('✅ Ventas cargadas:', sales.length);
                    self.data.sales = sales;
                } else {
                    console.log('ℹ️ Cargando ventas desde localStorage...');
                    self.data.sales = JSON.parse(localStorage.getItem('ash_ling_ventas') || '[]');
                    hasError = true;
                }
                checkComplete();
            });
            
            // Cargar clientes
            window.FirebaseService.loadClients(function(error, clients) {
                if (!error && clients) {
                    console.log('✅ Clientes cargados:', clients.length);
                    self.data.clients = clients;
                } else {
                    console.log('ℹ️ Cargando clientes desde localStorage...');
                    self.data.clients = JSON.parse(localStorage.getItem('ash_ling_clients') || '[]');
                    hasError = true;
                }
                checkComplete();
            });
        });
    }
    
    loadFromLocalStorage() {
        console.log('📱 Cargando datos desde localStorage...');
        this.data.products = JSON.parse(localStorage.getItem('ash_ling_products') || '[]');
        this.data.sales = JSON.parse(localStorage.getItem('ash_ling_ventas') || '[]');
        this.data.clients = JSON.parse(localStorage.getItem('ash_ling_clients') || '[]');
        
        this.finishInitialization();
    }
    
    finishInitialization() {
        console.log('✅ Dashboard inicializado con datos:');
        console.log('  - Productos:', this.data.products.length);
        console.log('  - Ventas:', this.data.sales.length);
        console.log('  - Clientes:', this.data.clients.length);
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboardData();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        var self = this;
        // Sidebar toggle
        var sidebarToggle = document.getElementById('sidebarToggle');
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                self.toggleSidebar();
            });
        }
        
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', function() {
                self.toggleSidebar();
            });
        }

        // Search functionality
        var searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                self.handleSearch(e.target.value);
            });
        }

        // Responsive handling
        window.addEventListener('resize', function() {
            self.handleResize();
        });
    }

    setupMobileMenu() {
        var self = this;
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                var sidebar = document.querySelector('.sidebar');
                var isClickInsideSidebar = sidebar.contains(e.target);
                var isMenuToggle = e.target.closest('.mobile-menu-toggle') || e.target.closest('.sidebar-toggle');
                
                if (!isClickInsideSidebar && !isMenuToggle) {
                    self.closeSidebar();
                }
            }
        });
    }

    toggleSidebar() {
        var sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        }
    }

    closeSidebar() {
        var sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    }

    handleResize() {
        if (window.innerWidth > 768) {
            var sidebar = document.querySelector('.sidebar');
            sidebar.classList.remove('open');
        }
    }

    handleSearch(query) {
        if (query.length < 2) return;
        console.log('Searching dashboard for:', query);
        // Implementar búsqueda global aquí
    }

    initializeCharts() {
        this.createWeeklySalesChart();
        this.createCategorySalesChart();
    }

    createWeeklySalesChart() {
        var canvas = document.getElementById('weeklySalesChart');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        
        this.weeklySalesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Ventas Diarias ($)',
                    data: [0, 0, 0, 0, 0, 0, 0], // Se actualizará con datos reales
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
                                return '$' + value.toLocaleString('es-ES');
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
                }
            }
        });
    }

    createCategorySalesChart() {
        var canvas = document.getElementById('categorySalesChart');
        if (!canvas) return;

        var ctx = canvas.getContext('2d');
        
        // Usar categorías reales del inventario ASH-LING
        var categoryLabels = ['Carteras', 'Perfumes', 'Accesorios', 'Ropa Dama', 'Ropa Caballero'];
        
        this.categorySalesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: [0, 0, 0, 0, 0], // Se actualizará con datos reales
                    backgroundColor: [
                        '#ff69b4', // Rosa para carteras
                        '#ffd700', // Dorado para perfumes
                        '#000000', // Negro para accesorios
                        '#ffb3d9', // Rosa claro para ropa dama
                        '#ffe55c'  // Dorado claro para ropa caballero
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
                                return context.label + ': $' + context.parsed.toLocaleString('es-ES');
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

    loadDashboardData() {
        console.log('📊 Cargando datos del dashboard...');
        var stats = this.calculateStats();
        this.updateStatsCards(stats);
        this.updateCharts(stats);
        
        var self = this;
        setInterval(function() {
            var updatedStats = self.calculateStats();
            self.updateStatsCards(updatedStats);
            self.updateCharts(updatedStats);
        }, 30000);
    }
    
    calculateStats() {
        console.log('🧮 Calculando estadísticas desde datos reales...');
        
        var today = new Date();
        var todayStr = today.toISOString().split('T')[0];
        var thisMonth = today.getMonth();
        var thisYear = today.getFullYear();
        
        // Estadísticas de ventas
        var salesData = this.data.sales || [];
        var todaySales = salesData.filter(function(sale) {
            var saleDate = new Date(sale.fecha || sale.createdAt);
            return saleDate.toISOString().split('T')[0] === todayStr;
        });
        
        var monthSales = salesData.filter(function(sale) {
            var saleDate = new Date(sale.fecha || sale.createdAt);
            return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
        });
        
        var totalSalesToday = todaySales.reduce(function(sum, sale) { 
            return sum + (sale.total || 0); 
        }, 0);
        var totalSalesMonth = monthSales.reduce(function(sum, sale) { 
            return sum + (sale.total || 0); 
        }, 0);
        
        // Estadísticas de productos con categorías reales
        var productsData = this.data.products || [];
        var totalProducts = productsData.length;
        var inStockProducts = productsData.filter(function(p) { return (p.stock || 0) > 0; }).length;
        var outOfStockProducts = productsData.filter(function(p) { return (p.stock || 0) === 0; }).length;
        var lowStockProducts = productsData.filter(function(p) { 
            return (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStock || 5); 
        }).length;
        
        // Calcular valor total del inventario
        var totalInventoryValue = productsData.reduce(function(sum, product) {
            return sum + ((product.costPrice || product.purchasePrice || 0) * (product.stock || 0));
        }, 0);
        
        // Valor potencial de ventas
        var totalSalesValue = productsData.reduce(function(sum, product) {
            return sum + ((product.salePrice || 0) * (product.stock || 0));
        }, 0);
        
        // Categorías reales del inventario ASH-LING
        var categoryStats = {};
        var realCategories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
        
        for (var i = 0; i < realCategories.length; i++) {
            var category = realCategories[i];
            var categoryProducts = productsData.filter(function(p) { return p.category === category; });
            categoryStats[category] = {
                count: categoryProducts.length,
                value: categoryProducts.reduce(function(sum, p) { 
                    return sum + ((p.costPrice || p.purchasePrice || 0) * (p.stock || 0)); 
                }, 0),
                salesValue: categoryProducts.reduce(function(sum, p) { 
                    return sum + ((p.salePrice || 0) * (p.stock || 0)); 
                }, 0),
                inStock: categoryProducts.filter(function(p) { return (p.stock || 0) > 0; }).length,
                totalStock: categoryProducts.reduce(function(sum, p) { return sum + (p.stock || 0); }, 0),
                lowStock: categoryProducts.filter(function(p) { 
                    return (p.stock || 0) > 0 && (p.stock || 0) <= (p.minStock || 5); 
                }).length
            };
        }
        
        // Estadísticas de clientes mejoradas
        var clientsData = this.data.clients || [];
        var totalClients = clientsData.length;
        var activeClients = clientsData.filter(function(c) { return c.estado === 'active' || !c.estado; }).length;
        var vipClients = clientsData.filter(function(c) { return c.tipo === 'vip'; }).length;
        var regularClients = clientsData.filter(function(c) { return c.tipo === 'regular' || !c.tipo; }).length;
        
        // Productos más vendidos (mejorado)
        var productSales = {};
        salesData.forEach(function(sale) {
            if (sale.productos && Array.isArray(sale.productos)) {
                sale.productos.forEach(function(product) {
                    var key = product.nombre || product.producto || 'Producto sin nombre';
                    productSales[key] = (productSales[key] || 0) + (product.cantidad || 1);
                });
            }
        });
        
        var topProducts = Object.keys(productSales)
            .map(function(key) { return [key, productSales[key]]; })
            .sort(function(a, b) { return b[1] - a[1]; })
            .slice(0, 5)
            .map(function(item) { return { name: item[0], quantity: item[1] }; });
        
        // Análisis de rentabilidad
        var potentialProfit = totalSalesValue - totalInventoryValue;
        var profitMargin = totalSalesValue > 0 ? ((potentialProfit / totalSalesValue) * 100) : 0;
        
        console.log('📊 Estadísticas calculadas:');
        console.log('  - Productos:', totalProducts);
        console.log('  - Ventas del mes:', totalSalesMonth);
        console.log('  - Clientes:', totalClientes);
        console.log('  - Categorías:', realCategories);
        
        return {
            // Ventas
            totalSalesToday: totalSalesToday,
            totalSalesMonth: totalSalesMonth,
            totalSalesCount: salesData.length,
            todaySalesCount: todaySales.length,
            
            // Inventario mejorado
            totalProducts: totalProducts,
            inStockProducts: inStockProducts,
            outOfStockProducts: outOfStockProducts,
            lowStockProducts: lowStockProducts,
            inventoryValue: totalInventoryValue,
            salesValue: totalSalesValue,
            potentialProfit: potentialProfit,
            profitMargin: profitMargin,
            
            // Categorías reales
            categoryStats: categoryStats,
            categories: realCategories,
            
            // Clientes
            totalClients: totalClients,
            activeClients: activeClients,
            vipClients: vipClients,
            regularClients: regularClients,
            
            // Análisis
            topProducts: topProducts,
            
            // Porcentajes para gráficos
            stockPercentage: totalProducts > 0 ? (inStockProducts / totalProducts * 100) : 0,
            lowStockPercentage: totalProducts > 0 ? (lowStockProducts / totalProducts * 100) : 0,
            outOfStockPercentage: totalProducts > 0 ? (outOfStockProducts / totalProducts * 100) : 0,
            clientsGrowth: this.calculateGrowthPercentage('clients'),
            salesGrowth: this.calculateGrowthPercentage('sales'),
            inventoryTurnover: this.calculateInventoryTurnover()
        };
    }
    
    calculateGrowthPercentage(type) {
        var today = new Date();
        var lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        var currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        var currentData = 0;
        var lastMonthData = 0;
        
        if (type === 'sales') {
            var sales = this.data.sales || [];
            currentData = sales.filter(function(sale) {
                var saleDate = new Date(sale.fecha || sale.createdAt);
                return saleDate >= currentMonth;
            }).length;
            
            lastMonthData = sales.filter(function(sale) {
                var saleDate = new Date(sale.fecha || sale.createdAt);
                return saleDate >= lastMonth && saleDate < currentMonth;
            }).length;
        } else if (type === 'clients') {
            var clients = this.data.clients || [];
            currentData = clients.filter(function(client) {
                var regDate = new Date(client.fechaRegistro || client.createdAt);
                return regDate >= currentMonth;
            }).length;
            
            lastMonthData = clients.filter(function(client) {
                var regDate = new Date(client.fechaRegistro || client.createdAt);
                return regDate >= lastMonth && regDate < currentMonth;
            }).length;
        }
        
        if (lastMonthData === 0) return currentData > 0 ? 100 : 0;
        return Math.round(((currentData - lastMonthData) / lastMonthData) * 100);
    }
    
    calculateInventoryTurnover() {
        // Calcular rotación de inventario basado en ventas vs stock
        var totalSales = (this.data.sales || []).reduce(function(sum, sale) {
            return sum + (sale.total || 0);
        }, 0);
        
        var totalInventoryValue = (this.data.products || []).reduce(function(sum, product) {
            return sum + ((product.costPrice || product.purchasePrice || 0) * (product.stock || 0));
        }, 0);
        
        return totalInventoryValue > 0 ? (totalSales / totalInventoryValue) : 0;
    }

    updateStatsCards(stats) {
        console.log('📈 Actualizando tarjetas con datos reales...');
        console.log('🏪 Categorías disponibles:', stats.categories);
        
        // Actualizar ventas principales
        this.updateStatCard('.today-sales .stat-value', stats.totalSalesToday, '$');
        this.updateStatCard('.month-sales .stat-value', stats.totalSalesMonth, '$');
        this.updateStatCard('.total-sales .stat-value', stats.totalSalesCount, '');
        
        // Actualizar inventario con datos reales
        this.updateStatCard('.total-products .stat-value', stats.totalProducts, '');
        this.updateStatCard('.in-stock .stat-value', stats.inStockProducts, '');
        this.updateStatCard('.out-stock .stat-value', stats.outOfStockProducts, '');
        this.updateStatCard('.low-stock .stat-value', stats.lowStockProducts, '');
        this.updateStatCard('.inventory-value .stat-value', stats.inventoryValue, '$');
        
        // Mostrar valor potencial de ventas
        this.updateStatCard('.sales-potential .stat-value', stats.salesValue, '$');
        this.updateStatCard('.profit-margin .stat-value', stats.profitMargin, '%');
        
        // Actualizar clientes
        this.updateStatCard('.total-clients .stat-value', stats.totalClients, '');
        this.updateStatCard('.active-clients .stat-value', stats.activeClients, '');
        this.updateStatCard('.vip-clients .stat-value', stats.vipClients, '');
        this.updateStatCard('.regular-clients .stat-value', stats.regularClients, '');
        
        // Actualizar crecimiento
        this.updateStatCard('.sales-growth .stat-change', stats.salesGrowth, '%', 'growth');
        this.updateStatCard('.clients-growth .stat-change', stats.clientsGrowth, '%', 'growth');
        
        // Actualizar estadísticas por categoría
        this.updateCategoryStats(stats.categoryStats);
        
        // Actualizar productos más vendidos
        this.updateTopProducts(stats.topProducts);
        
        // Actualizar indicadores de salud
        this.updateHealthIndicators(stats);
        
        console.log('✅ Dashboard actualizado con datos sincronizados');
    }
    
    updateCategoryStats(categoryStats) {
        var categories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
        var categoryNames = {
            'carteras': 'Carteras',
            'perfumes': 'Perfumes', 
            'accesorios': 'Accesorios',
            'ropa_dama': 'Ropa Dama',
            'ropa_caballero': 'Ropa Caballero'
        };
        
        for (var i = 0; i < categories.length; i++) {
            var category = categories[i];
            var stats = categoryStats[category];
            
            if (stats) {
                this.updateStatCard('.category-' + category + ' .count', stats.count, '');
                this.updateStatCard('.category-' + category + ' .value', stats.value, '$');
                this.updateStatCard('.category-' + category + ' .stock', stats.totalStock, '');
                
                console.log('📦 ' + categoryNames[category] + ':', stats.count + ' productos, $' + stats.value.toFixed(2));
            }
        }
    }
    
    updateStatCard(selector, value, prefix, type) {
        prefix = prefix || '';
        type = type || 'normal';
        
        var element = document.querySelector(selector);
        if (element) {
            if (type === 'growth') {
                var isPositive = value >= 0;
                element.textContent = (isPositive ? '+' : '') + value + prefix;
                element.className = element.className.replace(/positive|negative/g, '');
                element.classList.add(isPositive ? 'positive' : 'negative');
            } else {
                var formattedValue = typeof value === 'number' ? 
                    (prefix === '$' ? value.toLocaleString('es-ES', {minimumFractionDigits: 2}) : value.toLocaleString('es-ES')) :
                    value;
                element.textContent = prefix + formattedValue;
            }
        }
    }
    
    updateTopProducts(topProducts) {
        var container = document.querySelector('.top-products-list');
        if (container && topProducts) {
            container.innerHTML = topProducts.map(function(product, index) {
                return '<div class="top-product-item">' +
                    '<span class="product-rank">#' + (index + 1) + '</span>' +
                    '<span class="product-name">' + product.name + '</span>' +
                    '<span class="product-quantity">' + product.quantity + ' vendidos</span>' +
                '</div>';
            }).join('');
        }
    }
    
    updateHealthIndicators(stats) {
        var inventoryHealth = document.querySelector('.inventory-health');
        if (inventoryHealth) {
            var healthPercentage = stats.totalProducts > 0 ? 
                ((stats.inStockProducts / stats.totalProducts) * 100) : 0;
            
            var healthClass = 'good';
            var healthText = 'Excelente';
            
            if (healthPercentage < 50) {
                healthClass = 'critical';
                healthText = 'Crítico';
            } else if (healthPercentage < 80) {
                healthClass = 'warning';
                healthText = 'Atención';
            }
            
            inventoryHealth.className = 'health-indicator ' + healthClass;
            inventoryHealth.textContent = healthText;
        }
    }
    
    // Configurar sincronización en tiempo real
    setupFirebaseRealTimeSync() {
        var self = this;
        console.log('⚡ Configurando sincronización en tiempo real para dashboard...');
        
        // Escuchar cambios en inventario
        window.addEventListener('inventoryUpdated', function(event) {
            console.log('🔄 Inventario actualizado, recalculando dashboard...');
            self.data.products = event.detail.products;
            var stats = self.calculateStats();
            self.updateStatsCards(stats);
            self.updateCharts(stats);
        });
        
        // Escuchar cambios en clientes
        window.addEventListener('clientsUpdated', function(event) {
            console.log('🔄 Clientes actualizados, recalculando dashboard...');
            self.data.clients = event.detail.clients;
            var stats = self.calculateStats();
            self.updateStatsCards(stats);
            self.updateCharts(stats);
        });
        
        // Configurar sincronización periódica
        setInterval(function() {
            if (window.FirebaseService && window.FirebaseService.isReady()) {
                console.log('🔄 Sincronización periódica del dashboard...');
                self.loadFromFirebase();
            }
        }, 60000); // Cada minuto
    }
    
    // Actualizar gráficos con datos reales
    updateCharts(stats) {
        console.log('📊 Actualizando gráficos con datos reales...');
        
        // Actualizar gráfico de ventas semanales
        if (this.weeklySalesChart) {
            var today = new Date();
            var last7Days = [];
            
            for (var i = 6; i >= 0; i--) {
                var date = new Date(today);
                date.setDate(date.getDate() - i);
                var dateStr = date.toISOString().split('T')[0];
                
                var daySales = (this.data.sales || []).filter(function(sale) {
                    var saleDate = new Date(sale.fecha || sale.createdAt);
                    return saleDate.toISOString().split('T')[0] === dateStr;
                });
                
                var dayTotal = daySales.reduce(function(sum, sale) { 
                    return sum + (sale.total || 0); 
                }, 0);
                last7Days.push(dayTotal);
            }
            
            this.weeklySalesChart.data.datasets[0].data = last7Days;
            this.weeklySalesChart.update();
        }
        
        // Actualizar gráfico de categorías con datos reales
        if (this.categorySalesChart && stats.categoryStats) {
            var categories = ['carteras', 'perfumes', 'accesorios', 'ropa_dama', 'ropa_caballero'];
            var categoryData = [];
            
            for (var i = 0; i < categories.length; i++) {
                var category = categories[i];
                var categoryStats = stats.categoryStats[category];
                categoryData.push(categoryStats ? categoryStats.salesValue : 0);
            }
            
            this.categorySalesChart.data.datasets[0].data = categoryData;
            this.categorySalesChart.update();
            
            console.log('🎯 Gráfico de categorías actualizado:', categoryData);
        }
        
        // Actualizar gráfico de inventario
        if (this.inventoryChart) {
            this.inventoryChart.data.datasets[0].data = [
                stats.inStockProducts,
                stats.outOfStockProducts,  
                stats.lowStockProducts
            ];
            this.inventoryChart.update();
        }
        
        console.log('✅ Todos los gráficos actualizados con datos reales');
    }
    
    // Configurar botón de sincronización manual
    setupSyncButton() {
        var self = this;
        var syncButton = document.getElementById('syncButton');
        
        if (syncButton) {
            syncButton.addEventListener('click', function() {
                var icon = syncButton.querySelector('i');
                var text = syncButton.querySelector('.sync-text');
                
                // Iniciar animación de carga
                icon.style.animation = 'spin 1s linear infinite';
                text.textContent = 'Sincronizando...';
                syncButton.disabled = true;
                
                // Realizar sincronización
                self.loadFromFirebase().then(function() {
                    // Detener animación
                    icon.style.animation = '';
                    text.textContent = 'Sincronizado';
                    
                    // Mostrar mensaje de éxito
                    self.showNotification('✅ Dashboard sincronizado correctamente', 'success');
                    
                    // Restaurar botón después de 2 segundos
                    setTimeout(function() {
                        text.textContent = 'Sincronizar';
                        syncButton.disabled = false;
                    }, 2000);
                }).catch(function(error) {
                    console.error('Error al sincronizar dashboard:', error);
                    
                    // Detener animación
                    icon.style.animation = '';
                    text.textContent = 'Error';
                    
                    // Mostrar mensaje de error
                    self.showNotification('❌ Error al sincronizar dashboard', 'error');
                    
                    // Restaurar botón después de 3 segundos
                    setTimeout(function() {
                        text.textContent = 'Sincronizar';
                        syncButton.disabled = false;
                    }, 3000);
                });
            });
        }
    }
    
    // Mostrar notificaciones
    showNotification(message, type) {
        var notification = document.createElement('div');
        notification.className = 'notification ' + (type || 'info');
        notification.textContent = message;
        notification.style.cssText = 
            'position: fixed;' +
            'top: 20px;' +
            'right: 20px;' +
            'padding: 12px 20px;' +
            'background: ' + (type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6') + ';' +
            'color: white;' +
            'border-radius: 8px;' +
            'z-index: 10000;' +
            'font-weight: 500;' +
            'box-shadow: 0 4px 12px rgba(0,0,0,0.15);' +
            'animation: slideIn 0.3s ease-out;';
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES').format(new Date(date));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.dashboardManager = new DashboardManager();
});
