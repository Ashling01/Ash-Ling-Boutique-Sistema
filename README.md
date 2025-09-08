# Ash-Ling ERP System

## 📋 Descripción

Sistema ERP (Enterprise Resource Planning) moderno y elegante desarrollado para la gestión integral de la empresa Ash-Ling. Este sistema web profesional permite gestionar ventas, clientes, inventario, facturación, finanzas, empleados y generar reportes detallados.

## ✨ Características Principales

### 🎯 Dashboard Ejecutivo
- Métricas en tiempo real de ventas, órdenes, clientes y productos
- Gráficos interactivos de tendencias de ventas
- Actividad reciente del sistema
- Indicadores de rendimiento (KPIs)

### 💼 Módulos Principales

#### 1. **Gestión de Ventas**
- Registro de nuevas ventas
- Seguimiento de órdenes
- Estados de venta (completada, pendiente, cancelada)
- Historial de transacciones

#### 2. **Gestión de Clientes**
- Base de datos completa de clientes
- Información de contacto y direcciones
- Estados de clientes (activo, inactivo)
- Historial de compras por cliente

#### 3. **Gestión de Inventario**
- Control de stock en tiempo real
- Alertas de stock bajo
- Gestión de productos por categorías
- Códigos SKU únicos
- Precios y descripciones

#### 4. **Facturación**
- Generación automática de facturas
- Plantillas personalizables
- Control de pagos
- Exportación a PDF

#### 5. **Finanzas**
- Reportes financieros
- Análisis de ingresos y gastos
- Flujo de caja
- Rentabilidad por producto

#### 6. **Recursos Humanos**
- Gestión de empleados
- Información de contacto y salarios
- Departamentos y posiciones
- Fechas de contratación

#### 7. **Reportes y Analytics**
- Reportes de ventas por período
- Análisis de inventario
- Métricas de clientes
- Exportación de datos

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, Variables CSS
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Storage**: LocalStorage para persistencia de datos

## 📁 Estructura del Proyecto

```
Ash-Ling/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos principales
├── js/
│   ├── app.js              # Lógica principal de la aplicación
│   └── data-manager.js     # Gestión de datos y persistencia
├── logo/
│   └── logo.png            # Logo de la empresa
└── README.md               # Documentación
```

## 🛠️ Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)

### Instalación Local

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [repository-url]
   cd Ash-Ling
   ```

2. **Abrir en navegador**
   - Opción 1: Abrir `index.html` directamente en el navegador
   - Opción 2: Usar un servidor local
     ```bash
     # Con Python
     python -m http.server 8000
     
     # Con Node.js (live-server)
     npx live-server
     
     # Con PHP
     php -S localhost:8000
     ```

3. **Acceder al sistema**
   - Abrir navegador en `http://localhost:8000` (si usa servidor local)
   - O simplemente abrir `index.html`

## 📱 Características Responsivas

El sistema está completamente optimizado para:
- **Desktop**: Experiencia completa con sidebar y todas las funcionalidades
- **Tablet**: Layout adaptado con navegación optimizada
- **Mobile**: Interface móvil con menú colapsable y controles táctiles

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: #2563eb (Azul profesional)
- **Secundario**: #64748b (Gris neutro)
- **Éxito**: #10b981 (Verde)
- **Advertencia**: #f59e0b (Amarillo)
- **Peligro**: #ef4444 (Rojo)

### Tipografía
- **Fuente principal**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

### Componentes UI
- Sidebar navegable con iconos
- Cards estadísticas con animaciones
- Tablas responsivas
- Modales para formularios
- Botones con estados hover
- Notificaciones toast

## 💾 Gestión de Datos

### Almacenamiento Local
- Los datos se almacenan en LocalStorage del navegador
- Persistencia automática en cada operación
- Respaldo y restauración de datos

### Estructura de Datos
```javascript
{
  clients: [
    {
      id: 1,
      name: "Cliente Ejemplo",
      email: "cliente@email.com",
      phone: "+1234567890",
      address: "Dirección completa",
      status: "active",
      created: "2025-01-15"
    }
  ],
  products: [...],
  sales: [...],
  employees: [...],
  invoices: [...]
}
```

## 🔧 Funcionalidades Avanzadas

### Búsqueda Global
- Búsqueda en tiempo real en clientes, productos y ventas
- Filtros dinámicos
- Resultados destacados

### Exportación de Datos
- Exportar a JSON
- Exportar a Excel (implementable)
- Exportar a PDF (implementable)

### Notificaciones
- Alertas de stock bajo
- Confirmaciones de operaciones
- Mensajes de error y éxito

### Validaciones
- Validación de formularios en tiempo real
- Validación de email y teléfono
- Campos requeridos marcados

## 🔒 Seguridad y Consideraciones

- Validación del lado del cliente
- Sanitización de inputs
- Manejo seguro de datos sensibles
- Estructura preparada para autenticación

## 🚀 Desarrollo Futuro

### Próximas Características
- [ ] Sistema de autenticación de usuarios
- [ ] Base de datos real (MySQL, PostgreSQL)
- [ ] API REST para backend
- [ ] Integración con sistemas de pago
- [ ] Notificaciones push
- [ ] Aplicación móvil nativa
- [ ] Integración con contabilidad
- [ ] Reportes avanzados con BI
- [ ] Multi-idioma
- [ ] Temas personalizables

### Integraciones Propuestas
- **Pasarelas de Pago**: Stripe, PayPal, MercadoPago
- **Email**: SendGrid, Mailgun
- **SMS**: Twilio
- **Contabilidad**: QuickBooks, SAP
- **E-commerce**: Shopify, WooCommerce

## 🛡️ Soporte y Mantenimiento

### Compatibilidad de Navegadores
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Resolución de Problemas

**Problema**: Los datos no se guardan
**Solución**: Verificar que localStorage esté habilitado en el navegador

**Problema**: El sidebar no se muestra en móvil
**Solución**: Usar el botón de menú hamburguesa en la esquina superior izquierda

**Problema**: Los gráficos no se cargan
**Solución**: Verificar que Chart.js esté cargando correctamente

## 📞 Contacto y Soporte

Para soporte técnico o consultas sobre el sistema:
- **Email**: soporte@ash-ling.com
- **Teléfono**: +1 (234) 567-8900
- **Documentación**: [Documentación técnica completa]

## 📄 Licencia

© 2025 Ash-Ling. Todos los derechos reservados.

---

**Desarrollado con ❤️ para Ash-Ling Enterprise Solutions**
