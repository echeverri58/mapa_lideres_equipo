# Mapa Interactivo de Líderes y Puestos de Votación

Este proyecto es una aplicación web interactiva basada en **Leaflet** que visualiza información geopolítica y electoral de **Medellín y Bello**.

## Características Principales

- **Capas Geográficas**:
  - **Comunas Medellín**: Límites administrativos de Medellín.
  - **Comunas Bello**: Límites administrativos de Bello.
  - **Puestos de Votación**: Ubicación exacta de los puestos de votación (puntos azules).
- **Análisis de Datos**:
  - **Mapa de Calor**: Visualización de densidad de líderes por comuna en Medellín.
  - **Popups Informativos**: Detalles al hacer clic en zonas o puntos (nombres, direcciones, listas de líderes).
- **Control de Capas**:
  - El mapa inicia **limpio** (sin capas activas) para mejor rendimiento y claridad.
  - Menú interactivo (esquina superior derecha) para activar/desactivar capas según necesidad.

## Tecnologías y Herramientas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Leaflet.js.
- **Procesamiento de Datos**: Python (scripts de conversión).

## Estructura de Archivos y Datos

- `index.html`: Punto de entrada de la aplicación.
- `script.js`: Lógica principal del mapa y gestión de capas.
- `style.css`: Estilos visuales.
- **Fuentes de Datos**:
  - `medellin.geojson` / `data.js`: Geometría de Medellín.
  - `bello_data.js`: Geometría de Bello.
  - `lideres_data.js`: Base de datos de líderes.
  - `puestos_data.js`: Datos de puestos de votación (generado automáticamente).

## Procesamiento de Puestos de Votación (KMZ)

El proyecto incluye un sistema para convertir archivos `.kmz` (Google Earth) a formato web compatible.

- **Archivo Fuente**: `Divipole_puestos_votacion.csv.kmz`
- **Script de Conversión**: `convert_kmz.py`
  - Extrae el KML del archivo comprimido.
  - Procesa las coordenadas y atributos.
  - Genera el archivo `puestos_data.js`.
- **Ventaja**: Permite cargar los datos sin necesidad de un servidor backend ni problemas de CORS, facilitando el uso local (doble clic en `index.html`).

## Cómo usar

1. **Visualización**: Abre el archivo `index.html` en tu navegador.
2. **Activar Capas**: Pasa el mouse por el icono de capas (arriba derecha) y selecciona lo que deseas ver.
3. **Actualizar Datos KMZ**:
   - Si tienes un nuevo archivo KMZ, reemplaza el existente.
   - Ejecuta `python convert_kmz.py` para regenerar `puestos_data.js`.
