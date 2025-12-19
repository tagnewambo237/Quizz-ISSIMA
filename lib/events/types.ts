import { DomainEvent } from './core/EventBus';
import mongoose from 'mongoose';

/**
 * Types d'événements centralisés
 *
 * Liste exhaustive de tous les événements du système.
 * Chaque module peut étendre cette liste avec ses propres types.
 */
export enum EventType {
  // Auth & Users
  USER_REGISTERED = 'USER_REGISTERED',
  USER_PROFILE_COMPLETED = 'USER_PROFILE_COMPLETED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',

  // Schools & Classes
  SCHOOL_CREATED = 'SCHOOL_CREATED',
  SCHOOL_VALIDATED = 'SCHOOL_VALIDATED',
  CLASS_CREATED = 'CLASS_CREATED',
  CLASS_UPDATED = 'CLASS_UPDATED',
  TEACHER_ADDED_TO_CLASS = 'TEACHER_ADDED_TO_CLASS',
  SYLLABUS_CREATED = 'SYLLABUS_CREATED',
  SYLLABUS_UPDATED = 'SYLLABUS_UPDATED',

  // Invitations
  INVITATION_CREATED = 'INVITATION_CREATED',
  INVITATION_ACCEPTED = 'INVITATION_ACCEPTED',
  STUDENT_ENROLLED = 'STUDENT_ENROLLED',
  BATCH_IMPORT_COMPLETED = 'BATCH_IMPORT_COMPLETED',

  // Assessments (Exams)
  EXAM_CREATED = 'EXAM_CREATED',
  EXAM_SUBMITTED_FOR_VALIDATION = 'EXAM_SUBMITTED_FOR_VALIDATION',
  EXAM_VALIDATED = 'EXAM_VALIDATED',
  EXAM_PUBLISHED = 'EXAM_PUBLISHED',
  EXAM_ARCHIVED = 'EXAM_ARCHIVED',
  EXAM_STATUS_CHANGED = 'EXAM_STATUS_CHANGED',
  LATE_CODE_GENERATED = 'LATE_CODE_GENERATED',
  LATE_CODE_USED = 'LATE_CODE_USED',

  // Exam Execution
  ATTEMPT_STARTED = 'ATTEMPT_STARTED',
  QUESTION_ANSWERED = 'QUESTION_ANSWERED',
  ATTEMPT_SUBMITTED = 'ATTEMPT_SUBMITTED',
  ATTEMPT_GRADED = 'ATTEMPT_GRADED',
  ANTI_CHEAT_VIOLATION = 'ANTI_CHEAT_VIOLATION',

  // Gamification
  XP_GAINED = 'XP_GAINED',
  BADGE_EARNED = 'BADGE_EARNED',
  LEVEL_UP = 'LEVEL_UP',
  STREAK_ACHIEVED = 'STREAK_ACHIEVED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',

  // Analytics
  ANALYTICS_REPORT_GENERATED = 'ANALYTICS_REPORT_GENERATED',
  PERFORMANCE_ALERT = 'PERFORMANCE_ALERT',

  // Messaging
  FORUM_CREATED = 'FORUM_CREATED',
  FORUM_POST_CREATED = 'FORUM_POST_CREATED',
  FORUM_REPLY_CREATED = 'FORUM_REPLY_CREATED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  NOTIFICATION_CREATED = 'NOTIFICATION_CREATED',
  REQUEST_CREATED = 'REQUEST_CREATED',
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_COMPLETED = 'REQUEST_COMPLETED'
}

/**
 * Interfaces typées pour les événements majeurs
 */

export interface UserRegisteredEvent extends DomainEvent {
  type: EventType.USER_REGISTERED;
  data: {
    name: string;
    email: string;
    role: string;
  };
}

export interface StudentEnrolledEvent extends DomainEvent {
  type: EventType.STUDENT_ENROLLED;
  data: {
    classId: mongoose.Types.ObjectId;
    className: string;
    userName: string;
    userEmail: string;
  };
}

export interface AttemptGradedEvent extends DomainEvent {
  type: EventType.ATTEMPT_GRADED;
  data: {
    attemptId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
  };
}

export interface XPGainedEvent extends DomainEvent {
  type: EventType.XP_GAINED;
  data: {
    amount: number;
    source: string;
    sourceId?: string;
    newTotal: number;
  };
}

export interface BadgeEarnedEvent extends DomainEvent {
  type: EventType.BADGE_EARNED;
  data: {
    badgeId: string;
    badgeName: string;
    badgeIcon: string;
    badgeRarity: string;
    pointsAwarded: number;
  };
}

export interface LevelUpEvent extends DomainEvent {
  type: EventType.LEVEL_UP;
  data: {
    oldLevel: number;
    newLevel: number;
    levelInfo: any;
  };
}

export interface ExamPublishedEvent extends DomainEvent {
  type: EventType.EXAM_PUBLISHED;
  data: {
    examId: mongoose.Types.ObjectId;
    examTitle: string;
    classId: mongoose.Types.ObjectId;
    className: string;
    dueDate?: Date;
  };
}

export interface AntiCheatViolationEvent extends DomainEvent {
  type: EventType.ANTI_CHEAT_VIOLATION;
  data: {
    attemptId: mongoose.Types.ObjectId;
    examId: mongoose.Types.ObjectId;
    violationType: string;
    timestamp: Date;
  };
}
