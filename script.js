// Inicializar el mapa centrado en Medellín
const map = L.map('map').setView([6.29, -75.57], 12); // Ajustado para ver ambos municipios

// Capa base
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

osm.addTo(map);

// Función para generar un color aleatorio
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Estilo para los polígonos
function style(feature) {
    return {
        fillColor: getRandomColor(),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        dashArray: '3',
        fillOpacity: 0.2 // Más transparente para dar protagonismo al mapa de calor
    };
}

// Función para contar líderes
function getLeaderCount(feature) {
    if (typeof lideresData === 'undefined') return 0;

    let codigo = feature.properties.CODIGO;
    if (!codigo && feature.properties.IDENTIFICACION) {
        let match = feature.properties.IDENTIFICACION.match(/(\d+)/);
        if (match) codigo = match[1];
    }

    if (codigo) {
        let codigoInt = parseInt(codigo, 10);
        const keys = Object.keys(lideresData);
        const matchKey = keys.find(k => {
            let match = k.match(/COMUNA\s+(\d+)/i);
            if (match) return parseInt(match[1], 10) === codigoInt;
            return false;
        });
        if (matchKey) return lideresData[matchKey].length;
    }

    // Fallback por nombre
    let name = feature.properties.NOMBRE || feature.properties.name || "";
    let identificacion = feature.properties.IDENTIFICACION || name;
    let featureId = identificacion.toUpperCase();

    if (lideresData[featureId]) return lideresData[featureId].length;

    const keys = Object.keys(lideresData);
    const matchKey = keys.find(k => k.includes(featureId));
    return matchKey ? lideresData[matchKey].length : 0;
}

// Escala de colores para el mapa de calor
function getHeatmapColor(d) {
    return d > 40 ? '#800026' :
        d > 30 ? '#BD0026' :
            d > 20 ? '#E31A1C' :
                d > 10 ? '#FC4E2A' :
                    d > 5 ? '#FD8D3C' :
                        d > 0 ? '#FEB24C' :
                            '#FFEDA0';
}

