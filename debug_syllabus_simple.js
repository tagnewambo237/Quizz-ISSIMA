
const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();

const SyllabusSchema = new Schema({
    title: String,
    subject: { type: Schema.Types.ObjectId, ref: 'Subject' },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
    status: String
});
const SubjectSchema = new Schema({
    name: String
});

const Syllabus = mongoose.models.Syllabus || mongoose.model('Syllabus', SyllabusSchema);
const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);

async function run() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected to DB");

        const syllabuses = await Syllabus.find({}).populate('subject');
        console.log(`Found ${syllabuses.length} total syllabuses.`);

        syllabuses.forEach(s => {
            console.log(`ID: ${s._id}`);
            console.log(`  Title: ${s.title}`);
            console.log(`  Subject: ${s.subject?._id} (${s.subject?.name})`);
            console.log(`  Teacher: ${s.teacher}`);
            console.log(`  Status: ${s.status}`);
            console.log('---');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
