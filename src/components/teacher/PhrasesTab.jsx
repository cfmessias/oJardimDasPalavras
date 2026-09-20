(function () {
  const { useState, useEffect } = React;

  function PhrasesTab({
    phrases = [],
    selectedGrade,
    selectedPlnnLevel,
    phraseText,
    setPhraseText,
    phraseCategory,
    setPhraseCategory,
    phraseTargetWord,
    setPhraseTargetWord,
    phraseType,
    setPhraseType,
    editingPhraseId,
    savingPhrase,
    handlePhraseSubmit,
    clearPhraseForm,
    startEditPhrase,
    handleDeletePhrase
  }) {
    // Fallback de categoria
    const [localPhraseCategory, setLocalPhraseCategory] = useState('Verbo');
    const currentCategory = phraseCategory !== undefined ? phraseCategory : localPhraseCategory;
    const changeCategory = setPhraseCategory || setLocalPhraseCategory;

    // Filtragem de frases
    const filteredPhrases = phrases.filter((p) => {
      const matchGrade = Number(p.grade) === Number(selectedGrade);
      const matchLevel = (p.plnn_level || p.level || 'A1') === selectedPlnnLevel;
      return matchGrade && matchLevel;
    });

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
      setCurrentPage(1);
    }, [selectedGrade, selectedPlnnLevel]);

    const totalPages = Math.ceil(filteredPhrases.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedPhrases = filteredPhrases.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <React.Fragment>
        <h3>{editingPhraseId ? "Editar Frase" : `Adicionar Frase para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}</h3>

        <form onSubmit={handlePhraseSubmit} autoComplete="off" style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Texto da Frase</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: O cão correu rapidamente no parque."
              value={phraseText}
              onChange={(e) => setPhraseText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Categoria</label>
              <select 
                className="input" 
                value={currentCategory} 
                onChange={(e) => changeCategory(e.target.value)}
                required
              >
                <option value="Verbo">Verbo</option>
                <option value="Classe">Classe</option>
                <option value="Pontuação">Pontuação</option>
                <option value="Nome">Nome / Substantivo</option>
                <option value="Adjetivo">Adjetivo</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Palavra-Alvo (opcional)</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: correu"
                value={phraseTargetWord}
                onChange={(e) => setPhraseTargetWord(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Tipo de Exercício</label>
              <select 
                className="input" 
                value={phraseType} 
                onChange={(e) => setPhraseType(e.target.value)}
              >
                <option value="leitura">Leitura / Compreensão</option>
                <option value="lacuna">Preenchimento de Lacuna</option>
                <option value="ordenacao">Ordenação de Frase</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPhrase}>
              {savingPhrase ? "A guardar..." : (editingPhraseId ? "Guardar alterações" : "Adicionar frase")}
            </button>
            {editingPhraseId && (
              <button type="button" className="btn btn-outline" onClick={clearPhraseForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <hr style={{ margin: '24px 0' }} />

        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1f2937', marginTop: '24px' }}>
          Frases Registadas ({filteredPhrases.length})
        </h3>

        {filteredPhrases.length > 0 ? (
          <>
            <div className="phrases-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {paginatedPhrases.map((p) => (
                <div 
                  key={p.id} 
                  className="card" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px 16px', 
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1f2937' }}>
                      {p.base_word || p.phrase_text}
                    </div>
                    
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>Categoria: <strong>{p.category || 'Verbo'}</strong></span>
                      <span>Tipo: <strong>{p.feature_type || p.type || 'leitura'}</strong></span>
                      {(p.target_word || p.phrase_target_word) && (
                        <span style={{ color: '#059669' }}>
                          Palavra-alvo: <strong>{p.target_word || p.phrase_target_word}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="btn-link" 
                      style={{ color: '#f2704e', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'none' }} 
                      onClick={() => startEditPhrase(p)}
                    >
                      Editar
                    </button>
                    <button 
                      type="button" 
                      className="btn-link" 
                      style={{ color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', border: 'none', background: 'none' }} 
                      onClick={() => handleDeletePhrase(p.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
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
            Nenhuma frase registada para o {selectedGrade}.º Ano ({selectedPlnnLevel}).
          </p>
        )}
      </React.Fragment>
    );
  }

  window.PhrasesTab = PhrasesTab;
})();