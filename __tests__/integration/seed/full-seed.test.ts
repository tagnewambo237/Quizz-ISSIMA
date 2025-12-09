import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import { seedEducationLevels } from '../../../scripts/seed/education-levels'
import { seedFields } from '../../../scripts/seed/fields'
import { seedSubjects } from '../../../scripts/seed/subjects'
import { seedCompetencies } from '../../../scripts/seed/competencies'
import EducationLevel from '../../../models/EducationLevel'
import Field from '../../../models/Field'
import Subject from '../../../models/Subject'
import Competency from '../../../models/Competency'
import { Cycle, SubSystem } from '../../../models/enums'

describe('Full Seed Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB()
  }, 30000)

  afterEach(async () => {
    await clearTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  describe('seedEducationLevels', () => {
    it('devrait créer tous les niveaux d\'éducation', async () => {
      const count = await seedEducationLevels()

      expect(count).toBeGreaterThan(0)

      // Vérifier les niveaux francophone
      const francophone = await EducationLevel.find({ subSystem: SubSystem.FRANCOPHONE })
      expect(francophone.length).toBeGreaterThan(10)

      // Vérifier les niveaux anglophone
      const anglophone = await EducationLevel.find({ subSystem: SubSystem.ANGLOPHONE })
      expect(anglophone.length).toBeGreaterThan(5)
    })

    it('devrait être idempotent (re-run ne crée pas de doublons)', async () => {
      const count1 = await seedEducationLevels()
      const count2 = await seedEducationLevels() // Re-run

      expect(count1).toBe(count2) // Même nombre de documents
    })

    it('devrait créer des niveaux avec toutes les propriétés requises', async () => {
      await seedEducationLevels()

      const level = await EducationLevel.findOne({ code: '6EME' })

      expect(level).toBeDefined()
      expect(level?.name).toBeDefined()
      expect(level?.code).toBe('6EME')
      expect(level?.cycle).toBe(Cycle.COLLEGE)
      expect(level?.subSystem).toBe(SubSystem.FRANCOPHONE)
      expect(level?.order).toBe(1)
      expect(level?.isActive).toBe(true)
      expect(level?.metadata).toBeDefined()
    })
  })

  describe('seedFields', () => {
    beforeEach(async () => {
      // Les fields dépendent des levels
      await seedEducationLevels()
    })

    it('devrait créer toutes les filières/séries', async () => {
      const count = await seedFields()

      expect(count).toBeGreaterThan(0)

      // Vérifier les séries francophone
      const serieC = await Field.findOne({ code: 'SERIE_C' })
      expect(serieC).toBeDefined()
      expect(serieC?.name).toContain('Série C')

      // Vérifier les streams anglophone
      const scienceStream = await Field.findOne({ code: 'SCIENCE_STREAM' })
      expect(scienceStream).toBeDefined()
    })

    it('devrait avoir les relations correctes avec EducationLevel', async () => {
      await seedFields()

      const serieC = await Field.findOne({ code: 'SERIE_C' }).populate('applicableLevels')

      expect(serieC).toBeDefined()
      expect(serieC?.applicableLevels).toBeDefined()
      expect(serieC?.applicableLevels.length).toBeGreaterThan(0)

      // Vérifier que les niveaux sont bien TLE_C et 1ERE_C
      const levelCodes = (serieC?.applicableLevels as any[]).map((level: any) => level.code)
      expect(levelCodes).toContain('TLE_C')
      expect(levelCodes).toContain('1ERE_C')
    })

    it('devrait être idempotent', async () => {
      const count1 = await seedFields()
      const count2 = await seedFields()

      expect(count1).toBe(count2)
    })
  })

  describe('seedSubjects', () => {
    beforeEach(async () => {
      // Les subjects dépendent des levels et fields
      await seedEducationLevels()
      await seedFields()
    })

    it('devrait créer toutes les matières', async () => {
      const count = await seedSubjects()

      expect(count).toBeGreaterThan(0)

      // Vérifier matières francophone
      const math = await Subject.findOne({ code: 'MATH' })
      expect(math).toBeDefined()
      expect(math?.name).toBe('Mathématiques')

      // Vérifier matières anglophone
      const mathematics = await Subject.findOne({ code: 'MATHEMATICS' })
      expect(mathematics).toBeDefined()
      expect(mathematics?.name).toBe('Mathematics')
    })

    it('devrait avoir les relations correctes avec EducationLevel et Field', async () => {
      await seedSubjects()

      const math = await Subject.findOne({ code: 'MATH' })
        .populate('applicableLevels')
        .populate('applicableFields')

      expect(math).toBeDefined()
      expect(math?.applicableLevels).toBeDefined()
      expect(math?.applicableFields).toBeDefined()
      expect(math?.applicableLevels.length).toBeGreaterThan(0)
      expect(math?.applicableFields.length).toBeGreaterThan(0)
    })

    it('devrait marquer correctement les matières transversales', async () => {
      await seedSubjects()

      const math = await Subject.findOne({ code: 'MATH' })
      const svt = await Subject.findOne({ code: 'SVT' })

      expect(math?.isTransversal).toBe(true) // Maths est transversal
      expect(svt?.isTransversal).toBe(false) // SVT est spécifique à Série D
    })

    it('devrait être idempotent', async () => {
      const count1 = await seedSubjects()
      const count2 = await seedSubjects()

      expect(count1).toBe(count2)
    })
  })

  describe('seedCompetencies', () => {
    beforeEach(async () => {
      // Les competencies dépendent des subjects
      await seedEducationLevels()
      await seedFields()
      await seedSubjects()
    })

    it('devrait créer toutes les compétences', async () => {
      const count = await seedCompetencies()

      expect(count).toBeGreaterThan(0)

      // Vérifier quelques compétences
      const digital = await Competency.findOne({ code: 'COMP_DIGITAL' })
      expect(digital).toBeDefined()
      expect(digital?.type).toBe('DIGITAL')

      const entrepreneurial = await Competency.findOne({ code: 'COMP_ENTREPRENEURIAL' })
      expect(entrepreneurial).toBeDefined()
      expect(entrepreneurial?.type).toBe('ENTREPRENEURIAL')
    })

    it('devrait avoir les relations correctes avec Subject', async () => {
      await seedCompetencies()

      const digital = await Competency.findOne({ code: 'COMP_DIGITAL' })
        .populate('relatedSubjects')

      expect(digital).toBeDefined()
      expect(digital?.relatedSubjects).toBeDefined()

      // Digital devrait être lié à INFO et COMP_SCI
      const subjectCodes = (digital?.relatedSubjects as any[]).map((s: any) => s.code)
      expect(subjectCodes).toContain('INFO')
    })

    it('devrait avoir des critères d\'évaluation définis', async () => {
      await seedCompetencies()

      const digital = await Competency.findOne({ code: 'COMP_DIGITAL' })

      expect(digital?.assessmentCriteria).toBeDefined()
      expect(digital?.assessmentCriteria.length).toBeGreaterThan(0)

      // Vérifier la structure d'un critère
      const criterion = digital?.assessmentCriteria[0]
      expect(criterion?.criterion).toBeDefined()
      expect(criterion?.weight).toBeGreaterThan(0)
      expect(criterion?.weight).toBeLessThanOrEqual(1)

      // Vérifier que la somme des poids = 1
      const totalWeight = digital?.assessmentCriteria.reduce(
        (sum, c) => sum + c.weight,
        0
      )
      expect(totalWeight).toBeCloseTo(1, 1) // toBeCloseTo for floating point
    })

    it('devrait être idempotent', async () => {
      const count1 = await seedCompetencies()
      const count2 = await seedCompetencies()

      expect(count1).toBe(count2)
    })
  })

  describe('Full Seed Workflow', () => {
    it('devrait exécuter le seed complet dans le bon ordre', async () => {
      // Seed dans l'ordre des dépendances
      const levelCount = await seedEducationLevels()
      const fieldCount = await seedFields()
      const subjectCount = await seedSubjects()
      const competencyCount = await seedCompetencies()

      expect(levelCount).toBeGreaterThan(0)
      expect(fieldCount).toBeGreaterThan(0)
      expect(subjectCount).toBeGreaterThan(0)
      expect(competencyCount).toBeGreaterThan(0)

      // Vérifier que toutes les relations sont correctes
      const serieC = await Field.findOne({ code: 'SERIE_C' })
        .populate('applicableLevels')

      const math = await Subject.findOne({ code: 'MATH' })
        .populate('applicableLevels')
        .populate('applicableFields')

      const digital = await Competency.findOne({ code: 'COMP_DIGITAL' })
        .populate('relatedSubjects')

      expect(serieC?.applicableLevels.length).toBeGreaterThan(0)
      expect(math?.applicableLevels.length).toBeGreaterThan(0)
      expect(math?.applicableFields.length).toBeGreaterThan(0)
      expect(digital?.relatedSubjects.length).toBeGreaterThan(0)
    })

    it('devrait avoir une performance acceptable (< 10 secondes)', async () => {
      const startTime = Date.now()

      await seedEducationLevels()
      await seedFields()
      await seedSubjects()
      await seedCompetencies()

      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000 // en secondes

      expect(duration).toBeLessThan(10) // Doit finir en moins de 10 secondes
    }, 15000) // Timeout de 15 secondes pour le test
  })
})
