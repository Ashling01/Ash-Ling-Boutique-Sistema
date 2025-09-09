// Firebase Configuration for ASH-LING ERP System (ES5 Compatible)
// Esta versión usa el SDK de Firebase v9 con sintaxis compatible

// Firebase Configuration
var firebaseConfig = {
  apiKey: "AIzaSyADkNP4QKDj-3rGblJoY_RUi2BFGhcx6Cg",
  authDomain: "ashling-f44aa.firebaseapp.com",
  databaseURL: "https://ashling-f44aa-default-rtdb.firebaseio.com",
  projectId: "ashling-f44aa",
  storageBucket: "ashling-f44aa.firebasestorage.app",
  messagingSenderId: "885806495701",
  appId: "1:885806495701:web:84266cb2acba453341ef5c"
};

// Initialize Firebase (será inicializado cuando se carguen los scripts)
var firebaseApp;
var database;
var auth;
var storage;

// Firebase Service for ASH-LING
var FirebaseService = {
  
  initialized: false,
  
  // Inicializar Firebase cuando los scripts estén cargados
  init: function() {
    try {
      if (typeof firebase !== 'undefined') {
        console.log('🔥 Inicializando Firebase...');
        firebaseApp = firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        auth = firebase.auth();
        storage = firebase.storage();
        this.initialized = true;
        console.log('✅ Firebase inicializado correctamente');
        return true;
      } else {
        console.warn('⚠️ Firebase SDK no está cargado');
        return false;
      }
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error);
      return false;
    }
  },
  
  // Verificar si Firebase está listo
  isReady: function() {
    return this.initialized && typeof firebase !== 'undefined';
  },
  
  // === AUTHENTICATION ===
  signIn: function(email, password, callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'), null);
      return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        console.log('✅ Usuario autenticado:', userCredential.user.email);
        if (callback) callback(null, userCredential.user);
      })
      .catch(function(error) {
        console.error('❌ Error de autenticación:', error.message);
        if (callback) callback(error, null);
      });
  },
  
  signUp: function(email, password, callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'), null);
      return;
    }
    
    auth.createUserWithEmailAndPassword(email, password)
      .then(function(userCredential) {
        console.log('✅ Usuario registrado:', userCredential.user.email);
        if (callback) callback(null, userCredential.user);
      })
      .catch(function(error) {
        console.error('❌ Error de registro:', error.message);
        if (callback) callback(error, null);
      });
  },
  
  signOut: function(callback) {
    if (!this.isReady()) {
      if (callback) callback(new Error('Firebase no inicializado'));
      return;
    }
    
    auth.signOut()
      .then(function() {
        console.log('✅ Sesión cerrada');
        if (callback) callback(null);
      })
      .catch(function(error) {
        console.error('❌ Error al cerrar sesión:', error.message);
        if (callback) callback(error);
      });
  },
  
  onAuthStateChange: function(callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      return function() {}; // unsubscribe vacío
    }
    
    return auth.onAuthStateChanged(callback);
  },
  
  // === INVENTORY MANAGEMENT ===
  saveInventoryProducts: function(products, callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'));
      return;
    }
    
    var inventoryRef = database.ref('ash-ling/inventory/products');
    var dataToSave = {
      products: products,
      lastUpdated: new Date().toISOString(),
      updatedBy: (auth.currentUser && auth.currentUser.email) || 'system'
    };
    
    inventoryRef.set(dataToSave)
      .then(function() {
        console.log('✅ Inventario sincronizado con Firebase');
        if (callback) callback(null, true);
      })
      .catch(function(error) {
        console.error('❌ Error al guardar inventario:', error.message);
        if (callback) callback(error);
      });
  },
  
  loadInventoryProducts: function(callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'), []);
      return;
    }
    
    var inventoryRef = database.ref('ash-ling/inventory/products');
    inventoryRef.once('value')
      .then(function(snapshot) {
        if (snapshot.exists()) {
          var data = snapshot.val();
          var products = data.products || [];
          console.log('✅ Inventario cargado desde Firebase:', products.length, 'productos');
          if (callback) callback(null, products);
        } else {
          console.log('ℹ️ No hay datos de inventario en Firebase');
          if (callback) callback(null, []);
        }
      })
      .catch(function(error) {
        console.error('❌ Error al cargar inventario:', error.message);
        if (callback) callback(error, []);
      });
  },
  
  // === SALES MANAGEMENT ===
  saveSale: function(saleData, callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'), null);
      return;
    }
    
    var salesRef = database.ref('ash-ling/sales');
    var newSaleRef = salesRef.push();
    
    var saleWithMetadata = {
      id: newSaleRef.key,
      fecha: saleData.fecha || new Date().toISOString(),
      cliente: saleData.cliente,
      productos: saleData.productos,
      total: saleData.total,
      createdAt: new Date().toISOString(),
      createdBy: (auth.currentUser && auth.currentUser.email) || 'system'
    };
    
    // Copiar otras propiedades de saleData
    for (var key in saleData) {
      if (saleData.hasOwnProperty(key) && !saleWithMetadata.hasOwnProperty(key)) {
        saleWithMetadata[key] = saleData[key];
      }
    }
    
    newSaleRef.set(saleWithMetadata)
      .then(function() {
        console.log('✅ Venta guardada en Firebase con ID:', newSaleRef.key);
        if (callback) callback(null, newSaleRef.key);
      })
      .catch(function(error) {
        console.error('❌ Error al guardar venta:', error.message);
        if (callback) callback(error, null);
      });
  },
  
  loadSales: function(limit, callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'), []);
      return;
    }
    
    limit = limit || 100;
    var salesRef = database.ref('ash-ling/sales');
    
    salesRef.limitToLast(limit).once('value')
      .then(function(snapshot) {
        if (snapshot.exists()) {
          var salesData = snapshot.val();
          var salesArray = Object.values(salesData);
          console.log('✅ Ventas cargadas desde Firebase:', salesArray.length);
          if (callback) callback(null, salesArray);
        } else {
          console.log('ℹ️ No hay datos de ventas en Firebase');
          if (callback) callback(null, []);
        }
      })
      .catch(function(error) {
        console.error('❌ Error al cargar ventas:', error.message);
        if (callback) callback(error, []);
      });
  },
  
  // === REAL-TIME SYNC ===
  onInventoryChange: function(callback) {
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      return function() {}; // unsubscribe vacío
    }
    
    var inventoryRef = database.ref('ash-ling/inventory/products');
    console.log('👂 Escuchando cambios en inventario Firebase...');
    
    return inventoryRef.on('value', function(snapshot) {
      if (snapshot.exists()) {
        var data = snapshot.val();
        var products = data.products || [];
        console.log('🔄 Cambio detectado en Firebase:', products.length, 'productos');
        
        // Solo actualizar si hay cambios reales
        var currentLocal = JSON.parse(localStorage.getItem('ash_ling_products') || '[]');
        if (JSON.stringify(currentLocal) !== JSON.stringify(products)) {
          console.log('📥 Aplicando cambios desde Firebase...');
          localStorage.setItem('ash_ling_products', JSON.stringify(products));
          callback(products);
        }
      }
    });
  },
  
  setupRealTimeSync: function() {
    var self = this;
    console.log('⚡ Configurando sincronización en tiempo real...');
    
    this.onInventoryChange(function(products) {
      console.log('🔄 Inventario actualizado desde otro dispositivo');
      
      // Notificar al sistema de inventario si está activo
      if (window.inventoryManager) {
        window.inventoryManager.products = products;
        window.inventoryManager.renderProducts();
        window.inventoryManager.updateStats();
        window.inventoryManager.showNotification('📱 Inventario sincronizado desde otro dispositivo', 'info');
      }
      
      // Disparar evento personalizado para otras partes del sistema
      window.dispatchEvent(new CustomEvent('inventoryUpdated', { 
        detail: { products: products, source: 'firebase' } 
      }));
    });
  },
  
  // === SYNC UTILITIES ===
  syncToCloud: function(callback) {
    var self = this;
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'));
      return;
    }
    
    try {
      // Obtener datos del localStorage
      var localInventory = JSON.parse(localStorage.getItem('ash_ling_products') || '[]');
      var localSales = JSON.parse(localStorage.getItem('ash_ling_ventas') || '[]');
      
      console.log('🔄 Sincronizando', localInventory.length, 'productos y', localSales.length, 'ventas...');
      
      // Sincronizar inventario
      this.saveInventoryProducts(localInventory, function(error) {
        if (error) {
          console.error('❌ Error al sincronizar inventario:', error);
          if (callback) callback(error);
          return;
        }
        
        // Sincronizar ventas
        var ventasPendientes = 0;
        var ventasCompletadas = 0;
        
        if (localSales.length === 0) {
          console.log('✅ Sincronización completa - no hay ventas locales');
          if (callback) callback(null);
          return;
        }
        
        localSales.forEach(function(sale, index) {
          if (!sale.firebaseId) {
            ventasPendientes++;
            self.saveSale(sale, function(error, firebaseId) {
              if (error) {
                console.error('❌ Error al sincronizar venta:', error);
              } else {
                sale.firebaseId = firebaseId;
                ventasCompletadas++;
              }
              
              // Verificar si todas las ventas fueron procesadas
              if (ventasCompletadas + (ventasPendientes - ventasCompletadas) === ventasPendientes) {
                // Actualizar localStorage
                localStorage.setItem('ash_ling_ventas', JSON.stringify(localSales));
                console.log('✅ Sincronización completa:', ventasCompletadas, 'ventas subidas');
                if (callback) callback(null);
              }
            });
          }
        });
        
        if (ventasPendientes === 0) {
          console.log('✅ Sincronización completa - todas las ventas ya estaban en la nube');
          if (callback) callback(null);
        }
      });
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      if (callback) callback(error);
    }
  },
  
  syncFromCloud: function(callback) {
    var self = this;
    if (!this.isReady()) {
      console.error('❌ Firebase no está inicializado');
      if (callback) callback(new Error('Firebase no inicializado'));
      return;
    }
    
    console.log('🔄 Sincronizando datos desde la nube...');
    
    // Cargar inventario
    this.loadInventoryProducts(function(error, cloudInventory) {
      if (error) {
        console.error('❌ Error al cargar inventario:', error);
        if (callback) callback(error);
        return;
      }
      
      // Cargar ventas
      self.loadSales(1000, function(error, cloudSales) {
        if (error) {
          console.error('❌ Error al cargar ventas:', error);
          if (callback) callback(error);
          return;
        }
        
        // Actualizar localStorage
        if (cloudInventory.length > 0) {
          localStorage.setItem('ash_ling_products', JSON.stringify(cloudInventory));
          console.log('✅ Inventario sincronizado:', cloudInventory.length, 'productos');
        }
        
        if (cloudSales.length > 0) {
          localStorage.setItem('ash_ling_ventas', JSON.stringify(cloudSales));
          console.log('✅ Ventas sincronizadas:', cloudSales.length, 'registros');
        }
        
        console.log('✅ Sincronización desde la nube completada');
        if (callback) callback(null, { inventory: cloudInventory, sales: cloudSales });
      });
    });
  },
  
  // Función de utilidad para mostrar estado de conexión
  showConnectionStatus: function() {
    if (this.isReady()) {
      console.log('🟢 Firebase: CONECTADO');
      console.log('📡 Proyecto:', firebaseConfig.projectId);
      console.log('👤 Usuario:', (auth.currentUser && auth.currentUser.email) || 'No autenticado');
    } else {
      console.log('🔴 Firebase: NO DISPONIBLE');
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Intentar inicializar Firebase después de un breve delay para asegurar que los scripts estén cargados
  setTimeout(function() {
    if (FirebaseService.init()) {
      FirebaseService.showConnectionStatus();
      
      // Configurar sincronización en tiempo real
      FirebaseService.setupRealTimeSync();
      
      // Notificar a otros scripts que Firebase está listo
      window.dispatchEvent(new CustomEvent('firebaseReady', { 
        detail: { service: FirebaseService } 
      }));
    }
  }, 1000);
});

// Hacer disponible globalmente
window.FirebaseService = FirebaseService;
window.firebaseConfig = firebaseConfig;

console.log('🔥 Firebase Service configurado para ASH-LING ERP System');
