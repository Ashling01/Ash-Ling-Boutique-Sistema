// Dashboard JavaScript - Ash-Ling ERP
class DashboardManager {
    constructor() {
        this.init();
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
        if (typeof window.dataManager !== 'undefined') {
            const stats = window.dataManager.getStats();
            this.updateStatsCards(stats);
        }
        
        // Simular actualizaciones en tiempo real
        this.startRealTimeUpdates();
    }

    updateStatsCards(stats) {
        this.animateValue('.stat-value', stats.totalSales, '$');
        // Actualizar otros valores según sea necesario
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
