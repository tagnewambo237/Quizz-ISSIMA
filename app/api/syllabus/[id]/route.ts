import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Syllabus, { ISyllabus, SyllabusStatus } from "@/models/Syllabus"
import { UserRole } from "@/models/enums"
import mongoose from "mongoose"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Validate ID
        if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid syllabus ID" }, { status: 400 })
        }

        await connectDB()

        const syllabus = await Syllabus.findById(id)
            .populate('subject', 'name code')
            .populate('school', 'name')
            .populate('teacher', 'name email')

        if (!syllabus) {
            return NextResponse.json({ success: false, message: "Syllabus not found" }, { status: 404 })
        }

        // Access control: Owner or Admin or Linked via School?
        // For now, strict ownership or public read? Let's assume Owner for edit details.

        return NextResponse.json({ success: true, data: syllabus })

    } catch (error: any) {
        console.error("Get Syllabus Details Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

import { SyllabusBuilder } from "@/lib/patterns/SyllabusBuilder"

// ...

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Validate ID
        if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid syllabus ID" }, { status: 400 })
        }

        await connectDB()

        const body = await req.json()
        const { title, description, structure, learningObjectives, status } = body

        // Find existing
        const existingSyllabus = await Syllabus.findById(id)
        if (!existingSyllabus) {
            return NextResponse.json({ success: false, message: "Syllabus not found" }, { status: 404 })
        }

        if (existingSyllabus.teacher.toString() !== session.user.id) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        // Use Builder to construct the update
        const builder = SyllabusBuilder.fromExisting(existingSyllabus)
            .setBasicInfo(title || existingSyllabus.title, description || existingSyllabus.description)

        if (status) {
            // We might need a method for this or just access property if allowed? 
            // The builder doesn't explicitly expose status setter, but we can assume it's part of the object it builds.
            // Let's rely on standard logic or add setStatus to builder in future. 
            // For now, let's just use what we have and maybe direct assignment if needed? 
            // Wait, builder.syllabus is private. strict update via builder methods only?
            // Just realized we didn't add setStatus. Let's assume for now we handle status separately or add it.
            // Actually, `fromExisting` loads it.
        }

        // Rebuild Structure if provided
        if (structure && Array.isArray(structure.chapters)) {
            builder.resetStructure()
            structure.chapters.forEach((chap: any) => {
                const chapterId = builder.addChapter(chap.title, chap.description)
                if (Array.isArray(chap.topics)) {
                    chap.topics.forEach((top: any) => {
                        const topicId = builder.addTopic(chapterId, top.title, top.content)
                        if (Array.isArray(top.resources)) {
                            top.resources.forEach((res: any) => {
                                builder.addResource(chapterId, topicId, {
                                    title: res.title,
                                    type: res.type,
                                    url: res.url,
                                    content: res.content
                                })
                            })
                        }
                    })
                }
            })
        }

        // Rebuild Objectives if provided
        if (learningObjectives && Array.isArray(learningObjectives)) {
            builder.resetObjectives()
            learningObjectives.forEach((obj: string) => builder.addObjective(obj))
        }

        const updateData = builder.build()

        // Explicitly handle status and increment version manually if not in builder
        const finalUpdate = {
            ...updateData,
            status: status || existingSyllabus.status,
            $inc: { version: 1 }
        }

        const updatedSyllabus = await Syllabus.findByIdAndUpdate(
            id,
            finalUpdate,
            { new: true }
        )

        // Initialize Event System
        const { initEventSystem } = await import("@/lib/events")
        initEventSystem()

        // Publish SYLLABUS_UPDATED Event
        const { EventPublisher } = await import("@/lib/events/EventPublisher")
        const { EventType } = await import("@/lib/events/types")
        const mongoose = await import("mongoose")

        const publisher = EventPublisher.getInstance()
        await publisher.publish({
            type: EventType.SYLLABUS_UPDATED,
            timestamp: new Date(),
            userId: new mongoose.Types.ObjectId(session.user.id),
            data: {
                syllabusId: updatedSyllabus?._id,
                teacherId: session.user.id,
                title: updatedSyllabus?.title,
                version: updatedSyllabus?.version
            }
        })

        return NextResponse.json({ success: true, data: updatedSyllabus })

    } catch (error: any) {
        console.error("Update Syllabus Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Validate ID
        if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: "Invalid syllabus ID" }, { status: 400 })
        }

        await connectDB()

        const existingSyllabus = await Syllabus.findById(id)
        if (!existingSyllabus) {
            return NextResponse.json({ success: false, message: "Syllabus not found" }, { status: 404 })
        }

        if (existingSyllabus.teacher.toString() !== session.user.id) {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        // Soft delete (Archive)
        existingSyllabus.status = SyllabusStatus.ARCHIVED
        await existingSyllabus.save()

        return NextResponse.json({ success: true, message: "Syllabus archived" })

    } catch (error: any) {
        console.error("Delete Syllabus Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        )
    }
}
