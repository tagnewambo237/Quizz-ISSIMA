import mongoose, { Schema, Document } from 'mongoose';

/**
 * Transaction XP pour tracking et idempotence
 */
export interface IXPTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  source: string; // 'exam', 'enrollment', 'daily_login', etc.
  sourceId?: string;
  eventId?: string; // Pour idempotence
  timestamp: Date;
  createdAt: Date;
}

const XPTransactionSchema = new Schema<IXPTransaction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true, index: true },
  sourceId: { type: String, index: true },
  eventId: { type: String, unique: true, sparse: true }, // Pour éviter doubles crédits
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Index composé pour requêtes fréquentes
XPTransactionSchema.index({ userId: 1, createdAt: -1 });
XPTransactionSchema.index({ userId: 1, source: 1 });

export const XPTransaction = mongoose.models.XPTransaction || 
  mongoose.model<IXPTransaction>('XPTransaction', XPTransactionSchema);

