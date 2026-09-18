(function() {
  window.VerbExerciseView = function VerbExerciseView({ level = 'A1', grade = 1 }) {
    const [currentQuestion, setCurrentQuestion] = React.useState(0);
    const [selectedOption, setSelectedOption] = React.useState(null);
    const [isCorrect, setIsCorrect] = React.useState(null);
    const [score, setScore] = React.useState(0);

    // Banco de Exercícios Adaptativo alinhado com PLNM (A1, A2, B1)
    const verbDatabase = {
      A1: [
        {
          sentence: "O menino ________ futebol no parque.",
          options: ["joga", "jogamos", "jogam"],
          correct: "joga",
          hint: "Presente do Indicativo (Ele)"
        },
        {
          sentence: "Ontem, nós ________ uma maçã saborosa.",
          options: ["comi", "comemos", "comeram"],
          correct: "comemos",
          hint: "Pretérito Perfeito (Nós)"
        },
        {
          sentence: "Amanhã, a Maria ________ à escola de autocarro.",
          options: ["vai", "fui", "irão"],
          correct: "vai",
          hint: "Futuro / Presente com valor de futuro"
        }
      ],
      A2: [
        {
          sentence: "Quando eu era pequeno, ________ muito no jardim.",
          options: ["brincava", "brinquei", "brincarei"],
          correct: "brincava",
          hint: "Pretérito Imperfeito (Ação habitual no passado)"
        },
        {
          sentence: "____ a porta, por favor, está muito frio!",
          options: ["Fecha", "Fechaste", "Fechavas"],
          correct: "Fecha",
          hint: "Modo Imperativo (Instrução / Pedido)"
        }
      ],
      B1: [
        {
          sentence: "Espero que tu ________ tempo para estudar hoje.",
          options: ["tenhas", "tem", "tiveste"],
          correct: "tenhas",
          hint: "Presente do Conjuntivo (Desejo / Dúvida)"
        },
        {
          sentence: "O professor disse que nós ________ o exercício juntos.",
          options: ["faríamos", "fizemos", "fazem"],
          correct: "faríamos",
          hint: "Discurso Indireto / Condicional"
        }
      ]
    };

    const questions = verbDatabase[level] || verbDatabase['A1'];
    const activeQuestion = questions[currentQuestion] || questions[0];

    const handleSelectOption = (option) => {
      if (selectedOption !== null) return;
      setSelectedOption(option);
      
      if (option === activeQuestion.correct) {
        setIsCorrect(true);
        setScore(score + 10);
      } else {
        setIsCorrect(false);
      }
    };

    const handleNextQuestion = () => {
      setSelectedOption(null);
      setIsCorrect(null);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setCurrentQuestion(0);
      }
    };

    return (
      <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
            ⚡ {grade <= 2 ? 'Ações e Verbos' : 'Verbos e Expressões'} • Nível {level}
          </span>
          <span style={{ backgroundColor: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '16px', fontWeight: 'bold' }}>
            Pontos: {score}
          </span>
        </div>

        <div style={{ margin: '24px 0', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '8px' }}>
            {activeQuestion.sentence.split('________').map((part, index, array) => (
              <React.Fragment key={index}>
                {part}
                {index < array.length - 1 && (
                  <span style={{ borderBottom: '3px solid #ff6b4a', padding: '0 12px', color: '#ff6b4a', fontWeight: 'bold' }}>
                    {selectedOption || '______'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </h3>
          <p style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
            💡 Dica: {activeQuestion.hint}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', margin: '24px 0' }}>
          {activeQuestion.options.map((option, idx) => {
            let btnStyle = {
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            };

            if (selectedOption === option) {
              btnStyle.backgroundColor = isCorrect ? '#4ade80' : '#f87171';
              btnStyle.color = '#ffffff';
              btnStyle.borderColor = isCorrect ? '#22c55e' : '#ef4444';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                style={btnStyle}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontWeight: 'bold', color: isCorrect ? '#15803d' : '#b91c1c', marginBottom: '12px' }}>
              {isCorrect ? '🎉 Muito bem! Resposta certa.' : `❌ Quase! A opção correta era: "${activeQuestion.correct}".`}
            </p>
            <button
              onClick={handleNextQuestion}
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
              Próximo Exercício ➔
            </button>
          </div>
        )}
      </div>
    );
  };
})();