// src/services/verbsService.js

window.VerbsService = {
  // 1. Obter verbos parametrizados e filtrar as conjugações pelo tempo verbal correto
  async getVerbsByLevel(grade, plnnLevel) {
    let query = supabase
      .from('verbs')
      .select(`
        id,
        infinitive,
        is_regular,
        verb_levels!inner (
          id,
          grade,
          plnn_level,
          tense
        ),
        verb_conjugations (*)
      `);

    if (grade) {
      query = query.eq('verb_levels.grade', parseInt(grade));
    }
    if (plnnLevel) {
      query = query.eq('verb_levels.plnn_level', plnnLevel);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao obter verbos parametrizados:', error);
      return [];
    }

    // Normalização para comparar tempos verbais sem falhas por espaços ou acentos
    const normalizeStr = (str) => 
      (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Mapeamento para desconstruir o join e manter o formato exato esperado pela interface
    const results = [];

    (data || []).forEach(verb => {
      (verb.verb_levels || []).forEach(vl => {
        // Filtrar por grade e level caso tenham sido especificados
        const matchGrade = !grade || Number(vl.grade) === Number(grade);
        const matchLevel = !plnnLevel || vl.plnn_level === plnnLevel;

        if (matchGrade && matchLevel) {
          const targetTense = vl.tense || 'Presente do Indicativo';

          const filteredConjugations = (verb.verb_conjugations || []).filter(
            conj => normalizeStr(conj.tense) === normalizeStr(targetTense)
          );

          results.push({
            association_id: vl.id,
            tense: targetTense,
            id: verb.id,
            infinitive: verb.infinitive,
            is_regular: verb.is_regular,
            verb_conjugations: filteredConjugations
          });
        }
      });
    });

    return results;
  },

  // 2. Pesquisar verbos no catálogo com as respetivas conjugações
  async searchCatalogVerbs(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    const { data, error } = await supabase
      .from('verbs')
      .select(`
        id, 
        infinitive, 
        is_regular,
        gerund,
        past_participle,
        impersonal_infinitive,
        verb_conjugations (*)
      `)
      .ilike('infinitive', `${searchTerm.trim()}%`)
      .limit(10);
	
    if (error) {
      console.error('Erro ao pesquisar catálogo:', error);
      return [];
    }
    return data || [];
  },

  // 3. Associar verbo ao Ano / Nível PLNM COM O TEMPO VERBAL
  async assignVerbToLevel(verbId, grade, plnnLevel, tense) {
    if (!plnnLevel || plnnLevel.trim() === '') {
      throw new Error('O Nível PLNM é de preenchimento obrigatório.');
    }

    const { data, error } = await supabase
      .from('verb_levels')
      .insert([
        {
          verb_id: verbId,
          grade: parseInt(grade),
          plnn_level: plnnLevel,
          tense: tense || 'Presente do Indicativo'
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao associar verbo:', error);
      throw error;
    }
    return data;
  },

  // 4. Criar ou atualizar um verbo e as suas 6 conjugações no catálogo global
  async saveCatalogVerb(verbData) {
    const { id, infinitive, is_regular, tense, conjugations } = verbData;
    let verbId = id;

    if (verbId) {
      // Atualiza o verbo no catálogo
      const { error } = await supabase
        .from('verbs')
        .update({ infinitive, is_regular })
        .eq('id', verbId);
      if (error) throw error;
    } else {
      // Cria novo verbo no catálogo
      const { data, error } = await supabase
        .from('verbs')
        .insert([{ infinitive, is_regular }])
        .select('id')
        .single();
      if (error) throw error;
      verbId = data.id;
    }

    // Atualiza conjugações para este tempo verbal
    if (conjugations && tense) {
      await supabase
        .from('verb_conjugations')
        .delete()
        .eq('verb_id', verbId)
        .eq('tense', tense);

      const toInsert = Object.entries(conjugations)
        .filter(([_, val]) => val && val.trim() !== '')
        .map(([person, form]) => ({
          verb_id: verbId,
          tense: tense,
          person: person,
          conjugated_form: form.trim()
        }));

      if (toInsert.length > 0) {
        const { error: conjErr } = await supabase
          .from('verb_conjugations')
          .insert(toInsert);
        if (conjErr) throw conjErr;
      }
    }

    return verbId;
  },

  // 5. Remover associação da tabela verb_levels
  async removeVerbFromLevel(associationId) {
    const { error } = await supabase
      .from('verb_levels')
      .delete()
      .eq('id', associationId);

    if (error) throw error;
    return true;
  }
};