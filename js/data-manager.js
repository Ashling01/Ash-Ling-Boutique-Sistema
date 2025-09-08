// Gestión de datos del ERP
class DataManager {
    constructor() {
        this.data = {
            clients: [],
            products: [],
            sales: [],
            employees: [],
            invoices: []
        };
        this.loadSampleData();
    }

    // Cargar datos de ejemplo
    loadSampleData() {
        this.data.clients = [
            {
                id: 1,
                name: "María González",
                email: "maria@email.com",
                phone: "+1 234 567 8900",
                address: "Calle Principal 123",
                status: "active",
                created: "2025-01-15"
            },
            {
                id: 2,
                name: "Juan Pérez",
                email: "juan@email.com",
                phone: "+1 234 567 8901",
                address: "Avenida Central 456",
                status: "active",
                created: "2025-02-10"
            },
            {
                id: 3,
                name: "Ana Rodríguez",
                email: "ana@email.com",
                phone: "+1 234 567 8902",
                address: "Plaza Mayor 789",
                status: "inactive",
                created: "2025-03-05"
            }
        ];

        this.data.products = [
            {
                id: 1,
                sku: "SKU001",
                name: "Producto Premium A",
                category: "Electrónicos",
                price: 299.99,
                stock: 150,
                minStock: 20,
                status: "active",
                description: "Producto de alta calidad con características premium"
            },
            {
                id: 2,
                sku: "SKU002",
                name: "Producto Estándar B",
                category: "Hogar",
                price: 89.99,
                stock: 75,
                minStock: 15,
                status: "active",
                description: "Producto estándar para uso doméstico"
            },
            {
                id: 3,
                sku: "SKU003",
                name: "Producto Especial C",
                category: "Oficina",
                price: 159.99,
                stock: 5,
                minStock: 10,
                status: "low_stock",
                description: "Producto especializado para oficina"
            }
        ];

        this.data.sales = [
            {
                id: 1,
                clientId: 1,
                clientName: "María González",
                date: "2025-09-01",
                items: [
                    { productId: 1, productName: "Producto Premium A", quantity: 2, price: 299.99 }
                ],
                total: 599.98,
                status: "completed",
                paymentMethod: "credit_card"
            },
            {
                id: 2,
                clientId: 2,
                clientName: "Juan Pérez",
                date: "2025-08-30",
                items: [
                    { productId: 2, productName: "Producto Estándar B", quantity: 1, price: 89.99 },
                    { productId: 3, productName: "Producto Especial C", quantity: 3, price: 159.99 }
                ],
                total: 569.96,
                status: "pending",
                paymentMethod: "cash"
            }
        ];

        this.data.employees = [
            {
                id: 1,
                name: "Carlos Manager",
                position: "Gerente General",
                department: "Administración",
                email: "carlos@ashling.com",
                phone: "+1 234 567 8910",
                salary: 75000,
                hireDate: "2023-01-15",
                status: "active"
            },
            {
                id: 2,
                name: "Sofia Vendedora",
                position: "Ejecutiva de Ventas",
                department: "Ventas",
                email: "sofia@ashling.com",
                phone: "+1 234 567 8911",
                salary: 45000,
                hireDate: "2023-06-10",
                status: "active"
            }
        ];
    }

    // Métodos para clientes
    getClients() {
        return this.data.clients;
    }

