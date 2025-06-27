//Grupo 1 - Programación Web 2 - Año 2025 - Integrantes: Bruno Hernandez - Lucas Morilla - Malena Tong - Leonardo Gómez.
//ARCHIVOS DE: Visitas a los Parques Nacionales según tipo de residencia del visitante.
//LINK: https://datos.gob.ar/dataset/turismo-parques-nacionales/archivo/turismo_a570af75-ed33-427c-9797-980fc0cd8fd1
// ----------------------------------------------------------------------------------------------------------------------------
const express = require('express');
const { Database } = require('@sqlitecloud/drivers');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexión a SQLite Cloud
const db = new Database('sqlitecloud://cbajjkmbnk.g3.sqlite.cloud:8860/edge.sqlitecloud?apikey=9T6BfHCVYmepPwu13boDWbBMt71W8Gs7AayutLiMaDc');

// --------------------------------- FUNCIONES SQL SEPARADAS ---------------------------------
async function testConnection() {
  return await db.sql`SELECT COUNT(*) AS total FROM visitas`;
}

async function countSinTotal() {
  return await db.sql`
    SELECT COUNT(*) AS total
    FROM visitas v
    JOIN origenes o ON v.origen_id = o.id
    WHERE LOWER(o.tipo) IN ('residentes', 'no residentes')
  `;
}

