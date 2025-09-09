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
        this.setupFirebaseRealTimeSync();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboardData();
        this.setupMobileMenu();
    }

    setupEventListeners() {
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
    }

    setupMobileMenu() {
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const isClickInsideSidebar = sidebar.contains(e.target);
                const isMenuToggle = e.target.closest('.mobile-menu-toggle') || e.target.closest('.sidebar-toggle');
                
                if (!isClickInsideSidebar && !isMenuToggle) {
                    this.closeSidebar();
                }
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('open');
        }
    }

    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('open');
    }

    handleResize() {
        if (window.innerWidth > 768) {
            const sidebar = document.querySelector('.sidebar');
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
        const canvas = document.getElementById('weeklySalesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
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
                }
            }
        });
    }

    createCategorySalesChart() {
        const canvas = document.getElementById('categorySalesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
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

    loadDashboardData() {
        console.log('📊 Cargando datos del dashboard...');
        
        // Calcular estadísticas en tiempo real desde Firebase
        const stats = this.calculateStats();
        this.updateStatsCards(stats);
        this.updateCharts(stats);
        
        // Actualizar cada 30 segundos
        setInterval(() => {
            const updatedStats = this.calculateStats();
            this.updateStatsCards(updatedStats);
            this.updateCharts(updatedStats);
        }, 30000);
    }
    
    calculateStats() {
        console.log('🧮 Calculando estadísticas desde datos sincronizados...');
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();
        
        // Estadísticas de ventas
        const salesData = this.data.sales || [];
        const todaySales = salesData.filter(sale => {
            const saleDate = new Date(sale.fecha || sale.createdAt);
            return saleDate.toISOString().split('T')[0] === todayStr;
        });
        
        const monthSales = salesData.filter(sale => {
            const saleDate = new Date(sale.fecha || sale.createdAt);
            return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear;
        });
        
        const totalSalesToday = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const totalSalesMonth = monthSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        
        // Estadísticas de productos
        const productsData = this.data.products || [];
        const totalProducts = productsData.length;
        const inStockProducts = productsData.filter(p => (p.stock || 0) > 0).length;
        const outOfStockProducts = productsData.filter(p => (p.stock || 0) === 0).length;
        const lowStockProducts = productsData.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length;
        
        const totalInventoryValue = productsData.reduce((sum, product) => {
            return sum + ((product.costPrice || 0) * (product.stock || 0));
        }, 0);
        
        // Estadísticas de clientes
        const clientsData = this.data.clients || [];
        const totalClients = clientsData.length;
        const activeClients = clientsData.filter(c => c.estado === 'active').length;
        const vipClients = clientsData.filter(c => c.tipo === 'vip').length;
        
        // Productos más vendidos
        const productSales = {};
        salesData.forEach(sale => {
            if (sale.productos && Array.isArray(sale.productos)) {
                sale.productos.forEach(product => {
                    const key = product.nombre || product.producto || 'Producto sin nombre';
                    productSales[key] = (productSales[key] || 0) + (product.cantidad || 1);
                });
            }
        });
        
        const topProducts = Object.entries(productSales)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({ name, quantity }));
        
        return {
            // Ventas
            totalSalesToday: totalSalesToday,
            totalSalesMonth: totalSalesMonth,
            totalSalesCount: salesData.length,
            todaySalesCount: todaySales.length,
            
            // Inventario
            totalProducts: totalProducts,
            inStockProducts: inStockProducts,
            outOfStockProducts: outOfStockProducts,
            lowStockProducts: lowStockProducts,
            inventoryValue: totalInventoryValue,
            
            // Clientes
            totalClients: totalClients,
            activeClients: activeClients,
            vipClients: vipClients,
            
            // Tendencias
            topProducts: topProducts,
            
            // Percentajes para charts
            stockPercentage: totalProducts > 0 ? (inStockProducts / totalProducts * 100) : 0,
            clientsGrowth: this.calculateGrowthPercentage('clients'),
            salesGrowth: this.calculateGrowthPercentage('sales')
        };
    }
    
    calculateGrowthPercentage(type) {
        // Calcular crecimiento comparando con el mes anterior
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        let currentData = 0;
        let lastMonthData = 0;
        
        if (type === 'sales') {
            const sales = this.data.sales || [];
            currentData = sales.filter(sale => {
                const saleDate = new Date(sale.fecha || sale.createdAt);
                return saleDate >= currentMonth;
            }).length;
            
            lastMonthData = sales.filter(sale => {
                const saleDate = new Date(sale.fecha || sale.createdAt);
                return saleDate >= lastMonth && saleDate < currentMonth;
            }).length;
        } else if (type === 'clients') {
            const clients = this.data.clients || [];
            currentData = clients.filter(client => {
                const regDate = new Date(client.fechaRegistro || client.createdAt);
                return regDate >= currentMonth;
            }).length;
            
            lastMonthData = clients.filter(client => {
                const regDate = new Date(client.fechaRegistro || client.createdAt);
                return regDate >= lastMonth && regDate < currentMonth;
            }).length;
        }
        
        if (lastMonthData === 0) return currentData > 0 ? 100 : 0;
        return Math.round(((currentData - lastMonthData) / lastMonthData) * 100);
    }

    updateStatsCards(stats) {
        console.log('📈 Actualizando tarjetas de estadísticas...');
        
        // Actualizar ventas de hoy
        this.updateStatCard('.today-sales .stat-value', stats.totalSalesToday, '$');
        this.updateStatCard('.today-sales .stat-change', stats.salesGrowth, '%', 'growth');
        
        // Actualizar ventas del mes
        this.updateStatCard('.month-sales .stat-value', stats.totalSalesMonth, '$');
        this.updateStatCard('.total-sales .stat-value', stats.totalSalesCount, '');
        
        // Actualizar inventario
        this.updateStatCard('.total-products .stat-value', stats.totalProducts, '');
        this.updateStatCard('.in-stock .stat-value', stats.inStockProducts, '');
        this.updateStatCard('.out-stock .stat-value', stats.outOfStockProducts, '');
        this.updateStatCard('.low-stock .stat-value', stats.lowStockProducts, '');
        this.updateStatCard('.inventory-value .stat-value', stats.inventoryValue, '$');
        
        // Actualizar clientes
        this.updateStatCard('.total-clients .stat-value', stats.totalClients, '');
        this.updateStatCard('.active-clients .stat-value', stats.activeClients, '');
        this.updateStatCard('.vip-clients .stat-value', stats.vipClients, '');
        this.updateStatCard('.clients-growth .stat-change', stats.clientsGrowth, '%', 'growth');
        
        // Actualizar productos más vendidos
        this.updateTopProducts(stats.topProducts);
        
        // Actualizar indicadores de estado
        this.updateHealthIndicators(stats);
    }
    
    updateStatCard(selector, value, prefix = '', type = 'normal') {
        const element = document.querySelector(selector);
        if (element) {
            if (type === 'growth') {
                const isPositive = value >= 0;
                element.textContent = (isPositive ? '+' : '') + value + prefix;
                element.className = element.className.replace(/positive|negative/g, '');
                element.classList.add(isPositive ? 'positive' : 'negative');
            } else {
                const formattedValue = typeof value === 'number' ? 
                    (prefix === '$' ? value.toLocaleString('es-ES', {minimumFractionDigits: 2}) : value.toLocaleString('es-ES')) :
                    value;
                element.textContent = prefix + formattedValue;
            }
        }
    }
    
    updateTopProducts(topProducts) {
        const container = document.querySelector('.top-products-list');
        if (container && topProducts) {
            container.innerHTML = topProducts.map((product, index) => `
                <div class="top-product-item">
                    <span class="product-rank">#${index + 1}</span>
                    <span class="product-name">${product.name}</span>
                    <span class="product-quantity">${product.quantity} vendidos</span>
                </div>
            `).join('');
        }
    }
    
    updateHealthIndicators(stats) {
        // Indicador de salud del inventario
        const inventoryHealth = document.querySelector('.inventory-health');
        if (inventoryHealth) {
            const healthPercentage = stats.totalProducts > 0 ? 
                ((stats.inStockProducts / stats.totalProducts) * 100) : 0;
            
            let healthClass = 'good';
            let healthText = 'Excelente';
            
            if (healthPercentage < 50) {
                healthClass = 'critical';
                healthText = 'Crítico';
            } else if (healthPercentage < 80) {
                healthClass = 'warning';
                healthText = 'Atención';
            }
            
            inventoryHealth.className = `health-indicator ${healthClass}`;
            inventoryHealth.textContent = healthText;
        }
    }
    
    // Configurar sincronización en tiempo real con Firebase
    setupFirebaseRealTimeSync() {
        var self = this;
        console.log('⚡ Configurando sincronización en tiempo real para dashboard...');
        
        // Escuchar cambios en inventario
        window.addEventListener('inventoryUpdated', function(event) {
            console.log('🔄 Inventario actualizado, recalculando dashboard...');
            self.data.products = event.detail.products;
            const stats = self.calculateStats();
            self.updateStatsCards(stats);
            self.updateCharts(stats);
        });
        
        // Escuchar cambios en clientes
        window.addEventListener('clientsUpdated', function(event) {
            console.log('🔄 Clientes actualizados, recalculando dashboard...');
            self.data.clients = event.detail.clients;
            const stats = self.calculateStats();
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
    
    // Actualizar gráficos con nuevos datos
    updateCharts(stats) {
        // Actualizar gráfico de ventas si existe
        if (this.salesChart) {
            const today = new Date();
            const last7Days = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const daySales = (this.data.sales || []).filter(sale => {
                    const saleDate = new Date(sale.fecha || sale.createdAt);
                    return saleDate.toISOString().split('T')[0] === dateStr;
                });
                
                const dayTotal = daySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
                last7Days.push(dayTotal);
            }
            
            this.salesChart.data.datasets[0].data = last7Days;
            this.salesChart.update();
        }
        
        // Actualizar gráfico de inventario si existe
        if (this.inventoryChart) {
            this.inventoryChart.data.datasets[0].data = [
                stats.inStockProducts,
                stats.outOfStockProducts,
                stats.lowStockProducts
            ];
            this.inventoryChart.update();
        }
    }
    
    // Configurar botón de sincronización manual
    setupSyncButton() {
        var self = this;
        var syncButton = document.getElementById('syncButton');
        
        if (syncButton) {
            syncButton.addEventListener('click', function() {
                const icon = syncButton.querySelector('i');
                const text = syncButton.querySelector('.sync-text');
                
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
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
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

    animateValue(selector, targetValue, prefix = '') {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            if (index === 0) { // Solo animar el primer elemento (ventas)
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
        });
    }

    startRealTimeUpdates() {
        // Actualizar datos cada 5 minutos
        setInterval(() => {
            this.updateCharts();
            this.loadDashboardData();
        }, 300000);
    }

    updateCharts() {
        // Simular nuevos datos para las gráficas
        if (this.weeklySalesChart) {
            const newData = this.generateRandomSalesData();
            this.weeklySalesChart.data.datasets[0].data = newData;
            this.weeklySalesChart.update();
        }
    }

    generateRandomSalesData() {
        return Array.from({length: 7}, () => Math.floor(Math.random() * 20000) + 10000);
    }

    // Métodos de utilidad
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
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});
