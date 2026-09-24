// db.js - Gestão de dados e comunicação com o Supabase

const SUPABASE_URL = "https://ostzbzkxvomuztprzdvw.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdHpiemt4dm9tdXp0cHJ6ZHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Nzk1OTUsImV4cCI6MjEwMjQ1NTU5NX0.ae8uWGBFn2gQ23GJykxRoZ8q9ci4Ql8Y4xIwalBSWsE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ACESSO CUMULATIVO A ANOS/NÍVEIS ---------------------------------------
// O aluno vê sempre o conteúdo exato do seu Ano/Nível, mais (em menor
// quantidade, como revisão) conteúdo de Anos/Níveis anteriores. A ordem dos
// níveis (A1 < A2 < B1...) vem da tabela `niveis`, não fica fixa no código.

let _niveisOrdenadosCache = null;

async function getNiveisOrdenados() {
  if (_niveisOrdenadosCache) return _niveisOrdenadosCache;
  const { data, error } = await supabase
    .from("niveis")
    .select("nivel_val")
    .order("nivel_id");
  if (error || !data || data.length === 0) {
    console.error("Erro ao carregar níveis, a usar ordem por omissão:", error);
    return ["A1", "A2", "B1", "B2", "C1", "C2"];
  }
  _niveisOrdenadosCache = data.map((n) => n.nivel_val);
  return _niveisOrdenadosCache;
}

// Devolve a lista de níveis "iguais ou anteriores" a plnnLevel, ex: "B1" -> ["A1","A2","B1"]
async function getAllowedLevels(plnnLevel) {
  const ordenados = await getNiveisOrdenados();
  const idx = ordenados.indexOf(plnnLevel);
  if (idx === -1) return [plnnLevel]; // nível desconhecido: não arrisca alargar
  return ordenados.slice(0, idx + 1);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Junta o conteúdo exato do Ano/Nível ("primary") com uma amostra limitada de
// revisão de Anos/Níveis anteriores ("review"), para que a revisão nunca
// domine sobre o conteúdo atual do aluno.
function combineWithReview(primary, review, reviewRatio = 0.4) {
  const cap = Math.max(0, Math.ceil(primary.length * reviewRatio));
  const reviewSample = shuffleArray(review).slice(0, cap);
  return shuffleArray([...primary, ...reviewSample]);
}
// ---------------------------------------------------------------------------

// 1. AUTENTICAÇÃO DO PROFESSOR (email + PIN, sem Supabase Auth)
async function registerTeacher(email, pin, name, school) {
  const { data, error } = await supabase
    .from("teachers")
    .insert([{ email, pin, name, school }])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma conta registada com este email.");
    }
    throw error;
  }

  return data;
}

async function loginTeacher(email, pin) {
  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .eq("email", email)
    .eq("pin", pin)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Email ou PIN incorretos.");

  return data;
}

function saveTeacherSession(teacher) {
  localStorage.setItem("jdp_teacher", JSON.stringify(teacher));
}

function getStoredTeacherSession() {
  try {
    const raw = localStorage.getItem("jdp_teacher");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearTeacherSession() {
  localStorage.removeItem("jdp_teacher");
}

async function logoutTeacher() {
  clearTeacherSession();
}

// 2. GESTÃO DE ALUNOS (Associados ao teacher_id)
async function getStudentsByTeacher(teacherId) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao carregar alunos:", error);
    return [];
  }
  return data;
}

async function createStudent(teacherId, name, pin, grade) {
  const { data, error } = await supabase
    .from("students")
    .insert([
      {
        teacher_id: teacherId,
        name: name,
        pin: pin,
        grade: parseInt(grade),
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

async function verifyStudentPin(studentId, pin) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .eq("pin", pin)
    .single();

  if (error || !data) return null;
  return data;
}

// 4. GESTÃO DE PALAVRAS
function slugifyWordId(word, grade) {
  const base = word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

  return `${base || "palavra"}-${grade}`;
}

async function getAllWords() {
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .order("grade")
    .order("word");

  if (error) {
    console.error("Erro ao carregar palavras:", error);
    return [];
  }
  return data;
}

async function createWord({ word, grade, emoji, hint, blankBefore, blankAfter }) {
  const id = slugifyWordId(word, grade);

  const { data, error } = await supabase
    .from("words")
    .insert([
      {
        id,
        grade: parseInt(grade),
        word,
        emoji,
        hint,
        blank_before: blankBefore || "",
        blank_after: blankAfter || "",
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma palavra igual registada nesse ano.");
    }
    throw error;
  }

  return data;
}

async function updateWord(id, { word, grade, emoji, hint, blankBefore, blankAfter }) {
  const { error } = await supabase
    .from("words")
    .update({
      word,
      grade: parseInt(grade),
      emoji,
      hint,
      blank_before: blankBefore || "",
      blank_after: blankAfter || "",
    })
    .eq("id", id);

  if (error) throw error;
}

async function deleteWord(id) {
  // apaga primeiro o progresso associado, já que não há FK a garantir isso
  await supabase.from("student_progress").delete().eq("word_id", id);

  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) throw error;
}

// 3. PALAVRAS E PROGRESSO
async function getWordsByGrade(grade, plnnLevel) {
  if (!plnnLevel) {
    // Compatibilidade: sem nível indicado, mantém o comportamento antigo.
    const { data, error } = await supabase.from("words").select("*").eq("grade", grade);
    if (error) {
      console.error("Erro ao carregar palavras:", error);
      return [];
    }
    return data || [];
  }

  const allowedLevels = await getAllowedLevels(plnnLevel);
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .lte("grade", grade)
    .in("plnn_level", allowedLevels);

  if (error) {
    console.error("Erro ao carregar palavras:", error);
    return [];
  }

  const all = data || [];
  const primary = all.filter((w) => Number(w.grade) === Number(grade) && w.plnn_level === plnnLevel);
  const review = all.filter((w) => !(Number(w.grade) === Number(grade) && w.plnn_level === plnnLevel));
  return combineWithReview(primary, review);
}

async function getStudentProgress(studentId) {
  const { data, error } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_id", studentId);

  if (error) {
    console.error("Erro ao carregar progresso:", error);
    return {};
  }

  // Retorna em formato de dicionário { word_id: { stage, written_sentence, ... } }
  return (data || []).reduce((acc, item) => {
    acc[item.word_id] = item;
    return acc;
  }, {});
}

async function saveStudentProgress(studentId, wordId, stage, writtenSentence = null) {
  const payload = {
    student_id: studentId,
    word_id: wordId,
    stage: stage,
    written_sentence: writtenSentence,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("student_progress")
    .upsert(payload, { onConflict: "student_id,word_id" });

  if (error) {
    console.error("Erro ao guardar progresso:", error);
  }
}
