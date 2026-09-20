(function () {
  const { useState, useEffect } = React;

  function StudentsTab(props) {
    const {
      selectedGrade,
      selectedPlnnLevel,
      editingStudentId,
      handleStudentSubmit,
      newStudentName,
      setNewStudentName,
      newStudentPin,
      setNewStudentPin,
      clearStudentForm,
      students = [],
      startEditStudent,
      handleDeleteStudent,
      setCurrentView
    } = props;

    // Filtragem de alunos por Ano Escolar e Nível PLNM
    const filteredStudents = students.filter(
      (s) => Number(s.grade) === Number(selectedGrade) && (s.plnn_level || 'A1') === selectedPlnnLevel
    );

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
      setCurrentPage(1);
    }, [selectedGrade, selectedPlnnLevel]);

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <React.Fragment>
        <h3>
          {editingStudentId
            ? "Editar Aluno"
            : `Criar Novo Aluno para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}
        </h3>

        <form
          onSubmit={handleStudentSubmit}
          autoComplete="off"
          style={{ display: 'grid', gap: '12px', gridTemplateColumns: '2fr 1fr auto', alignItems: 'end', marginTop: '12px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Nome do Aluno</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Zé Maria"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>PIN do Aluno</label>
            <input
              type="text"
              inputMode="numeric"
              className="input"
              placeholder="Ex: 1234"
              value={newStudentPin}
              onChange={(e) => setNewStudentPin(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              {editingStudentId ? "Guardar" : "Adicionar"}
            </button>
            {editingStudentId && (
              <button type="button" className="btn btn-outline" style={{ height: '42px' }} onClick={clearStudentForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        <hr style={{ margin: '24px 0' }} />

        <h3>Alunos Registados ({filteredStudents.length})</h3>

        {filteredStudents.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {paginatedStudents.map((student) => (
                <div key={student.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#111827' }}>{student.name}</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                    {student.grade}.º Ano • Nível {student.plnn_level || 'A1'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" className="link-btn" onClick={() => startEditStudent(student)}>
                      Editar
                    </button>
                    <button type="button" className="link-btn" onClick={() => handleDeleteStudent(student.id)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === 1 ? '#f3f4f6' : '#ffffff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Anterior
                </button>

                <span style={{ fontSize: '0.9rem', color: '#374151' }}>
                  Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#ffffff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Seguinte
                </button>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: '#6b7280', marginTop: '16px', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Nenhum aluno registado para o {selectedGrade}.º Ano ({selectedPlnnLevel}).
          </p>
        )}

        <button 
          className="btn btn-outline" 
          style={{ marginTop: '24px' }} 
          onClick={() => setCurrentView("student_select")}
        >
          👁️ Ver Visão do Aluno
        </button>
      </React.Fragment>
    );
  }

  window.StudentsTab = StudentsTab;
})();