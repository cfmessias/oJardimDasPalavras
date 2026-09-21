(function () {
  // Garante o acesso aos hooks do React global
  const { useState, useEffect } = React;

  function TeacherDashboardView(props) {
    const {
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
      // Frases (passadas via props se necessário)
      PhrasesTab,
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
    } = props;

    // Resolve componentes globais se não forem passados diretamente via props
    const ActualPhrasesTab = PhrasesTab || window.PhrasesTab || (() => <div>Componente PhrasesTab não encontrado.</div>);
    const ActualVerbsTab = VerbsTab || window.VerbsTab || (() => <div>Componente VerbsTab não encontrado.</div>);
    const ActualVerbCatalogTab = VerbCatalogTab || window.VerbCatalogTab || (() => <div>Componente VerbCatalogTab não encontrado.</div>);
    const ActualStudentsTab = props.StudentsTab || window.StudentsTab || (() => <div>Componente StudentsTab não encontrado.</div>);
    const ActualVocabularyTab = props.VocabularyTab || window.VocabularyTab || (() => <div>Componente VocabularyTab não encontrado.</div>);
    const ActualGrammarTab = props.GrammarTab || window.GrammarTab || (() => <div>Componente GrammarTab não encontrado.</div>);
    
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
                    {["A1", "A2", "B1"].map((level) => (
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
            <ActualStudentsTab {...props} />
          )}

          {/* 2. SEPARADOR: VOCABULÁRIO (PALAVRAS) */}
          {dashboardTab === "palavras" && (
            <ActualVocabularyTab {...props} />
          )}

          {/* 3. SEPARADOR: FRASES (Modularizado no componente externo PhrasesTab) */}
          {dashboardTab === "frases" && (
            <ActualPhrasesTab {...props} />
          )}

          {/* 4. SEPARADOR: VERBOS */}
          {dashboardTab === "verbos" && (
            <ActualVerbsTab {...props} />
          )}

          {/* 4.1. SEPARADOR: CATÁLOGO & CONJUGAÇÕES */}
          {dashboardTab === "catalogo_verbos" && (
            <ActualVerbCatalogTab />
          )}

          {/* 5. SEPARADOR: GRAMÁTICA */}
          {dashboardTab === "gramatica" && (
            <ActualGrammarTab {...props} />
          )}

        </div>
      </div>
    );
  }

  window.TeacherDashboardView = TeacherDashboardView;
})();