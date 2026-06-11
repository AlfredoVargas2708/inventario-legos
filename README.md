# Inventario de Legos

Aplicación web para consultar pedidos y el inventario de piezas LEGO a partir de un **set** o una **pieza**, usando datos de Rebrickable y un backend propio.

## Funcionalidades

- Búsqueda por tipo **Lego** (set) o **Pieza** (elemento)
- Vista de **pedidos** con paginación en servidor, edición y eliminación
- Vista de **inventario** con filtrado, ordenamiento y paginación lazy
- Ficha resumen del elemento buscado (imagen, nombre, tema, color, etc.)
- Navegación entre pedidos e inventario sin recargar la búsqueda

## Stack

| Área | Tecnología |
|------|------------|
| Framework | Vue 3 + TypeScript |
| Build | Vite 8 |
| UI | PrimeVue 4, PrimeFlex, PrimeIcons |
| Estado | Pinia |
| Rutas | Vue Router 5 |
| HTTP | Axios |

## Requisitos

- **Node.js** `^20.19.0` o `>=22.12.0`
- **pnpm**
- Backend [lego-server](../lego-server) en ejecución (por defecto en `http://localhost:3000`)

## Configuración

Copia las variables de entorno o crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:3000/api
```

En producción, `VITE_API_URL` apunta al servidor desplegado (ver `.env.production`).

## Inicio rápido

```sh
# Instalar dependencias
pnpm install

# Servidor de desarrollo (http://localhost:5173)
pnpm dev

# Comprobar tipos y generar build de producción
pnpm build

# Vista previa del build
pnpm preview
```

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Desarrollo con hot-reload |
| `pnpm build` | Type-check + build de producción |
| `pnpm preview` | Sirve el contenido de `dist/` |
| `pnpm type-check` | Verificación de tipos con `vue-tsc` |
| `pnpm lint` | ESLint + Oxlint |
| `pnpm format` | Formateo con oxfmt |

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/pedidos` | Tabla de pedidos asociados a la búsqueda (ruta por defecto) |
| `/inventario` | Inventario del set o pieza buscada |

Tras buscar en el header, la app carga primero los **pedidos**. El inventario solo se consulta al entrar en `/inventario`.

## Estructura del proyecto

```
src/
├── api/                    # Cliente HTTP y store Pinia compartido
├── assets/styles/          # Estilos compartidos (tablas)
├── components/
│   ├── common/             # TableCard, FilterBar, ServerDataTable
│   ├── search/             # Barra de búsqueda
│   ├── info/               # Ficha del elemento
│   ├── pedidos/            # Tabla y formulario de edición
│   └── inventario/         # Tabla de inventario
├── composables/            # Lógica reutilizable (paginación, inventario)
├── constants/              # Opciones de búsqueda, filtros y tabla
├── layouts/                # Layout principal con header y router-view
├── router/                 # Definición de rutas
├── utils/                  # Helpers (columnas lego/pieza, tags, etc.)
└── views/                  # Vistas enlazadas al router
```

## API consumida

El frontend espera un backend con endpoints como:

| Método | Endpoint | Uso |
|--------|----------|-----|
| `GET` | `/search/:column/:value` | Pedidos y metadatos del set/pieza |
| `GET` | `/inventory/:column/:value` | Inventario paginado, con filtros y sort |
| `PUT` | `/editar/:id` | Actualizar pedido |
| `DELETE` | `/:id` | Eliminar pedido |

Parámetros habituales de query: `page`, `limit`, `sortBy`, `sortOrder` y filtros por campo (p. ej. `color.name=Black`).

## Desarrollo

### IDE recomendado

[VS Code](https://code.visualstudio.com/) con la extensión [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

### Estilos globales

Los estilos base y PrimeFlex se cargan desde `styles.scss` en `index.html`. PrimeFlex se importa como CSS compilado para evitar warnings de deprecación de Sass.

### Convenciones

- Estado de búsqueda compartido en `useDataSharingService` (columna, valor, resultados)
- Paginación lazy en tablas con guards para evitar bucles de actualización en PrimeVue DataTable
- Composables para lógica de inventario y paginación en servidor

## Licencia

Proyecto privado.
