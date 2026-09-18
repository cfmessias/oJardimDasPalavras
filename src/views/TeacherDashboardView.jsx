(function () {
  function TeacherDashboardView({
    teacher,
    handleLogout,
    dashboardTab,
    setDashboardTab,
    openWordsTab,
    openPhrasesTab,
    openVerbsTab,
    openGrammarTab,
    selectedGrade,
    setSelectedGrade,
    setNewStudentGrade,
    setWordGrade,
    selectedPlnnLevel,
    setSelectedPlnnLevel,
    setNewStudentPlnnLevel,
    setWordPlnnLevel,
    // Alunos
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
    setCurrentView,
    // Vocabulário
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
    handleDeleteWord,
    // Frases
    editingPhraseId,
    handlePhraseSubmit,
    phraseText,
    setPhraseText,
    phraseTargetWord,
    setPhraseTargetWord,
    phraseType,
    setPhraseType,
    savingPhrase,
    clearPhraseForm,
    phrases = [],
    startEditPhrase,
    handleDeletePhrase,
    // Componentes externos de Verbos
    VerbsTab,
    VerbCatalogTab,
    // Gramática
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
  }) {
    // Resolve componentes de Verbos globais se não forem passados por props
    const ActualVerbsTab = VerbsTab || window.VerbsTab || (() => <div>Componente VerbsTab não encontrado.</div>);
    const ActualVerbCatalogTab = VerbCatalogTab || window.VerbCatalogTab || (() => <div>Componente VerbCatalogTab não encontrado.</div>);

    return (
      <div className="container">
        <div className="card">
          {/* Cabeçalho do Professor */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>👨‍🏫 Painel do Professor</h2>
            <button onClick={handleLogout} className="btn btn-outline">Sair</button>
          </div>
          <p>Prof. {teacher?.name} ({teacher?.school || "Escola"})</p>

          {/* Navegação por Separadores */}
          <div style={{ display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap', borderBottom: '2px solid #e5e7eb', paddingBottom: '12px' }}>
            <button
              type="button"
              className={`btn ${dashboardTab === "alunos" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setDashboardTab("alunos")}
            >
              👥 Alunos
            </button>
            <button
              type="button"
              className={`btn ${dashboardTab === "palavras" ? "btn-primary" : "btn-outline"}`}
              onClick={openWordsTab}
            >
              🔤 Vocabulário
            </button>
            <button
              type="button"
              className={`btn ${dashboardTab === "frases" ? "btn-primary" : "btn-outline"}`}
              onClick={openPhrasesTab}
            >
              📖 Frases
            </button>
            <button
              type="button"
              className={`btn ${dashboardTab === "verbos" ? "btn-primary" : "btn-outline"}`}
              onClick={openVerbsTab}
            >
              🗣️ Verbos
            </button>

            <button
              type="button"
              className={`btn ${dashboardTab === "catalogo_verbos" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setDashboardTab("catalogo_verbos")}
            >
              📖 Catálogo
            </button>

            <button
              type="button"
              className={`btn ${dashboardTab === "gramatica" ? "btn-primary" : "btn-outline"}`}
              onClick={openGrammarTab}
            >
              📐 Gramática
            </button>
          </div>

          {/* BARRA DE FILTROS GLOBAIS (Oculta no Catálogo de Verbos) */}
          {dashboardTab !== "catalogo_verbos" && (
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {/* Filtro por Ano Escolar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#374151', minWidth: '100px' }}>Ano Escolar:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[1, 2, 3, 4, 5, 6].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        className={`btn ${Number(selectedGrade) === grade ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '20px' }}
                        onClick={() => {
                          setSelectedGrade && setSelectedGrade(grade);
                          setNewStudentGrade && setNewStudentGrade(grade);
                          setWordGrade && setWordGrade(grade);
                        }}
                      >
                        {grade}.º Ano
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Nível PLNM */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#374151', minWidth: '100px' }}>Nível PLNM:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {["A1", "A2", "B1", "B2"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`btn ${selectedPlnnLevel === level ? 'btn-primary' : 'btn-outline'}`}
                        style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '20px' }}
                        onClick={() => {
                          setSelectedPlnnLevel && setSelectedPlnnLevel(level);
                          setNewStudentPlnnLevel && setNewStudentPlnnLevel(level);
                          setWordPlnnLevel && setWordPlnnLevel(level);
                        }}
                      >
                        Nível {level}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 1. SEPARADOR: ALUNOS */}
          {dashboardTab === "alunos" && (
            <React.Fragment>
              <h3>{editingStudentId ? "Editar Aluno" : `Criar Novo Aluno para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}</h3>

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

              <h3>
                Alunos Registados ({
                  students.filter(s => Number(s.grade) === Number(selectedGrade) && (s.plnn_level || 'A1') === selectedPlnnLevel).length
                })
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                {students
                  .filter(s => Number(s.grade) === Number(selectedGrade) && (s.plnn_level || 'A1') === selectedPlnnLevel)
                  .map((student) => (
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

              <button className="btn btn-outline" style={{ marginTop: '24px' }} onClick={() => setCurrentView("student_select")}>
                Ver Visão do Aluno
              </button>
            </React.Fragment>
          )}

          {/* 2. SEPARADOR: VOCABULÁRIO (PALAVRAS) */}
          {dashboardTab === "palavras" && (
            <React.Fragment>
              <h3>{editingWordId ? "Editar Palavra" : `Adicionar Palavra para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}</h3>

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

              <h3>
                Palavras Registadas ({
                  allWords.filter(w => Number(w.grade) === Number(selectedGrade) && (w.plnn_level || 'A1') === selectedPlnnLevel).length
                })
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                {allWords
                  .filter(w => Number(w.grade) === Number(selectedGrade) && (w.plnn_level || 'A1') === selectedPlnnLevel)
                  .map((w) => (
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
            </React.Fragment>
          )}

          {/* 3. SEPARADOR: FRASES */}
          {dashboardTab === "frases" && (
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4b5563' }}>Palavra-Alvo / Lacuna (opcional)</label>
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
                    {editingPhraseId ? "Guardar alterações" : "Adicionar frase"}
                  </button>
                  {editingPhraseId && (
                    <button type="button" className="btn btn-outline" onClick={clearPhraseForm}>
                      Cancelar edição
                    </button>
                  )}
                </div>
              </form>

              <hr style={{ margin: '24px 0' }} />

              <h3>
                Frases Registadas ({
                  phrases.filter(p => Number(p.grade) === Number(selectedGrade) && (p.plnn_level || 'A1') === selectedPlnnLevel).length
                })
              </h3>

              <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                {phrases
                  .filter(p => Number(p.grade) === Number(selectedGrade) && (p.plnn_level || 'A1') === selectedPlnnLevel)
                  .map((p) => (
                    <div key={p.id} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#111827' }}>{p.phrase_text}</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.8rem', color: '#6b7280' }}>
                          <span>Tipo: <strong>{p.type || 'leitura'}</strong></span>
                          {p.target_word && <span style={{ color: '#059669' }}>Palavra-alvo: <strong>{p.target_word}</strong></span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" className="link-btn" onClick={() => startEditPhrase(p)}>Editar</button>
                        <button type="button" className="link-btn" onClick={() => handleDeletePhrase(p.id)}>Remover</button>
                      </div>
                    </div>
                  ))}
              </div>
            </React.Fragment>
          )}

          {/* 4. SEPARADOR: VERBOS */}
          {dashboardTab === "verbos" && (
            <ActualVerbsTab />
          )}

          {/* 4.1. SEPARADOR: CATÁLOGO & CONJUGAÇÕES */}
          {dashboardTab === "catalogo_verbos" && (
            <ActualVerbCatalogTab />
          )}

          {/* 5. SEPARADOR: GRAMÁTICA */}
          {dashboardTab === "gramatica" && (
            <React.Fragment>
              <h3>{editingGrammarId ? "Editar Parâmetro Gramatical" : `Adicionar Regra Gramatical para ${selectedGrade}.º Ano (${selectedPlnnLevel || 'A1'})`}</h3>

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

              <h3>
                Regras Registadas ({
                  grammarList.filter(g => Number(g.grade) === Number(selectedGrade) && (g.plnn_level || 'A1') === selectedPlnnLevel).length
                })
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
                {grammarList
                  .filter(g => Number(g.grade) === Number(selectedGrade) && (g.plnn_level || 'A1') === selectedPlnnLevel)
                  .map((g) => (
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
            </React.Fragment>
          )}

        </div>
      </div>
    );
  }

  window.TeacherDashboardView = TeacherDashboardView;
})();