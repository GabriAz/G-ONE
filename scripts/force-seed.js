const mysql = require('mysql2/promise');

async function setup() {
    const connection = await mysql.createConnection({
        host: '192.168.18.58',
        user: 'controle',
        password: 'Controle_DB_2026!',
        database: 'controle'
    });

    try {
        console.log('Limpando e populando G•ONE (prefixo gone_)...');

        // Desabilitar chaves estrangeiras temporariamente para limpeza
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

        const tables = [
            'gone_notifications', 'gone_activity_logs', 'gone_activities',
            'gone_projects', 'gone_deals', 'gone_leads', 'gone_pipeline_stages'
        ];

        for (const table of tables) {
            await connection.execute(`TRUNCATE TABLE ${table}`);
        }

        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Admin User (se não existir, mantemos ou recriamos)
        await connection.execute(`
      INSERT IGNORE INTO gone_users (id, name, email, password, role) 
      VALUES ('admin-id', 'Gabriel Azevedo', 'admin@gone.local', '$2a$10$vI8BvSdS.S/hF3.uN4P2Re.m7M.3Z9.lS.lS.lS.lS.lS.lS.', 'ADMIN')
    `);

        // Pipeline Stages (NOMES OFICIAIS DO PLANO)
        const stages = [
            { id: 'stg-1', name: 'Lead', color: '#94A3B8', orderIndex: 0 },
            { id: 'stg-2', name: 'Qualificação', color: '#60A5FA', orderIndex: 1 },
            { id: 'stg-3', name: 'Prospecção', color: '#FBBF24', orderIndex: 2 },
            { id: 'stg-4', name: 'Negociação', color: '#F472B6', orderIndex: 3 },
            { id: 'stg-5', name: 'Fechamento', color: '#10B981', orderIndex: 4 },
        ];

        for (const stage of stages) {
            await connection.execute(`
        INSERT INTO gone_pipeline_stages (id, name, color, orderIndex)
        VALUES (?, ?, ?, ?)
      `, [stage.id, stage.name, stage.color, stage.orderIndex]);
        }

        // Leads Exemplo
        await connection.execute(`
       INSERT INTO gone_leads (id, name, company, email, assignedUserId) 
       VALUES ('lead-1', 'Bruno Oliveira', 'Tech Solutions', 'bruno@tech.com', 'admin-id'),
              ('lead-2', 'Carla Mendes', 'Studio Zen', 'carla@zen.com', 'admin-id')
    `);

        // Deals Exemplo
        await connection.execute(`
       INSERT INTO gone_deals (id, title, estimatedValue, leadId, stageId, assignedUserId) 
       VALUES ('deal-1', 'Renovação Contrato Tech', 12000, 'lead-1', 'stg-4', 'admin-id'),
              ('deal-2', 'Consultoria Studio Zen', 4500, 'lead-2', 'stg-2', 'admin-id')
    `);

        // Activities Exemplo
        await connection.execute(`
      INSERT INTO gone_activities (id, type, origin, leadId, dealId, title, dueAt, priority, status, assignedUserId)
      VALUES ('act-1', 'FOLLOW_UP', 'SYSTEM', NULL, NULL, 'Follow-up proposta — Studio Que', DATE_SUB(NOW(), INTERVAL 1 DAY), 'HIGH', 'OPEN', 'admin-id'),
             ('act-2', 'FOLLOW_UP', 'CRM', 'lead-1', NULL, 'Ligar para lead Bruno', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'MEDIUM', 'OPEN', 'admin-id'),
             ('act-3', 'TASK', 'SYSTEM', NULL, NULL, 'Enviar contrato revisado', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'HIGH', 'OPEN', 'admin-id'),
             ('act-4', 'MEETING', 'CRM', 'lead-2', 'deal-2', 'Reunião Studio Zen', DATE_ADD(NOW(), INTERVAL 20 HOUR), 'MEDIUM', 'OPEN', 'admin-id'),
             ('act-5', 'TASK', 'CRM', 'lead-1', 'deal-1', 'Revisar proposta Alpha', DATE_ADD(NOW(), INTERVAL 3 DAY), 'LOW', 'OPEN', 'admin-id')
    `);

        console.log('Seed forçado concluído com sucesso!');
    } catch (error) {
        console.error('Erro no seed forçado:', error);
    } finally {
        await connection.end();
    }
}

setup();
