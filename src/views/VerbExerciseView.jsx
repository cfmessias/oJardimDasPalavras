(function() {
  // Normaliza texto para comparar pessoas gramaticais e tempos verbais sem falhas
  // por causa de maiúsculas, acentos ou espaços (mesma lógica usada no VerbsTab).
  function normalizeStr(str) {
    return (str || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // Mapa de pessoas gramaticais -> pronome apresentado ao aluno.
  const PERSON_MAP = [
    { key: 'eu', label: 'Eu', targets: ['eu'] },
    { key: 'tu', label: 'Tu', targets: ['tu'] },
    { key: 'ele', label: 'Ele/Ela', targets: ['ele', 'ela', 'ele/ela'] },
    { key: 'nos', label: 'Nós', targets: ['nos', 'nós'] },
    { key: 'vos', label: 'Vós', targets: ['vos', 'vós'] },
    { key: 'eles', label: 'Eles/Elas', targets: ['eles', 'elas', 'eles/elas'] }
  ];

  function pronounFor(person) {
    const norm = normalizeStr(person);
    const match = PERSON_MAP.find((p) => p.targets.includes(norm));
    return match ? match.label : person;
  }

  // Baralha um array sem alterar o original.
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Constrói as perguntas de escolha múltipla a partir dos verbos/tempos
  // configurados pelo professor (tabela verb_levels) e das respetivas
  // conjugações (verb_conjugations), devolvidas por VerbsService.getVerbsByLevel.
  function buildQuestions(associations) {
    const questions = [];
    const allFormsByTense = {};

    // Agrupa todas as formas conjugadas por tempo verbal, para servirem de
    // distratoras quando um verbo não tem formas suficientes noutras pessoas.
    associations.forEach((assoc) => {
      const tenseKey = normalizeStr(assoc.tense);
      if (!allFormsByTense[tenseKey]) allFormsByTense[tenseKey] = [];
      (assoc.verb_conjugations || []).forEach((c) => {
        if (c.conjugated_form && c.conjugated_form.trim() !== '') {
          allFormsByTense[tenseKey].push(c.conjugated_form.trim());
        }
      });
    });

    associations.forEach((assoc) => {
      const forms = (assoc.verb_conjugations || []).filter(
        (c) => c.conjugated_form && c.conjugated_form.trim() !== '' && c.person
      );
      if (!assoc.infinitive || forms.length === 0) return;

      forms.forEach((formEntry) => {
        const correct = formEntry.conjugated_form.trim();

        // Distratoras: primeiro tenta outras pessoas do mesmo verbo/tempo;
        // se não houver o suficiente, completa com formas de outros verbos
        // no mesmo tempo verbal.
        const sameVerbOthers = forms
          .filter((f) => f.conjugated_form.trim() !== correct)
          .map((f) => f.conjugated_form.trim());

        const tenseKey = normalizeStr(assoc.tense);
        const pool = shuffle(
          Array.from(new Set(allFormsByTense[tenseKey] || []))
        ).filter((f) => f !== correct);

        const distractors = Array.from(new Set([...sameVerbOthers, ...pool]))
          .filter((f) => f !== correct)
          .slice(0, 2);

        if (distractors.length < 2) return; // sem distratoras suficientes, ignora

        questions.push({
          infinitive: assoc.infinitive,
          tense: assoc.tense,
          pronoun: pronounFor(formEntry.person),
          correct,
          options: shuffle([correct, ...distractors])
        });
      });
    });

    return shuffle(questions);
  }

  window.VerbExerciseView = function VerbExerciseView({ level = 'A1', grade = 1 }) {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [questions, setQuestions] = React.useState([]);
    const [batchStart, setBatchStart] = React.useState(0);
    const [answers, setAnswers] = React.useState({});
    const [score, setScore] = React.useState(0);

    React.useEffect(() => {
      let cancelled = false;

      async function load() {
        setLoading(true);
        setError(null);
        setBatchStart(0);
        setAnswers({});
        setScore(0);

        try {
          const associations = await window.VerbsService.getVerbsByLevelCumulative(grade, level);
          if (cancelled) return;
          setQuestions(buildQuestions(associations));
        } catch (err) {
          console.error('Erro ao carregar exercícios de verbos:', err);
          if (!cancelled) setError('Não foi possível carregar os exercícios de verbos.');
        } finally {
          if (!cancelled) setLoading(false);
        }
      }

      load();
      return () => { cancelled = true; };
    }, [grade, level]);

    // Mostra 3 exercícios em simultâneo. Se houver menos de 3 disponíveis,
    // apresenta os que existirem.
    const visibleQuestions = questions.slice(batchStart, batchStart + 3);
    const answeredCount = visibleQuestions.filter((_, index) => answers[batchStart + index] !== undefined).length;
    const batchComplete = visibleQuestions.length > 0 && answeredCount === visibleQuestions.length;

    const handleSelectOption = (questionIndex, option) => {
      if (answers[questionIndex] !== undefined) return;

      const question = questions[questionIndex];
      if (!question) return;

      setAnswers(prev => ({ ...prev, [questionIndex]: option }));
      if (option === question.correct) {
        setScore(prev => prev + 10);
      }
    };

    const handleNextBatch = () => {
      if (questions.length <= 3) {
        setAnswers({});
        return;
      }

      const nextStart = batchStart + 3;
      setBatchStart(nextStart < questions.length ? nextStart : 0);
      setAnswers({});
    };

    const headerLabel = grade <= 2 ? 'Ações e Verbos' : 'Verbos e Expressões';

    if (loading) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', color: '#6b7280' }}>
          A carregar exercícios de verbos...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fff5f5', borderRadius: '12px', textAlign: 'center', color: '#b91c1c' }}>
          {error}
        </div>
      );
    }

    if (questions.length === 0) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
            Ainda não há verbos configurados para o {grade}.º Ano ({level}).
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '8px' }}>
            Pede ao/à professor(a) para associar verbos e conjugações neste Ano/Nível na aba "Verbos".
          </p>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
            ⚡ {headerLabel} • Nível {level}
          </span>
          <span style={{ backgroundColor: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
            Pontos: {score}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '14px' }}>
          {visibleQuestions.map((question, localIndex) => {
            const questionIndex = batchStart + localIndex;
            const selectedOption = answers[questionIndex];
            const answeredCorrectly = selectedOption !== undefined && selectedOption === question.correct;

            return (
              <div
                key={`${questionIndex}-${question.infinitive}-${question.pronoun}`}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '14px',
                  backgroundColor: '#fafafa',
                  minWidth: 0
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', color: '#1f2937', margin: '0 0 6px' }}>
                    {question.pronoun}{' '}
                    <span style={{ borderBottom: '2px solid #ff6b4a', padding: '0 6px', color: '#ff6b4a', fontWeight: 'bold' }}>
                      {selectedOption || '______'}
                    </span>{' '}
                    ({question.infinitive})
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
                    💡 Dica: {question.tense}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '7px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {question.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isWrongSelected = isSelected && !answeredCorrectly;
                    const isCorrectSelected = isSelected && answeredCorrectly;

                    const btnStyle = {
                      padding: '9px 10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      borderRadius: '7px',
                      border: '2px solid #e5e7eb',
                      backgroundColor: isCorrectSelected ? '#4ade80' : isWrongSelected ? '#f87171' : '#ffffff',
                      color: (isCorrectSelected || isWrongSelected) ? '#ffffff' : '#111827',
                      borderColor: isCorrectSelected ? '#22c55e' : isWrongSelected ? '#ef4444' : '#e5e7eb',
                      cursor: selectedOption === undefined ? 'pointer' : 'default',
                      transition: 'all 0.2s'
                    };

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(questionIndex, option)}
                        style={btnStyle}
                        disabled={selectedOption !== undefined}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== undefined && (
                  <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', color: answeredCorrectly ? '#15803d' : '#b91c1c', margin: '10px 0 0' }}>
                    {answeredCorrectly ? '🎉 Certo!' : `❌ Correta: "${question.correct}"`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {batchComplete && (
          <div style={{ textAlign: 'center', marginTop: '18px' }}>
            <button
              onClick={handleNextBatch}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff6b4a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Próximos 3 Exercícios ➔
            </button>
          </div>
        )}
      </div>
    );
  };
})();
