# TP - Presentación

Trabajo Práctico de **FE + BE(APIs y BD) + CY** para la materia Programación Web 2 - UNO.

---

# Integrantes

Bruno Hernandez - Lucas Morilla - Malena Tong - Leonardo Gómez.

---

# Fuente de datos

Cantidad de visitas al total de Parques Nacionales según tipo de residencia del visitante en formato de series de tiempo.

**Link:** https://datos.gob.ar/dataset/turismo-parques-nacionales/archivo/turismo_a570af75-ed33-427c-9797-980fc0cd8fd1

---

# Descripción

Desarrollamos una aplicación web con backend en Node.js y frontend en HTML/JavaScript que permite gestionar registros de visitas a Parques Nacionales, basándose en datos importados desde un archivo CSV. La API facilita consultas, inserciones, actualizaciones y eliminaciones de registros relacionados con fechas, tipos de visitantes (residentes, no residentes, total), cantidad de visitas y observaciones. Para el almacenamiento, utilizamos SQLite Cloud como base de datos en la nube, evitando la necesidad de gestionar una base de datos local.

---

# **Respuestas HTTP**

Peticiones HTTP utilizadas:

* **200 OK**: cuando la operación fue exitosa.
* **201 Created** : cuando se crea un nuevo recurso exitosamente (por ejemplo, al agregar una nueva visita).
* **400 Bad Request** : cuando los datos enviados son incorrectos o faltan campos obligatorios.
* **500 Internal Server Error** : para errores generales del servidor.

---

# Dependencias instaladas:

`@sqlitecloud/drivers`

* Permite conectar el backend (Node.js) con SQLiteCloud, una base de datos SQLite alojada en la nube. Que se usa para ejecutar consultas SQL desde JavaScript usando `db.sql`.

`express`

* Framework minimalista de Node.js para crear servidores web y API REST. Que se usa para definir rutas (`GET`, `POST`, `PUT`, `DELETE`), escuchar peticiones y manejar respuestas.

`cors`

* Middleware que habilita el  CORS (Cross-Origin Resource Sharing). Que permite que el frontend (HTML/JS) alojado en otro origen acceda al backend sin ser bloqueado por el navegador.

`csv-parser`

* Librería para leer y **parsear archivos CSV** de forma sencilla en Node.js. Que se utiliza para leer el archivo CSV original de visitas y transformarlo en datos para insertar en la base de datos.

`cypress`

* Usado para pruebas automatizadas del frontend.

---

# Archivos

**generarSQL.js:** Convierte automáticamente el archivo CSV con los datos de visitas en Parques Nacionales en un archivo **`.sql`** listo para cargar esos datos en nuestra base de datos SQLite Cloud.

**carga.js:** Ejecuta en SQLite Cloud los comandos SQL del archivo `carga.sql` para cargar datos iniciales en la base de datos.

**cargar.sql:** Contiene las sentencias SQL generadas automáticamente para insertar datos en las tablas `indice_tiempo`, `origenes` y `visitas` de la base de datos.

**index.js:** Se conecta a la base de datos SQLite Cloud.

**public/gestion.html:** Muestra una tabla con todas las visitas registradas que permite, y te permite ver los registros de visitas de forma organizada cada 20 registros, y agregar, editar y eliminar visitas.

**public/index.html:** Menú principal para navegar en los distintos HTML.

**public/vista_unificada.html:** herramienta de análisis visual y estadístico de los datos de visita, por lo cual, filtra registros, muestra los registros de visitas y su estadisticas, con un grafico, todo respectoo del filtro que se aplique.

**public/mostrar_fecha.html:** Permite seleccionar un año y mes para mostrar en una tabla las visitas registradas en esa fecha específica, consultando la información mediante una API y mostrando los resultados dinámicamente.

**public/mostrar_obs.html:** Muestra en una tabla las visitas registradas que tienen observaciones, consultando la información mediante una API y mostrando los resultados dinámicamente.

**public/mostrar_tipo.html:** Muestra en una tabla las visitas registradas separadas por tipo de origen (residentes y no residentes), consultando la información mediante una API y mostrando los resultados dinámicamente.

**cypress/e2e/test_filtros.cy.js:** Este test verifica que las APIs de filtrado funcionen correctamente al buscar visitas por tipo, fecha y observaciones, además de validar que el conteo de registros devuelto sea correcto.

**cypress/e2e/test_modificar_eliminar.cy.js:** Este test toma una visita ya existente en la base, la modifica correctamente mediante una solicitud PUT y luego la elimina con una solicitud DELETE, comprobando al final que dicha visita ya no esté disponible en la base de datos.

