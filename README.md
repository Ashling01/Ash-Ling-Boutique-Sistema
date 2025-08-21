# 🏢 Sistema de Gestión Empresarial Ash-Ling

Un sistema de gestión empresarial completo y moderno desarrollado con tecnologías web nativas, diseñado para pequeñas y medianas empresas que necesitan un control integral de sus operaciones comerciales.

## 📋 Descripción

Sistema web profesional para la gestión completa de una empresa, incluyendo control de inventario, ventas, clientes, proveedores, reportes financieros y análisis de datos. Desarrollado con un diseño moderno utilizando efectos glassmorphism y una interfaz de usuario intuitiva.

## ✨ Características Principales

### 🎯 Dashboard Principal
- **Métricas en tiempo real**: Ventas del día, productos vendidos, ingresos totales
- **Gráficos interactivos**: Análisis de ventas por categorías usando Chart.js
- **Indicadores visuales**: Estado del inventario, clientes activos, proveedores
- **Integración de datos**: Sincronización automática con todos los módulos

### 📦 Gestión de Inventario
- **Categorías organizadas**: Carteras, Accesorios, Ropa Dama, Ropa Caballero, Perfumes
- **Control de stock**: Alertas de stock bajo, gestión de entradas y salidas
- **CRUD completo**: Crear, leer, actualizar y eliminar productos
- **Búsqueda avanzada**: Filtros por categoría, precio y disponibilidad

### 💰 Sistema de Ventas
- **Registro de ventas**: Formulario completo con selección de clientes y productos
- **Cálculos automáticos**: Subtotal, descuentos, IVA y total final
- **Métodos de pago**: Efectivo, tarjeta, transferencia, cheque
- **Tabla de registro**: Historial completo con filtros, paginación y exportación
- **Acciones avanzadas**: Ver detalles, imprimir recibos, eliminar ventas

### 👥 Gestión de Clientes
- **Base de datos completa**: Información personal y de contacto
- **Historial de compras**: Seguimiento de transacciones por cliente
- **Gestión de contactos**: Email, teléfono, dirección
- **Exportación de datos**: Reportes en CSV y Excel

### 🏭 Gestión de Proveedores
- **Directorio de proveedores**: Información completa de contacto
- **Categorización**: Organización por tipo de productos
- **Gestión de contratos**: Seguimiento de acuerdos comerciales
- **Integración con inventario**: Vinculación con productos

### 📊 Sistema de Reportes
- **Reportes financieros**: Ventas diarias, mensuales y anuales
- **Análisis de productos**: Productos más vendidos, rentabilidad
- **Reportes de clientes**: Clientes frecuentes, análisis de compras
- **Exportación múltiple**: PDF, Excel, CSV
- **Gráficos dinámicos**: Visualización de datos interactiva

### 📅 Calendario de Eventos
- **Gestión de citas**: Reuniones con clientes y proveedores
- **Eventos empresariales**: Lanzamientos, promociones
- **Recordatorios**: Notificaciones de eventos importantes
- **Vista mensual**: Calendario interactivo completo

### ⚙️ Configuración del Sistema
- **Personalización**: Configuración de empresa, logotipos
- **Gestión de usuarios**: Perfiles de empleados y permisos
- **Parámetros del sistema**: IVA, descuentos, métodos de pago
- **Respaldos**: Exportación e importación de datos

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica y accesible
- **CSS3**: Efectos glassmorphism, gradientes, animaciones
- **JavaScript ES6+**: Funcionalidad dinámica e interactividad
- **Chart.js**: Gráficos y visualización de datos
- **Font Awesome**: Iconografía profesional
- **Google Fonts (Inter)**: Tipografía moderna

### Librerías Adicionales
- **jsPDF**: Generación de reportes PDF
- **XLSX**: Exportación de datos a Excel
- **LocalStorage API**: Persistencia de datos en el navegador

### Diseño
- **Responsive Design**: Adaptable a dispositivos móviles y desktop
- **Glassmorphism**: Efectos de vidrio esmerilado modernos
- **Dark Theme**: Tema oscuro con gradientes corporativos
- **Animaciones CSS**: Transiciones suaves y microinteracciones

## 📁 Estructura del Proyecto

```
Ash-Ling/
├── index.html              # Dashboard principal
├── ventas.html             # Sistema de ventas
├── inventario.html         # Gestión de inventario
├── clientes.html           # Gestión de clientes
├── proveedores.html        # Gestión de proveedores
├── reportes.html           # Sistema de reportes
├── calendario.html         # Calendario de eventos
├── configuracion.html      # Configuración del sistema
├── empleados.html          # Gestión de empleados
├── facturacion.html        # Sistema de facturación
├── logo/                   # Recursos gráficos
│   └── logo.png           # Logotipo de la empresa
└── README.md              # Documentación del proyecto
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional, para desarrollo)

### Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone [URL-del-repositorio]
   cd Ash-Ling
   ```

