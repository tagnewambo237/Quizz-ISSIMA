import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de gestion des examens
 */
export class ExamService {
  /**
   * Crée un nouvel examen
   */
  static async createExam(data: {
    title: string;
    description?: string;
    classId: mongoose.Types.ObjectId | string;
    duration: number;
    syllabusId?: mongoose.Types.ObjectId | string;
    createdBy: mongoose.Types.ObjectId | string;
  }): Promise<{ examId: mongoose.Types.ObjectId }> {
    const createdByObj =
      typeof data.createdBy === "string"
        ? new mongoose.Types.ObjectId(data.createdBy)
        : data.createdBy;

    const classIdObj =
      typeof data.classId === "string"
        ? new mongoose.Types.ObjectId(data.classId)
        : data.classId;

    // TODO: Logique métier pour créer l'examen dans la DB
    // const exam = await Exam.create({ ...data, status: 'DRAFT' });

    const examId = new mongoose.Types.ObjectId();

    // Publier événement EXAM_CREATED
    await publishEvent(
      EventType.EXAM_CREATED,
      {
        examId: examId,
        title: data.title,
        description: data.description,
        classId: classIdObj,
        duration: data.duration,
        syllabusId: data.syllabusId,
        status: "DRAFT",
        createdAt: new Date(),
      },
      {
        userId: createdByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[Assessments] Examen créé: ${data.title}`);

    return { examId };
  }

  /**
   * Soumet un examen pour validation
   */
  static async submitForValidation(
    examId: mongoose.Types.ObjectId | string,
    examTitle: string,
    submittedBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const examIdObj =
      typeof examId === "string" ? new mongoose.Types.ObjectId(examId) : examId;

    const submittedByObj =
      typeof submittedBy === "string"
        ? new mongoose.Types.ObjectId(submittedBy)
        : submittedBy;

    // TODO: Logique métier pour changer le statut
    // await Exam.updateOne({ _id: examId }, { status: 'PENDING_VALIDATION' });

    // Publier événement EXAM_SUBMITTED_FOR_VALIDATION
    await publishEvent(
      EventType.EXAM_SUBMITTED_FOR_VALIDATION,
      {
        examId: examIdObj,
        examTitle: examTitle,
        submittedAt: new Date(),
      },
      {
        userId: submittedByObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(
      `[Assessments] Examen soumis pour validation: ${examTitle}`
    );
  }

  /**
   * Valide un examen
   */
  static async validateExam(
    examId: mongoose.Types.ObjectId | string,
    examTitle: string,
    validatedBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const examIdObj =
      typeof examId === "string" ? new mongoose.Types.ObjectId(examId) : examId;

    const validatedByObj =
      typeof validatedBy === "string"
        ? new mongoose.Types.ObjectId(validatedBy)
        : validatedBy;

    // TODO: Logique métier pour valider
    // await Exam.updateOne({ _id: examId }, { status: 'VALIDATED' });

    // Publier événement EXAM_VALIDATED
    await publishEvent(
      EventType.EXAM_VALIDATED,
      {
        examId: examIdObj,
        examTitle: examTitle,
        validatedAt: new Date(),
      },
      {
        userId: validatedByObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(`[Assessments] Examen validé: ${examTitle}`);
  }

  /**
   * Publie un examen (le rend disponible aux étudiants)
   */
  static async publishExam(
    examId: mongoose.Types.ObjectId | string,
    examTitle: string,
    classId: mongoose.Types.ObjectId | string,
    className: string,
    dueDate?: Date,
    publishedBy?: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const examIdObj =
      typeof examId === "string" ? new mongoose.Types.ObjectId(examId) : examId;

    const classIdObj =
      typeof classId === "string"
        ? new mongoose.Types.ObjectId(classId)
        : classId;

    const publishedByObj = publishedBy
      ? typeof publishedBy === "string"
        ? new mongoose.Types.ObjectId(publishedBy)
        : publishedBy
      : undefined;

    // TODO: Logique métier pour publier
    // await Exam.updateOne({ _id: examId }, { status: 'PUBLISHED', publishedAt: new Date() });

    // Publier événement EXAM_PUBLISHED
    await publishEvent(
      EventType.EXAM_PUBLISHED,
      {
        examId: examIdObj,
        examTitle: examTitle,
        classId: classIdObj,
        className: className,
        dueDate: dueDate,
        publishedAt: new Date(),
      },
      {
        userId: publishedByObj,
        priority: EventPriority.HIGH,
      }
    );

    console.log(`[Assessments] Examen publié: ${examTitle}`);
  }

  /**
   * Archive un examen
   */
  static async archiveExam(
    examId: mongoose.Types.ObjectId | string,
    examTitle: string,
    archivedBy: mongoose.Types.ObjectId | string
  ): Promise<void> {
    const examIdObj =
      typeof examId === "string" ? new mongoose.Types.ObjectId(examId) : examId;

    const archivedByObj =
      typeof archivedBy === "string"
        ? new mongoose.Types.ObjectId(archivedBy)
        : archivedBy;

    // TODO: Logique métier pour archiver
    // await Exam.updateOne({ _id: examId }, { status: 'ARCHIVED' });

    // Publier événement EXAM_ARCHIVED
    await publishEvent(
      EventType.EXAM_ARCHIVED,
      {
        examId: examIdObj,
        examTitle: examTitle,
        archivedAt: new Date(),
      },
      {
        userId: archivedByObj,
        priority: EventPriority.NORMAL,
      }
    );

    console.log(`[Assessments] Examen archivé: ${examTitle}`);
  }
}

