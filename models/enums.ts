export enum SubSystem {
    FRANCOPHONE = 'FRANCOPHONE',
    ANGLOPHONE = 'ANGLOPHONE',
    BILINGUAL = 'BILINGUAL'
}

export enum CloseMode {
    STRICT = 'STRICT',      // Ferme automatiquement à l'heure exacte
    PERMISSIVE = 'PERMISSIVE' // Autorise les soumissions tardives avec code
}

export enum Cycle {
    COLLEGE = 'COLLEGE',      // 6ème → 3ème
    LYCEE = 'LYCEE',          // 2nde → Tle
    LICENCE = 'LICENCE',      // L1 → L3
    MASTER = 'MASTER'         // M1 → M2
}

export enum FieldCategory {
    COMPETENCE_GROUP = 'COMPETENCE_GROUP',  // Collège
    SERIE = 'SERIE',                        // Lycée
    SPECIALITY = 'SPECIALITY'               // Supérieur
}

export enum SubjectType {
    DISCIPLINE = 'DISCIPLINE',  // Collège/Lycée
    UE = 'UE'                   // Enseignement Supérieur
}

export enum UnitType {
    CHAPTER = 'CHAPTER',
    MODULE = 'MODULE',
    COURSE = 'COURSE'
}

export enum DifficultyLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    EXPERT = 'EXPERT'
}

export enum PedagogicalObjective {
    DIAGNOSTIC_EVAL = 'DIAGNOSTIC_EVAL',           // Évaluation diagnostique
    FORMATIVE_EVAL = 'FORMATIVE_EVAL',             // Évaluation formative
    SUMMATIVE_EVAL = 'SUMMATIVE_EVAL',             // Évaluation sommative
    SELF_ASSESSMENT = 'SELF_ASSESSMENT',           // Auto-évaluation
    COMPETENCY_VALIDATION = 'COMPETENCY_VALIDATION', // Validation de compétence
    REMEDIATION = 'REMEDIATION',                   // Remédiation
    EVALUATE = 'EVALUATE',                         // Évaluer
    REVISE = 'REVISE',                             // Réviser
    TRAIN = 'TRAIN',                               // S'entraîner
    PREP_EXAM = 'PREP_EXAM',                       // Préparer un examen
    CONTINUOUS_VALIDATION = 'CONTINUOUS_VALIDATION' // Validation continue
}

export enum EvaluationType {
    QCM = 'QCM',                    // Questions à choix multiples
    TRUE_FALSE = 'TRUE_FALSE',      // Vrai/Faux
    OPEN_QUESTION = 'OPEN_QUESTION', // Question ouverte
    CASE_STUDY = 'CASE_STUDY',      // Étude de cas
    EXAM_SIMULATION = 'EXAM_SIMULATION', // Simulation d'examen
    ADAPTIVE = 'ADAPTIVE',          // Évaluation adaptative
    MIXED = 'MIXED'                 // Mixte
}

export enum ExamStatus {
    DRAFT = 'DRAFT',                         // Brouillon
    PENDING_VALIDATION = 'PENDING_VALIDATION', // En attente de validation
    VALIDATED = 'VALIDATED',                 // Validé par l'inspecteur
    PUBLISHED = 'PUBLISHED',                 // Publié et accessible
    ARCHIVED = 'ARCHIVED'                    // Archivé
}

export enum CompetencyType {
    DIGITAL = 'DIGITAL',
    ENTREPRENEURIAL = 'ENTREPRENEURIAL',
    SOFT_SKILL = 'SOFT_SKILL',
    PROBLEM_SOLVING = 'PROBLEM_SOLVING',
    LOGIC_REASONING = 'LOGIC_REASONING'
}

export enum UserRole {
    // Apprenants
    STUDENT = 'STUDENT',

    // Pédagogiques
    TEACHER = 'TEACHER',
    SCHOOL_ADMIN = 'SCHOOL_ADMIN',
    INSPECTOR = 'INSPECTOR',
    SURVEILLANT = 'SURVEILLANT',
    PREFET = 'PREFET',
    PRINCIPAL = 'PRINCIPAL',
    DG_ISIMMA = 'DG_ISIMMA',
    RECTOR = 'RECTOR',

    // Technique
    DG_M4M = 'DG_M4M',
    TECH_SUPPORT = 'TECH_SUPPORT'
}

export enum ClassValidationStatus {
    PENDING = 'PENDING',
    VALIDATED = 'VALIDATED',
    REJECTED = 'REJECTED'
}

export enum SchoolStatus {
    PENDING = 'PENDING',
    VALIDATED = 'VALIDATED',
    REJECTED = 'REJECTED'
}

export enum CognitiveProfile {
    VISUAL = 'VISUAL',
    AUDITORY = 'AUDITORY',
    LOGIC_MATH = 'LOGIC_MATH',
    LITERARY = 'LITERARY'
}

export enum LearnerType {
    EXAM_PREP = 'EXAM_PREP',
    REMEDIAL = 'REMEDIAL',
    ADVANCED = 'ADVANCED',
    STRUGGLING = 'STRUGGLING'
}

export enum SubscriptionStatus {
    FREEMIUM = 'FREEMIUM',
    PREMIUM = 'PREMIUM',
    INSTITUTION_PREMIUM = 'INSTITUTION_PREMIUM',
    EDUCATOR_ACCESS = 'EDUCATOR_ACCESS',
    DIRECTION_ACCESS = 'DIRECTION_ACCESS'
}

export enum LearningMode {
    AUTO_EVAL = 'AUTO_EVAL',
    COMPETITION = 'COMPETITION',
    EXAM = 'EXAM',
    CLASS_CHALLENGE = 'CLASS_CHALLENGE'
}

export enum ContributionType {
    CREATOR = 'CREATOR',
    VALIDATOR = 'VALIDATOR',
    CORRECTOR = 'CORRECTOR',
    MANAGER = 'MANAGER',
    SUPERVISOR = 'SUPERVISOR'
}

export enum AccessScope {
    GLOBAL = 'GLOBAL',
    LOCAL = 'LOCAL',
    SUBJECT = 'SUBJECT',
    LEVEL = 'LEVEL',
    FIELD = 'FIELD'
}

export enum ReportingAccess {
    CLASS = 'CLASS',
    FIELD = 'FIELD',
    ESTABLISHMENT = 'ESTABLISHMENT',
    GLOBAL = 'GLOBAL'
}
