# Proyecto: Dale pué 🛵

## Qué es
Plataforma de pedidos online estilo PedidosYa, pensada para locales pequeños y medianos.
El nombre del proyecto es **Dale pué**.
Repositorio público en GitHub: `github.com/crisplate/Prueba-pedidos`
Sitio operativo hosteado en **GitHub Pages** con dominio personalizado vía CNAME.
URL en producción: `dalepue.com.ar`

---

## Stack tecnológico
- **Frontend:** HTML + JavaScript puro (sin frameworks)
- **Base de datos:** Firebase Firestore (NoSQL)
- **Autenticación:** Firebase Auth (email/password)
- **Hosting:** GitHub Pages conectado al repo (deploy automático por push)
- **PWA:** Sí — tiene `manifest.json` y `sw.js`
- **IAs en uso:** Claude (arquitectura y código), Gemini (generación), ChatGPT (revisión)

---

## Credenciales Firebase
```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyCwfVFtJxYIa6I1R624IRmF0SoE1o1-RPE",
  authDomain:        "dale-pue.firebaseapp.com",
  projectId:         "dale-pue",
  storageBucket:     "dale-pue.firebasestorage.app",
  messagingSenderId: "137759081638",
  appId:             "1:137759081638:web:0816dd9327837d4dc46067"
};
```
⚠️ La API key tiene caracteres específicos — copiarla exactamente: `AIzaSyCwfVFtJxYIa6I1R624IRmF0SoE1o1-RPE`

---

## Estructura del repo
```
Prueba-pedidos/
├── index.html        ← App principal del cliente
├── dueno.html        ← Portal del dueño/encargado
├── manifest.json
├── sw.js
├── logo.png
├── CNAME
└── .nojekyll
```

---

## Roles del sistema (3, sin repartidor)
| Rol | Portal | Descripción |
|-----|--------|-------------|
| `cliente` | `index.html` | Busca locales, arma pedido, confirma por WhatsApp |
| `dueno` | `dueno.html` | Gestiona su local y menú |
| `admin` | pendiente | Crisplate — gestiona usuarios, accesos y locales |

---

## Estructura de datos en Firestore

### Colección: `locales`
```
locales/
  {localId}/
    nombre:        string
    direccion:     string
    whatsapp:      string   ← número con código de país, ej: 5493874123456
    tipo:          string   ← Sandwichería, Pizzería, etc.
    estado:        string   ← "abierto" | "cerrado"
    horariosTxt:   string   ← HTML con horarios, ej: "🕒 <b>Lun a Jue:</b> 12:00 a 04:00 AM"
    dueno_uid:     string   ← UID del usuario dueño en Firebase Auth
    zona:          string   ← "Centro" | "Norte" | "Sur" | "Este" | "Oeste" | "Sureste"
    lat:           double   ← coordenada GPS (tipo double en Firestore)
    lng:           double   ← coordenada GPS (tipo double en Firestore)
    descCorta:     string   ← descripción corta para tarjeta, ej: "Sandwichería • Minutas"
    colorBrand:    string   ← color hex del local, ej: "#d9232d"
    mapaUrl:       string   ← link corto de Google Maps del local
    tags:          array    ← palabras clave para buscador, ej: ["milanesa","gaseosa","cerveza"]
    menu: {
      "Nombre Categoría": [
        { nombre, desc, precio, tipo, disponible }
        ← tipo: "comida" | "bebida" | "alcohol"
        ← disponible: true | false (false = se muestra en gris sin botón Agregar)
      ]
    }
```

### Colección: `usuarios` (pendiente de implementar)
```
usuarios/
  {uid}/
    nombre:    string
    email:     string
    rol:       string   ← "cliente" | "dueno" | "admin"
    creadoEn:  timestamp
```

---

## Local real operativo
| Campo | Valor |
|-------|-------|
| ID Firestore | `eloeste` |
| Nombre | El Oeste |
| Dirección | Leguizamón 1594, Salta |
| WhatsApp | 5493875055343 |
| Zona | Centro |
| lat/lng | -24.7883 / -65.4105 (tipo double) |
| Usuario dueño | email personal del dueño en Firebase Auth |
| Menú | Cargado completo: sándwiches, minutas, bebidas |

---

## Lo que está hecho ✅

