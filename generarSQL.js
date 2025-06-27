// Importación de módulos:
const fs = require('fs'); //Leer archivos
const csv = require('csv-parser'); //Lee y parsea archivos CSV 

const archivoEntrada = 'visitas-residentes-y-no-residentes.csv';
const archivoSalida = 'carga.sql';

const tiempoSet = new Set(); //para guardar valores únicos de fechas
const origenSet = new Set(); //para guardar valores únicos de tipos
const inserts = []; //array de objetos con los datos a insertar en la tabla "visitas".

fs.createReadStream(archivoEntrada) //Lectura y procesamiento del CSV
  .pipe(csv())
  .on('data', (row) => {
    const fechaCruda = row['﻿indice_tiempo'] || row['indice_tiempo']; // por si tiene BOM
    const fecha = fechaCruda.trim().split('-').slice(0, 3).join('-'); // Ya viene como "AAAA-MM-01"

    const tipo = row['origen_visitantes'].trim().toLowerCase(); // normalizamos
    const visitas = parseInt(row['visitas']) || 0;
    const observaciones = (row['observaciones'] || '').replace(/'/g, "''"); // escapamos comillas simples
    const id = row['id'] ? parseInt(row['id']) : null;

    tiempoSet.add(fecha);
    origenSet.add(tipo);

    inserts.push({ id, fecha, tipo, visitas, observaciones });

    //Se agregan al set (para evitar duplicados) y al array de inserciones.
  })
  .on('end', () => {
    const lines = [];

    // INSERTs para indice_tiempo
    tiempoSet.forEach(fecha => {
      lines.push(`INSERT OR IGNORE INTO indice_tiempo (fecha) VALUES ('${fecha}');`);
    });

    // INSERTs para origenes
    origenSet.forEach(tipo => {
      lines.push(`INSERT OR IGNORE INTO origenes (tipo) VALUES ('${tipo}');`);
    });

    // INSERTs para visitas con subqueries
    inserts.forEach(entry => {
      const idPart = entry.id !== null ? `${entry.id}, ` : ''; // solo si hay ID
      const campos = entry.id !== null
        ? `(id, indice_tiempo_id, origen_id, visitas, observaciones)`
        : `(indice_tiempo_id, origen_id, visitas, observaciones)`;

      const valores = entry.id !== null
        ? `${entry.id}, `
        : '';

      lines.push(`
INSERT OR IGNORE INTO visitas ${campos}
VALUES (
  ${valores}
  (SELECT id FROM indice_tiempo WHERE fecha = '${entry.fecha}'),
  (SELECT id FROM origenes WHERE tipo = '${entry.tipo}'),
  ${entry.visitas},
  '${entry.observaciones}'
);`);
    });

    // Escribir archivo SQL
    fs.writeFileSync(archivoSalida, lines.join('\n'));
    console.log('✅ Archivo carga.sql generado correctamente.');
  });
