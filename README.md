# Amada Fashion

## Configuración e Instalación

Sigue estos pasos para levantar el entorno local:

### backend
debes entrar a la carpeta /backend y de ahi puedes crear el entorno virtual con:
```bash
python -m venv venv
```
Activa el entorno con
```bash
.\venv\Scripts\activate
```
una vez creada puedes instalar los paquetes utilizados con
```bash
pip install -r requirements.txt
```
si agregas un nuevo paquetes, actualiza la lista de paquetes con:
```bash
pip freeze > requirements.txt
```

### frontend
ahora debes entrar a la carpeta frontend/ y luego instalar los paquetes con:
```bash
npm install
```
Nota: al agregar una nueva libreria con pip, este actualiza la lista de paquetes de package.json


## Iniciar
puedes iniciar el servidor local con:
```bash
npm run dev:full
```
debes estar en la carpeta frontend/
