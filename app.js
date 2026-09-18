// app.js - Fluxo principal, Estado Global e Inicialização (Com Suporte PLNN A1-B2)
const { useState, useEffect } = React;

function App() {
 // Verifica se o URL contém "?prof"
  const isProfUrl = window.location.search.includes("prof");

  // Estado Global
  const [isRegistering, setIsRegistering] = useState(() => {
    return isProfUrl;
  });

  const [regName, setRegName] = useState("");
  const [regSchool, setRegSchool] = useState("");

  // Só carrega o professor do localStorage se estivermos no URL "?prof"
  const [teacher, setTeacher] = useState(() => {
    if (!isProfUrl) return null;
    const saved = localStorage.getItem("jardim_teacher");
    return saved ? JSON.parse(saved) : null;
  });

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(1); 
  const [newStudentPlnmLevel, setNewStudentPlnmLevel] = useState("A1"); // Alterado para PLNM
  const [words, setWords] = useState([]);
  const [plnnExercises, setPlnnExercises] = useState([]); // Alterado para PLNM
  const [progress, setProgress] = useState({});
  const [currentWord, setCurrentWord] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedPlnnLevel, setSelectedPlnnLevel] = useState("A1"); // Alterado para PLNM

  // Define a vista inicial: se for URL de prof e já tiver sessão, vai para "dashboard"; senão vai para "auth"
  const [currentView, setCurrentView] = useState(() => {
    if (isProfUrl) {
      const saved = localStorage.getItem("jardim_teacher");
      return saved ? "dashboard" : "auth"; // Alterado de "teacher_login" para "auth"
    }
    return "student_select";
  });

  // Estados para Frases
  const [phrases, setPhrases] = React.useState([]);
  const [editingPhraseId, setEditingPhraseId] = React.useState(null);
  const [phraseText, setPhraseText] = React.useState('');
  const [phraseTargetWord, setPhraseTargetWord] = React.useState('');
  const [phraseType, setPhraseType] = React.useState('leitura');
  const [savingPhrase, setSavingPhrase] = React.useState(false);
  
  // Estados para Verbos
  const [verbs, setVerbs] = React.useState([]);
  
  // Estados para Gramática
  const [grammarList, setGrammarList] = React.useState([]);
  const [editingGrammarId, setEditingGrammarId] = React.useState(null);
  const [grammarCategory, setGrammarCategory] = React.useState('Género');
  const [grammarBaseWord, setGrammarBaseWord] = React.useState('');
  const [grammarTargetWord, setGrammarTargetWord] = React.useState('');
  const [grammarFeatureType, setGrammarFeatureType] = React.useState('');
  const [savingGrammar, setSavingGrammar] = React.useState(false);
 
  const [editingStudentId, setEditingStudentId] = useState(null);
  // Formulários do Professor
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentPin, setNewStudentPin] = useState("");
  const [newStudentGrade, setNewStudentGrade] = useState("1");

  const [dashboardTab, setDashboardTab] = useState("alunos");
  const [allWords, setAllWords] = useState([]);
  const [editingWordId, setEditingWordId] = useState(null);
  const [wordText, setWordText] = useState("");
  const [wordGrade, setWordGrade] = useState("1");
  const [wordEmoji, setWordEmoji] = useState("");
  const [wordHint, setWordHint] = useState("");
  const [wordBlankBefore, setWordBlankBefore] = useState("");
  const [wordBlankAfter, setWordBlankAfter] = useState("");
  const [savingWord, setSavingWord] = useState(false);

  const [wordPlnnLevel, setWordPlnnLevel] = useState("A1");
  // Carregar alunos e sessão ao iniciar
  useEffect(() => {
    async function initApp() {
      const { data } = await supabase.from('students').select('*').order('name');
      if (data) setStudents(data);

      const savedTeacher = getStoredTeacherSession();
      if (savedTeacher) {
        setTeacher(savedTeacher);
      }
    }
    initApp();
  }, []);

