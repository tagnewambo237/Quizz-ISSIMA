import connectDB from "@/lib/mongodb"
import Class from "@/models/Class"
import Syllabus from "@/models/Syllabus"
import User from "@/models/User"
import EducationLevel from "@/models/EducationLevel" // Required for populate
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Users, Search, Mail, GraduationCap, BookOpen } from "lucide-react"
import Link from "next/link"

export default async function TeacherStudentsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return (
            <div className="p-8 text-center">
                <p>Vous devez être connecté pour voir cette page.</p>
            </div>
        )
    }

    await connectDB()

    // Force model registration for populate
    void EducationLevel

    // 1. Find classes where teacher is mainTeacher
    const mainTeacherClassIds = await Class.find({
        mainTeacher: session.user.id,
        isActive: true
    }).distinct('_id')

    // 2. Find classes from teacher's syllabuses
    const syllabuses = await Syllabus.find({
        teacher: session.user.id
    }).select('classes').lean()

    const syllabusClassIds = syllabuses.flatMap(s => s.classes || [])

    // 3. Combine and deduplicate class IDs
    const allClassIds = [...new Set([
        ...mainTeacherClassIds.map(id => id.toString()),
        ...syllabusClassIds.map(id => id.toString())
    ])]

    // 4. Fetch all unique classes with students
    const classes = await Class.find({
        _id: { $in: allClassIds },
        isActive: true
    })
        .populate('students', 'name email image studentCode createdAt')
        .populate('level', 'name')
        .lean()

    // Flatten students with their class info
    const studentsWithClass: any[] = []

    for (const cls of classes) {
        const classStudents = (cls.students || []) as any[]
        for (const student of classStudents) {
            studentsWithClass.push({
                id: student._id?.toString(),
                name: student.name || 'Sans nom',
                email: student.email,
                image: student.image,
                studentCode: student.studentCode,
                createdAt: student.createdAt,
                className: cls.name,
                classId: cls._id?.toString(),
                levelName: (cls.level as any)?.name || ''
            })
        }
    }

    // Remove duplicates (student can be in multiple classes, but we show once per class)
    // Actually, we want to show all instances for now

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Apprenants</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {studentsWithClass.length} apprenant{studentsWithClass.length !== 1 ? 's' : ''} dans {classes.length} classe{classes.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{studentsWithClass.length}</p>
                            <p className="text-sm text-gray-500">Total Apprenants</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{classes.length}</p>
                            <p className="text-sm text-gray-500">Classes</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {classes.length > 0 ? Math.round(studentsWithClass.length / classes.length) : 0}
                            </p>
                            <p className="text-sm text-gray-500">Moyenne par classe</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un apprenant..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                </div>

                {studentsWithClass.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Users className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucun apprenant</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Vos classes n'ont pas encore d'apprenants inscrits.
                        </p>
                        <Link
                            href="/teacher/classes"
                            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                            Gérer mes classes
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Apprenant</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Classe</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Inscrit le</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {studentsWithClass.map((student, index) => (
                                    <tr key={`${student.id}-${student.classId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                {student.email || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/teacher/classes/${student.classId}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                            >
                                                <BookOpen className="w-3 h-3" />
                                                {student.className}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                {student.studentCode || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR') : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
