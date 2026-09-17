// src/components/teacher/VerbsTab.jsx

function VerbsTab() {
  const [selectedGrade, setSelectedGrade] = React.useState('1');
  const [selectedPlnnLevel, setSelectedPlnnLevel] = React.useState(() => {
	return localStorage.getItem('verbsTab_selectedPlnnLevel') || '';
	});
	
  const handlePlnnLevelChange = (e) => {
	const value = e.target.value;
	setSelectedPlnnLevel(value);
	localStorage.setItem('verbsTab_selectedPlnnLevel', value);
  };
  // No VerbsTab.jsx:

	const [selectedTense, setSelectedTense] = React.useState(() => {
	  return localStorage.getItem('verbsTab_selectedTense') || 'Presente do Indicativo';
	});

	const handleTenseChange = (e) => {
	  const value = e.target.value;
	  setSelectedTense(value);
	  localStorage.setItem('verbsTab_selectedTense', value);
	};

	// Garante que o loadAssignedVerbs é recarregado quando o nível muda

  const [assignedVerbs, setAssignedVerbs] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [expandedVerbId, setExpandedVerbId] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

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
	try {
		// Se o utilizador tiver "-- Todos --" selecionado, podes forçar 'A1' ou avisar
		const levelToAssign = selectedPlnnLevel || 'A1';
	
		await VerbsService.assignVerbToLevel(
		verb.id, 
		selectedGrade, 
		levelToAssign, 
		selectedTense
		);
	
		setSearchTerm('');
		setSearchResults([]);
		loadAssignedVerbs();
	} catch (err) {
		alert('Erro ao associar o verbo.');
	}
	};

  const handleRemoveAssociation = async (associationId) => {
    if (confirm('Remover este verbo deste ano/nível?')) {
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

      // Se for um novo verbo, associa-o logo ao nível ativo
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

      {/* 1. Seleção do Ano, Nível PLNM e Tempo Verbal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '15px', marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
        <div>
          <label><strong>Ano Escolar:</strong></label><br />
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="1">1.º Ano</option>
            <option value="2">2.º Ano</option>
            <option value="3">3.º Ano</option>
            <option value="4">4.º Ano</option>
          </select>
        </div>

        <div>
          <label><strong>Nível PLNM:</strong></label><br />
          <select value={selectedPlnnLevel} onChange={(e) => setSelectedPlnnLevel(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="">-- Todos --</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
			<option value="B2">B2</option>
          </select>
        </div>

        <div>
          <label><strong>Tempo Verbal Pretendido:</strong></label><br />
          <select value={selectedTense} onChange={(e) => setSelectedTense(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="Presente do Indicativo">Presente do Indicativo</option>
            <option value="Pretérito Perfeito">Pretérito Perfeito</option>
            <option value="Pretérito Imperfeito">Pretérito Imperfeito</option>
            <option value="Futuro do Indicativo">Futuro do Indicativo</option>
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
          + Criar Novo Verbo
        </button>
      </div>

      {/* 3. Tabela de Verbos Associados */}
      <h3>Verbos Associados ao {selectedGrade}.º Ano ({assignedVerbs.length})</h3>
      {loading ? (
        <p>A carregar...</p>
      ) : assignedVerbs.length === 0 ? (
        <p>Nenhum verbo associado a este ano/nível ainda.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Infinitivo</th>
              <th style={{ padding: '8px' }}>Tempo Verbal</th>
              <th style={{ padding: '8px' }}>Conjugações</th>
              <th style={{ padding: '8px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {assignedVerbs.map((verb) => {
              const conjugations = verb.verb_conjugations || [];
              const isExpanded = expandedVerbId === verb.association_id;

              return (
                <React.Fragment key={verb.association_id}>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}><strong>{verb.infinitive}</strong></td>
                    <td style={{ padding: '8px' }}>{verb.tense || selectedTense}</td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => setExpandedVerbId(isExpanded ? null : verb.association_id)}
                        style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isExpanded ? 'Ocultar Conjugações' : `Ver Conjugações (${conjugations.length})`}
                      </button>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button
                        onClick={() => handleRemoveAssociation(verb.association_id)}
                        style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>

                  {/* Detalhe expandido com as 6 pessoas gramaticais */}
                  {/* Detalhe expandido com as 6 pessoas gramaticais */}
				  {isExpanded && (
				    <tr>
				  	<td colSpan="4" style={{ background: '#f9f9f9', padding: '12px' }}>
				  	  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.9rem' }}>
				  		{[
				  		  { key: 'eu', label: 'Eu', targets: ['eu'] },
				  		  { key: 'tu', label: 'Tu', targets: ['tu'] },
				  		  { key: 'ele', label: 'Ele/Ela', targets: ['ele', 'ela', 'ele/ela'] },
				  		  { key: 'nos', label: 'Nós', targets: ['nos', 'nós'] },
				  		  { key: 'vos', label: 'Vós', targets: ['vos', 'vós'] },
				  		  { key: 'eles', label: 'Eles/Elas', targets: ['eles', 'elas', 'eles/elas'] }
				  		].map(personObj => {
				  		  // Procura na lista de conjugações ignorando acentos e maiúsculas
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
				  			<div key={personObj.key} style={{ background: '#fff', padding: '6px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
				  			  <strong>{personObj.label}:</strong> {match ? match.conjugated_form : '-'}
				  			</div>
				  		  );
				  		})}
				  	  </div>
				  	</td>
				    </tr>
				  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
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