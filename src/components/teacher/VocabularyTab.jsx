(function () {
  const { useState, useEffect } = React;

  function VocabularyTab(props) {
    const {
      selectedGrade,
      selectedPlnnLevel,
      editingWordId,
      handleWordSubmit,
      wordText,
      setWordText,
      wordEmoji,
      setWordEmoji,
      wordHint,
      setWordHint,
      wordBlankBefore,
      setWordBlankBefore,
      wordBlankAfter,
      setWordBlankAfter,
      savingWord,
      clearWordForm,
      allWords = [],
      startEditWord,
      handleDeleteWord
    } = props;

    // Filtragem de palavras por Ano Escolar e Nível PLNM
    const filteredWords = allWords.filter(
      (w) => Number(w.grade) === Number(selectedGrade) && (w.plnn_level || 'A1') === selectedPlnnLevel
    );

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
      setCurrentPage(1);
    }, [selectedGrade, selectedPlnnLevel]);

    const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedWords = filteredWords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
      <React.Fragment>
        <h3>
          {editingWordId
            ? "Editar Palavra"
            : `Adicionar Palavra para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}
        </h3>

        <form
          onSubmit={handleWordSubmit}
          autoComplete="off"
          style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr 2fr', marginTop: '12px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Palavra</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: gato"
              value={wordText}
              onChange={(e) => setWordText(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Emoji</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: 🐱"
              value={wordEmoji}
              onChange={(e) => setWordEmoji(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Dica / Significado</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Animal doméstico que mia."
              value={wordHint}
              onChange={(e) => setWordHint(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Início da frase</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: O "
              value={wordBlankBefore}
              onChange={(e) => setWordBlankBefore(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Fim da frase</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: dorme no sofá."
              value={wordBlankAfter}
              onChange={(e) => setWordBlankAfter(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingWord}>
              {editingWordId ? "Guardar alterações" : "Adicionar palavra"}
            </button>

            {editingWordId && (
              <button type="button" className="btn btn-outline" onClick={clearWordForm}>
                Cancelar edição
              </button>
            )}
          </div>
        </form>

        <hr style={{ margin: '24px 0' }} />

        <h3>Palavras Registadas ({filteredWords.length})</h3>

        {filteredWords.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {paginatedWords.map((w) => (
                <div key={w.id} style={{ border: '1px solid #ddd', padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#111827' }}>{w.emoji} {w.word}</h4>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                    {w.grade}.º Ano • Nível {w.plnn_level || 'A1'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button type="button" className="link-btn" onClick={() => startEditWord(w)}>Editar</button>
                    <button type="button" className="link-btn" onClick={() => handleDeleteWord(w.id)}>Remover</button>
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
            Nenhuma palavra registada para o {selectedGrade}.º Ano ({selectedPlnnLevel}).
          </p>
        )}
      </React.Fragment>
    );
  }

  window.VocabularyTab = VocabularyTab;
})();