2. **Abrir en navegador**
   - Opción 1: Abrir `index.html` directamente en el navegador
   - Opción 2: Usar un servidor local (recomendado)
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Acceder al sistema**
   - Abrir navegador en `http://localhost:8000`
   - Comenzar con el dashboard principal

### Primer Uso

1. **Configurar la empresa**: Ir a Configuración y establecer datos básicos
2. **Cargar inventario**: Agregar productos en el módulo de Inventario
3. **Registrar clientes**: Añadir clientes en el módulo correspondiente
4. **Realizar primera venta**: Usar el sistema de ventas
5. **Revisar reportes**: Verificar métricas en el Dashboard

## 💾 Gestión de Datos

### Almacenamiento Local
- Los datos se almacenan en `localStorage` del navegador
- Persistencia automática sin necesidad de base de datos externa
- Capacidad aproximada: 5-10MB por dominio

### Respaldo de Datos
- **Exportación manual**: Usar las funciones de exportación en cada módulo
- **Recomendación**: Realizar respaldos periódicos exportando a CSV/Excel

### Importación de Datos
- Funcionalidad de importación disponible en el módulo de Configuración
- Formatos soportados: JSON, CSV

## 🎨 Características de Diseño

### Glassmorphism UI
- Efectos de vidrio esmerilado con `backdrop-filter: blur()`
- Transparencias con `rgba()` para profundidad visual
- Bordes sutiles con gradientes

### Paleta de Colores
```css
/* Colores principales */
--primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)
--glass: rgba(255, 255, 255, 0.1)
--text: #ffffff
--accent: #00d4aa
```

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 📈 Funcionalidades Avanzadas

### Análisis de Datos
- Gráficos en tiempo real con Chart.js
- Métricas de rendimiento empresarial
- Análisis de tendencias de ventas
- Reportes de rentabilidad por producto

### Filtros y Búsquedas
- Búsqueda en tiempo real en todas las tablas
- Filtros por fecha, categoría, estado
- Ordenamiento por múltiples criterios
- Paginación automática para grandes conjuntos de datos

### Exportación de Reportes
- **PDF**: Reportes formateados profesionalmente
- **Excel**: Datos tabulares para análisis
- **CSV**: Compatibilidad universal
- **Print**: Impresión directa optimizada

## 🔧 Personalización

### Modificar Colores
Editar las variables CSS en cada archivo:
```css
:root {
    --primary-color: #tu-color;
    --secondary-color: #tu-color;
}
```

### Agregar Nuevas Funcionalidades
1. Crear nueva página HTML siguiendo la estructura existente
2. Implementar JavaScript para funcionalidad
3. Actualizar navegación en todas las páginas
4. Integrar con sistema de datos existente

### Personalizar Productos
Modificar las opciones en `ventas.html` y `inventario.html`:
```javascript
const categorias = [
    'tu-categoria-1',
    'tu-categoria-2'
];
```

## 🤝 Contribuir

### Reportar Bugs
1. Usar la sección de Issues del repositorio
2. Incluir pasos para reproducir el error
3. Especificar navegador y versión

### Sugerir Mejoras
1. Crear un Issue con la etiqueta "enhancement"
2. Describir la funcionalidad propuesta
3. Explicar el beneficio para los usuarios

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- **Email**: soporte@ash-ling.com
- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]

## 🚀 Roadmap

### Versión 2.0 (Planificada)
- [ ] Integración con base de datos externa
- [ ] Sistema de usuarios y autenticación
- [ ] API REST para integración con terceros
- [ ] App móvil nativa
- [ ] Sincronización en la nube

### Mejoras Inmediatas
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Temas personalizables
- [ ] Atajos de teclado
- [ ] Tutorial interactivo

## 🎯 Casos de Uso

### Tiendas de Ropa
- Gestión de inventario por tallas y colores
- Control de temporadas y colecciones
- Análisis de tendencias de moda

### Boutiques
- Gestión de productos exclusivos
- Control de proveedores especializados
- Reportes de rentabilidad premium

### Pequeños Comercios
- Sistema integral para múltiples categorías
- Control básico pero completo
- Reportes simples y efectivos

---

**Desarrollado con ❤️ para la gestión empresarial moderna**

*Sistema Ash-Ling - Transformando la gestión empresarial una transacción a la vez*
