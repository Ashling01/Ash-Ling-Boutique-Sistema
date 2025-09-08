// Firebase Configuration for ASH-LING ERP System
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, push, update, remove, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADkNP4QKDj-3rGblJoY_RUi2BFGhcx6Cg",
  authDomain: "ashling-f44aa.firebaseapp.com",
  databaseURL: "https://ashling-f44aa-default-rtdb.firebaseio.com",
  projectId: "ashling-f44aa",
  storageBucket: "ashling-f44aa.firebasestorage.app",
  messagingSenderId: "885806495701",
  appId: "1:885806495701:web:84266cb2acba453341ef5c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Firebase utility functions for ASH-LING
export const FirebaseService = {
  
  // === AUTHENTICATION ===
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuario autenticado exitosamente:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error de autenticación:', error.message);
      throw error;
    }
  },

  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Usuario registrado exitosamente:', userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      console.error('❌ Error de registro:', error.message);
      throw error;
    }
  },

  async signOut() {
    try {
      await signOut(auth);
      console.log('✅ Sesión cerrada exitosamente');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error.message);
      throw error;
    }
  },

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // === INVENTORY MANAGEMENT ===
  async saveInventoryProducts(products) {
    try {
      const inventoryRef = ref(database, 'ash-ling/inventory/products');
      await set(inventoryRef, {
        products: products,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'system'
      });
      console.log('✅ Inventario sincronizado con Firebase');
      return true;
    } catch (error) {
      console.error('❌ Error al guardar inventario en Firebase:', error.message);
      throw error;
    }
  },

  async loadInventoryProducts() {
    try {
      const inventoryRef = ref(database, 'ash-ling/inventory/products');
      const snapshot = await get(inventoryRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('✅ Inventario cargado desde Firebase:', data.products?.length || 0, 'productos');
        return data.products || [];
      } else {
        console.log('ℹ️ No hay datos de inventario en Firebase');
        return [];
      }
    } catch (error) {
      console.error('❌ Error al cargar inventario desde Firebase:', error.message);
      throw error;
    }
  },

  // === SALES MANAGEMENT ===
  async saveSale(saleData) {
    try {
      const salesRef = ref(database, 'ash-ling/sales');
      const newSaleRef = push(salesRef);
      
      const saleWithMetadata = {
        ...saleData,
        id: newSaleRef.key,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.email || 'system'
      };
      
      await set(newSaleRef, saleWithMetadata);
      console.log('✅ Venta guardada en Firebase con ID:', newSaleRef.key);
      return newSaleRef.key;
    } catch (error) {
      console.error('❌ Error al guardar venta en Firebase:', error.message);
      throw error;
    }
  },

  async loadSales(limit = 100) {
    try {
      const salesRef = ref(database, 'ash-ling/sales');
      const snapshot = await get(salesRef);
      
      if (snapshot.exists()) {
        const salesData = snapshot.val();
        const salesArray = Object.values(salesData);
        console.log('✅ Ventas cargadas desde Firebase:', salesArray.length);
        return salesArray.slice(-limit); // Últimas ventas
      } else {
        console.log('ℹ️ No hay datos de ventas en Firebase');
        return [];
      }
    } catch (error) {
      console.error('❌ Error al cargar ventas desde Firebase:', error.message);
      throw error;
    }
  },

  // === REAL-TIME SYNC ===
  onInventoryChange(callback) {
    const inventoryRef = ref(database, 'ash-ling/inventory/products');
    return onValue(inventoryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        callback(data.products || []);
      }
    });
  },

  onSalesChange(callback) {
    const salesRef = ref(database, 'ash-ling/sales');
    return onValue(salesRef, (snapshot) => {
      if (snapshot.exists()) {
        const salesData = snapshot.val();
        const salesArray = Object.values(salesData);
        callback(salesArray);
      }
    });
  },

  // === BACKUP & RESTORE ===
  async createBackup() {
    try {
      const timestamp = new Date().toISOString();
      const backupRef = ref(database, `ash-ling/backups/${timestamp}`);
      
      // Cargar todos los datos
      const inventory = await this.loadInventoryProducts();
      const sales = await this.loadSales(1000);
      
      const backupData = {
        timestamp: timestamp,
        inventory: inventory,
        sales: sales,
        createdBy: auth.currentUser?.email || 'system'
      };
      
      await set(backupRef, backupData);
      console.log('✅ Backup creado exitosamente:', timestamp);
      return timestamp;
    } catch (error) {
      console.error('❌ Error al crear backup:', error.message);
      throw error;
    }
  },

  // === SYNC WITH LOCAL STORAGE ===
  async syncToCloud() {
    try {
      // Obtener datos del localStorage
      const localInventory = JSON.parse(localStorage.getItem('ash_ling_products') || '[]');
      const localSales = JSON.parse(localStorage.getItem('ash_ling_ventas') || '[]');
      
      // Sincronizar con Firebase
      await this.saveInventoryProducts(localInventory);
      
      // Subir ventas que no estén en la nube
      for (const sale of localSales) {
        if (!sale.firebaseId) {
          const firebaseId = await this.saveSale(sale);
          sale.firebaseId = firebaseId;
        }
      }
      
      // Actualizar localStorage con los IDs de Firebase
      localStorage.setItem('ash_ling_ventas', JSON.stringify(localSales));
      
      console.log('✅ Sincronización completa con la nube');
      return true;
    } catch (error) {
      console.error('❌ Error en sincronización:', error.message);
      throw error;
    }
  },

  async syncFromCloud() {
    try {
      // Cargar datos desde Firebase
      const cloudInventory = await this.loadInventoryProducts();
      const cloudSales = await this.loadSales(1000);
      
      // Actualizar localStorage
      if (cloudInventory.length > 0) {
        localStorage.setItem('ash_ling_products', JSON.stringify(cloudInventory));
      }
      
      if (cloudSales.length > 0) {
        localStorage.setItem('ash_ling_ventas', JSON.stringify(cloudSales));
      }
      
      console.log('✅ Datos sincronizados desde la nube');
      return { inventory: cloudInventory, sales: cloudSales };
    } catch (error) {
      console.error('❌ Error al sincronizar desde la nube:', error.message);
      throw error;
    }
  }
};

// Global Firebase instance for backward compatibility
window.firebaseApp = app;
window.FirebaseService = FirebaseService;

console.log('🔥 Firebase configurado para ASH-LING ERP System');
