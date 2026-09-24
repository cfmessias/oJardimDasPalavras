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
  const [phraseCategory, setPhraseCategory] = useState('Verbo');
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
  const handleDeleteStudent = async (studentId) => {
  if (!window.confirm("Tem a certeza que deseja remover este aluno?")) return;

	try {
		const { error } = await supabase
		.from('students')
		.delete()
		.eq('id', studentId);
	
		if (error) throw error;
	
		// Atualiza o estado local removendo o aluno
		setStudents(prev => prev.filter(s => s.id !== studentId));
	} catch (err) {
		console.error("Erro ao remover aluno:", err);
		alert("Erro ao remover o aluno.");
	}
  };	
  const [newStudentPlnnLevel, setNewStudentPlnnLevel] = React.useState("A1");
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
// Função auxiliar para padronizar os registos da BD para o estado das frases
  const mapGrammarToPhrases = (data) => {
    return (data || []).map((item) => ({
      ...item,
      phrase_text: item.base_word,           // Mapeia base_word para phrase_text
      phrase_target_word: item.target_word, // Mapeia target_word
      type: item.feature_type               // Mapeia feature_type
    }));
  };

  const openPhrasesTab = async () => {
    setDashboardTab("frases");
    const { data, error } = await supabase
      .from('plnn_exercises')
      .select('*')
      .eq('module_type', 'Frases') // Filtra pela nova designação da aba
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhrases(data);
    }
  };

  const clearPhraseForm = () => {
    setPhraseText('');
    setPhraseTargetWord('');
    setPhraseType('leitura');
    setPhraseCategory('Verbo'); // Reseta a categoria
    setEditingPhraseId(null);
  };

  const handleEditPhrase = (phrase) => {
    setEditingPhraseId(phrase.id);
    setPhraseText(phrase.base_word || phrase.phrase_text || '');
    setPhraseTargetWord(phrase.target_word || phrase.phrase_target_word || '');
    setPhraseType(phrase.feature_type || phrase.type || 'leitura');
    setPhraseCategory(phrase.category || 'Verbo'); // Preenche a categoria
  };

  const startEditPhrase = (phrase) => {
    setEditingPhraseId(phrase.id);
    setPhraseText(phrase.base_word || phrase.phrase_text || '');
    setPhraseTargetWord(phrase.target_word || phrase.phrase_target_word || '');
    setPhraseType(phrase.feature_type || phrase.type || 'leitura');
    setPhraseCategory(phrase.category || 'Verbo');

    if (phrase.grade) setSelectedGrade(phrase.grade);
    if (phrase.plnn_level) setSelectedPlnnLevel(phrase.plnn_level);
  };

  const handlePhraseSubmit = async (e) => {
    e.preventDefault();

    // Constrói o objeto content de acordo com a mecânica em JSONB
    const payload = {
      teacher_id: teacher?.id || null,
      module_type: 'Frases',
      exercise_type: phraseType || 'sentence_order',
      category: phraseCategory,
      grade: Number(selectedGrade),
      plnn_level: selectedPlnnLevel || 'A1',
      title: phraseText.substring(0, 50) + "...", // Título do exercício
      prompt: "Ordena os blocos para formar a frase!",
      content: {
        full_sentence: phraseText.trim(),
        target_word: phraseTargetWord.trim(),
        scrambled: phraseText.trim().split(" ")
      }
    };

    if (!payload.content.full_sentence) return;

    setSavingPhrase(true);
    try {
      if (editingPhraseId) {
        const { error } = await supabase
          .from('plnn_exercises')
          .update(payload)
          .eq('id', editingPhraseId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('plnn_exercises')
          .insert([payload]);
        if (error) throw error;
      }

      clearPhraseForm();
      openPhrasesTab(); // Recarrega a lista
    } catch (err) {
      alert("Erro ao guardar frase: " + err.message);
    } finally {
      setSavingPhrase(false);
    }
  };

  const handleDeletePhrase = async (id) => {
    if (!confirm("Remover esta frase?")) return;

    const { error } = await supabase
      .from('plnn_exercises')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Erro ao remover frase: " + error.message);
      return;
    }
    setPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const fetchPhrases = async () => {
    const { data, error } = await supabase
      .from('plnn_exercises')
      .select('*')
      .eq('module_type', 'Frases')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPhrases(data);
    } else if (error) {
      console.error("Erro ao carregar frases:", error.message);
    }
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
    const studentPlnnLevel = validated.plnn_level || "A1";

    if (gradeNum <= 2) {
      const studentWords = await getWordsByGrade(gradeNum, studentPlnnLevel);
      setWords(studentWords);
    } else {
      // Procura exercícios do Ano/Nível do aluno, mais (em menor
      // quantidade, como revisão) de Anos/Níveis anteriores.
      const allowedLevels = await getAllowedLevels(studentPlnnLevel);
      const { data, error } = await supabase
        .from('plnn_exercises')
        .select('*')
        .lte('grade', gradeNum)
        .in('plnn_level', allowedLevels)
        .order('id');

      if (!error && data) {
        const isExact = (ex) => Number(ex.grade) === gradeNum && ex.plnn_level === studentPlnnLevel;
        const moduleTypes = [...new Set(data.map(ex => ex.module_type))];

        let combined = [];
        moduleTypes.forEach(mt => {
          const subset = data.filter(ex => ex.module_type === mt);
          const primary = subset.filter(isExact);
          const review = subset.filter(ex => !isExact(ex));
          combined = combined.concat(combineWithReview(primary, review));
        });

        // Mapeia exercise_type com fallback para module_type caso venha a null
        const formattedExercises = combined.map(ex => ({
          ...ex,
          exercise_type: ex.exercise_type || ex.module_type
        }));
        setPlnnExercises(formattedExercises);
      } else {
        setPlnnExercises([]);
      }
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
      teacher={teacher}
      setCurrentView={setCurrentView}
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
	  phraseCategory={phraseCategory}          
	  setPhraseCategory={setPhraseCategory}   
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
  return (
    <StudentGameView 
      selectedStudent={selectedStudent}
      selectedModuleId={selectedModuleId}
      setSelectedModuleId={setSelectedModuleId}
      teacher={teacher}
      setCurrentView={setCurrentView}
      setSelectedStudent={setSelectedStudent}
      words={words}
      plnnExercises={plnnExercises}
      handleModuleComplete={handleModuleComplete}
    />
  );
 }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}
