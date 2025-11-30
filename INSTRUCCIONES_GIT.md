# Guía para subir tu proyecto a GitHub

Sigue estos pasos en tu terminal (PowerShell o CMD) para subir este mapa a GitHub.

## Prerrequisitos
1.  Tener **Git** instalado. (Prueba escribiendo `git --version`).
2.  Tener una cuenta en [GitHub.com](https://github.com).

## Paso 1: Crear el repositorio en GitHub
1.  Ve a [github.com/new](https://github.com/new).
2.  Ponle un nombre al repositorio (ej: `mapa-lideres-medellin`).
3.  Déjalo como **Público**.
4.  **NO** marques ninguna casilla de "Initialize this repository with..." (ni README, ni .gitignore, ni licencia), ya que los hemos creado localmente.
5.  Dale al botón verde **Create repository**.

## Paso 2: Inicializar y subir desde tu PC

Abre la terminal en la carpeta de tu proyecto (`C:\Users\ASUS vivobook\Desktop\Experimento mapa\Experimento 1`) y ejecuta estos comandos uno por uno:

```powershell
# 1. Inicializar el repositorio git
git init

# 2. Agregar todos los archivos al área de preparación
git add .

# 3. Guardar los cambios (hacer el primer commit)
git commit -m "Primer commit: Mapa de líderes con mapa de calor"

# 4. Cambiar el nombre de la rama principal a 'main' (estándar actual)
git branch -M main

# 5. Conectar tu carpeta con el repositorio de GitHub
# REEMPLAZA 'TU_USUARIO' con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/mapa-lideres-medellin.git

# 6. Subir los archivos
git push -u origin main
```

Si es la primera vez que usas Git, es posible que te pida iniciar sesión con tu cuenta de GitHub en una ventana emergente.

## Actualizaciones futuras

Si haces más cambios en el código, solo necesitas repetir estos 3 comandos:

```powershell
git add .
git commit -m "Descripción de los cambios"
git push
```
