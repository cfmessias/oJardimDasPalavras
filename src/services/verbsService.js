// src/services/verbsService.js

const VerbsService = {
  // Obter verbos associados a um determinado Ano ou Nível PLNM via verb_levels
  async getVerbsByLevel(grade, plnnLevel) {
    let query = supabase
      .from('verb_levels')
      .select(`
        id,
        grade,
        plnn_level,
        verbs (
          id,
          infinitive,
          is_regular
        )
      `);

    if (grade) query = query.eq('grade', grade);
    if (plnnLevel) query = query.eq('plnn_level', plnnLevel);

    const { data, error } = await query;
    if (error) {
      console.error('Erro ao obter verbos parametrizados:', error);
      return [];
    }
    
    return data.map(item => ({
      association_id: item.id,
      ...item.verbs
    }));
  },

  // Pesquisar no catálogo geral de ~12.000 verbos
  async searchCatalogVerbs(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) return [];

    const { data, error } = await supabase
      .from('verbs')
      .select('id, infinitive, is_regular')
      .ilike('infinitive', `%${searchTerm.trim()}%`)
      .limit(10);

    if (error) {
      console.error('Erro ao pesquisar catálogo:', error);
      return [];
    }
    return data;
  },

  // Associar um verbo a um Ano / Nível PLNM
  async assignVerbToLevel(verbId, grade, plnnLevel) {
    const { data, error } = await supabase
      .from('verb_levels')
      .insert([
        {
          verb_id: verbId,
          grade: grade ? parseInt(grade) : null,
          plnn_level: plnnLevel || null
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao associar verbo:', error);
      throw error;
    }
    return data[0];
  },

  // Remover associação
  async removeVerbFromLevel(associationId) {
    const { error } = await supabase
      .from('verb_levels')
      .delete()
      .eq('id', associationId);

    if (error) {
      console.error('Erro ao remover associação:', error);
      throw error;
    }
    return true;
  }
};