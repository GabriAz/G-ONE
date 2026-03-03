import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import DealForm from '@/components/forms/DealForm'

export default async function NewDealPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const [leads, stages] = await Promise.all([
        prisma.lead.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, company: true }
        }),
        prisma.pipelineStage.findMany({
            orderBy: { orderIndex: 'asc' },
            select: { id: true, name: true }
        })
    ])

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
            <DealForm leads={leads} stages={stages} />
        </div>
    )
}
