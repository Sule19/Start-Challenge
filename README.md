# Servidor de API Mock

Un servidor de API mock profesional construido con FastAPI (backend) y React (frontend) que permite crear, gestionar y probar endpoints de API mock con soporte para respuestas condicionales.

## Tabla de Contenidos

- [Características](#características)
- [Prerrequisitos](#prerrequisitos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Formato de Mocks](#formato-mocks)
- [Ejemplos de Solicitudes](#ejemplos-de-solicitudes)
- [Descripción de la Arquitectura](#descripción-de-la-arquitectura)
- [Pruebas](#pruebas)
- [Documentación de la API](#documentación-de-la-api)
- [Contribuir](#contribuir)
- [Uso de herramientas IA](#usoia)


## Características

- **Creación Dinámica de Mocks**: Crear endpoints de API mock con rutas, métodos y respuestas personalizadas
- **Respuestas Condicionales**: Soporte para lógica condicional basada en parámetros de solicitud, cuerpo o headers
- **Carga de Archivos**: Importar configuraciones de mock desde archivos JSON
- **Panel Web**: Interfaz moderna basada en React para gestionar mocks
- **Ejemplos de estructuras**: En la interfaz puedes descargar o copiar ejemplo de la estrucura sin condiciones y con condiciones.
- **Almacenamiento Persistente**: Guardado automático de configuraciones de mock en el sistema de archivos
- **Pruebas Integrales**: Cobertura completa de pruebas para frontend y backend
- **Prevención de Duplicados**: Validación para prevenir combinaciones duplicadas de ruta/método

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Python 3.8+** - [Descargar Python](https://python.org/downloads/)
- **Node.js 16+** - [Descargar Node.js](https://nodejs.org/)
- **npm** (viene con Node.js)
- **Git** - [Descargar Git](https://git-scm.com/)

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Sule19/Start-Challenge.git
cd  CHALLENGE

### 2. Configuración del Backend (FastAPI)

#### Crear y Activar Entorno Virtual

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

```
markdown

### 2. Configuración del Backend (FastAPI)

#### Crear y Activar Entorno Virtual

```shellscript
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate
```

#### Instalar Dependencias del Backend

```shellscript
pip install fastapi uvicorn pydantic
```

#### Instalar Dependencias de Pruebas (Opcional)

```shellscript
pip install pytest pytest-asyncio httpx
```

#### Ejecutar Servidor Backend

```shellscript
# Desde el directorio raíz
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

La API del backend estará disponible en `http://localhost:8000`

### 3. Configuración del Frontend (React + Vite)

#### Navegar al Directorio Frontend e Instalar Dependencias

```shellscript
# Abrir una nueva ventana/pestaña de terminal
cd src  # o donde esté tu aplicación React
npm install
```

#### Instalar Dependencias de Pruebas (Opcional)

```shellscript
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

#### Ejecutar Servidor de Desarrollo Frontend

```shellscript
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 4. Verificar Instalación

1. Abrir `http://localhost:3000` en tu navegador
2. Deberías ver el Panel de API Mock
3. La documentación de la API backend está disponible en `http://localhost:8000/docs`


## Formato de Mocks

### Estructura de Configuración de Mock

El sistema soporta dos tipos de configuraciones de mock:

#### Estructura de Respuesta Simple

```json
{
  "ruta": "/api/usuarios",
  "metodo": "GET",
  "parametros_url": {},
  "parametros_body": {},
  "headers": {},
  "codigo_estado": 200,
  "contenido_respuesta": {
    "usuarios": [
      {"id": 1, "nombre": "Juan Pérez"},
      {"id": 2, "nombre": "María García"}
    ]
  },
  "content_type": "application/json"
}
```

#### Estructura de Respuesta Condicional

```json
{
  "ruta": "/api/login",
  "metodo": "POST",
  "parametros_url": {},
  "parametros_body": {},
  "headers": {},
  "codigo_estado": 200,
  "contenido_respuesta": {
    "condiciones": [
      {
        "si": {"usuario": "admin", "contraseña": "admin123"},
        "respuesta": {
          "exito": true,
          "token": "admin-token-123",
          "rol": "administrador"
        }
      },
      {
        "si": {"usuario": "usuario"},
        "respuesta": {
          "exito": true,
          "token": "user-token-456",
          "rol": "usuario"
        }
      }
    ],
    "default": {
      "exito": false,
      "mensaje": "Credenciales inválidas"
    }
  },
  "content_type": "application/json"
}
```

### Campos de Configuración

| Campo | Tipo | Descripción
|-----|-----|-----
| `ruta` | string | Ruta del endpoint API (ej., "/api/usuarios")
| `metodo` | string | Método HTTP (GET, POST, PUT, DELETE, etc.)
| `parametros_url` | object | Parámetros URL (actualmente sin usar)
| `parametros_body` | object | Parámetros esperados del cuerpo de la solicitud
| `headers` | object | Headers esperados de la solicitud
| `codigo_estado` | integer | Código de estado HTTP (100-599)
| `contenido_respuesta` | object | Contenido de respuesta (simple o condicional)
| `content_type` | string | Tipo de contenido de respuesta


## Ejemplos de Solicitudes

### Registrar un Mock Simple

```shellscript
curl -X POST "http://localhost:8000/configure-mock" \
  -H "Content-Type: application/json" \
  -d '{
    "ruta": "/api/saludo",
    "metodo": "GET",
    "parametros_url": {},
    "parametros_body": {},
    "headers": {},
    "codigo_estado": 200,
    "contenido_respuesta": {
      "mensaje": "¡Hola, Mundo!",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "content_type": "application/json"
  }'
```

### Registrar un Mock Condicional

```shellscript
curl -X POST "http://localhost:8000/configure-mock" \
  -H "Content-Type: application/json" \
  -d '{
    "ruta": "/api/auth",
    "metodo": "POST",
    "parametros_url": {},
    "parametros_body": {},
    "headers": {},
    "codigo_estado": 200,
    "contenido_respuesta": {
      "condiciones": [
        {
          "si": {"rol": "admin"},
          "respuesta": {"acceso": "completo", "permisos": ["leer", "escribir", "eliminar"]}
        },
        {
          "si": {"rol": "usuario"},
          "respuesta": {"acceso": "limitado", "permisos": ["leer"]}
        }
      ],
      "default": {"acceso": "denegado", "permisos": []}
    },
    "content_type": "application/json"
  }'
```

### Probar un Mock Registrado

```shellscript
# Probar mock simple
curl -X GET "http://localhost:8000/api/saludo"

# Probar mock condicional con rol admin
curl -X POST "http://localhost:8000/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"rol": "admin"}'

# Probar mock condicional con rol usuario
curl -X POST "http://localhost:8000/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"rol": "usuario"}'

# Probar mock condicional sin condición coincidente (devuelve default)
curl -X POST "http://localhost:8000/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"rol": "invitado"}'
```

### Obtener Todos los Mocks Registrados

```shellscript
curl -X GET "http://localhost:8000/configure-mock"
```

### Obtener Mock Específico por ID

```shellscript
curl -X GET "http://localhost:8000/configure-mock/1"
```

### Eliminar un Mock

```shellscript
curl -X DELETE "http://localhost:8000/configure-mock/1"
```

### Limpiar Todos los Mocks

```shellscript
curl -X DELETE "http://localhost:8000/configure-mock"
```

## Descripción de la Arquitectura

### Estructura del Proyecto

```plaintext
CHALLENGE/
├── __pycache__/
│   └── main.cpython-313.pyc
├── Backend/
│   ├── __pycache__/
│   ├── .pytest_cache/
│   ├── htmlcov/
│   ├── tests/
│   ├── .coverage
│   ├── configure-mock.json
│   ├── main.py
│   ├── requirements-test.txt
│   ├── run_server.py
│   └── storage.py
├── Frontend/
│   ├── .pytest_cache/
│   ├── coverage/
│   ├── node_modules/
│   ├── src/
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
│   └── vitest.config.js
├── node_modules/
├── public/
├── .gitignore
├── eslint.config.js
├── package-lock.json
├── package.json
└── README.md

```

### Arquitectura del Backend (FastAPI)

#### Componentes Principales

- **Almacenamiento de Mocks**: Lista en memoria con persistencia en archivo (`configure-mock.json`)
- **Endpoints CRUD**: API REST completa para gestión de mocks
- **Manejador de Rutas Dinámicas**: Ruta catch-all que coincide solicitudes contra mocks configurados
- **Motor de Lógica Condicional**: Evalúa parámetros de solicitud contra condiciones de mock
- **Operaciones de Archivo**: Operaciones de archivo JSON thread-safe con bloqueo


#### Librerías Clave

- **FastAPI**: Framework web moderno para construir APIs
- **Pydantic**: Validación y serialización de datos
- **Uvicorn**: Servidor ASGI para ejecutar la aplicación


#### Endpoints

| Método | Endpoint | Descripción
|-----|-----|-----
| POST | `/configure-mock` | Crear nueva configuración de mock
| GET | `/configure-mock` | Obtener todas las configuraciones de mock
| GET | `/configure-mock/{id}` | Obtener mock específico por ID
| DELETE | `/configure-mock/{id}` | Eliminar mock específico
| DELETE | `/configure-mock` | Limpiar todos los mocks
| * | `/{path:path}` | Manejador dinámico de endpoint mock


### Arquitectura del Frontend (React + Vite)

#### Componentes Principales

- **MockConfigPanel**: Formulario para crear y editar configuraciones de mock
- **RegisteredMocksPanel**: Tabla que muestra todos los mocks registrados con acciones de gestión
- **RequestSimulator**: Herramienta para probar endpoints mock dentro del panel
- **FileUpload**: Componente para importar configuraciones de mock desde archivos JSON
- **ConditionalResponseBuilder**: Editor visual para respuestas condicionales complejas


#### Librerías Clave

- **React**: Librería UI para construir interfaces de usuario
- **Vite**: Herramienta de construcción rápida y servidor de desarrollo
- **React Hot Toast**: Notificaciones toast para retroalimentación del usuario


#### Gestión de Estado

- **Estado Local**: Estado a nivel de componente usando hooks de React
- **Integración API**: Llamadas fetch directas a endpoints del backend
- **Manejo de Errores**: Manejo integral de errores con mensajes amigables para el usuario


### Flujo de Datos

1. **Registro de Mock**: Usuario crea mock vía UI o API
2. **Validación**: Backend valida estructura de mock y verifica duplicados
3. **Almacenamiento**: Mock guardado en memoria y persistido en archivo JSON
4. **Coincidencia de Solicitudes**: Solicitudes entrantes coinciden contra mocks registrados
5. **Generación de Respuesta**: Respuesta apropiada devuelta basada en lógica simple o condicional


## Pruebas

### Pruebas del Backend (pytest)

#### Ejecutar Todas las Pruebas del Backend

```shellscript
# Asegúrate de estar en la raíz del proyecto y el entorno virtual esté activado
pytest tests/ -v
```

#### Ejecutar Pruebas con Cobertura

```shellscript
pytest tests/ --cov=main --cov-report=html
```

#### Ejecutar Archivo de Prueba Específico

```shellscript
pytest tests/test_backend.py -v
```

#### Categorías de Pruebas

- **Operaciones CRUD**: Creación, recuperación, eliminación de mocks
- **Validación**: Detección de duplicados, validación de campos
- **Manejo de Respuestas**: Lógica de respuesta simple y condicional
- **Casos de Error**: Datos inválidos, campos faltantes, casos límite


### Pruebas del Frontend (Vitest)

#### Ejecutar Todas las Pruebas del Frontend

```shellscript
# Navegar al directorio frontend
cd src
npm test
```

#### Ejecutar Pruebas con UI

```shellscript
npm run test:ui
```

#### Ejecutar Pruebas con Cobertura

```shellscript
npm run test:coverage
```

#### Categorías de Pruebas

- **Renderizado de Componentes**: Visualización e interacción de componentes UI
- **Validación de Formularios**: Validación de entrada y manejo de errores
- **Integración API**: Llamadas API mock y manejo de respuestas
- **Interacciones de Usuario**: Clics de botón, envíos de formulario, cargas de archivo


### Archivos de Prueba

#### Pruebas del Backend

- `tests/test_backend.py`: Pruebas integrales de endpoints API
- `tests/conftest.py`: Configuración de pruebas y fixtures


#### Pruebas del Frontend

- `src/components/__tests__/MockConfigPanel.test.jsx`: Pruebas de formulario de creación de mock
- `src/components/__tests__/RegisteredMocksPanel.test.jsx`: Pruebas de gestión de mocks
- `src/utils/__tests__/jsonValidator.test.js`: Pruebas de utilidad de validación JSON


## Documentación de la API

### Documentación Interactiva

Una vez que el backend esté ejecutándose, puedes acceder a la documentación interactiva de la API:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`


### Formatos de Respuesta

#### Respuesta de Éxito

```json
{
  "success": true,
  "message": "Mock settings saved successfully",
  "settings_id": 1,
  "total_settings": 1
}
```

#### Respuesta de Error

```json
{
  "detail": "Mock with this rute and method already exist"
}
```

### Códigos de Estado

- **200**: Éxito
- **201**: Creado
- **400**: Solicitud Incorrecta (error de validación, duplicado)
- **404**: No Encontrado
- **422**: Entidad No Procesable (formato de datos inválido)
- **500**: Error Interno del Servidor


## Contribuir

### Flujo de Desarrollo

1. Hacer fork del repositorio
2. Crear una rama de característica
3. Hacer tus cambios
4. Ejecutar pruebas para asegurar que todo funciona
5. Enviar un pull request


### Estilo de Código

- **Backend**: Seguir las pautas de estilo Python PEP 8
- **Frontend**: Usar la configuración ESLint proporcionada en el proyecto
- **Pruebas**: Mantener cobertura de pruebas por encima del 80%

### Uso de herramientas IA
Para facilitar el desarrollo del proyecto, se utilizó la IA v0 de Vercel. Los prompts utilizados para crear **el endpoint POST (configure-mock), la lógica de la persistencia de datos, la interfaz y la documentación interactiva** fueron:

## 1. Endpoint POST
Create a FastAPI endpoint in Python that receives mock settings as a JSON payload via POST. The endpoint should:Accept a JSON object with the following structure:{ "ruta": "/api/saludo", "metodo": "GET", "parametros_url": {}, "parametros_body": {}, "headers": {}, "codigo_estado": 200, "contenido_respuesta": { "mensaje": "Hola desde el mock" }, "content_type": "application/json" } Store each received dictionary individually in a list kept in memory. Respond with a JSON success message confirming the mock settings were saved.Make sure to: Use FastAPI and Python, validate the incoming JSON against the expected schema, return appropriate HTTP status codes.

## 2. Persistencia de datos
Create a function in Python to persist mock settings to a file, so that they are not lost if the server is restarted. The system should:Automatically save each mock to a JSON file (e.g., mock_settings.json) every time a new mock is added to the in-memory mock_settings_storage.Automatically remove a mock from the file if it is deleted from the in-memory storage.Ensure the file is always kept in sync with the current state of mock_settings_storage.Use Python file I/O for storage. The function should work within a FastAPI-based backend.

## 3. UI
Here's my backend code. Please use it as context to generate the frontend:Create a modern-corporate user interface for a dashboard using the following color palette: #FAFFD8, #ECFFB0, #9AA899, #54577C, #4A7B9D.The dashboard must include:1. An option to upload a `.json` file.2. A text editor to display and allow editing of the uploaded file's content.3. A dropdown to choose the HTTP method (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD).4. An input field to enter the route.5. A panel with tabs for "Headers" and "Body", each containing a textarea.6. A button labeled “Send Configuration” that performs a POST request to `/configure-mock` using the current settings.7. A "Registered Mocks" panel shown as a table with the following columns:   - Route   - Method   - Status   - Content-Type   - Action buttons for "Try" and "Delete"8. A button labeled “Clear All Mocks” to delete all mocks at once.9. A section to simulate a request to the generic endpoint without leaving the app.10. Use modals or toast notifications to display success or error messages.The UI should be clean, responsive, and follow a modern corporate design style. Use *React + Vite+JavaScript*. Prefer functional components with hooks.

## 4.Documentación interactiva
Generate interactive API documentation for my backend API. Use OpenAPI/Swagger-style format if possible.

The documentation must:

- Include all available endpoints with their HTTP methods (e.g. POST /configure-mock, DELETE /mocks, etc.).
- Show required parameters (query, body, headers) and their data types.
- Include request and response examples.
- Support condition-based responses where applicable.
- Be organized and easy to read.
- Include a general description of the API and its purpose.