// Carregar os verbos da turma sempre que o Ano ou Nível PLNM mudar
  React.useEffect(() => {
    async function loadVerbsForCurrentLevel() {
      if (selectedGrade) {
        const verbosDaTurma = await VerbsService.getVerbsByLevel(selectedGrade, selectedPlnnLevel);
        setVerbs(verbosDaTurma);
      }
    }
    loadVerbsForCurrentLevel();
  }, [selectedGrade, selectedPlnnLevel]);

  const loadTeacherStudents = async (teacherId) => {
    const list = await getStudentsByTeacher(teacherId);
    setStudents(list);
  };

  // Ações do Professor
  const handleLogout = async () => {
    await logoutTeacher();
    setTeacher(null);
    setSelectedStudent(null);
    const { data } = await supabase.from('students').select('*').order('name');
    if (data) setStudents(data);
    setCurrentView("student_select");
  };
 // Preenche o formulário com os dados do aluno a editar
  const startEditStudent = (student) => {
    setEditingStudentId(student.id);
    setNewStudentName(student.name);
    setNewStudentPin(student.pin || "");
    setNewStudentGrade(student.grade?.toString() || "1");
    setNewStudentPlnnLevel(student.plnn_level || "A1");
  };
  
  // Limpa o formulário e cancela o modo de edição
  const clearStudentForm = () => {
    setEditingStudentId(null);
    setNewStudentName("");
    setNewStudentPin("");
    setNewStudentGrade("1");
    setNewStudentPlnnLevel("A1");
  };
  
  // SUSTITUIR a função handleCreateStudent por esta:
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!teacher) return;

    try {
      const payload = {
        name: newStudentName,
        pin: newStudentPin,
        grade: Number(newStudentGrade),
        plnn_level: newStudentPlnnLevel,
        teacher_id: teacher.id
      };

      if (editingStudentId) {
        // Modo Edição: UPDATE na tabela 'students'
        const { error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', editingStudentId);

        if (error) throw error;
      } else {
        // Modo Criação: INSERT na tabela 'students'
        const { error } = await supabase
          .from('students')
          .insert([payload]);

        if (error) throw error;
      }

      // Recarrega a lista atualizada e limpa os campos
      const { data } = await supabase.from('students').select('*').order('name');
      if (data) setStudents(data);
      clearStudentForm();

    } catch (err) {
      alert("Erro ao guardar aluno: " + err.message);
    }
  };

  
  const openWordsTab = async () => {
    setDashboardTab("palavras");
    setAllWords(await getAllWords());
  };
  
  const clearWordForm = () => {
  setEditingWordId(null);
  setWordText("");
  setWordGrade("1");
  setWordPlnnLevel("A1");
  setWordEmoji("");
  setWordHint("");
  setWordBlankBefore("");
  setWordBlankAfter("");
};

const startEditWord = (w) => {
  setEditingWordId(w.id);
  setWordText(w.word);
  setWordGrade(String(w.grade));
  setWordPlnnLevel(w.plnn_level || "A1");
  setWordEmoji(w.emoji || "");
  setWordHint(w.hint || "");
  setWordBlankBefore(w.blank_before || "");
  setWordBlankAfter(w.blank_after || "");
};

