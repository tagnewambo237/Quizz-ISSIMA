import mongoose from 'mongoose'

/**
 * Connect to the in-memory database
 */
export async function connectDB() {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }

    // Use the global MongoDB URI set by globalSetup
    const mongoUri = `${process.env.MONGO_URI}/${Math.random().toString(36).substring(7)}`
    await mongoose.connect(mongoUri)
}

/**
 * Drop database, close the connection
 */
export async function closeDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
    }
}

/**
 * Remove all data from all collections
 */
export async function clearDB() {
    if (mongoose.connection.readyState === 0) {
        throw new Error('Database not connected')
    }

    const collections = mongoose.connection.collections

    for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany({})
    }
}

/**
 * Setup function to be called in beforeAll
 */
export async function setupTestDB() {
    await connectDB()
}

/**
 * Teardown function to be called in afterAll
 */
export async function teardownTestDB() {
    await closeDB()
}

/**
 * Clear function to be called in afterEach
 */
export async function clearTestDB() {
    await clearDB()
}
