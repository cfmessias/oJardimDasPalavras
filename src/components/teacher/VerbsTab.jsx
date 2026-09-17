// src/components/teacher/VerbsTab.jsx

function VerbsTab() {
  const [selectedGrade, setSelectedGrade] = React.useState('1');
  const [selectedPlnnLevel, setSelectedPlnnLevel] = React.useState('');
  
  const [assignedVerbs, setAssignedVerbs] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Carregar os verbos parametrizados para o nível selecionado
  const loadAssignedVerbs = React.useCallback(async () => {
    setLoading(true);
    const data = await VerbsService.getVerbsByLevel(selectedGrade, selectedPlnnLevel);
    setAssignedVerbs(data);
    setLoading(false);
  }, [selectedGrade, selectedPlnnLevel]);

  React.useEffect(() => {
    loadAssignedVerbs();
  }, [loadAssignedVerbs]);

  // Pesquisar no catálogo geral de ~12.000 verbos enquanto digita
  const handleSearchChange = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length >= 2) {
      const results = await VerbsService.searchCatalogVerbs(term);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Associar um verbo do catálogo ao nível selecionado
  const handleAssignVerb = async (verb) => {
    try {
      await VerbsService.assignVerbToLevel(verb.id, selectedGrade, selectedPlnnLevel);
      setSearchTerm('');
      setSearchResults([]);
      loadAssignedVerbs();
    } catch (err) {
      alert('Erro ao associar o verbo. Verifique se já não está associado a este ano/nível.');
    }
  };

  // Remover a associação do verbo a este nível
  const handleRemoveAssociation = async (associationId) => {
    if (confirm('Deseja remover este verbo deste ano/nível?')) {
      await VerbsService.removeVerbFromLevel(associationId);
      loadAssignedVerbs();
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Parametrização de Verbos por Ano / Nível PLNM</h2>

      {/* Filtros de Seleção */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <div>
          <label><strong>Ano Escolar:</strong></label><br />
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)}>
            <option value="">-- Todos --</option>
            <option value="1">1.º Ano</option>
            <option value="2">2.º Ano</option>
            <option value="3">3.º Ano</option>
            <option value="4">4.º Ano</option>
          </select>
        </div>

        <div>
          <label><strong>Nível PLNM:</strong></label><br />
          <select value={selectedPlnnLevel} onChange={(e) => setSelectedPlnnLevel(e.target.value)}>
            <option value="">-- Nenhum --</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
        </div>
      </div>

      {/* Pesquisa no Catálogo Global de 12.000 Verbos */}
      <div style={{ position: 'relative', marginBottom: '30px' }}>
        <label><strong>Pesquisar e Adicionar Verbo do Catálogo:</strong></label>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Digite o infinitivo (ex: cantar, fazer)..."
          style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        {searchResults.length > 0 && (
          <ul style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', border: '1px solid #ccc', borderRadius: '0 0 4px 4px',
            listStyle: 'none', margin: 0, padding: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto'
          }}>
            {searchResults.map((verb) => (
              <li
                key={verb.id}
                onClick={() => handleAssignVerb(verb)}
                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}
              >
                <span><strong>{verb.infinitive}</strong></span>
                <span style={{ color: '#28a745' }}>+ Adicionar</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tabela de Verbos Parametrizados */}
      <h3>Verbos Associados ao Nível Selecionado ({assignedVerbs.length})</h3>
      {loading ? (
        <p>A carregar...</p>
      ) : assignedVerbs.length === 0 ? (
        <p>Nenhum verbo associado a este ano/nível ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Infinitivo</th>
              <th style={{ padding: '8px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {assignedVerbs.map((verb) => (
              <tr key={verb.association_id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '8px' }}><strong>{verb.infinitive}</strong></td>
                <td style={{ padding: '8px' }}>
                  <button
                    onClick={() => handleRemoveAssociation(verb.association_id)}
                    style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}