const handleWordSubmit = async (e) => {
  e.preventDefault();
  const payload = {
    word: wordText.trim(),
    grade: Number(wordGrade),
    plnn_level: wordPlnnLevel,
    emoji: wordEmoji.trim(),
    hint: wordHint.trim(),
    blankBefore: wordBlankBefore,
    blankAfter: wordBlankAfter,
  };

  if (!payload.word || !payload.emoji || !payload.hint) return;

  setSavingWord(true);
  try {
    if (editingWordId) {
      await updateWord(editingWordId, payload);
    } else {
      await createWord(payload);
    }
    clearWordForm();
    setAllWords(await getAllWords());
  } catch (err) {
    alert("Erro ao guardar palavra: " + err.message);
  } finally {
    setSavingWord(false);
  }
};
  
  const handleDeleteWord = async (id) => {
    if (!confirm("Remover esta palavra? O progresso dos alunos nesta palavra também será apagado.")) {
      return;
    }
    await deleteWord(id);
    setAllWords(await getAllWords());
  };

  // ---------- Frases ----------
  const openPhrasesTab = async () => {
    setDashboardTab("frases");
    const { data } = await supabase.from('phrases').select('*').order('id');
    if (data) setPhrases(data);
  };

  const clearPhraseForm = () => {
    setEditingPhraseId(null);
    setPhraseText('');
    setPhraseTargetWord('');
    setPhraseType('leitura');
  };

  const startEditPhrase = (p) => {
    setEditingPhraseId(p.id);
    setPhraseText(p.phrase_text || '');
    setPhraseTargetWord(p.target_word || '');
    setPhraseType(p.type || 'leitura');
  };

  const handlePhraseSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      phrase_text: phraseText.trim(),
      target_word: phraseTargetWord.trim(),
      type: phraseType,
      grade: Number(selectedGrade),
      plnn_level: selectedPlnnLevel || 'A1',
    };
    if (!payload.phrase_text) return;

    setSavingPhrase(true);
    try {
      if (editingPhraseId) {
        const { error } = await supabase.from('phrases').update(payload).eq('id', editingPhraseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('phrases').insert([payload]);
        if (error) throw error;
      }
      clearPhraseForm();
      const { data } = await supabase.from('phrases').select('*').order('id');
      if (data) setPhrases(data);
    } catch (err) {
      alert("Erro ao guardar frase: " + err.message);
    } finally {
      setSavingPhrase(false);
    }
  };

  const handleDeletePhrase = async (id) => {
    if (!confirm("Remover esta frase?")) return;
    const { error } = await supabase.from('phrases').delete().eq('id', id);
    if (error) {
      alert("Erro ao remover frase: " + error.message);
      return;
    }
    setPhrases(prev => prev.filter(p => p.id !== id));
  };

  // ---------- Verbos ----------
  const openVerbsTab = () => {
  setDashboardTab("verbos");
};
 
  // ---------- Gramática ----------
  const openGrammarTab = async () => {
    setDashboardTab("gramatica");
    const { data } = await supabase.from('grammar').select('*').order('id');
    if (data) setGrammarList(data);
  };

  const clearGrammarForm = () => {
    setEditingGrammarId(null);
    setGrammarCategory('Género');
    setGrammarBaseWord('');
    setGrammarTargetWord('');
    setGrammarFeatureType('');
  };

  const startEditGrammar = (g) => {
    setEditingGrammarId(g.id);
    setGrammarCategory(g.category || 'Género');
    setGrammarBaseWord(g.base_word || '');
    setGrammarTargetWord(g.target_word || '');
    setGrammarFeatureType(g.feature_type || '');
  };

  const handleGrammarSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category: grammarCategory,
      base_word: grammarBaseWord.trim(),
      target_word: grammarTargetWord.trim(),
      feature_type: grammarFeatureType.trim(),
      grade: Number(selectedGrade),
      plnn_level: selectedPlnnLevel || 'A1',
    };
    if (!payload.base_word || !payload.target_word) return;

    setSavingGrammar(true);
    try {
      if (editingGrammarId) {
        const { error } = await supabase.from('grammar').update(payload).eq('id', editingGrammarId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('grammar').insert([payload]);
        if (error) throw error;
      }
      clearGrammarForm();
      const { data } = await supabase.from('grammar').select('*').order('id');
      if (data) setGrammarList(data);
    } catch (err) {
      alert("Erro ao guardar regra gramatical: " + err.message);
    } finally {
      setSavingGrammar(false);
    }
  };

  const handleDeleteGrammar = async (id) => {
    if (!confirm("Remover esta regra gramatical?")) return;
    const { error } = await supabase.from('grammar').delete().eq('id', id);
    if (error) {
      alert("Erro ao remover regra: " + error.message);
      return;
    }
    setGrammarList(prev => prev.filter(g => g.id !== id));
  };

  // Ações do Aluno e Carregamento de Exercícios por Nível PLNN
  // REMOVER as funções: fetchPlnnExercises e handleLevelChange