    addClient(clientData) {
        const newClient = {
            id: this.getNextId('clients'),
            ...clientData,
            created: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        this.data.clients.push(newClient);
        this.saveToLocalStorage();
        return newClient;
    }

    updateClient(id, clientData) {
        const index = this.data.clients.findIndex(client => client.id === id);
        if (index !== -1) {
            this.data.clients[index] = { ...this.data.clients[index], ...clientData };
            this.saveToLocalStorage();
            return this.data.clients[index];
        }
        return null;
    }

    deleteClient(id) {
        const index = this.data.clients.findIndex(client => client.id === id);
        if (index !== -1) {
            this.data.clients.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    // Métodos para productos
    getProducts() {
        return this.data.products;
    }

    addProduct(productData) {
        const newProduct = {
            id: this.getNextId('products'),
            ...productData,
            status: this.getProductStatus(productData.stock, productData.minStock)
        };
        this.data.products.push(newProduct);
        this.saveToLocalStorage();
        return newProduct;
    }

    updateProduct(id, productData) {
        const index = this.data.products.findIndex(product => product.id === id);
        if (index !== -1) {
            const updatedProduct = { ...this.data.products[index], ...productData };
            updatedProduct.status = this.getProductStatus(updatedProduct.stock, updatedProduct.minStock);
            this.data.products[index] = updatedProduct;
            this.saveToLocalStorage();
            return updatedProduct;
        }
        return null;
    }

    deleteProduct(id) {
        const index = this.data.products.findIndex(product => product.id === id);
        if (index !== -1) {
            this.data.products.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }

    getProductStatus(stock, minStock) {
        if (stock === 0) return 'out_of_stock';
        if (stock <= minStock) return 'low_stock';
        return 'active';
    }

    // Métodos para ventas
    getSales() {
        return this.data.sales;
    }

    addSale(saleData) {
        const newSale = {
            id: this.getNextId('sales'),
            ...saleData,
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
        };
        
        // Actualizar stock de productos
        saleData.items.forEach(item => {
            this.updateProductStock(item.productId, -item.quantity);
        });
        
        this.data.sales.push(newSale);
        this.saveToLocalStorage();
        return newSale;
    }

    updateProductStock(productId, quantityChange) {
        const product = this.data.products.find(p => p.id === productId);
        if (product) {
            product.stock += quantityChange;
            product.status = this.getProductStatus(product.stock, product.minStock);
        }
    }

    // Métodos para empleados
    getEmployees() {
        return this.data.employees;
    }

    addEmployee(employeeData) {
        const newEmployee = {
            id: this.getNextId('employees'),
            ...employeeData,
            hireDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        this.data.employees.push(newEmployee);
        this.saveToLocalStorage();
        return newEmployee;
    }

    // Métodos de estadísticas
    getStats() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlySales = this.data.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        });

        const totalSales = monthlySales.reduce((sum, sale) => sum + sale.total, 0);
        const totalOrders = monthlySales.length;
        const totalClients = this.data.clients.filter(client => client.status === 'active').length;
        const totalProducts = this.data.products.length;
        const lowStockProducts = this.data.products.filter(product => product.status === 'low_stock').length;
        const outOfStockProducts = this.data.products.filter(product => product.status === 'out_of_stock').length;

        return {
            totalSales,
            totalOrders,
            totalClients,
            totalProducts,
            lowStockProducts,
            outOfStockProducts
        };
    }

    getSalesChartData() {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const salesByMonth = new Array(12).fill(0);

        this.data.sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            if (saleDate.getFullYear() === currentYear) {
                salesByMonth[saleDate.getMonth()] += sale.total;
            }
        });

        return {
            labels: months,
            data: salesByMonth
        };
    }

    // Métodos de búsqueda
    searchClients(query) {
        const lowerQuery = query.toLowerCase();
        return this.data.clients.filter(client => 
            client.name.toLowerCase().includes(lowerQuery) ||
            client.email.toLowerCase().includes(lowerQuery) ||
            client.phone.includes(query)
        );
    }

    searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return this.data.products.filter(product => 
            product.name.toLowerCase().includes(lowerQuery) ||
            product.sku.toLowerCase().includes(lowerQuery) ||
            product.category.toLowerCase().includes(lowerQuery)
        );
    }

    // Métodos de utilidad
    getNextId(collection) {
        const items = this.data[collection];
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('ashling_erp_data', JSON.stringify(this.data));
        } catch (e) {
            console.warn('No se pudo guardar en localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('ashling_erp_data');
            if (saved) {
                this.data = JSON.parse(saved);
                return true;
            }
        } catch (e) {
            console.warn('No se pudo cargar desde localStorage:', e);
        }
        return false;
    }

    // Exportar datos
    exportToJSON() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ashling_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Importar datos
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    this.data = importedData;
                    this.saveToLocalStorage();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    // Generar reportes
    generateSalesReport(startDate, endDate) {
        const sales = this.data.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalOrders = sales.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            sales,
            totalRevenue,
            totalOrders,
            averageOrderValue,
            period: { startDate, endDate }
        };
    }

    generateInventoryReport() {
        const products = this.data.products;
        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.status === 'active').length;
        const lowStockProducts = products.filter(p => p.status === 'low_stock').length;
        const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
        const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        return {
            totalProducts,
            activeProducts,
            lowStockProducts,
            outOfStockProducts,
            totalInventoryValue,
            products
        };
    }
}

// Inicializar el gestor de datos globalmente
window.dataManager = new DataManager();