async function getVisitas({ tipo, fecha, limit, offset }) {
  let sql = `
    SELECT v.id, i.fecha, o.tipo, v.visitas, v.observaciones
    FROM visitas v
    JOIN indice_tiempo i ON v.indice_tiempo_id = i.id
    JOIN origenes o ON v.origen_id = o.id
  `;
  const condiciones = [];
  const params = [];

  if (tipo) {
    condiciones.push(`LOWER(o.tipo) = ?`);
    params.push(tipo.toLowerCase());
  } else {
    condiciones.push(`LOWER(o.tipo) IN ('residentes', 'no residentes')`);
  }

  if (fecha) {
    condiciones.push(`strftime('%Y-%m', i.fecha) = ?`);
    params.push(fecha.slice(0, 7));
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  sql += ' ORDER BY i.fecha DESC';

  if (limit !== undefined && offset !== undefined) {
    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
  }

  return await db.sql(sql, ...params);
}

async function insertarVisita({ fecha, tipo, visitas, observaciones }) {
  await db.sql`INSERT OR IGNORE INTO indice_tiempo (fecha) VALUES (${fecha})`;
  await db.sql`INSERT OR IGNORE INTO origenes (tipo) VALUES (${tipo})`;

  // Obtener los nuevos IDs relacionados
  const [{ id: fecha_id }] = await db.sql`SELECT id FROM indice_tiempo WHERE fecha = ${fecha}`;
  const [{ id: tipo_id }] = await db.sql`SELECT id FROM origenes WHERE tipo = ${tipo}`;

  const [{ id }] = await db.sql`
    INSERT INTO visitas (indice_tiempo_id, origen_id, visitas, observaciones)
    VALUES (${fecha_id}, ${tipo_id}, ${visitas}, ${observaciones})
    RETURNING id
  `;
  return id;
}

async function actualizarVisita(id, { fecha, tipo, visitas, observaciones }) {
  await db.sql`INSERT OR IGNORE INTO indice_tiempo (fecha) VALUES (${fecha})`;
  await db.sql`INSERT OR IGNORE INTO origenes (tipo) VALUES (${tipo})`;

  // Obtener los nuevos IDs relacionados
  const [{ id: fecha_id }] = await db.sql`SELECT id FROM indice_tiempo WHERE fecha = ${fecha}`;
  const [{ id: tipo_id }] = await db.sql`SELECT id FROM origenes WHERE tipo = ${tipo}`;

  await db.sql`
    UPDATE visitas
    SET
      indice_tiempo_id = ${fecha_id},
      origen_id = ${tipo_id},
      visitas = ${visitas},
      observaciones = ${observaciones}
    WHERE id = ${id}
  `;
}

async function eliminarVisita(id) {
  await db.sql`DELETE FROM visitas WHERE id = ${id}`;
}


async function getVisitasPorTipo(tipo, limit = 20, offset = 0) {
    // Selecciona solo residentes y no residentes (en tabla tipo de origen)
    // Ajusta los nombres de tablas y campos.
  return await db.sql`
    SELECT v.id, i.fecha, o.tipo, v.visitas, v.observaciones
    FROM visitas v
    JOIN indice_tiempo i ON v.indice_tiempo_id = i.id
    JOIN origenes o ON v.origen_id = o.id
    WHERE LOWER(o.tipo) = ${tipo.toLowerCase()}
    ORDER BY i.fecha DESC
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;
}

async function countVisitasPorTipo(tipo) {
  const tipoLower = tipo.toLowerCase();

  const result = await db.sql`
    SELECT COUNT(*) as total
    FROM visitas v
    JOIN origenes o ON v.origen_id = o.id
    WHERE LOWER(o.tipo) = ${tipoLower}
  `;

  return result[0]?.total || 0;
}

async function getVisitasConObservaciones(limit = 20, offset = 0) {
    // Selecciona las visitas que tienen observaciones NO NULL ni vacías
    // Ajusta nombres de tablas y columnas.
  return await db.sql`
    SELECT v.id, i.fecha, o.tipo, v.visitas, v.observaciones
    FROM visitas v
    JOIN indice_tiempo i ON v.indice_tiempo_id = i.id
    JOIN origenes o ON v.origen_id = o.id
    WHERE v.observaciones IS NOT NULL AND TRIM(v.observaciones) != ''
    ORDER BY i.fecha DESC
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;
}

async function countVisitasConObservaciones() {
  const result = await db.sql`
    SELECT COUNT(*) as total
    FROM visitas v
    WHERE v.observaciones IS NOT NULL AND TRIM(v.observaciones) != ''
  `;
  return result[0]?.total || 0;
}

async function getVisitasPorFecha(fecha) {
  // Busca visitas que coincidan con el año y mes de 'fecha' y tipo 'residentes' o 'no residentes'
  return await db.sql`
    SELECT v.id, i.fecha, o.tipo, v.visitas, v.observaciones
    FROM visitas v
    JOIN indice_tiempo i ON v.indice_tiempo_id = i.id
    JOIN origenes o ON v.origen_id = o.id
    WHERE strftime('%Y-%m', i.fecha) = ${fecha.slice(0, 7)}
      AND LOWER(o.tipo) IN ('residentes', 'no residentes')
  `;
}

async function getTodasLasVisitas() {
  return await db.sql`
    SELECT v.id, i.fecha, o.tipo, v.visitas, v.observaciones
    FROM visitas v
    JOIN indice_tiempo i ON v.indice_tiempo_id = i.id
    JOIN origenes o ON v.origen_id = o.id
    WHERE LOWER(o.tipo) IN ('residentes', 'no residentes')
    ORDER BY i.fecha DESC
  `;
}

// --------------------------------- API's ---------------------------------
// Verificar conexión a SQLite Cloud
app.get('/test-db', async (req, res) => {
  try {
    const result = await testConnection();
    res.json({ conectado: true, total: result[0].total });
  } catch (err) {
    res.status(500).json({ conectado: false, error: err.message });
  }
});

// Contar registros que NO son de tipo 'total'
app.get('/api/visitas/count', async (req, res) => {
  try {
    const result = await countSinTotal();
    res.json({ total: result[0].total });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar visitas', detalle: err.message });
  }
});

// Ruta unificada para filtro por tipo y fecha
app.get('/api/visitas', async (req, res) => {
  try {
    const datos = await getVisitas(req.query);
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar visitas', detalle: err.message });
  }
});

// Agrega visita
app.post('/api/post', async (req, res) => {
  try {
    const id = await insertarVisita(req.body);
    res.status(201).json({ mensaje: 'Visita insertada correctamente', id });
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar visita', detalle: err.message });
  }
});

//Actualiza visita
app.put('/api/put/:id', async (req, res) => {
  try {
    await actualizarVisita(req.params.id, req.body);
    res.json({ mensaje: `Visita con ID ${req.params.id} actualizada correctamente` });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar visita', detalle: err.message });
  }
});

// Elimina visita
app.delete('/api/delete/:id', async (req, res) => {
  try {
    await eliminarVisita(req.params.id);
    res.json({ mensaje: `Visita con ID ${req.params.id} eliminada correctamente` });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar visita', detalle: err.message });
  }
});

// Obtener visitas según tipo, con paginación
app.get('/api/visitas-tipo', async (req, res) => {
  const { tipo, limit, offset } = req.query;
  if (!tipo) return res.status(400).json({ error: 'Falta parámetro tipo' });

  try {
    const datos = await getVisitasPorTipo(tipo, limit, offset);
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar visitas por tipo', detalle: err.message });
  }
});

// Obtener la cantidad total de visitas por tipo (para paginación)
app.get('/api/visitas-tipo-count', async (req, res) => {
  const { tipo } = req.query;

  if (!tipo) {
    return res.status(400).json({ error: 'Falta parámetro tipo' });
  }

  try {
    const total = await countVisitasPorTipo(tipo);
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar visitas por tipo', detalle: err.message });
  }
});

//Muestra solo las visitas que tienen observaciones
app.get('/api/visitas/observaciones', async (req, res) => {
  const { limit, offset } = req.query;

  try {
    const datos = await getVisitasConObservaciones(limit, offset);
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitas con observaciones', detalle: err.message });
  }
});

//paginacion
app.get('/api/visitas/observaciones/count', async (req, res) => {
  try {
    const total = await countVisitasConObservaciones();
    res.json({ total });
  } catch (err) {
    res.status(500).json({ error: 'Error al contar visitas con observaciones', detalle: err.message });
  }
});

//filtrar visitas según una fecha específica
app.get('/api/visitas/por-fecha', async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'Falta parámetro fecha' });

  try {
    const datos = await getVisitasPorFecha(fecha);
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar visitas por fecha', detalle: err.message });
  }
});

//muestra todas las visitas pero filtrando lo que esta escrito en busqueda
app.get('/api/visitas/all', async (req, res) => {
  try {
    const datos = await getTodasLasVisitas();
    res.json(datos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener todas las visitas', detalle: err.message });
  }
});

// --------------------------------- INICIO DEL SERVIDOR ---------------------------------
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
