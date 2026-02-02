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
// Crear capas
let medellinLayer;
let belloLayer;
let heatmapLayer;
let puestosLayer;

// Control de capas inicial
const baseMaps = {
    "OpenStreetMap": osm
};
const overlayMaps = {};
let layerControl;

// Cargar Medellín
if (typeof medellinData !== 'undefined') {
    medellinLayer = createGeoJsonLayer(medellinData, "Medellín");
    // No agregamos al mapa por defecto para que inicien desactivadas
    // medellinLayer.addTo(map);

    // Crear capa de mapa de calor
    heatmapLayer = L.geoJSON(medellinData, {
        style: heatmapStyle,
        onEachFeature: function (feature, layer) {
            let count = getLeaderCount(feature);
            let name = feature.properties.NOMBRE || "Comuna";
            let popupContent = `<strong>${name}</strong><br>Líderes: ${count}`;

            layer.bindTooltip(`${name}<br>(${count} líderes)`, {
                permanent: true,
                direction: "center",
                className: "commune-label"
            });

            // Lógica de popup detallado (reutilizada)
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
                } else {
                    layer.bindPopup(popupContent);
                }
            }
        }
    });

    overlayMaps["Comunas Medellín"] = medellinLayer;
    overlayMaps["Mapa de Calor Líderes"] = heatmapLayer;

    // --- Votos Juancho Heatmap ---
    function getJuanchoVoteCount(feature) {
        if (typeof juanchoVotesData === 'undefined' || !feature.properties.CODIGO) {
            return 0;
        }
        return juanchoVotesData[feature.properties.CODIGO] || 0;
    }

    function getJuanchoHeatmapColor(d) {
        return d > 300 ? '#005a32' :
            d > 250 ? '#238b45' :
                d > 200 ? '#41ab5d' :
                    d > 150 ? '#74c476' :
                        d > 100 ? '#a1d99b' :
                            d > 50 ? '#c7e9c0' :
                                d > 0 ? '#e5f5e0' :
                                    '#f7fcf5';
    }

    function juanchoHeatmapStyle(feature) {
        return {
            fillColor: getJuanchoHeatmapColor(getJuanchoVoteCount(feature)),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    const juanchoHeatmapLayer = L.geoJSON(medellinData, {
        style: juanchoHeatmapStyle,
        onEachFeature: function (feature, layer) {
            const count = getJuanchoVoteCount(feature);
            const name = feature.properties.NOMBRE || "Comuna";
            const popupContent = `<strong>${name}</strong><br>Votos: ${count}`;

            layer.bindTooltip(`${name}<br>(${count} votos)`, {
                permanent: true,
                direction: "center",
                className: "commune-label"
            });
            layer.bindPopup(popupContent);
        }
    });

    overlayMaps["Votos Juancho Medellín"] = juanchoHeatmapLayer;
    // --- End Votos Juancho Heatmap ---

    // --- Apoyos León Heatmap (Consolidado BD) ---
    function getApoyosLeonCount(feature) {
        if (typeof apoyosLeonData === 'undefined' || !feature.properties.CODIGO) {
            return 0;
        }
        return apoyosLeonData[feature.properties.CODIGO] || 0;
    }

    function getApoyosLeonColor(d) {
        return d > 250 ? '#800026' :
            d > 200 ? '#bd0026' :
                d > 150 ? '#e31a1c' :
                    d > 100 ? '#fc4e2a' :
                        d > 50 ? '#fd8d3c' :
                            d > 25 ? '#feb24c' :
                                d > 0 ? '#fed976' :
                                    '#ffeda0';
    }

    function apoyosLeonStyle(feature) {
        return {
            fillColor: getApoyosLeonColor(getApoyosLeonCount(feature)),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    const apoyosLeonMainLayer = L.geoJSON(medellinData, {
        style: apoyosLeonStyle,
        onEachFeature: function (feature, layer) {
            const count = getApoyosLeonCount(feature);
            const name = feature.properties.NOMBRE || "Comuna";
            const popupContent = `<strong>${name}</strong><br>Apoyos: ${count}`;

            layer.bindTooltip(`${name}<br>(${count} apoyos)`, {
                permanent: true,
                direction: "center",
                className: "commune-label"
            });
            layer.bindPopup(popupContent);
        }
    });

    // Marcador para "Medellín General" (Datos sin comuna específica)
    let apoyosLeonLayer;
    if (typeof apoyosLeonMedellinGeneral !== 'undefined' && apoyosLeonMedellinGeneral > 0) {
        const generalMarker = L.circleMarker([6.2442, -75.5709], { // Cerca de La Alpujarra
            radius: 10,
            fillColor: "#ff0000",
            color: "#000",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });
        generalMarker.bindPopup(`<strong>Medellín General</strong><br>Apoyos sin comuna: ${apoyosLeonMedellinGeneral}`);
        generalMarker.bindTooltip("General: " + apoyosLeonMedellinGeneral, { permanent: true, direction: "top" });

        apoyosLeonLayer = L.layerGroup([apoyosLeonMainLayer, generalMarker]);
    } else {
        apoyosLeonLayer = apoyosLeonMainLayer;
    }

    overlayMaps["Apoyos León - Consolidado BD"] = apoyosLeonLayer;
    // --- End Apoyos León Heatmap ---

} else {
    console.error('Error: medellinData no definido.');
}

// Cargar Bello
if (typeof belloData !== 'undefined') {
    belloLayer = createGeoJsonLayer(belloData, "Bello");
    overlayMaps["Comunas Bello"] = belloLayer;
} else {
    console.error('Error: belloData no definido.');
}

// Cargar Puestos de Votación (desde KMZ convertido)
if (typeof puestosData !== 'undefined') {
    puestosLayer = L.geoJSON(puestosData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 5,
                fillColor: "#3388ff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function (feature, layer) {
            let p = feature.properties;
            let content = `<strong>${p.name}</strong>`;
            if (p.description) {
                content += `<br><div style="max-height:150px; overflow:auto;">${p.description}</div>`;
            }
            layer.bindPopup(content);
        }
    });

    overlayMaps["Puestos de Votación"] = puestosLayer;
    // puestosLayer.addTo(map); // Desactivado por defecto
}

// --- Votos Nacional Marker ---
if (typeof medellinData !== 'undefined') {
    const laurelesFeature = medellinData.features.find(f => f.properties.CODIGO === '11');
    if (laurelesFeature) {
        // Create a temporary layer to calculate the center
        const tempLayer = L.geoJSON(laurelesFeature);
        const center = tempLayer.getBounds().getCenter();

        const nacionalVotesMarker = L.circleMarker(center, {
            radius: 8,
            fillColor: "#ff00ff", // Magenta color to stand out
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        nacionalVotesMarker.bindPopup("<strong>Votos Nacional: 77</strong>");

        const nacionalLayer = L.layerGroup([nacionalVotesMarker]);
        overlayMaps["Votos Nacional"] = nacionalLayer;
    }
}
// --- End Votos Nacional Marker ---


// Crear control de capas
layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
