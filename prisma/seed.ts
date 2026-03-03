import { PrismaClient, ActivityType, Priority, ActivityStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Limpando Banco G•ONE...')

    // Limpeza (ordem inversa das FKs)
    await prisma.activityLog.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.project.deleteMany()
    await prisma.deal.deleteMany()
    await prisma.lead.deleteMany()
    await prisma.pipelineStage.deleteMany()

    console.log('Populando Estágios do Pipeline...')
    const stages = [
        { id: 'stg-1', name: 'Lead', color: '#94A3B8', orderIndex: 0 },
        { id: 'stg-2', name: 'Qualificação', color: '#60A5FA', orderIndex: 1 },
        { id: 'stg-3', name: 'Prospecção', color: '#FBBF24', orderIndex: 2 },
        { id: 'stg-4', name: 'Negociação', color: '#F472B6', orderIndex: 3 },
        { id: 'stg-5', name: 'Fechamento', color: '#10B981', orderIndex: 4 },
    ]

    for (const s of stages) {
        await prisma.pipelineStage.create({ data: s })
    }

    const adminEmail = 'admin@gone.local'
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (!admin) {
        console.log('Criando Usuário Admin...')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        admin = await prisma.user.create({
            data: {
                id: 'admin-id',
                name: 'Gabriel Azevedo',
                email: adminEmail,
                passwordHash: hashedPassword,
                role: 'ADMIN',
            },
        })
    }

    console.log('Criando Leads e Negócios de Exemplo...')
    const lead1 = await prisma.lead.create({
        data: {
            id: 'lead-1',
            name: 'Bruno Oliveira',
            company: 'Tech Solutions',
            email: 'bruno@tech.com',
            assignedUserId: admin.id,
        }
    })

    const lead2 = await prisma.lead.create({
        data: {
            id: 'lead-2',
            name: 'Carla Mendes',
            company: 'Studio Zen',
            email: 'carla@zen.com',
            assignedUserId: admin.id,
        }
    })

    const deal1 = await prisma.deal.create({
        data: {
            id: 'deal-1',
            title: 'Renovação Contrato Tech',
            estimatedValue: 12000,
            leadId: lead1.id,
            stageId: 'stg-4',
            assignedUserId: admin.id,
        }
    })

    const deal2 = await prisma.deal.create({
        data: {
            id: 'deal-2',
            title: 'Consultoria Studio Zen',
            estimatedValue: 4500,
            leadId: lead2.id,
            stageId: 'stg-2',
            assignedUserId: admin.id,
        }
    })

    console.log('Criando Activities...')
    await prisma.activity.createMany({
        data: [
            { id: 'act-1', type: 'FOLLOW_UP', origin: 'CRM', title: 'Follow-up proposta — Studio Que', dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000), priority: 'HIGH', assignedUserId: admin.id },
            { id: 'act-2', type: 'FOLLOW_UP', origin: 'CRM', leadId: lead1.id, title: 'Ligar para lead Bruno', dueAt: new Date(Date.now() - 2 * 60 * 60 * 1000), priority: 'MEDIUM', assignedUserId: admin.id },
            { id: 'act-3', type: 'TASK', origin: 'SYSTEM', title: 'Enviar contrato revisado', dueAt: new Date(Date.now() - 2 * 60 * 60 * 1000), priority: 'HIGH', assignedUserId: admin.id },
            { id: 'act-4', type: 'MEETING', origin: 'CRM', leadId: lead2.id, dealId: deal2.id, title: 'Reunião Studio Zen', dueAt: new Date(Date.now() + 20 * 60 * 60 * 1000), priority: 'MEDIUM', assignedUserId: admin.id },
            { id: 'act-5', type: 'TASK', origin: 'CRM', leadId: lead1.id, dealId: deal1.id, title: 'Revisar proposta Alpha', dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), priority: 'LOW', assignedUserId: admin.id },
        ]
    })

    console.log('Seed Finalizado!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