// Estilo para el mapa de calor
function heatmapStyle(feature) {
    return {
        fillColor: getHeatmapColor(getLeaderCount(feature)),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Función auxiliar para crear capas GeoJSON
function createGeoJsonLayer(data, layerName) {
    return L.geoJSON(data, {
        style: style,
        onEachFeature: function (feature, layer) {
            // Intentar encontrar una propiedad que parezca un nombre
            let name = feature.properties.NOMBRE || feature.properties.name || feature.properties.Name || feature.properties.nombre || "Comuna";
            let identificacion = feature.properties.IDENTIFICACION || name;

            layer.bindTooltip(name, {
                permanent: true,
                direction: "center",
                className: "commune-label"
            });

            // Lógica para líderes
            if (typeof lideresData !== 'undefined') {
                let lideres = null;

                // Estrategia 1: Usar CODIGO del GeoJSON (ej: "01", "50")
                let codigo = feature.properties.CODIGO;

                // Estrategia 2: Extraer número de IDENTIFICACION (ej: "Comuna 1" -> "1", "Corregimiento 50" -> "50")
                if (!codigo && feature.properties.IDENTIFICACION) {
                    let match = feature.properties.IDENTIFICACION.match(/(\d+)/);
                    if (match) codigo = match[1];
                }

                if (codigo) {
                    let codigoInt = parseInt(codigo, 10);
                    const keys = Object.keys(lideresData);

                    // Buscar la clave en lideresData que tenga el mismo número de comuna/corregimiento
                    const matchKey = keys.find(k => {
                        // Las claves son tipo "COMUNA 1", "COMUNA 50 - ..."
                        // Buscamos el primer número que aparezca después de "COMUNA"
                        let match = k.match(/COMUNA\s+(\d+)/i);
                        if (match) {
                            return parseInt(match[1], 10) === codigoInt;
                        }
                        return false;
                    });

                    if (matchKey) {
                        lideres = lideresData[matchKey];
                    }
                }

                // Fallback por nombre si falla el código (para casos raros)
                if (!lideres) {
                    let featureId = (identificacion || "").toUpperCase();
                    lideres = lideresData[featureId];
                    if (!lideres) {
                        const keys = Object.keys(lideresData);
                        const matchKey = keys.find(k => k.includes(featureId));
                        if (matchKey) lideres = lideresData[matchKey];
                    }
                }

                if (lideres && lideres.length > 0) {
                    let popupContent = `<div style="max-height: 200px; overflow-y: auto;">
                                            <h3>${name}</h3>
                                            <h4>Líderes:</h4>
                                            <ul style="padding-left: 20px;">`;
                    lideres.forEach(lider => {
                        popupContent += `<li>${lider}</li>`;
                    });
                    popupContent += `</ul></div>`;
                    layer.bindPopup(popupContent);
                }
            }
        }
    });
}

// Crear capas
let medellinLayer;
let belloLayer;
let heatmapLayer;

// Cargar Medellín
if (typeof medellinData !== 'undefined') {
    medellinLayer = createGeoJsonLayer(medellinData, "Medellín");
    // No agregamos al mapa por defecto para que inicien desactivadas
    // medellinLayer.addTo(map);

    // Crear capa de mapa de calor (solo para Medellín por ahora, ya que ahí están los datos)
    heatmapLayer = L.geoJSON(medellinData, {
        style: heatmapStyle,
        onEachFeature: function (feature, layer) {
            let count = getLeaderCount(feature);
            let name = feature.properties.NOMBRE || "Comuna";

            // Reutilizamos la lógica de popup existente o creamos una simple
            let popupContent = `<strong>${name}</strong><br>Líderes: ${count}`;

            // Si queremos ver la lista completa también en el mapa de calor:
            if (count > 0 && typeof lideresData !== 'undefined') {
                // Recalcular líderes para la lista (podríamos refactorizar para no repetir, pero por simplicidad:)
                // ... (lógica simplificada, asumiendo que getLeaderCount ya validó existencia)
                // Para el popup detallado, mejor usamos la misma lógica de createGeoJsonLayer o simplemente mostramos cantidad.
                // El usuario pidió "ver en que comuna tenemos mas lideres", la cantidad es clave.
            }

            layer.bindTooltip(`${name}<br>(${count} líderes)`, {
                permanent: true,
                direction: "center",
                className: "commune-label"
            });
            // Copiamos la lógica de popup completa para que sea útil
            let identificacion = feature.properties.IDENTIFICACION || name;
            if (typeof lideresData !== 'undefined') {
                let lideres = null;
                let codigo = feature.properties.CODIGO;
                if (!codigo && feature.properties.IDENTIFICACION) {
                    let match = feature.properties.IDENTIFICACION.match(/(\d+)/);
                    if (match) codigo = match[1];
                }
                if (codigo) {
                    let codigoInt = parseInt(codigo, 10);
                    const keys = Object.keys(lideresData);
                    const matchKey = keys.find(k => {
                        let match = k.match(/COMUNA\s+(\d+)/i);
                        if (match) return parseInt(match[1], 10) === codigoInt;
                        return false;
                    });
                    if (matchKey) lideres = lideresData[matchKey];
                }
                // Fallback
                if (!lideres) {
                    let featureId = (identificacion || "").toUpperCase();
                    lideres = lideresData[featureId];
                    if (!lideres) {
                        const keys = Object.keys(lideresData);
                        const matchKey = keys.find(k => k.includes(featureId));
                        if (matchKey) lideres = lideresData[matchKey];
                    }
                }

                if (lideres && lideres.length > 0) {
                    let listContent = `<div style="max-height: 200px; overflow-y: auto;">
                                            <h3>${name}</h3>
                                            <p><strong>Total: ${lideres.length}</strong></p>
                                            <ul style="padding-left: 20px;">`;
                    lideres.forEach(l => listContent += `<li>${l}</li>`);
                    listContent += `</ul></div>`;
                    layer.bindPopup(listContent);
                }
            }
        }
    });
} else {
    console.error('Error: medellinData no definido.');
}

// Cargar Bello
if (typeof belloData !== 'undefined') {
    belloLayer = createGeoJsonLayer(belloData, "Bello");
    // belloLayer.addTo(map);
} else {
    console.error('Error: belloData no definido.');
}

// Control de capas
const baseMaps = {
    "OpenStreetMap": osm
};

const overlayMaps = {};

if (medellinLayer) {
    overlayMaps["Comunas Medellín"] = medellinLayer;
    overlayMaps["Mapa de Calor Líderes"] = heatmapLayer;
}
if (belloLayer) {
    overlayMaps["Comunas Bello"] = belloLayer;
}

L.control.layers(baseMaps, overlayMaps).addTo(map);
