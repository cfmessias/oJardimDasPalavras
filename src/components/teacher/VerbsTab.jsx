(function () {
  const { useState, useEffect, useMemo } = React;

  function VerbsTab(props) {
    const {
      selectedGrade,
      selectedPlnnLevel,
      verbsList = [],
      handleDeleteVerb,
      // Se tiveres funções para abrir o modal de conjugações/edição
      onViewConjugations,
      onAddVerb
    } = props;

    // 1. Filtragem por Ano Escolar e Nível PLNM
    const filteredVerbs = useMemo(() => {
      return verbsList.filter(
        (v) => Number(v.grade) === Number(selectedGrade) && (v.plnn_level || 'A1') === selectedPlnnLevel
      );
    }, [verbsList, selectedGrade, selectedPlnnLevel]);

    // 2. Agrupamento por Infinitivo (evita repetir "ajudar", "andar", "beber" em várias linhas)
    const groupedVerbs = useMemo(() => {
      const groups = {};
      filteredVerbs.forEach((item) => {
        const key = item.infinitive || item.verb || 'Sem Nome';
        if (!groups[key]) {
          groups[key] = {
            infinitive: key,
            tenses: [],
            rawItems: []
          };
        }
        groups[key].tenses.push(item.tense || item.tempo_verbal);
        groups[key].rawItems.push(item);
      });
      return Object.values(groups);
    }, [filteredVerbs]);

    // 3. Paginação (6 verbos agrupados por página)
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
      setCurrentPage(1);
    }, [selectedGrade, selectedPlnnLevel]);

    const totalPages = Math.ceil(groupedVerbs.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedVerbs = groupedVerbs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <React.Fragment>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>
            Verbos Registados — {selectedGrade}.º Ano ({selectedPlnnLevel || 'A1'})
            <span style={{ fontSize: '0.9rem', color: '#6b7280', marginLeft: '8px' }}>
              ({groupedVerbs.length} verbos)
            </span>
          </h3>

          {onAddVerb && (
            <button type="button" className="btn btn-primary" onClick={onAddVerb}>
              + Associar Novo Verbo
            </button>
          )}
        </div>

        {groupedVerbs.length > 0 ? (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold', color: '#374151' }}>Infinitivo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold', color: '#374151' }}>Tempos Configurados</th>
                  <th style={{ padding: '12px 16px', fontWeight: 'bold', color: '#374151', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVerbs.map((group) => (
                  <tr key={group.infinitive} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#111827', fontSize: '1.05rem' }}>
                      {group.infinitive}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {group.tenses.map((tense, idx) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.8rem',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid #bfdbfe'
                            }}
                          >
                            {tense}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {onViewConjugations && (
                          <button
                            type="button"
                            className="link-btn"
                            onClick={() => onViewConjugations(group)}
                          >
                            Ver Conjugações
                          </button>
                        )}
                        <button
                          type="button"
                          className="link-btn"
                          style={{ color: '#dc2626' }}
                          onClick={() => {
                            // Eliminar todos os registos associados a este verbo no ano/nível
                            group.rawItems.forEach((item) => handleDeleteVerb(item.id));
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Controlo de Paginação */}
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
            Nenhum verbo registado para o {selectedGrade}.º Ano ({selectedPlnnLevel}).
          </p>
        )}
      </React.Fragment>
    );
  }

  window.VerbsTab = VerbsTab;
})();