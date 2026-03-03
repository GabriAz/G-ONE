'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActivityType, Priority } from '@prisma/client'

export async function createLead(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error('Unauthorized')

    const userId = (session.user as any).id as string
    if (!userId) throw new Error('User ID not found in session')

    const name = formData.get('name') as string
    const company = formData.get('company') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const notes = formData.get('notes') as string

    // Activity Data
    const activityType = formData.get('activityType') as ActivityType
    const dueAtStr = formData.get('dueAt') as string
    const activityTitle = formData.get('activityTitle') as string || `Follow-up: ${name}`

    if (!name || !activityType || !dueAtStr) {
        throw new Error('Campos obrigatórios faltando')
    }

    const dueAt = new Date(dueAtStr)

    // Transaction: Create Lead + First Activity
    await prisma.$transaction(async (tx) => {
        const lead = await tx.lead.create({
            data: {
                name,
                company,
                email,
                phone,
                notes,
                assignedUserId: userId,
            },
        })

        await tx.activity.create({
            data: {
                type: activityType,
                origin: 'CRM',
                entityType: 'lead',
                entityId: lead.id,
                leadId: lead.id,
                title: activityTitle,
                dueAt,
                priority: 'MEDIUM',
                assignedUserId: userId,
            },
        })
    })

    revalidatePath('/leads')
    revalidatePath('/hoje')
    redirect('/leads')
}
