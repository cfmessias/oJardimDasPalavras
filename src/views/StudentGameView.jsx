(function () {
  function StudentGameView({
    selectedStudent,
    selectedModuleId,
    setSelectedModuleId,
    teacher,
    setCurrentView,
    setSelectedStudent,
    words = [],
    plnnExercises = [],
    handleModuleComplete
  }) {
    const studentGrade = Number(selectedStudent?.grade || 1);
    const activeModuleId = selectedModuleId || 1;

    // Lista de módulos disponíveis dependendo do Ano (Inclui o Módulo 4: Verbos & Ações)
   const availableModules = [
  { 
    id: 1, 
    title: studentGrade <= 2 ? "🔍 Descobre a Palavra" : "📐 Gramática",
    desc: studentGrade <= 2 ? "Nomeia imagens e objetos" : "Nomes, adjetivos e tempos verbais"
  },
  { 
    id: 2, 
    title: studentGrade <= 2 ? "✏️ Letra em Falta" : "🧩 Construção de Frases",
    desc: studentGrade <= 2 ? "Completa o abecedário" : "Ordenação e conectores lógicos"
  },
  { 
    id: 3, 
    title: studentGrade <= 2 ? "📖 Completa a Frase" : "📚 Leitura e Interpretação",
    desc: studentGrade <= 2 ? "Escolha de palavras simples" : "Textos, notícias e vocabulário"
  },
  { 
    id: 4, 
    title: studentGrade <= 2 ? "⚡ Verbos em Ação" : "🗣️ Verbos e Expressões",
    desc: studentGrade <= 2 ? "Ações do dia a dia" : "Conjuntivo, imperativo e rotinas"
  }
];

    // Roteamento Dinâmico dos Componentes do exercises.js
    // Roteamento Dinâmico dos Componentes
    const renderActiveExercise = () => {
      const studentLevel = selectedStudent?.plnn_level || 'A1';

      // 1.º ANO
      if (studentGrade === 1) {
        if (activeModuleId === 1 && typeof Grade1Module1 !== 'undefined') return <Grade1Module1 words={words} />;
        if (activeModuleId === 2 && typeof MissingLetterList !== 'undefined') return <MissingLetterList words={words} onComplete={() => handleModuleComplete && handleModuleComplete(2)} />;
        if (activeModuleId === 3 && typeof Grade1Module3 !== 'undefined') return <Grade1Module3 words={words} onComplete={() => handleModuleComplete && handleModuleComplete(3)} />;
        if (activeModuleId === 4 && typeof VerbExerciseView !== 'undefined') return <VerbExerciseView grade={studentGrade} level={studentLevel} />;
      }

      // 2.º ANO
      if (studentGrade === 2) {
        if (activeModuleId === 1 && typeof Grade1Module1 !== 'undefined') return <Grade1Module1 words={words} />;
        if (activeModuleId === 2 && typeof MissingLetterList !== 'undefined') return <MissingLetterList words={words} onComplete={() => handleModuleComplete && handleModuleComplete(2)} />;
        if (activeModuleId === 3 && typeof Grade2Module3 !== 'undefined') return <Grade2Module3 words={words} onComplete={() => handleModuleComplete && handleModuleComplete(3)} />;
        if (activeModuleId === 4 && typeof VerbExerciseView !== 'undefined') return <VerbExerciseView grade={studentGrade} level={studentLevel} />;
      }

      // 3.º ao 6.º ANO (PLNM)
      // A tabela plnn_exercises identifica o módulo pelo campo module_type
      // (texto), não por um module_id numérico — por isso mapeamos o id do
      // módulo ativo para o tipo correspondente antes de filtrar.
      
      const MODULE_TYPE_BY_ID = {
        1: 'Gramática',
        2: 'Frases',
        3: 'Leitura'
      };
      const activeModuleType = MODULE_TYPE_BY_ID[activeModuleId];

      // Filtra os exercícios pertencentes à Aba/Módulo selecionado
      const moduleExercises = plnnExercises.filter(ex => ex.module_type === activeModuleType);


      if (activeModuleId === 1 && typeof Grade3Module1 !== 'undefined') {
        return <Grade3Module1 exercises={moduleExercises} onComplete={() => handleModuleComplete && handleModuleComplete(1)} />;
      }
      if (activeModuleId === 2 && typeof Grade3Module2 !== 'undefined') {
        return <Grade3Module2 exercises={moduleExercises} onComplete={() => handleModuleComplete && handleModuleComplete(2)} />;
      }
      if (activeModuleId === 3 && typeof Grade4Module3 !== 'undefined') {
        return <Grade4Module3 exercises={moduleExercises} onComplete={() => handleModuleComplete && handleModuleComplete(3)} />;
      }
      if (activeModuleId === 4 && typeof VerbExerciseView !== 'undefined') {
        return <VerbExerciseView grade={studentGrade} level={studentLevel} />;
      }

      // Fallback padrão se não houver componente específico
      return typeof Grade1Module1 !== 'undefined' ? <Grade1Module1 words={words} /> : <div>A carregar exercício...</div>;
    };

    return (
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '16px' }}>
        <div className="card" style={{ padding: '24px' }}>
          
          {/* Cabeçalho */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0 }}>Jardim de {selectedStudent?.name}</h2>
              <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                {studentGrade}.º Ano {studentGrade >= 3 && `• Nível PLNM: ${selectedStudent?.plnn_level || 'A1'}`}
              </span>
            </div>

            {teacher ? (
              <button onClick={() => setCurrentView("dashboard")} className="btn btn-outline">
                ← Voltar ao Painel
              </button>
            ) : (
              <button 
                onClick={() => { 
                  setSelectedStudent && setSelectedStudent(null); 
                  setCurrentView("student_select"); 
                }} 
                className="btn btn-outline"
              >
                Sair
              </button>
            )}
          </div>

          {/* SELETOR DE MÓDULOS */}
          <div style={{ marginBottom: '20px', backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '12px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4B5563', display: 'block', marginBottom: '8px' }}>
              Escolhe o Módulo de Aprendizagem:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {availableModules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId && setSelectedModuleId(mod.id)}
                  className={`btn ${activeModuleId === mod.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    backgroundColor: activeModuleId === mod.id ? '#F2704E' : '#FFFFFF',
                    color: activeModuleId === mod.id ? '#FFFFFF' : '#374151',
                    fontSize: '0.9rem'
                  }}
                >
                  {mod.title}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #E5E7EB' }} />

          {/* ÁREA PRINCIPAL DO EXERCÍCIO */}
          <div style={{ marginTop: '16px' }}>
            {renderActiveExercise()}
          </div>

        </div>
      </div>
    );
  }

  window.StudentGameView = StudentGameView;
})();