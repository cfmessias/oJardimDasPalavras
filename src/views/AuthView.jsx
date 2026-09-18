function AuthView({
  isRegistering,
  setIsRegistering,
  regName,
  setRegName,
  regSchool,
  setRegSchool,
  loginEmail,
  setLoginEmail,
  loginPin,
  setLoginPin,
  handleAuthSubmit,
  setCurrentView
}) {
  return (
    <div className="container">
      <div className="card">
        <h1>🌿 O Jardim das Palavras</h1>
        <h3>{isRegistering ? "Criar Conta de Professor" : "Área Reservada aos Professores"}</h3>
        
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {isRegistering && (
            <React.Fragment>
              <input
                type="text"
                className="input"
                placeholder="Nome Completo"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
              <input
                type="text"
                className="input"0442
                placeholder="Escola / Agrupamento"
                value={regSchool}
                onChange={(e) => setRegSchool(e.target.value)}
                required
              />
            </React.Fragment>
          )}
          
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            className="input"
            placeholder="PIN (4 dígitos)"
            value={loginPin}
            onChange={(e) => setLoginPin(e.target.value)}
            required
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="submit" className="btn btn-primary">
              {isRegistering ? "Registar e Entrar" : "Entrar"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setCurrentView("student_select")}>
              Voltar
            </button>
          </div>
        </form>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <button
          type="button"
          className="link-btn"
          onClick={() => setIsRegistering(!isRegistering)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669', fontSize: '0.95rem' }}
        >
          {isRegistering ? "Já tens conta? Faz login aqui." : "Ainda não tens conta? Regista-te aqui."}
        </button>
      </div>
    </div>
  );
}