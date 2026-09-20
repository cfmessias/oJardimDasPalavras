(function () {
  const { useState, useEffect } = React;

  function GrammarTab(props) {
    const {
      selectedGrade,
      selectedPlnnLevel,
      editingGrammarId,
      handleGrammarSubmit,
      grammarCategory,
      setGrammarCategory,
      grammarBaseWord,
      setGrammarBaseWord,
      grammarTargetWord,
      setGrammarTargetWord,
      grammarFeatureType,
      setGrammarFeatureType,
      savingGrammar,
      clearGrammarForm,
      grammarList = [],
      startEditGrammar,
      handleDeleteGrammar
    } = props;

    // Filtragem de regras por Ano Escolar e Nível PLNM
    const filteredGrammar = grammarList.filter(
      (g) => Number(g.grade) === Number(selectedGrade) && (g.plnn_level || 'A1') === selectedPlnnLevel
    );

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
      setCurrentPage(1);
    }, [selectedGrade, selectedPlnnLevel]);

    const totalPages = Math.ceil(filteredGrammar.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedGrammar = filteredGrammar.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <React.Fragment>
        <h3>
          {editingGrammarId
            ? "Editar Parâmetro Gramatical"
            : `Adicionar Regra Gramatical para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}
        </h3>

        <form onSubmit={handleGrammarSubmit} autoComplete="off" style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Categoria</label>
              <select className="input" value={grammarCategory} onChange={(e) => setGrammarCategory(e.target.value)}>
                <option value="Género">Género (M/F)</option>
                <option value="Número">Número (Singular/Plural)</option>
                <option value="Classe">Classe de Palavras</option>
                <option value="Pontuação">Pontuação</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Palavra Base</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: menino"
                value={grammarBaseWord}
                onChange={(e) => setGrammarBaseWord(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Par / Alvo</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: menina"
                value={grammarTargetWord}
                onChange={(e) => setGrammarTargetWord(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Regra / Tipo</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Feminino em -a"
                value={grammarFeatureType}
                onChange={(e) => setGrammarFeatureType(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingGrammar}>
              {editingGrammarId ? "Guardar alterações" : "Adicionar regra"}
            </button>
            {editingGrammarId && (
              <button type="button" className="btn btn-outline" onClick={clearGrammarForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <hr style={{ margin: '24px 0' }} />

        <h3>Regras Registadas ({filteredGrammar.length})</h3>

        {filteredGrammar.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {paginatedGrammar.map((g) => (
                <div key={g.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>{g.category}</span>
                  <h4 style={{ margin: '4px 0', color: '#111827' }}>{g.base_word} → {g.target_word}</h4>
                  {g.feature_type && <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>{g.feature_type}</p>}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" className="link-btn" onClick={() => startEditGrammar(g)}>Editar</button>
                    <button type="button" className="link-btn" onClick={() => handleDeleteGrammar(g.id)}>Remover</button>
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
            Nenhuma regra gramatical registada para o {selectedGrade}.º Ano ({selectedPlnnLevel}).
          </p>
        )}
      </React.Fragment>
    );
  }

  window.GrammarTab = GrammarTab;
})();