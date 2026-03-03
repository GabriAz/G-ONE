'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActivityType, Priority } from '@prisma/client'

export async function createDeal(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) throw new Error('Unauthorized')

    const userId = (session.user as any).id as string
    if (!userId) throw new Error('User ID not found in session')

    const title = formData.get('title') as string
    const leadId = formData.get('leadId') as string
    const stageId = formData.get('stageId') as string
    const estimatedValue = formData.get('estimatedValue') ? parseFloat(formData.get('estimatedValue') as string) : null

    // Activity Data
    const activityType = formData.get('activityType') as ActivityType
    const dueAtStr = formData.get('dueAt') as string
    const activityTitle = formData.get('activityTitle') as string || `Follow-up Negócio: ${title}`

    if (!title || !leadId || !stageId || !activityType || !dueAtStr) {
        throw new Error('Campos obrigatórios faltando')
    }

    const dueAt = new Date(dueAtStr)

    // Transaction: Create Deal + First Activity
    await prisma.$transaction(async (tx) => {
        const deal = await tx.deal.create({
            data: {
                title,
                leadId,
                stageId,
                estimatedValue,
                assignedUserId: userId,
            },
        })

        await tx.activity.create({
            data: {
                type: activityType,
                origin: 'CRM',
                entityType: 'deal',
                entityId: deal.id,
                dealId: deal.id,
                leadId: leadId,
                title: activityTitle,
                dueAt,
                priority: 'MEDIUM',
                assignedUserId: userId,
            },
        })
    })

    revalidatePath('/pipeline')
    revalidatePath('/hoje')
    redirect('/pipeline')
}
