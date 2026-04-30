export type Disciplina = {
  id: string; // código (ou ID estável p/ atividades complementares)
  codigo: string;
  nome: string;
  ch: string; // carga horária ex "60h"
  periodo: number; // 1..8
  prereqs: string[]; // códigos
  isAtividade?: boolean;
};

export const disciplinas: Disciplina[] = [
  // 1º Período
  { id: "CCET010", codigo: "CCET010", nome: "Lógica para Computação", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CCET059", codigo: "CCET059", nome: "Geometria Analítica", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CCET080", codigo: "CCET080", nome: "Álgebra Linear", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CCET095", codigo: "CCET095", nome: "Matemática Discreta", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CCET186", codigo: "CCET186", nome: "Introdução à Informática", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CCJSA133", codigo: "CCJSA133", nome: "Administração", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CELA088", codigo: "CELA088", nome: "Inglês Técnico", ch: "60h", periodo: 1, prereqs: [] },
  { id: "CELA465", codigo: "CELA465", nome: "Leitura e Produção de Textos Técnicos", ch: "30h", periodo: 1, prereqs: [] },

  // 2º Período
  { id: "CCET005", codigo: "CCET005", nome: "Algoritmos e Ling. de Programação", ch: "90h", periodo: 2, prereqs: ["CCET186"] },
  { id: "CCET007", codigo: "CCET007", nome: "Tópicos de Cálculo I", ch: "60h", periodo: 2, prereqs: ["CCET059"] },
  { id: "CCET090", codigo: "CCET090", nome: "Teoria Geral de Sistemas", ch: "60h", periodo: 2, prereqs: ["CCJSA133"] },
  { id: "CCET105", codigo: "CCET105", nome: "Introdução à Pesquisa em SI", ch: "60h", periodo: 2, prereqs: [] },
  { id: "CCJSA134", codigo: "CCJSA134", nome: "Comportamento Organizacional", ch: "30h", periodo: 2, prereqs: ["CCJSA133"] },

  // 3º Período
  { id: "CCET028", codigo: "CCET028", nome: "Tópicos de Cálculo II", ch: "60h", periodo: 3, prereqs: ["CCET007"] },
  { id: "CCET114", codigo: "CCET114", nome: "Linguagem de Programação I", ch: "60h", periodo: 3, prereqs: ["CCET005"] },
  { id: "CCET143", codigo: "CCET143", nome: "Fundamentos de SI", ch: "30h", periodo: 3, prereqs: ["CCET090"] },
  { id: "CCET178", codigo: "CCET178", nome: "Arquitetura e Org. de Computadores", ch: "90h", periodo: 3, prereqs: ["CCET186", "CCET010"] },
  { id: "CCJSA136", codigo: "CCJSA136", nome: "Economia e Finanças", ch: "60h", periodo: 3, prereqs: [] },
  { id: "CCJSA143", codigo: "CCJSA143", nome: "Marketing", ch: "30h", periodo: 3, prereqs: [] },

  // 4º Período
  { id: "CCJSA138", codigo: "CCJSA138", nome: "Organização, Sistemas e Métodos", ch: "30h", periodo: 4, prereqs: ["CCJSA134"] },
  { id: "CCET115", codigo: "CCET115", nome: "Linguagem de Programação II", ch: "60h", periodo: 4, prereqs: ["CCET114"] },
  { id: "CCET130", codigo: "CCET130", nome: "Estrutura de Dados", ch: "60h", periodo: 4, prereqs: ["CCET005"] },
  { id: "CCET182", codigo: "CCET182", nome: "Sistemas Operacionais", ch: "60h", periodo: 4, prereqs: [] },
  { id: "CCET192", codigo: "CCET192", nome: "Estatística Computacional", ch: "60h", periodo: 4, prereqs: [] },
  { id: "CCET202", codigo: "CCET202", nome: "Sistemas de Apoio à Decisão", ch: "30h", periodo: 4, prereqs: [] },
  { id: "CFCH243", codigo: "CFCH243", nome: "Psicologia Aplicada", ch: "30h", periodo: 4, prereqs: [] },
  { id: "CCET197", codigo: "CCET197", nome: "Informática e Sociedade", ch: "30h", periodo: 4, prereqs: [] },

  // 5º Período
  { id: "CCET020", codigo: "CCET020", nome: "Pesquisa Operacional", ch: "60h", periodo: 5, prereqs: ["CCET080", "CCET007"] },
  { id: "CCET023", codigo: "CCET023", nome: "Banco de Dados I", ch: "60h", periodo: 5, prereqs: [] },
  { id: "CCET025", codigo: "CCET025", nome: "Comunicação e Rede de Computadores", ch: "60h", periodo: 5, prereqs: [] },
  { id: "CCET035", codigo: "CCET035", nome: "Fundamentos da Computação", ch: "60h", periodo: 5, prereqs: [] },
  { id: "CCET036", codigo: "CCET036", nome: "Tópicos Especiais em SI I", ch: "60h", periodo: 5, prereqs: [] },
  { id: "CCJSA129", codigo: "CCJSA129", nome: "Contabilidade e Custos", ch: "30h", periodo: 5, prereqs: [] },

  // 6º Período
  { id: "CCET050", codigo: "CCET050", nome: "Tópicos Especiais em SI II", ch: "60h", periodo: 6, prereqs: [] },
  { id: "CCET204", codigo: "CCET204", nome: "Engenharia de Software I", ch: "60h", periodo: 6, prereqs: ["CCET023"] },
  { id: "CCET206", codigo: "CCET206", nome: "Produção e Operações Logísticas", ch: "60h", periodo: 6, prereqs: [] },
  { id: "CCET208", codigo: "CCET208", nome: "Projetos de SI", ch: "60h", periodo: 6, prereqs: [] },
  { id: "CCET209", codigo: "CCET209", nome: "Gerência de Projetos", ch: "30h", periodo: 6, prereqs: [] },
  { id: "CCET212", codigo: "CCET212", nome: "Banco de Dados II", ch: "60h", periodo: 6, prereqs: ["CCET023"] },
  { id: "CCET213", codigo: "CCET213", nome: "Redes de Computadores", ch: "60h", periodo: 6, prereqs: ["CCET025"] },
  { id: "CFCH087", codigo: "CFCH087", nome: "Sociologia", ch: "30h", periodo: 6, prereqs: [] },

  // 7º Período
  { id: "CCET086", codigo: "CCET086", nome: "Sistemas Distribuídos", ch: "60h", periodo: 7, prereqs: ["CCET213"] },
  { id: "CCET207", codigo: "CCET207", nome: "Engenharia de Software II", ch: "60h", periodo: 7, prereqs: ["CCET204"] },
  { id: "CCET214", codigo: "CCET214", nome: "Interface Homem Máquina", ch: "60h", periodo: 7, prereqs: ["CCET204"] },
  { id: "CCET106", codigo: "CCET106", nome: "Ética e Legislação Aplicada à Informática", ch: "30h", periodo: 7, prereqs: [] },
  { id: "CCET217", codigo: "CCET217", nome: "Planos de Negócios em Informática", ch: "30h", periodo: 7, prereqs: [] },
  { id: "CCET219", codigo: "CCET219", nome: "Introdução à Inteligência Artificial", ch: "60h", periodo: 7, prereqs: ["CCET010"] },
  { id: "CCET175", codigo: "CCET175", nome: "Estágio Supervisionado", ch: "150h", periodo: 7, prereqs: [] },
  { id: "CCET177", codigo: "CCET177", nome: "TCC I", ch: "30h", periodo: 7, prereqs: [] },

  // 8º Período
  { id: "CCET183", codigo: "CCET183", nome: "Gestão da Informação", ch: "60h", periodo: 8, prereqs: [] },
  { id: "CCET189", codigo: "CCET189", nome: "Segurança e Auditoria de Sistemas", ch: "60h", periodo: 8, prereqs: [] },
  { id: "CCET201", codigo: "CCET201", nome: "Sistemas Multimídia", ch: "60h", periodo: 8, prereqs: [] },
  { id: "CCJSA139", codigo: "CCJSA139", nome: "Empreendedorismo", ch: "30h", periodo: 8, prereqs: [] },
  { id: "CCET222", codigo: "CCET222", nome: "Gerência de Redes", ch: "60h", periodo: 8, prereqs: ["CCET213"] },
  { id: "CCET121", codigo: "CCET121", nome: "Relatório de Estágio", ch: "30h", periodo: 8, prereqs: ["CCET175"] },
  { id: "CCET179", codigo: "CCET179", nome: "TCC II", ch: "90h", periodo: 8, prereqs: ["CCET177"] },
];

// Atividades complementares — uma por período
export const atividadesComplementares: Disciplina[] = Array.from({ length: 8 }, (_, i) => ({
  id: `AC-P${i + 1}`,
  codigo: "AC",
  nome: "Atividades Complementares",
  ch: "15h",
  periodo: i + 1,
  prereqs: [],
  isAtividade: true,
}));
