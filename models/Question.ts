import mongoose, { Schema, Document, Model } from 'mongoose'
import { DifficultyLevel, EvaluationType } from './enums'

/**
 * Interface pour les statistiques d'une question
 * Permet de tracker la Performance des Apprenants sur chaque question
 */
export interface QuestionStats {
  timesAsked: number // Nombre de fois que la question a été posée
  timesCorrect: number // Nombre de fois répondue correctement
  timesIncorrect: number // Nombre de fois répondue incorrectement
  successRate: number // Taux de réussite en pourcentage
}

/**
 * Interface principale du modèle Question V2
 */
export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId
  examId: mongoose.Types.ObjectId

  // Contenu de la question
  text: string
  imageUrl?: string
  audioUrl?: string // Pour les questions audio (langues, etc.)

  // Configuration
  type: EvaluationType // NOUVEAU
  points: number
  difficulty: DifficultyLevel
  timeLimit?: number // NOUVEAU - Limite de temps spécifique à la question (en secondes)

  // Réponses (selon le type)
  correctAnswer?: boolean // Pour TRUE_FALSE
  modelAnswer?: string // Pour OPEN_QUESTION

  // Aide pédagogique (NOUVEAUX CHAMPS V2)
  explanation?: string // Explication de la réponse correcte
  hints?: string[] // Indices progressifs
  tags?: string[] // Tags pour catégorisation (ex: ["algèbre", "dérivées"])

  // Statistiques (NOUVEAUX CHAMPS V2 - denormalized)
  stats: QuestionStats

  // Métadonnées
  order?: number // Ordre d'affichage dans l'examen
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
      index: true
    },

    // Contenu de la question
    text: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String
    },
    audioUrl: {
      type: String
    },

    // Configuration
    type: {
      type: String,
      enum: Object.values(EvaluationType),
      default: EvaluationType.QCM,
      required: true
    },
    points: {
      type: Number,
      default: 1,
      min: 0
    },
    difficulty: {
      type: String,
      enum: Object.values(DifficultyLevel),
      default: DifficultyLevel.INTERMEDIATE
    },
    timeLimit: {
      type: Number,
      min: 0
    },

    // Réponses
    correctAnswer: {
      type: Boolean
    },
    modelAnswer: {
      type: String,
      trim: true
    },

    // Aide pédagogique
    explanation: {
      type: String,
      trim: true
    },
    hints: [
      {
        type: String,
        trim: true
      }
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],

    // Statistiques
    stats: {
      timesAsked: {
        type: Number,
        default: 0
      },
      timesCorrect: {
        type: Number,
        default: 0
      },
      timesIncorrect: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 0
      }
    },

    // Métadonnées
    order: {
      type: Number
    }
  },
  {
    timestamps: true
  }
)

// Indexes
QuestionSchema.index({ examId: 1, order: 1 }) // Pour récupérer les questions triées
QuestionSchema.index({ tags: 1 }) // Pour filtrage par tags
QuestionSchema.index({ difficulty: 1 }) // Pour filtrage par difficulté

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema)

export default Question
