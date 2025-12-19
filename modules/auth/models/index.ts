/**
 * Module Auth - Models
 * 
 * Re-exporte les modèles depuis le dossier central /models
 * pour maintenir la compatibilité tout en permettant l'import modulaire.
 */

// User model
export { default as User } from '@/models/User';
export type { IUser } from '@/models/User';

// LearnerProfile model
export { default as LearnerProfile } from '@/models/LearnerProfile';
export type { ILearnerProfile } from '@/models/LearnerProfile';

// PedagogicalProfile model
export { default as PedagogicalProfile } from '@/models/PedagogicalProfile';
export type { IPedagogicalProfile } from '@/models/PedagogicalProfile';
