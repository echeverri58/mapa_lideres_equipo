# Mapa de Líderes Comunitarios - Medellín

Este proyecto es una aplicación web interactiva basada en **Leaflet** que visualiza las comunas y corregimientos de Medellín, junto con la distribución de líderes comunitarios.

## Características

- **Visualización de Comunas**: Capa base con los límites geográficos de Medellín.
- **Identificación de Líderes**: Al hacer clic en una zona, se despliega una lista de los líderes asignados a esa comuna o corregimiento.
- **Mapa de Calor**: Capa visual que muestra la densidad de líderes por zona mediante una escala de colores (de amarillo a rojo).
- **Etiquetas Permanentes**: Nombres de comunas y conteo de líderes visibles directamente en el mapa.

## Tecnologías

- HTML5 / CSS3
- JavaScript (Vanilla)
- [Leaflet.js](https://leafletjs.com/) - Librería de mapas interactivos.
- Datos GeoJSON de Medellín.

## Estructura de Archivos

- `index.html`: Estructura principal de la página.
- `script.js`: Lógica del mapa, capas y procesamiento de datos.
- `style.css`: Estilos personalizados.
- `lideres_data.js`: Base de datos de líderes (generada desde CSV).
- `medellin.geojson`: Datos geográficos.

## Cómo usar

Simplemente abre el archivo `index.html` en tu navegador web. Usa el control de capas en la esquina superior derecha para alternar entre la vista normal y el mapa de calor.