// SUBSTITUIR a função handleSelectStudent por esta:
const handleSelectStudent = async (student) => {
  const pin = prompt(`Digita o teu PIN para entrar, ${student.name}:`);
  if (!pin) return;

  const validated = await verifyStudentPin(student.id, pin);
  if (!validated) {
    alert("PIN incorreto!");
    return;
  }

  setSelectedStudent(validated);
  const gradeNum = Number(validated.grade);
  // Lê diretamente o nível gravado na ficha do aluno
  const studentPlnnLevel = validated.plnn_level || "A1";

  if (gradeNum <= 2) {
    const studentWords = await getWordsByGrade(gradeNum);
    setWords(studentWords);
  } else {
    // Procura na tabela pelo ano e pelo nível atribuído ao aluno
    const { data } = await supabase
      .from('plnn_exercises')
      .select('*')
      .eq('grade', gradeNum)
      .eq('plnn_level', studentPlnnLevel)
      .order('id');

    setPlnnExercises(data || []);
  }

  const studentProgress = await getStudentProgress(validated.id);
  setProgress(studentProgress);
  setCurrentView("game");
};

   const handleModuleComplete = (moduleId) => {
    alert(`Módulo ${moduleId} concluído com sucesso! ⭐`);
  };

  const filteredStudents = students.filter(s => Number(s.grade) === Number(selectedGrade));

  // 1. ECRÃ INICIAL: Seleção do Aluno
  if (currentView === "student_select") {
    return (
      <StudentSelectView
        selectedGrade={selectedGrade}
        setSelectedGrade={setSelectedGrade}
        filteredStudents={filteredStudents}
        handleSelectStudent={handleSelectStudent}
      />
    );
  }

  // 2. ECRÃ: Autenticação do Professor
  if (currentView === "auth") {
    const handleAuthSubmit = async (e) => {
      e.preventDefault();
      try {
        if (isRegistering) {
          const newTeacher = await registerTeacher(loginEmail, loginPin, regName, regSchool);
          alert("Conta de professor criada com sucesso!");
          setTeacher(newTeacher);
          saveTeacherSession(newTeacher);
          await loadTeacherStudents(newTeacher.id);
          setCurrentView("dashboard");
        } else {
          const loggedTeacher = await loginTeacher(loginEmail, loginPin);
          setTeacher(loggedTeacher);
          saveTeacherSession(loggedTeacher);
          await loadTeacherStudents(loggedTeacher.id);
          setCurrentView("dashboard");
        }
      } catch (err) {
        alert("Erro na autenticação: " + err.message);
      }
    };

    return (
      <AuthView
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        regName={regName}
        setRegName={setRegName}
        regSchool={regSchool}
        setRegSchool={setRegSchool}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPin={loginPin}
        setLoginPin={setLoginPin}
        handleAuthSubmit={handleAuthSubmit}
        setCurrentView={setCurrentView}
      />
    );
  }

  // 3. ECRÃ: Painel do Professor (Dashboard)
  if (currentView === "dashboard") {
  return (
    <TeacherDashboardView
      teacher={teacher}
      handleLogout={handleLogout}
      dashboardTab={dashboardTab}
      setDashboardTab={setDashboardTab}
      openWordsTab={openWordsTab}
      openPhrasesTab={openPhrasesTab}
      openVerbsTab={openVerbsTab}
      openGrammarTab={openGrammarTab}
      selectedGrade={selectedGrade}
      setSelectedGrade={setSelectedGrade}
      setNewStudentGrade={setNewStudentGrade}
      setWordGrade={setWordGrade}
      selectedPlnnLevel={selectedPlnnLevel}
      setSelectedPlnnLevel={setSelectedPlnnLevel}
      setNewStudentPlnnLevel={setNewStudentPlnnLevel}
      setWordPlnnLevel={setWordPlnnLevel}
      // Alunos
      editingStudentId={editingStudentId}
      handleStudentSubmit={handleStudentSubmit}
      newStudentName={newStudentName}
      setNewStudentName={setNewStudentName}
      newStudentPin={newStudentPin}
      setNewStudentPin={setNewStudentPin}
      clearStudentForm={clearStudentForm}
      students={students}
      startEditStudent={startEditStudent}
      handleDeleteStudent={handleDeleteStudent}
      setCurrentView={setCurrentView}
      // Vocabulário
      editingWordId={editingWordId}
      handleWordSubmit={handleWordSubmit}
      wordText={wordText}
      setWordText={setWordText}
      wordEmoji={wordEmoji}
      setWordEmoji={setWordEmoji}
      wordHint={wordHint}
      setWordHint={setWordHint}
      wordBlankBefore={wordBlankBefore}
      setWordBlankBefore={setWordBlankBefore}
      wordBlankAfter={wordBlankAfter}
      setWordBlankAfter={setWordBlankAfter}
      savingWord={savingWord}
      clearWordForm={clearWordForm}
      allWords={allWords}
      startEditWord={startEditWord}
      handleDeleteWord={handleDeleteWord}
      // Frases
      editingPhraseId={editingPhraseId}
      handlePhraseSubmit={handlePhraseSubmit}
      phraseText={phraseText}
      setPhraseText={setPhraseText}
      phraseTargetWord={phraseTargetWord}
      setPhraseTargetWord={setPhraseTargetWord}
      phraseType={phraseType}
      setPhraseType={setPhraseType}
      savingPhrase={savingPhrase}
      clearPhraseForm={clearPhraseForm}
      phrases={phrases}
      startEditPhrase={startEditPhrase}
      handleDeletePhrase={handleDeletePhrase}
      // Gramática
      editingGrammarId={editingGrammarId}
      handleGrammarSubmit={handleGrammarSubmit}
      grammarCategory={grammarCategory}
      setGrammarCategory={setGrammarCategory}
      grammarBaseWord={grammarBaseWord}
      setGrammarBaseWord={setGrammarBaseWord}
      grammarTargetWord={grammarTargetWord}
      setGrammarTargetWord={setGrammarTargetWord}
      grammarFeatureType={grammarFeatureType}
      setGrammarFeatureType={setGrammarFeatureType}
      savingGrammar={savingGrammar}
      clearGrammarForm={clearGrammarForm}
      grammarList={grammarList}
      startEditGrammar={startEditGrammar}
      handleDeleteGrammar={handleDeleteGrammar}
    />
  );
}
  // 4. ECRÃ: Visão do Aluno / Jogo Pedagógico PLNN
  if (currentView === "game") {
    const studentGrade = Number(selectedStudent?.grade || 1);
    const activeModuleId = selectedModuleId || 1;

    // Lista de módulos disponíveis dependendo do Ano
    const availableModules = [
      { id: 1, title: studentGrade <= 2 ? "Descobre a Palavra" : "Gramática & Concordância" },
      { id: 2, title: studentGrade <= 2 ? "Letra em Falta" : "Construção de Frases" },
      { id: 3, title: studentGrade <= 2 ? "Completa a Frase" : "Leitura & Interpretação" }
    ];

    // Roteamento Dinâmico dos Componentes do exercises.js
    const renderActiveExercise = () => {
      // 1.º e 2.º ANO (Lógica de Vocabulário & Leitura Inicial)
      if (studentGrade === 1) {
        if (activeModuleId === 1) return <Grade1Module1 words={words} />;
        if (activeModuleId === 2) return <MissingLetterList words={words} onComplete={() => handleModuleComplete(2)} />;
        if (activeModuleId === 3) return <Grade1Module3 words={words} onComplete={() => handleModuleComplete(3)} />;
      }

      if (studentGrade === 2) {
        if (activeModuleId === 1) return <MissingLetterList words={words} onComplete={() => handleModuleComplete(1)} />;
        if (activeModuleId === 2) return <Grade2Module2 words={words} onComplete={() => handleModuleComplete(2)} />;
        if (activeModuleId === 3) return <Grade2Module3 words={words} onComplete={() => handleModuleComplete(3)} />;
      }

      // 3.º ao 6.º ANO (Lógica de Módulos PLNN: A1, A2, B1, B2)
      const moduleExercises = plnnExercises.filter(ex => ex.module_id === activeModuleId);

      if (activeModuleId === 1) {
        return <Grade3Module1 exercises={moduleExercises} onComplete={() => handleModuleComplete(1)} />;
      }
      if (activeModuleId === 2) {
        return <Grade3Module2 exercises={moduleExercises} onComplete={() => handleModuleComplete(2)} />;
      }
      if (activeModuleId === 3) {
        return <Grade4Module3 exercises={moduleExercises} onComplete={() => handleModuleComplete(3)} />;
      }

      return <Grade1Module1 words={words} />;
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
                  setSelectedStudent(null); 
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
                  onClick={() => setSelectedModuleId(mod.id)}
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
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}
