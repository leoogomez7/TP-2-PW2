//Pruebas basadas en las API's de los filtros
describe('Pruebas basadas en index.js (API SQLite Cloud)', () => {
  const baseUrl = 'http://localhost:3000';
  const fecha = '2025-06-15'; 
  const tipo = 'no residentes';
  const observacionesEsperadas = 'Actualizado desde prueba Cypress'; 

  it('Verifica conexión a la base de datos', () => {
    cy.request(`${baseUrl}/test-db`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('conectado', true);
      expect(res.body).to.have.property('total');
    });
  });

  it('Consulta visitas por tipo', () => {
    cy.request(`${baseUrl}/api/visitas-tipo?tipo=${tipo}`).then(res => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      res.body.forEach(v => expect(v.tipo.toLowerCase()).to.eq(tipo.toLowerCase()));
    });
  });

  it('Cuenta visitas por tipo', () => {
    cy.request(`${baseUrl}/api/visitas-tipo-count?tipo=${tipo}`).then(res => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('total').and.to.be.a('number');
    });
  });

  it('Consulta visitas por fecha', () => {
    cy.request(`${baseUrl}/api/visitas/por-fecha?fecha=${fecha}`).then(res => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      res.body.forEach(v => {
        expect(v.fecha).to.include(fecha.slice(0, 7));
      });
    });
  });

  it('Consulta visitas con observaciones', () => {
    cy.request(`${baseUrl}/api/visitas/observaciones`).then(res => {
      expect(res.status).to.eq(200);
      res.body.forEach(v => {
        expect(v.observaciones).to.be.a('string').and.not.be.empty;
      });
    });
  });

  it('Cuenta visitas con observaciones', () => {
    cy.request(`${baseUrl}/api/visitas/observaciones/count`).then(res => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('total').and.to.be.a('number');
    });
  });
    });