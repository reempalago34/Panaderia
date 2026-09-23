<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# MazaMadre Control

SaaS de Gestión e Inventarios para Panadería y Pastelería Artesanal con control de pedidos por encargo, explosión de recetas, producción diaria y stock de insumos.

## Despliegue en Coolify

### Requisitos previos
- Coolify instalado y funcionando
- Cuenta de Supabase con proyecto creado
- API Key de Google Gemini

### Pasos para desplegar

1. **Crear un nuevo proyecto en Coolify** (fuente GitHub o Dockerfile)
2. **Configurar las variables de entorno** en el panel de Coolify:

| Variable | Descripción |
|---|---|
| `GEMINI_API_KEY` | Clave de la API de Google Gemini |
| `APP_URL` | URL donde estará desplegada la app |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase |

3. **Configurar el Dockerfile**: Coolify detectará automáticamente el `Dockerfile` y construirá la imagen.
4. **Configurar el puerto**: El contenedor expone el puerto `80`.

### Estructura de archivos clave

- `Dockerfile` - Construcción multi-stage (Node.js build + Nginx serve)
- `docker-compose.yml` - Para ejecución local
- `nginx.conf` - Configuración del servidor web de producción
- `.env.production` - Plantilla de variables de entorno
- `.env.example` - Ejemplo de variables de entorno

### Desarrollo local

```bash
npm install
npm run dev
```

O con Docker Compose:

```bash
docker compose up --build
```

La app estará disponible en `http://localhost:3000`.

## Tecnología

- React 19 + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth + Base de datos)
- Google Gemini AI
- Nginx (servidor de producción)
