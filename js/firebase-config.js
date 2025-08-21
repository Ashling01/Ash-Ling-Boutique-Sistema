// firebase-config.js
// Configuración centralizada de Firebase para Ash-Ling Sistema Empresarial

// Configuración de Firebase para Ash-Ling
const firebaseConfig = {
    apiKey: "AIzaSyBvAr526Zdh9NFiRv7Vz4hBRQe9qq5lyoQ",
    authDomain: "ash-ling-sistema.firebaseapp.com",
    projectId: "ash-ling-sistema",
    storageBucket: "ash-ling-sistema.firebasestorage.app",
    messagingSenderId: "643413580483",
    appId: "1:643413580483:web:d9433150520f96c6ff6076",
    measurementId: "G-XXXXXXXXXX" // Opcional para Analytics
};

// Estado de conexión
let isFirebaseConnected = false;
let db = null;

// Inicializar Firebase
function initializeFirebase() {
    try {
        // Verificar si Firebase ya está inicializado
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        
        db = firebase.database();
        isFirebaseConnected = true;
        
        console.log('✅ Firebase conectado correctamente');
        showConnectionStatus('Conectado a la nube', 'success');
        
        return true;
    } catch (error) {
        console.error('❌ Error conectando Firebase:', error);
        showConnectionStatus('Modo offline - Solo local', 'warning');
        isFirebaseConnected = false;
        return false;
    }
}

// Mostrar estado de conexión
function showConnectionStatus(message, type) {
    // Crear o actualizar indicador de estado
    let statusIndicator = document.getElementById('connectionStatus');
    if (!statusIndicator) {
        statusIndicator = document.createElement('div');
        statusIndicator.id = 'connectionStatus';
        statusIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(statusIndicator);
    }
    
    statusIndicator.textContent = message;
    
    if (type === 'success') {
        statusIndicator.style.background = '#10b981';
        statusIndicator.style.color = 'white';
    } else if (type === 'warning') {
        statusIndicator.style.background = '#f59e0b';
        statusIndicator.style.color = 'white';
    } else {
        statusIndicator.style.background = '#ef4444';
        statusIndicator.style.color = 'white';
    }
}

// Función para sincronizar datos a Firebase
async function syncToFirebase(collection, data) {
    if (!isFirebaseConnected) {
        console.log('⚠️ Firebase no conectado, guardando solo localmente');
        return false;
    }
    
    try {
        await db.ref(`ash-ling-sistema/${collection}`).set(data);
        console.log(`✅ ${collection} sincronizado a Firebase`);
        return true;
    } catch (error) {
        console.error(`❌ Error sincronizando ${collection}:`, error);
        return false;
    }
}

// Función para cargar datos desde Firebase
async function loadFromFirebase(collection) {
    if (!isFirebaseConnected) {
        return null;
    }
    
    try {
        const snapshot = await db.ref(`ash-ling-sistema/${collection}`).once('value');
        const data = snapshot.val();
        
        if (data) {
            console.log(`✅ ${collection} cargado desde Firebase`);
            return data;
        } else {
            console.log(`ℹ️ No hay datos de ${collection} en Firebase`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error cargando ${collection}:`, error);
        return null;
    }
}

// Función unificada para guardar datos (local + Firebase)
async function saveData(collection, data) {
    // Siempre guardar localmente primero
    localStorage.setItem(collection, JSON.stringify(data));
    
    // Intentar sincronizar a Firebase
    await syncToFirebase(collection, data);
}

// Función unificada para cargar datos (Firebase + local)
async function loadData(collection) {
    let data = null;
    
    // Intentar cargar desde Firebase primero
    if (isFirebaseConnected) {
        data = await loadFromFirebase(collection);
    }
    
    // Si no hay datos en Firebase, cargar desde localStorage
    if (!data) {
        const localData = localStorage.getItem(collection);
        if (localData) {
            data = JSON.parse(localData);
            console.log(`📁 ${collection} cargado desde localStorage`);
        }
    } else {
        // Si encontramos datos en Firebase, actualizar localStorage
        localStorage.setItem(collection, JSON.stringify(data));
    }
    
    return data;
}

// Función para sincronizar todos los datos
async function syncAllData() {
    if (!isFirebaseConnected) {
        showConnectionStatus('Sin conexión - Solo local', 'warning');
        return;
    }
    
    showConnectionStatus('Sincronizando...', 'info');
    
    const collections = [
        'joda_inventory',
        'joda_sales', 
        'joda_purchases',
        'joda_clients',
        'joda_suppliers'
    ];
    
    let syncCount = 0;
    
    for (const collection of collections) {
        const localData = localStorage.getItem(collection);
        if (localData) {
            const success = await syncToFirebase(collection, JSON.parse(localData));
            if (success) syncCount++;
        }
    }
    
    showConnectionStatus(`✅ ${syncCount}/${collections.length} sincronizados`, 'success');
    
    setTimeout(() => {
        showConnectionStatus('Conectado a la nube', 'success');
    }, 2000);
}

// Escuchar cambios en tiempo real (opcional)
function listenToChanges(collection, callback) {
    if (!isFirebaseConnected) return;
    
    db.ref(`joda_erp/${collection}`).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data && callback) {
            callback(data);
        }
    });
}

// Función para verificar estado de conexión
function checkConnection() {
    if (navigator.onLine && isFirebaseConnected) {
        return 'online';
    } else if (navigator.onLine && !isFirebaseConnected) {
        return 'firebase-error';
    } else {
        return 'offline';
    }
}

// Intentar reconectar cada 30 segundos si hay problemas
setInterval(() => {
    if (!isFirebaseConnected && navigator.onLine) {
        console.log('🔄 Intentando reconectar a Firebase...');
        initializeFirebase();
    }
}, 30000);

// Escuchar eventos de conexión/desconexión
window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    if (!isFirebaseConnected) {
        initializeFirebase();
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Sin conexión a internet');
    showConnectionStatus('Sin internet - Solo local', 'warning');
});

