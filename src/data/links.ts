// Sites oficiais por país (governo, agências oficiais de educação e embaixadas do Brasil).
// Conferidos em 12/10/2026. Endereços de governo mudam: revise a cada atualização do app.

export type LinkKind = 'visto' | 'escolas' | 'estudar' | 'bolsas' | 'embaixada';
export type OfficialLink = { kind: LinkKind; label: string; url: string };

export const LINK_KINDS: Record<LinkKind, { title: string; icon: 'file-text' | 'award' | 'book-open' | 'gift' | 'flag' }> = {
  visto: { title: 'Visto e imigração', icon: 'file-text' },
  escolas: { title: 'Escola credenciada', icon: 'award' },
  estudar: { title: 'Portal oficial de estudos', icon: 'book-open' },
  bolsas: { title: 'Bolsas de estudo', icon: 'gift' },
  embaixada: { title: 'Embaixada do Brasil', icon: 'flag' },
};

const MRE = 'https://www.gov.br/mre/pt-br';

export const OFFICIAL_LINKS: Record<string, OfficialLink[]> = {
  IE: [
    { kind: 'visto', label: 'Estudar na Irlanda: regras de imigração (Immigration Service)', url: 'https://www.irishimmigration.ie/coming-to-study-in-ireland/' },
    { kind: 'estudar', label: 'Education in Ireland, portal do governo irlandês', url: 'https://www.educationinireland.com' },
    { kind: 'bolsas', label: 'Bolsas do Governo da Irlanda (GOI-IES)', url: 'https://hea.ie/policy/internationalisation/goi-ies/' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Dublin', url: `${MRE}/embaixada-dublin` },
  ],
  CA: [
    { kind: 'visto', label: 'Study permit (governo do Canadá)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html' },
    { kind: 'escolas', label: 'Lista oficial de instituições autorizadas (DLI)', url: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/prepare/designated-learning-institutions-list.html' },
    { kind: 'bolsas', label: 'Bolsas para estrangeiros (EduCanada)', url: 'https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Ottawa', url: `${MRE}/embaixada-ottawa` },
  ],
  PT: [
    { kind: 'visto', label: 'Tipos de visto nacional (Portal de Vistos)', url: 'https://vistos.mne.gov.pt/pt/vistos-nacionais/informacao-geral/tipo-de-visto' },
    { kind: 'visto', label: 'AIMA: autorização de residência', url: 'https://aima.gov.pt' },
    { kind: 'escolas', label: 'DGES: ensino superior reconhecido em Portugal', url: 'https://www.dges.gov.pt' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Lisboa', url: `${MRE}/embaixada-lisboa` },
  ],
  AU: [
    { kind: 'visto', label: 'Student visa (subclass 500)', url: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500' },
    { kind: 'escolas', label: 'CRICOS: cursos e escolas registrados', url: 'https://cricos.education.gov.au' },
    { kind: 'estudar', label: 'Study Australia, portal do governo', url: 'https://www.studyaustralia.gov.au' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Camberra', url: `${MRE}/embaixada-camberra` },
  ],
  GB: [
    { kind: 'visto', label: 'Student visa (GOV.UK)', url: 'https://www.gov.uk/student-visa' },
    { kind: 'escolas', label: 'Lista de escolas autorizadas a receber estudantes', url: 'https://www.gov.uk/government/publications/register-of-licensed-sponsors-students' },
    { kind: 'bolsas', label: 'Bolsas Chevening (governo britânico)', url: 'https://www.chevening.org' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Londres', url: `${MRE}/embaixada-londres` },
  ],
  US: [
    { kind: 'visto', label: 'Visto de estudante (Departamento de Estado)', url: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html' },
    { kind: 'escolas', label: 'Busca de escolas certificadas (Study in the States)', url: 'https://studyinthestates.dhs.gov/school-search' },
    { kind: 'estudar', label: 'EducationUSA, orientação oficial gratuita', url: 'https://educationusa.state.gov' },
    { kind: 'bolsas', label: 'Comissão Fulbright Brasil', url: 'https://fulbright.org.br' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Washington', url: `${MRE}/embaixada-washington` },
  ],
  NZ: [
    { kind: 'visto', label: 'Immigration New Zealand', url: 'https://www.immigration.govt.nz' },
    { kind: 'estudar', label: 'Study with New Zealand, portal do governo', url: 'https://www.studywithnewzealand.govt.nz' },
    { kind: 'escolas', label: 'NZQA: qualificações e escolas reconhecidas', url: 'https://www.nzqa.govt.nz' },
    { kind: 'bolsas', label: 'Bolsas do governo da Nova Zelândia', url: 'https://www.mfat.govt.nz/en/aid-and-development/scholarships' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Wellington', url: `${MRE}/embaixada-wellington` },
  ],
  MT: [
    { kind: 'visto', label: 'Identità: vistos e residência', url: 'https://www.identita.gov.mt' },
    { kind: 'escolas', label: 'MFHEA: escolas e cursos credenciados', url: 'https://mfhea.mt' },
    { kind: 'embaixada', label: 'Portal Consular do Itamaraty (atendimento a brasileiros)', url: `${MRE}/assuntos/portal-consular` },
  ],
  ES: [
    { kind: 'visto', label: 'Ministério de Assuntos Exteriores: vistos', url: 'https://www.exteriores.gob.es' },
    { kind: 'escolas', label: 'Ministério das Universidades', url: 'https://www.universidades.gob.es' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Madri', url: `${MRE}/embaixada-madri` },
  ],
  DE: [
    { kind: 'visto', label: 'Vistos (Embaixada da Alemanha no Brasil)', url: 'https://brasil.diplo.de/br-pt/servicos/visto' },
    { kind: 'bolsas', label: 'DAAD: bolsas e cursos', url: 'https://www.daad.de/en/' },
    { kind: 'estudar', label: 'Study in Germany, portal oficial', url: 'https://www.study-in-germany.de' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Berlim', url: `${MRE}/embaixada-berlim` },
  ],
  FR: [
    { kind: 'visto', label: 'France-Visas, portal oficial', url: 'https://france-visas.gouv.fr' },
    { kind: 'estudar', label: 'Campus France Brasil', url: 'https://www.bresil.campusfrance.org' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Paris', url: `${MRE}/embaixada-paris` },
  ],
  JP: [
    { kind: 'visto', label: 'Vistos (Ministério das Relações Exteriores do Japão)', url: 'https://www.mofa.go.jp/j_info/visit/visa/' },
    { kind: 'estudar', label: 'Study in Japan (JASSO)', url: 'https://www.studyinjapan.go.jp/en/' },
    { kind: 'bolsas', label: 'Embaixada do Japão no Brasil (bolsas MEXT)', url: 'https://www.br.emb-japan.go.jp' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Tóquio', url: `${MRE}/embaixada-toquio` },
  ],
  ZA: [
    { kind: 'visto', label: 'Tipos de visto (Department of Home Affairs)', url: 'https://www.dha.gov.za/index.php/immigration-services/types-of-visas' },
    { kind: 'escolas', label: 'SAQA: qualificações registradas', url: 'https://www.saqa.org.za' },
    { kind: 'escolas', label: 'Departamento de Ensino Superior (instituições registradas)', url: 'https://www.dhet.gov.za' },
    { kind: 'embaixada', label: 'Embaixada do Brasil em Pretória', url: `${MRE}/embaixada-pretoria` },
  ],
};

export const GENERAL_LINKS: OfficialLink[] = [
  { kind: 'embaixada', label: 'Portal Consular do Itamaraty: documentos e ajuda no exterior', url: `${MRE}/assuntos/portal-consular` },
];
