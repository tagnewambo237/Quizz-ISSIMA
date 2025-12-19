import mongoose, { Schema, Document } from 'mongoose';

/**
 * Profil XP de l'utilisateur
 */
export interface IUserXP extends Document {
  userId: mongoose.Types.ObjectId;
  totalXP: number;
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  badges: Array<{
    badgeId: string;
    earnedAt: Date;
  }>;
  streakDays: number;
  lastActivityDate?: Date;
  updatedAt: Date;
}

const UserXPSchema = new Schema<IUserXP>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  totalXP: { type: Number, default: 0, index: true },
  level: { type: Number, default: 1, index: true },
  currentLevelXP: { type: Number, default: 0 },
  nextLevelXP: { type: Number, default: 100 },
  badges: [{
    badgeId: String,
    earnedAt: Date
  }],
  streakDays: { type: Number, default: 0 },
  lastActivityDate: Date,
  updatedAt: { type: Date, default: Date.now }
});

// Méthode helper pour calculer le niveau
UserXPSchema.methods.calculateLevel = function() {
  // Formule: XP requis = 100 * level^1.5
  let level = 1;
  let xpForNextLevel = 100;
  let totalXPRequired = 0;

  while (totalXPRequired + xpForNextLevel <= this.totalXP) {
    totalXPRequired += xpForNextLevel;
    level++;
    xpForNextLevel = Math.floor(100 * Math.pow(level, 1.5));
  }

  this.level = level;
  this.currentLevelXP = this.totalXP - totalXPRequired;
  this.nextLevelXP = xpForNextLevel;
};

export const UserXP = mongoose.models.UserXP || 
  mongoose.model<IUserXP>('UserXP', UserXPSchema);

