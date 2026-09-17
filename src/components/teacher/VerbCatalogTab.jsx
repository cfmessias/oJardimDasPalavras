function VerbCatalogTab() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [selectedVerb, setSelectedVerb] = React.useState(null);
  const [selectedTense, setSelectedTense] = React.useState('Presente do Indicativo');
  const [editingForms, setEditingForms] = React.useState({});
  const [isSaving, setIsSaving] = React.useState(false);

  const tenses = [
    'Presente do Indicativo',
    'Pretérito Perfeito do Indicativo',
    'Pretérito Imperfeito do Indicativo',
    'Futuro do Indicativo'
  ];

  const persons = ['eu', 'tu', 'ele/ela', 'nós', 'vós', 'eles/elas'];

  // Pesquisa de verbos no catálogo
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length >= 2) {
      const results = await VerbsService.searchCatalogVerbs(value);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Selecionar verbo para ver/editar conjugações
  const handleSelectVerb = (verb) => {
    setSelectedVerb(verb);
    setSearchResults([]);
    setSearchTerm(verb.infinitive);
    loadTenseForms(verb, selectedTense);
  };

  // Carregar formas conjugadas para o tempo selecionado
  const loadTenseForms = (verb, tense) => {
    const initialForms = {
      'eu': '', 'tu': '', 'ele/ela': '',
      'nós': '', 'vós': '', 'eles/elas': ''
    };

    if (verb && verb.verb_conjugations) {
      verb.verb_conjugations
        .filter(c => c.tense === tense)
        .forEach(c => {
          initialForms[c.person] = c.conjugated_form;
        });
    }
    setEditingForms(initialForms);
  };

  // Trocar de tempo verbal no visualizador
  const handleTenseChange = (tense) => {
    setSelectedTense(tense);
    if (selectedVerb) {
      loadTenseForms(selectedVerb, tense);
    }
  };

  // Guardar correções na base de dados
  const handleSaveConjugations = async () => {
    if (!selectedVerb) return;
    setIsSaving(true);

    try {
      await VerbsService.saveCatalogVerb({
        id: selectedVerb.id,
        infinitive: selectedVerb.infinitive,
        is_regular: selectedVerb.is_regular,
        tense: selectedTense,
        conjugations: editingForms
      });

      alert('Conjugação atualizada com sucesso!');
      // Recarrega o verbo atualizado
      const updatedList = await VerbsService.searchCatalogVerbs(selectedVerb.infinitive);
      if (updatedList.length > 0) {
        setSelectedVerb(updatedList[0]);
        loadTenseForms(updatedList[0], selectedTense);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao guardar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
      <h3>Catálogo de Verbos & Correção de Conjugações</h3>

      {/* Caixa de Pesquisa */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Pesquisar verbo no catálogo (ex: fazer, cantar)..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        {searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            backgroundColor: '#fff', border: '1px solid #ccc', zIndex: 10,
            maxHeight: '150px', overflowY: 'auto'
          }}>
            {searchResults.map(verb => (
              <div
                key={verb.id}
                onClick={() => handleSelectVerb(verb)}
                style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
              >
                <strong>{verb.infinitive}</strong> {verb.is_regular ? '(Regular)' : '(Irregular)'}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Painel de Edição do Verbo Selecionado */}
      {selectedVerb && (
        <div style={{ border: '1px solid #e0e0e0', padding: '15px', borderRadius: '6px' }}>
          <h4>Verbo: <span style={{ color: '#007bff' }}>{selectedVerb.infinitive}</span></h4>

          {/* Seletor do Tempo Verbal */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Tempo Verbal:</label>
            <select
              value={selectedTense}
              onChange={(e) => handleTenseChange(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '4px' }}
            >
              {tenses.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Formulário das 6 Pessoas Gramaticais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            {persons.map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '70px', fontWeight: 'bold', textAlign: 'right' }}>{p}:</span>
                <input
                  type="text"
                  value={editingForms[p] || ''}
                  onChange={(e) => setEditingForms({ ...editingForms, [p]: e.target.value })}
                  style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveConjugations}
            disabled={isSaving}
            style={{
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isSaving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </div>
      )}
    </div>
  );
}