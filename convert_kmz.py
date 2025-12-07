import zipfile
import json
import xml.etree.ElementTree as ET
import re

def parse_kml_coordinate(coord_str):
    """
    Parsea una cadena de coordenadas KML "lon,lat,alt"
    Retorna [lon, lat]
    """
    parts = coord_str.strip().split(',')
    if len(parts) >= 2:
        try:
            return [float(parts[0]), float(parts[1])]
        except ValueError:
            return None
    return None

def main():
    kmz_path = 'Divipole_puestos_votacion.csv.kmz'
    output_js = 'puestos_data.js'
    
    print(f"Procesando {kmz_path}...")
    
    try:
        with zipfile.ZipFile(kmz_path, 'r') as z:
            # Buscar archivo KML
            kml_files = [f for f in z.namelist() if f.endswith('.kml')]
            if not kml_files:
                print("No se encontró archivo .kml en el KMZ")
                return
            
            kml_filename = kml_files[0]
            print(f"Leyendo {kml_filename}...")
            
            with z.open(kml_filename) as f:
                tree = ET.parse(f)
                root = tree.getroot()
                
                # Namespace de KML suele ser necesario para findall
                # El namespace suele ser {http://www.opengis.net/kml/2.2}
                # Una forma robusta es ignorar el namespace o detectarlo
                
                # Estrategia simple: iterar sobre todos los elementos
                features = []
                
                # Buscar todos los Placemarks
                # Usamos iter() para encontrar tags sin importar el namespace exacto
                for placemark in root.iter():
                    if placemark.tag.endswith('Placemark'):
                        name = ""
                        description = ""
                        coordinates = None
                        
                        for child in placemark:
                            if child.tag.endswith('name'):
                                name = child.text
                            elif child.tag.endswith('description'):
                                description = child.text
                            elif child.tag.endswith('Point'):
                                for point_child in child:
                                    if point_child.tag.endswith('coordinates'):
                                        coordinates = parse_kml_coordinate(point_child.text)
                        
                        if coordinates:
                            # Intentar parsear descripción si es HTML (común en KML de Google Earth)
                            # O simplemente guardarla cruda.
                            # Para este caso, guardamos name y description.
                            
                            # Limpieza básica de descripción si es tabla HTML
                            props = {
                                "name": name,
                                "description": description
                            }
                            
                            # Intentar extraer datos estructurados de la descripción si parece HTML de tabla
                            if description and '<td' in description:
                                # Extracción muy básica de pares clave-valor si es posible
                                pass

                            feature = {
                                "type": "Feature",
                                "properties": props,
                                "geometry": {
                                    "type": "Point",
                                    "coordinates": coordinates
                                }
                            }
                            features.append(feature)
                
                geojson = {
                    "type": "FeatureCollection",
                    "features": features
                }
                
                print(f"Se encontraron {len(features)} puntos.")
                
                js_content = f"const puestosData = {json.dumps(geojson, ensure_ascii=False)};"
                
                with open(output_js, 'w', encoding='utf-8') as out:
                    out.write(js_content)
                
                print(f"Archivo {output_js} generado exitosamente.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