### App cliente (`index.html`)
- Pantalla de inicio con buscador en vivo, radar GPS y grilla de zonas
- Buscador busca en: nombre del local, tags, y nombres de productos
- Listado de locales por zona o por cercanía (con distancia en km)
- Vista de menú dinámico desde Firestore por categorías
- Productos no disponibles se muestran en gris sin botón Agregar
- Modal de personalización (aderezos + adicionales)
- Carrito de compras funcional con memoria (5 min, por local)
- Selector delivery/retiro con GPS y mapa Leaflet
- Envío de pedido por WhatsApp con formato completo
- Modo oscuro persistente
- Botón atrás del celular con History API
- Badge abierto/cerrado por local
- Locales demo hardcodeados para zonas sin locales reales aún
- PWA instalable

### Portal dueño (`dueno.html`)
- Login con Firebase Auth (sesión persistente)
- Carga automática del local vinculado al dueño (`dueno_uid`)
- Edición de datos: nombre, dirección, WhatsApp, tipo, estado
- Edición de horarios en texto plano (se convierte a HTML automáticamente)
- Campo de palabras clave (tags) para el buscador
- Gestión de menú:
  - Agregar productos con categoría, precio, tipo
  - Editar nombre, descripción, precio y tipo de productos existentes
  - Toggle disponible/no disponible por producto (sin borrar)
  - Eliminar productos
  - Subir/bajar orden de categorías
  - Renombrar categorías
  - Eliminar categoría completa
- Vista previa del local en tiempo real

### Firebase / Infraestructura
- Firebase Auth con email/password habilitado
- Firestore con reglas: lectura pública, escritura solo autenticados
- GitHub Pages con deploy automático
- Dominio `dalepue.com.ar` via CNAME

---

## Bugs conocidos 🐛

### Bug 1 — Orden de categorías no persiste
**Problema:** El menú en Firestore se guarda como objeto (map). Los objetos JS y Firestore no garantizan el orden de las keys. Al recargar, las categorías pueden aparecer en orden diferente (distinto entre PC y celular).
**Causa:** No hay campo separado que guarde el orden explícito.
**Solución pendiente:** Agregar campo `categoriasOrden: ["Cat1", "Cat2", "Cat3"]` en el documento del local. El portal dueño lo actualiza al reordenar. El `index.html` lo usa para renderizar en ese orden.

### Bug 2 — Parpadeo del menú al entrar al local
**Problema:** Al tocar "Ver menú" de un local, el menú aparece y desaparece varias veces antes de estabilizarse. Requiere 5-6 recargas para verse estable.
**Causa:** El `index.html` recarga el documento desde Firestore cada vez que se entra al local (para tener datos frescos), pero mientras espera muestra los datos viejos en memoria. Esto produce un doble render.
**Solución pendiente:** Mostrar spinner mientras carga, renderizar una sola vez cuando llegan los datos de Firestore. Eliminar el render previo con datos en memoria.

---

## Lo que falta construir 🔧

### Corto plazo
- Corregir Bug 1 (orden de categorías)
- Corregir Bug 2 (parpadeo del menú)
- Panel admin básico: ver locales, activar/desactivar con campo `activo: true/false`

### Mediano plazo
- Mejoras visuales: fuentes (DM Sans en index), sombras en botones, animaciones
- Pasarela de pagos (MercadoPago — prioritario para Argentina)
- Historial de pedidos
- Notificaciones al dueño cuando llega un pedido (WhatsApp API o similar)
- Restricción de API key al dominio `dalepue.com.ar` en Google Cloud

### Largo plazo
- Sistema de roles completo con colección `usuarios`
- Landing page para captar nuevos locales
- Panel de métricas para el admin

---

## Modelo de negocio (a definir)
- Cobro mensual fijo al local (suscripción SaaS)
- Primeros locales: cobro manual para validar antes de automatizar
- Precio tentativo: $5.000–$15.000 ARS/mes por local

---

## Instrucciones para Claude
- Siempre escribir código en **HTML + JavaScript puro**, sin frameworks (React, Vue, etc.)
- Usar Firebase compat (no modular) — más simple y confiable en este stack
- Respetar la estructura de Firestore definida arriba antes de agregar campos nuevos
- Los archivos nuevos van directo al repo (mismo nivel que `index.html`)
- Cuando haya dudas sobre el código existente, pedirle al usuario que comparta el archivo antes de asumir
- El usuario trabaja desde **mobile** — mantener respuestas claras y sin bloques de código innecesariamente largos
- Idioma siempre: **español rioplatense**
- Al generar archivos nuevos, incluir siempre la API key correcta: `AIzaSyCwfVFtJxYIa6I1R624IRmF0SoE1o1-RPE`
