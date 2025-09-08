// Finanzas Management
class FinanzasManager {
    constructor() {
        this.transactions = [];
        this.accounts = [];
        this.budgets = [];
        this.currentPeriod = 'month';
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        this.renderDashboard();
        this.renderTransactions();
    }

    setupEventListeners() {
        // Period selector
        document.getElementById('periodSelector').addEventListener('change', (e) => {
            this.currentPeriod = e.target.value;
            this.updateDashboard();
        });
        
        // Transaction modal
        document.getElementById('addTransactionBtn').addEventListener('click', () => this.openTransactionModal());
        document.getElementById('closeTransactionModal').addEventListener('click', () => this.closeTransactionModal());
        document.getElementById('cancelTransactionBtn').addEventListener('click', () => this.closeTransactionModal());
        document.getElementById('saveTransactionBtn').addEventListener('click', () => this.saveTransaction());
        
        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.chart-btn').classList.add('active');
                const chartType = e.target.closest('.chart-btn').dataset.type;
                this.updateRevenueExpensesChart(chartType);
            });
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

    loadData() {
        // Load transactions
        const storedTransactions = localStorage.getItem('ash_ling_transactions');
        if (storedTransactions) {
            this.transactions = JSON.parse(storedTransactions);
        } else {
            this.transactions = this.generateSampleTransactions();
            this.saveTransactions();
        }

        // Load accounts
        const storedAccounts = localStorage.getItem('ash_ling_accounts');
        if (storedAccounts) {
            this.accounts = JSON.parse(storedAccounts);
        } else {
            this.accounts = this.generateSampleAccounts();
            this.saveAccounts();
        }
    }

    saveTransactions() {
        localStorage.setItem('ash_ling_transactions', JSON.stringify(this.transactions));
    }

    saveAccounts() {
        localStorage.setItem('ash_ling_accounts', JSON.stringify(this.accounts));
    }

    generateSampleTransactions() {
        const transactions = [];
        const categories = ['sales', 'services', 'rent', 'utilities', 'supplies', 'marketing', 'other'];
        const descriptions = {
            sales: ['Venta de productos', 'Venta online', 'Venta mayorista'],
            services: ['Servicio de consultoría', 'Mantenimiento', 'Soporte técnico'],
            rent: ['Alquiler oficina', 'Alquiler local'],
            utilities: ['Electricidad', 'Internet', 'Teléfono', 'Agua'],
            supplies: ['Material oficina', 'Insumos', 'Equipamiento'],
            marketing: ['Publicidad online', 'Material promocional', 'Eventos'],
            other: ['Gastos varios', 'Impuestos', 'Seguros']
        };

        for (let i = 0; i < 50; i++) {
            const type = Math.random() > 0.6 ? 'income' : 'expense';
            const category = categories[Math.floor(Math.random() * categories.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));
            
            let amount;
            if (type === 'income') {
                amount = Math.random() * 5000 + 1000; // 1000-6000
            } else {
                amount = Math.random() * 2000 + 100; // 100-2100
            }

            transactions.push({
                id: i + 1,
                type: type,
                description: descriptions[category][Math.floor(Math.random() * descriptions[category].length)],
                amount: parseFloat(amount.toFixed(2)),
                category: category,
                account: ['checking', 'cash', 'savings'][Math.floor(Math.random() * 3)],
                date: date.toISOString().split('T')[0],
                notes: Math.random() > 0.7 ? 'Transacción automática del sistema' : '',
                createdAt: date.toISOString()
            });
        }

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    generateSampleAccounts() {
        return [
            {
                id: 1,
                name: 'Cuenta Corriente',
                type: 'asset',
                balance: 45250.00,
                currency: 'USD'
            },
            {
                id: 2,
                name: 'Caja Chica',
                type: 'asset',
                balance: 1500.00,
                currency: 'USD'
            },
            {
                id: 3,
                name: 'Cuentas por Cobrar',
                type: 'asset',
                balance: 12750.00,
                currency: 'USD'
            },
            {
                id: 4,
                name: 'Cuentas por Pagar',
                type: 'liability',
                balance: 8950.00,
                currency: 'USD'
            }
        ];
    }

    renderDashboard() {
        const period = this.getPeriodData();
        
        // Update summary cards
        document.getElementById('totalRevenue').textContent = `$${period.revenue.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${period.expenses.toFixed(2)}`;
        document.getElementById('netProfit').textContent = `$${period.profit.toFixed(2)}`;
        document.getElementById('profitMargin').textContent = `${period.margin.toFixed(1)}%`;
        
        // Update change indicators (mock data)
        document.getElementById('revenueChange').textContent = '+12.5%';
        document.getElementById('expensesChange').textContent = '+8.2%';
        document.getElementById('profitChange').textContent = '+18.7%';
        document.getElementById('marginChange').textContent = '+2.3%';
        
        this.updateCharts();
    }

    getPeriodData() {
        const now = new Date();
        let startDate, endDate;

        switch (this.currentPeriod) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = now;
        }

        const periodTransactions = this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });

        const revenue = periodTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const profit = revenue - expenses;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return { revenue, expenses, profit, margin, transactions: periodTransactions };
    }

    initializeCharts() {
        this.initRevenueExpensesChart();
        this.initCashFlowChart();
        this.initExpensesBreakdownChart();
    }

    initRevenueExpensesChart() {
        const ctx = document.getElementById('revenueExpensesChart').getContext('2d');
        const data = this.getMonthlyRevenueExpensesData();
        
        this.charts.revenueExpenses = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Ingresos',
                    data: data.revenue,
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    borderColor: '#ff69b4',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Gastos',
                    data: data.expenses,
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderColor: '#ffd700',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    initCashFlowChart() {
        const ctx = document.getElementById('cashFlowChart').getContext('2d');
        const data = this.getCashFlowData();
        
        this.charts.cashFlow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Flujo de Caja',
                    data: data.cashFlow,
                    backgroundColor: data.cashFlow.map(value => 
                        value >= 0 ? 'rgba(255, 105, 180, 0.8)' : 'rgba(255, 215, 0, 0.8)'
                    ),
                    borderColor: data.cashFlow.map(value => 
                        value >= 0 ? '#ff69b4' : '#ffd700'
                    ),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    initExpensesBreakdownChart() {
        const ctx = document.getElementById('expensesBreakdownChart').getContext('2d');
        const data = this.getExpensesBreakdownData();
        
        this.charts.expensesBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        '#ff69b4',
                        '#ffd700',
                        '#ff1493',
                        '#ffb347',
                        '#ff69b4aa',
                        '#ffd700aa'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    getMonthlyRevenueExpensesData() {
        const months = [];
        const revenue = [];
        const expenses = [];
        
        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            months.push(date.toLocaleDateString('es-ES', { month: 'short' }));
            
            const monthTransactions = this.transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= monthStart && transactionDate <= monthEnd;
            });
            
            const monthRevenue = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const monthExpenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            revenue.push(monthRevenue);
            expenses.push(monthExpenses);
        }
        
        return { labels: months, revenue, expenses };
    }

    getCashFlowData() {
        const weeks = [];
        const cashFlow = [];
        
        // Get last 8 weeks
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            weeks.push(`Sem ${8 - i}`);
            
            const weekTransactions = this.transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate >= weekStart && transactionDate <= weekEnd;
            });
            
            const weekRevenue = weekTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
                
            const weekExpenses = weekTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            cashFlow.push(weekRevenue - weekExpenses);
        }
        
        return { labels: weeks, cashFlow };
    }

    getExpensesBreakdownData() {
        const period = this.getPeriodData();
        const expensesByCategory = {};
        
        period.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });
        
        const labels = Object.keys(expensesByCategory).map(category => {
            const categoryNames = {
                rent: 'Alquiler',
                utilities: 'Servicios',
                supplies: 'Suministros',
                marketing: 'Marketing',
                other: 'Otros'
            };
            return categoryNames[category] || category;
        });
        
        const values = Object.values(expensesByCategory);
        
        return { labels, values };
    }

    updateCharts() {
        if (this.charts.revenueExpenses) {
            const data = this.getMonthlyRevenueExpensesData();
            this.charts.revenueExpenses.data.labels = data.labels;
            this.charts.revenueExpenses.data.datasets[0].data = data.revenue;
            this.charts.revenueExpenses.data.datasets[1].data = data.expenses;
            this.charts.revenueExpenses.update();
        }
        
        if (this.charts.cashFlow) {
            const data = this.getCashFlowData();
            this.charts.cashFlow.data.labels = data.labels;
            this.charts.cashFlow.data.datasets[0].data = data.cashFlow;
            this.charts.cashFlow.update();
        }
        
        if (this.charts.expensesBreakdown) {
            const data = this.getExpensesBreakdownData();
            this.charts.expensesBreakdown.data.labels = data.labels;
            this.charts.expensesBreakdown.data.datasets[0].data = data.values;
            this.charts.expensesBreakdown.update();
        }
    }

    updateRevenueExpensesChart(type) {
        if (this.charts.revenueExpenses) {
            this.charts.revenueExpenses.config.type = type;
            this.charts.revenueExpenses.update();
        }
    }

    updateDashboard() {
        this.renderDashboard();
    }

    renderTransactions() {
        const recentTransactions = this.transactions.slice(0, 10);
        const transactionsList = document.getElementById('transactionsList');
        
        transactionsList.innerHTML = '';
        
        recentTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            
            const icon = transaction.type === 'income' ? 'fa-arrow-up' : 'fa-arrow-down';
            const typeClass = transaction.type === 'income' ? 'income' : 'expense';
            const sign = transaction.type === 'income' ? '+' : '-';
            
            transactionElement.innerHTML = `
                <div class="transaction-icon ${typeClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        ${this.formatDate(transaction.date)} • ${this.getCategoryName(transaction.category)}
                    </div>
                </div>
                <div class="transaction-amount ${typeClass}">
                    ${sign}$${transaction.amount.toFixed(2)}
                </div>
            `;
            
            transactionsList.appendChild(transactionElement);
        });
    }

    openTransactionModal(transaction = null) {
        const modal = document.getElementById('transactionModal');
        const title = document.getElementById('transactionModalTitle');
        
        if (transaction) {
            title.textContent = 'Editar Transacción';
            this.populateTransactionForm(transaction);
        } else {
            title.textContent = 'Nueva Transacción';
            this.resetTransactionForm();
        }
        
        modal.classList.add('active');
    }

    closeTransactionModal() {
        const modal = document.getElementById('transactionModal');
        modal.classList.remove('active');
    }

    resetTransactionForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
    }

    populateTransactionForm(transaction) {
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionDescription').value = transaction.description;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.getElementById('transactionAccount').value = transaction.account;
        document.getElementById('transactionNotes').value = transaction.notes || '';
    }

    saveTransaction() {
        const form = document.getElementById('transactionForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        const formData = new FormData(form);
        const transaction = {
            id: Date.now(),
            type: formData.get('type'),
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            account: formData.get('account'),
            date: formData.get('date'),
            notes: formData.get('notes') || '',
            createdAt: new Date().toISOString()
        };
        
        this.transactions.unshift(transaction);
        this.saveTransactions();
        this.renderDashboard();
        this.renderTransactions();
        this.closeTransactionModal();
        
        this.showNotification('Transacción guardada exitosamente', 'success');
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    getCategoryName(category) {
        const categoryNames = {
            sales: 'Ventas',
            services: 'Servicios',
            rent: 'Alquiler',
            utilities: 'Servicios Públicos',
            supplies: 'Suministros',
            marketing: 'Marketing',
            other: 'Otros'
        };
        return categoryNames[category] || category;
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.finanzasManager = new FinanzasManager();
});
