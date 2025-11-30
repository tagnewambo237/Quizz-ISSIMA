import mongoose from 'mongoose'
import { setupTestDB, teardownTestDB, clearTestDB } from '../../helpers/db-setup'
import {
  findOrCreate,
  findOrUpsert,
  validateSeedData,
  validateSeedDataArray,
  resolveReferences,
  countDocuments
} from '../../../scripts/seed/utils/seed-helpers'
import EducationLevel from '../../../models/EducationLevel'
import { Cycle, SubSystem } from '../../../models/enums'

describe('Seed Helpers', () => {
  beforeAll(async () => {
    await setupTestDB()
  }, 30000)

  afterEach(async () => {
    await clearTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  describe('findOrCreate', () => {
    it('devrait créer un nouveau document si non existant', async () => {
      const levelData = {
        name: 'Sixième',
        code: '6EME',
        cycle: Cycle.COLLEGE,
        subSystem: SubSystem.FRANCOPHONE,
        order: 1,
        isActive: true
      }

      const level = await findOrCreate(
        EducationLevel,
        { code: '6EME' },
        levelData
      )

      expect(level).toBeDefined()
      expect(level.code).toBe('6EME')
      expect(level.name).toBe('Sixième')

      const count = await EducationLevel.countDocuments()
      expect(count).toBe(1)
    })

    it('devrait retourner le document existant sans créer de doublon', async () => {
      const levelData = {
        name: 'Sixième',
        code: '6EME',
        cycle: Cycle.COLLEGE,
        subSystem: SubSystem.FRANCOPHONE,
        order: 1,
        isActive: true
      }

      // Première création
      await findOrCreate(EducationLevel, { code: '6EME' }, levelData)

      // Deuxième appel (devrait retourner l'existant)
      await findOrCreate(EducationLevel, { code: '6EME' }, levelData)

      const count = await EducationLevel.countDocuments()
      expect(count).toBe(1) // Pas de doublon
    })

    it('devrait gérer les erreurs correctement', async () => {
      const invalidData = {
        // Missing required fields
        code: '6EME'
      }

      await expect(
        findOrCreate(EducationLevel, { code: '6EME' }, invalidData as any)
      ).rejects.toThrow()
    })
  })

  describe('findOrUpsert', () => {
    it('devrait créer un nouveau document si non existant', async () => {
      const levelData = {
        name: 'Sixième',
        code: '6EME',
        cycle: Cycle.COLLEGE,
        subSystem: SubSystem.FRANCOPHONE,
        order: 1,
        isActive: true
      }

      const level = await findOrUpsert(
        EducationLevel,
        { code: '6EME' },
        levelData
      )

      expect(level).toBeDefined()
      expect(level.code).toBe('6EME')
    })

    it('devrait mettre à jour le document existant', async () => {
      const initialData = {
        name: 'Sixieme',
        code: '6EME',
        cycle: Cycle.COLLEGE,
        subSystem: SubSystem.FRANCOPHONE,
        order: 1,
        isActive: true
      }

      await findOrUpsert(EducationLevel, { code: '6EME' }, initialData)

      const updatedData = {
        name: 'Sixième (Updated)',
        code: '6EME',
        cycle: Cycle.COLLEGE,
        subSystem: SubSystem.FRANCOPHONE,
        order: 1,
        isActive: false
      }

      const updated = await findOrUpsert(EducationLevel, { code: '6EME' }, updatedData)

      expect(updated.name).toBe('Sixième (Updated)')
      expect(updated.isActive).toBe(false)

      const count = await EducationLevel.countDocuments()
      expect(count).toBe(1) // Toujours un seul document
    })
  })

  describe('validateSeedData', () => {
    it('devrait valider des données correctes', () => {
      const validData = {
        name: 'Sixième',
        code: '6EME',
        cycle: Cycle.COLLEGE
      }

      expect(() => {
        validateSeedData(validData, ['name', 'code', 'cycle'])
      }).not.toThrow()
    })

    it('devrait lever une erreur si des champs requis manquent', () => {
      const invalidData = {
        name: 'Sixième',
        // Missing code and cycle
      }

      expect(() => {
        validateSeedData(invalidData, ['name', 'code', 'cycle'])
      }).toThrow('Missing required fields: code, cycle')
    })

    it('devrait lever une erreur si data n\'est pas un objet', () => {
      expect(() => {
        validateSeedData(null, ['name'])
      }).toThrow('Invalid data: must be an object')

      expect(() => {
        validateSeedData('string', ['name'])
      }).toThrow('Invalid data: must be an object')
    })
  })

  describe('validateSeedDataArray', () => {
    it('devrait valider un tableau de données correctes', () => {
      const validArray = [
        { name: 'Sixième', code: '6EME', cycle: 'COLLEGE' },
        { name: 'Cinquième', code: '5EME', cycle: 'COLLEGE' }
      ]

      expect(() => {
        validateSeedDataArray(validArray, ['name', 'code', 'cycle'])
      }).not.toThrow()
    })

    it('devrait lever une erreur si un élément est invalide', () => {
      const invalidArray = [
        { name: 'Sixième', code: '6EME', cycle: 'COLLEGE' },
        { name: 'Cinquième' } // Missing code and cycle
      ]

      expect(() => {
        validateSeedDataArray(invalidArray, ['name', 'code', 'cycle'])
      }).toThrow('Validation failed at index 1')
    })

    it('devrait lever une erreur si data n\'est pas un tableau', () => {
      expect(() => {
        validateSeedDataArray({} as any, ['name'])
      }).toThrow('Invalid data: must be an array')
    })
  })

  describe('resolveReferences', () => {
    beforeEach(async () => {
      // Créer quelques niveaux de test
      await EducationLevel.create([
        { name: 'Sixième', code: '6EME', cycle: Cycle.COLLEGE, subSystem: SubSystem.FRANCOPHONE, order: 1 },
        { name: 'Cinquième', code: '5EME', cycle: Cycle.COLLEGE, subSystem: SubSystem.FRANCOPHONE, order: 2 },
        { name: 'Quatrième', code: '4EME', cycle: Cycle.COLLEGE, subSystem: SubSystem.FRANCOPHONE, order: 3 }
      ])
    })

    it('devrait résoudre les références correctement', async () => {
      const codes = ['6EME', '5EME', '4EME']
      const ids = await resolveReferences(EducationLevel, codes, 'code')

      expect(ids).toHaveLength(3)
      expect(ids.every(id => id instanceof mongoose.Types.ObjectId)).toBe(true)
    })

    it('devrait retourner un tableau vide si aucun code fourni', async () => {
      const ids = await resolveReferences(EducationLevel, [], 'code')
      expect(ids).toEqual([])
    })

    it('devrait logger un avertissement si certaines références ne sont pas trouvées', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      const codes = ['6EME', 'INVALID_CODE', '5EME']
      const ids = await resolveReferences(EducationLevel, codes, 'code')

      expect(ids).toHaveLength(2) // Seulement 2 trouvés
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Some references not found')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('countDocuments', () => {
    beforeEach(async () => {
      await EducationLevel.create([
        { name: 'Sixième', code: '6EME', cycle: Cycle.COLLEGE, subSystem: SubSystem.FRANCOPHONE, order: 1 },
        { name: 'Cinquième', code: '5EME', cycle: Cycle.COLLEGE, subSystem: SubSystem.FRANCOPHONE, order: 2 },
        { name: 'Form 1', code: 'FORM_1', cycle: Cycle.COLLEGE, subSystem: SubSystem.ANGLOPHONE, order: 1 }
      ])
    })

    it('devrait compter tous les documents sans query', async () => {
      const count = await countDocuments(EducationLevel)
      expect(count).toBe(3)
    })

    it('devrait compter les documents avec query', async () => {
      const count = await countDocuments(EducationLevel, { subSystem: SubSystem.FRANCOPHONE })
      expect(count).toBe(2)
    })
  })
})
