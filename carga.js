// npm install @sqlitecloud/drivers
const fs = require('fs');
const { Database } = require('@sqlitecloud/drivers');

// Conectarse a SQLite Cloud usando la URL con base de datos "my-database"
// INSTALAR ESTO SINO NO VA ANDAR:
// npm install @sqlitecloud/drivers

//Ir a SQL LITE y seleccionar "CONNECT" que esta izquierda abajo
//En la parte de "DATABASE" seleccionar la base de datos que vamos a utilizar, que este caso utilice "TP-2"
//Y por ultimo ir a le dan a "COPY" del "CONNECTION STRING" y lo copian en el parentesis, asi:
//const db = new Database("COPIAR");

const db = new Database("sqlitecloud://cbajjkmbnk.g3.sqlite.cloud:8860/edge.sqlitecloud?apikey=9T6BfHCVYmepPwu13boDWbBMt71W8Gs7AayutLiMaDc");

// Leer el archivo SQL generado por generarSQL.js
const sqlScript = fs.readFileSync('carga.sql', 'utf8');

// Ejecutar el script en la base de datos
(async () => {
  try {
    await db.exec(sqlScript);
    console.log('✅ Script SQL ejecutado correctamente en SQLite Cloud.');
  } catch (err) {
    console.error('❌ Error al ejecutar el script SQL:', err.message);
  } finally {
    await db.close();
  }
})();


