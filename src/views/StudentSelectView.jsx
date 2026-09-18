function StudentSelectView({
  selectedGrade,
  setSelectedGrade,
  filteredStudents,
  handleSelectStudent
}) {
  return (
    <div className="container">
      <div className="card">
        <h2>🤓 Quem vai jogar hoje?</h2>
        <p className="subtitle">Escolhe o teu ano e depois o teu nome na lista da turma.</p>

        <div className="grade-selector" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '20px 0' }}>
          {[1, 2, 3, 4, 5, 6].map((grade) => {
            const isActive = Number(selectedGrade) === grade;
            return (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '25px',
                  border: isActive ? '2px solid #F2704E' : '1px solid #D1D5DB',
                  backgroundColor: isActive ? '#FFF0ED' : '#FFFFFF',
                  color: isActive ? '#F2704E' : '#374151',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {grade}.º Ano
              </button>
            );
          })}
        </div>

        {filteredStudents.length > 0 ? (
          <div className="students-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                className="btn btn-outline student-card-btn"
                onClick={() => handleSelectStudent(s)}
                style={{ padding: '10px 22px', borderRadius: '25px' }}
              >
                <div style={{ fontSize: '1rem', fontWeight: '600' }}>{s.name}</div>
              </button>
            ))}
          </div>
        ) : (
          <p className="empty-message" style={{ margin: '24px 0', color: '#666' }}>
            Ainda não há alunos registados neste ano. Pede ao professor para te adicionar.
          </p>
        )}

        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #eee' }} />

      </div>
    </div>
  );
}