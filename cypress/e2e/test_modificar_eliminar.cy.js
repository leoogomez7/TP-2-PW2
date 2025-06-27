describe('Modificar y luego eliminar una visita existente desde la API', () => {
  const baseUrl = 'http://localhost:3000';
  let idObjetivo = null;

  it('Busca una visita existente', () => {
    cy.request(`${baseUrl}/api/visitas/all`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.length).to.be.greaterThan(0);

      // Toma la primera visita que venga
      const visita = res.body[0];
      idObjetivo = visita.id;

      expect(idObjetivo).to.exist;
    });
  });

  it('Modifica la visita encontrada', () => {
    const nuevaData = {
      fecha: '2025-06-01',
      tipo: 'no residentes',
      visitas: 777,
      observaciones: 'Modificado desde Cypress'
    };

    cy.request('PUT', `${baseUrl}/api/put/${idObjetivo}`, nuevaData).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.mensaje).to.include('actualizada');
    });
  });

  it('Elimina la visita modificada', () => {
    cy.request('DELETE', `${baseUrl}/api/delete/${idObjetivo}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.mensaje).to.include('eliminada');
    });
  });

  it('Verifica que ya no existe', () => {
    cy.request(`${baseUrl}/api/visitas/all`).then((res) => {
      const eliminada = !res.body.find(v => v.id === idObjetivo);
      expect(eliminada).to.be.true;
    });
  });
});