---

# API's REST

`GET /api/visitas:`

* Lista visitas con filtros opcionales por tipo, fecha, paginación.

`GET /api/visitas/count: `

* Cuenta total de visitas residentes y no residentes.

`GET /api/visitas/observaciones`

* Listado paginado de visitas con observaciones.

`GET /api/visitas/observaciones/count`

* Total visitas con observaciones.

`POST /api/post`

* Insertar nueva visita.

`PUT /api/put/:id`

* Actualizar visita por ID.

`DELETE /api/delete/:id`

* Eliminar visita por ID.

`GET /test-db`

Verifica la conexión con la base de datos.

`GET /api/visitas-tipo`

Obtiene visitas por tipo (residentes o no residentes) con paginación.

`GET /api/visitas-tipo-count`

Devuelve la cantidad total de visitas de un tipo.

`GET /api/visitas-tipo-count`

Lista visitas que tienen observaciones no vacías (paginadas).

`GET /api/visitas/observaciones`

Devuelve la cantidad total de visitas con observaciones.

`GET /api/visitas/observaciones/count`

Filtra visitas por año y mes (AAAA-MM).

`GET /api/visitas/por-fecha`

Devuelve todas las visitas (solo residentes y no residentes).

---

# Backend y frontend

Usamos `fetch()` en los archivos HTML para enviar peticiones HTTP (`GET`, `POST`, `PUT`, `DELETE`), para la conexión entre backend y frontend.

**Backend (servidor):** Node.js con Express (puerto 3000).

Funcionalidad:

* Conexión a base de datos SQLite Cloud
* API REST para:
  * Consultar datos de visitas (por fecha, tipo de origen, cantidad de visitas, observaciones)
  * Insertar nuevas visitas
  * Actualizar visitas existentes
  * Eliminar visitas
  * Mostrar datos filtrados:
    * Visitas con fecha elegida.
    * Visitas con observaciones.
    * Visitas de residentes y no residentes (por tipo de origen).

**Frontend (cliente):** HTML, CSS y JavaScript.

Funcionalidad:

* Formularios para agregar/modificar/eliminar/mostrar datos de visitas.
* Envío de datos al backend vía fetch POST
* Muestra mensajes visuales para confirmar que los datos se agregaron correctamente o informar errores.
* Busqueda en los registros de visitas.
* Estadisticas sobre las visitas.
* Navegación básica (botones).
* Validación de formularios.
* Testing con **Cypress.**

---

# Estrategias

**Generar el archivo `carga.sql` desde el CSV:**

* node generarSQL.js (en la terminal)

**Cargar datos en SQLite Cloud:**

* node carga.js (en la terminal)

**Correr el servidor:**

* node index.js (en la terminal)
* El servidor correrá en `http://localhost:3000`.

**Cypress:**

* npx cypress open (en la terminal)

**Tipo de prueba automatizada:**

* E2E (end-to-end: flujo completo del usuario).
* UI Testing (validación visual y funcional del formulario).
* API Testing (validación directa del comportamiento del backend)

**Backend:**

* API REST.
* Conexión DB.
* Validación.
* Control de errores.

**Frontend:**

* HTML/CSS responsive.
* JS para interacción.
* Consumo de API.

---

# Consideraciones

Se utiliza SQLite Cloud, que es clave para tener una **URL de conexión válida y activa** para que el backend funcione correctamente.

Los archivos `generarSQL.js` y `carga.js` son necesarios para procesar y cargar los datos iniciales desde un archivo CSV a la base de datos. Primero se ejecuta `generarSQL.js` y luego `carga.js`.

---

# Conclusión

Este proyecto consiste en una aplicación web para gestionar y mostrar datos sobre visitas a parques nacionales según el tipo de origen del visitante. El backend está implementado en Node.js con Express y se conecta a una base de datos SQLite en la nube usando `@sqlitecloud/drivers`. Ofrece múltiples endpoints para consultar, filtrar, insertar, actualizar y eliminar registros de visitas. El frontend, basado en HTML, CSS y JavaScript, consume APIs para mostrar datos y gráficos interactivos. Además, se incluyen herramientas para procesamiento de archivos CSV y el uso de CORS para manejo de peticiones desde el cliente. Se puede mejorar la calidad del software con pruebas end-to-end usando Cypress, que se integra principalmente en el frontend para validar funcionalidades y la correcta comunicación con el backend. En resumen, es un sistema completo que cubre la gestión de datos, visualización y control de calidad mediante pruebas automatizadas.
#   T P - 2 - P W 2  
 