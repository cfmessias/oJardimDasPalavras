// src/components/teacher/VerbsTab.jsx

function VerbsTab(props) {
  // Ano Escolar e Nível PLNM vêm agora da barra de filtros global do Painel do
  // Professor (TeacherDashboardView), tal como nos separadores de Gramática,
  // Vocabulário e Frases — para que a seleção seja consistente em toda a app.
  const { selectedGrade = 1, selectedPlnnLevel = '' } = props;

  const [selectedTense, setSelectedTense] = React.useState(() => {
    return localStorage.getItem('verbsTab_selectedTense') || 'Presente do Indicativo';
  });

  const handleTenseChange = (e) => {
    const value = e.target.value;
    setSelectedTense(value);
    localStorage.setItem('verbsTab_selectedTense', value);
  };

  const [assignedVerbs, setAssignedVerbs] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [expandedGroupKey, setExpandedGroupKey] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Estado para Paginação
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 5;

  // Estado para Criar/Editar Verbo
  const [showCatalogModal, setShowCatalogModal] = React.useState(false);
  const [editingVerb, setEditingVerb] = React.useState(null);
  const [formInfinitive, setFormInfinitive] = React.useState('');
  const [formIsRegular, setFormIsRegular] = React.useState(true);
  const [formConjs, setFormConjs] = React.useState({ eu: '', tu: '', ele: '', nos: '', vos: '', eles: '' });

  const loadAssignedVerbs = React.useCallback(async () => {
    setLoading(true);
    const data = await VerbsService.getVerbsByLevel(selectedGrade, selectedPlnnLevel);
    setAssignedVerbs(data);
    setLoading(false);
  }, [selectedGrade, selectedPlnnLevel]);

  React.useEffect(() => {
    loadAssignedVerbs();
  }, [loadAssignedVerbs]);

  // Reseta para a página 1 ao alterar filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedGrade, selectedPlnnLevel]);

  // AGRUPAMENTO: Junta por Infinitivo mantendo todos os tempos verbais e conjugações de cada registo
  const groupedVerbs = React.useMemo(() => {
    const groups = {};
    assignedVerbs.forEach((item) => {
      const key = item.infinitive || 'Sem Nome';
      if (!groups[key]) {
        groups[key] = {
          infinitive: key,
          items: []
        };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups);
  }, [assignedVerbs]);

  // Cálculo de Paginação
  const totalPages = Math.ceil(groupedVerbs.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGroups = groupedVerbs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const handleAssignVerb = async (verb) => {
    if (!selectedPlnnLevel || selectedPlnnLevel.trim() === '') {
      alert('Por favor, selecione um Nível PLNM antes de associar o verbo.');
      return;
    }
    
    try {
      await VerbsService.assignVerbToLevel(
        verb.id,
        selectedGrade,
        selectedPlnnLevel,
        selectedTense
      );
    
      setSearchTerm('');
      setSearchResults([]);
      loadAssignedVerbs();
    } catch (err) {
      console.error(err);
      alert('Erro ao associar o verbo.');
    }
  };

  const handleRemoveAssociation = async (associationId) => {
    if (confirm('Remover este tempo verbal deste ano/nível?')) {
      await VerbsService.removeVerbFromLevel(associationId);
      loadAssignedVerbs();
    }
  };

  const handleSaveCatalogVerb = async (e) => {
    e.preventDefault();
    try {
      const verbId = await VerbsService.saveCatalogVerb({
        id: editingVerb ? editingVerb.id : null,
        infinitive: formInfinitive,
        is_regular: formIsRegular,
        tense: selectedTense,
        conjugations: formConjs
      });

      if (!editingVerb) {
        await VerbsService.assignVerbToLevel(verbId, selectedGrade, selectedPlnnLevel, selectedTense);
      }

      setShowCatalogModal(false);
      resetForm();
      loadAssignedVerbs();
    } catch (err) {
      alert('Erro ao guardar verbo no catálogo: ' + err.message);
    }
  };

  const resetForm = () => {
    setEditingVerb(null);
    setFormInfinitive('');
    setFormIsRegular(true);
    setFormConjs({ eu: '', tu: '', ele: '', nos: '', vos: '', eles: '' });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2>Parametrização de Verbos por Ano / Nível / Tempo Verbal</h2>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '-8px' }}>
        Ano Escolar: <strong>{selectedGrade}.º Ano</strong> · Nível PLNM: <strong>{selectedPlnnLevel || 'Todos'}</strong>
        {' '}(definidos na barra de filtros acima)
      </p>

      {/* 1. Seleção do Tempo Verbal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '320px', gap: '15px', marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <div>
          <label><strong>Tempo Verbal Ativo:</strong></label><br />
          <select value={selectedTense} onChange={handleTenseChange} style={{ width: '100%', padding: '8px' }}>
            <option value="Presente do Indicativo">Presente do Indicativo</option>
            <option value="Pretérito Perfeito do Indicativo">Pretérito Perfeito do Indicativo</option>
            <option value="Pretérito Imperfeito do Indicativo">Pretérito Imperfeito do Indicativo</option>
            <option value="Pretérito Mais-Que-Perfeito do Indicativo">Pretérito Mais-Que-Perfeito do Indicativo</option>
            <option value="Futuro do Indicativo">Futuro do Indicativo</option>
            <option value="Presente do Conjuntivo">Presente do Conjuntivo</option>
            <option value="Pretérito Imperfeito do Conjuntivo">Pretérito Imperfeito do Conjuntivo</option>
            <option value="Futuro do Conjuntivo">Futuro do Conjuntivo</option>
            <option value="Infinitivo Pessoal">Infinitivo Pessoal</option>
            <option value="Condicional">Condicional</option>
            <option value="Imperativo Afirmativo">Imperativo Afirmativo</option>
            <option value="Imperativo Negativo">Imperativo Negativo</option>
          </select>
        </div>
      </div>

      {/* 2. Pesquisa e Novo Verbo */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '25px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <label><strong>Pesquisar e Associar Verbo do Catálogo ({selectedTense}):</strong></label>
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
                  <span><strong>{verb.infinitive}</strong> ({verb.is_regular ? 'Regular' : 'Irregular'})</span>
                  <span style={{ color: '#28a745' }}>+ Associar ao {selectedTense}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={() => { resetForm(); setShowCatalogModal(true); }}
          style={{ padding: '10px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          + Registar Verbo
        </button>
      </div>

      {/* 3. Tabela Agrupada de Verbos Associados */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Verbos Associados ao {selectedGrade}.º Ano ({groupedVerbs.length} verbos)</h3>
      </div>

      {loading ? (
        <p>A carregar...</p>
      ) : groupedVerbs.length === 0 ? (
        <p>Nenhum verbo associado a este ano/nível ainda.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#eee', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Infinitivo</th>
                <th style={{ padding: '10px' }}>Tempos / Configurações</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedGroups.map((group) => {
                const isGroupExpanded = expandedGroupKey === group.infinitive;

                return (
                  <React.Fragment key={group.infinitive}>
                    <tr style={{ borderBottom: '1px solid #ddd', background: isGroupExpanded ? '#f8fafc' : 'transparent' }}>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', width: '20%' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#1f2937' }}>{group.infinitive}</strong>
                      </td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {group.items.map((verbItem) => (
                            <div key={verbItem.association_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                                {verbItem.tense || selectedTense}
                              </span>
                              <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                ({verbItem.verb_conjugations?.length || 0} conjugações)
                              </span>
                              <button
                                onClick={() => handleRemoveAssociation(verbItem.association_id)}
                                title="Remover este tempo verbal"
                                style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px', verticalAlign: 'top', textAlign: 'center', width: '25%' }}>
                        <button
                          onClick={() => setExpandedGroupKey(isGroupExpanded ? null : group.infinitive)}
                          style={{ background: '#f3f4f6', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          {isGroupExpanded ? '▲ Ocultar Conjugações' : '▼ Ver Conjugações'}
                        </button>
                      </td>
                    </tr>

                    {/* Detalhe expandido com as 6 pessoas gramaticais para CADA tempo verbal do verbo */}
                    {isGroupExpanded && (
                      <tr>
                        <td colSpan="3" style={{ background: '#f9fafb', padding: '16px', borderBottom: '2px solid #e5e7eb' }}>
                          {group.items.map((verbItem) => {
                            const conjugations = verbItem.verb_conjugations || [];
                            return (
                              <div key={verbItem.association_id} style={{ marginBottom: '16px', background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                <div style={{ fontWeight: 'bold', color: '#1d4ed8', marginBottom: '8px', fontSize: '0.9rem' }}>
                                  {verbItem.tense || selectedTense}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.88rem' }}>
                                  {[
                                    { key: 'eu', label: 'Eu', targets: ['eu'] },
                                    { key: 'tu', label: 'Tu', targets: ['tu'] },
                                    { key: 'ele', label: 'Ele/Ela', targets: ['ele', 'ela', 'ele/ela'] },
                                    { key: 'nos', label: 'Nós', targets: ['nos', 'nós'] },
                                    { key: 'vos', label: 'Vós', targets: ['vos', 'vós'] },
                                    { key: 'eles', label: 'Eles/Elas', targets: ['eles', 'elas', 'eles/elas'] }
                                  ].map(personObj => {
                                    const match = conjugations.find(item => {
                                      if (!item || !item.person) return false;
                                      const normalizedDbPerson = item.person
                                        .toString()
                                        .toLowerCase()
                                        .normalize("NFD")
                                        .replace(/[\u0300-\u036f]/g, "");
                                      return personObj.targets.includes(normalizedDbPerson);
                                    });

                                    return (
                                      <div key={personObj.key} style={{ background: '#f8fafc', padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                                        <strong>{personObj.label}:</strong> {match ? match.conjugated_form : '-'}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Controlos de Paginação */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: currentPage === 1 ? '#e9ecef' : '#fff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Anterior
              </button>

              <span style={{ fontSize: '0.9rem' }}>
                Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: currentPage === totalPages ? '#e9ecef' : '#fff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Seguinte
              </button>
            </div>
          )}
        </>
      )}

      {/* 4. Formulário/Modal para Criar ou Editar Verbo no Catálogo */}
      {showCatalogModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>{editingVerb ? 'Editar Verbo no Catálogo' : 'Adicionar Novo Verbo ao Catálogo'}</h3>
            <form onSubmit={handleSaveCatalogVerb} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label><strong>Infinitivo:</strong></label>
                <input
                  type="text"
                  value={formInfinitive}
                  onChange={(e) => setFormInfinitive(e.target.value)}
                  placeholder="Ex: cantar"
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>

              <div>
                <label><strong>Regularidade:</strong></label>
                <select value={formIsRegular ? "true" : "false"} onChange={(e) => setFormIsRegular(e.target.value === "true")} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                  <option value="true">Regular</option>
                  <option value="false">Irregular</option>
                </select>
              </div>

              <h4>Conjugações ({selectedTense})</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['eu', 'tu', 'ele', 'nos', 'vos', 'eles'].map((person) => (
                  <div key={person}>
                    <label style={{ textTransform: 'capitalize' }}>{person}:</label>
                    <input
                      type="text"
                      value={formConjs[person]}
                      onChange={(e) => setFormConjs({ ...formConjs, [person]: e.target.value })}
                      style={{ width: '100%', padding: '6px' }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Guardar
                </button>
                <button type="button" onClick={() => setShowCatalogModal(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}