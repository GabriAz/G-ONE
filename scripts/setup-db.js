const mysql = require('mysql2/promise');

async function setup() {
  const connection = await mysql.createConnection({
    host: '192.168.18.58',
    user: 'controle',
    password: 'Controle_DB_2026!',
    database: 'controle'
  });

  try {
    console.log('Criando tabelas G•ONE (prefixo gone_)...');

    // Users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_users (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(191) NOT NULL,
        role VARCHAR(191) DEFAULT 'USER',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    // Pipeline Stages
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_pipeline_stages (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        color VARCHAR(191) NOT NULL,
        orderIndex INTEGER NOT NULL,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    // Leads
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_leads (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        company VARCHAR(191),
        email VARCHAR(191),
        phone VARCHAR(191),
        notes TEXT,
        assignedUserId VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (assignedUserId) REFERENCES gone_users(id)
      )
    `);

    // Deals
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_deals (
        id VARCHAR(191) PRIMARY KEY,
        title VARCHAR(191) NOT NULL,
        description TEXT,
        estimatedValue DOUBLE,
        status VARCHAR(191) DEFAULT 'OPEN',
        leadId VARCHAR(191) NOT NULL,
        stageId VARCHAR(191) NOT NULL,
        assignedUserId VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (leadId) REFERENCES gone_leads(id),
        FOREIGN KEY (stageId) REFERENCES gone_pipeline_stages(id),
        FOREIGN KEY (assignedUserId) REFERENCES gone_users(id)
      )
    `);

    // Projects
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_projects (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        description TEXT,
        status VARCHAR(191) DEFAULT 'PLANNING',
        dealId VARCHAR(191),
        assignedUserId VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (dealId) REFERENCES gone_deals(id),
        FOREIGN KEY (assignedUserId) REFERENCES gone_users(id)
      )
    `);

    // Activities
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_activities (
        id VARCHAR(191) PRIMARY KEY,
        type VARCHAR(191) NOT NULL,
        origin VARCHAR(191) NOT NULL,
        entityType VARCHAR(191),
        entityId VARCHAR(191),
        title VARCHAR(191) NOT NULL,
        description TEXT,
        dueAt DATETIME(3) NOT NULL,
        status VARCHAR(191) DEFAULT 'OPEN',
        priority VARCHAR(191) DEFAULT 'MEDIUM',
        assignedUserId VARCHAR(191) NOT NULL,
        leadId VARCHAR(191),
        dealId VARCHAR(191),
        projectId VARCHAR(191),
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (assignedUserId) REFERENCES gone_users(id),
        FOREIGN KEY (leadId) REFERENCES gone_leads(id),
        FOREIGN KEY (dealId) REFERENCES gone_deals(id),
        FOREIGN KEY (projectId) REFERENCES gone_projects(id)
      )
    `);

    // Notifications
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_notifications (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) NOT NULL,
        activityId VARCHAR(191) NOT NULL,
        type VARCHAR(191) NOT NULL,
        sentAt DATETIME(3),
        status VARCHAR(191) DEFAULT 'PENDING',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        FOREIGN KEY (userId) REFERENCES gone_users(id),
        FOREIGN KEY (activityId) REFERENCES gone_activities(id)
      )
    `);

    // Activity Logs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS gone_activity_logs (
        id VARCHAR(191) PRIMARY KEY,
        activityId VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        action VARCHAR(191) NOT NULL,
        timestamp DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        details TEXT,
        FOREIGN KEY (activityId) REFERENCES gone_activities(id),
        FOREIGN KEY (userId) REFERENCES gone_users(id)
      )
    `);

    // Seed Inicial
    console.log('Populando dados iniciais...');

    // Admin User (se não existir)
    await connection.execute(`
      INSERT IGNORE INTO gone_users (id, name, email, password, role) 
      VALUES ('admin-id', 'Gabriel Azevedo', 'admin@gone.local', '$2a$10$vI8BvSdS.S/hF3.uN4P2Re.m7M.3Z9.lS.lS.lS.lS.lS.lS.', 'ADMIN')
    `);

    // Pipeline Stages
    const stages = [
      { id: 'stg-1', name: 'Lead', color: '#94A3B8', orderIndex: 0 },
      { id: 'stg-2', name: 'Qualificação', color: '#60A5FA', orderIndex: 1 },
      { id: 'stg-3', name: 'Prospecção', color: '#FBBF24', orderIndex: 2 },
      { id: 'stg-4', name: 'Negociação', color: '#F472B6', orderIndex: 3 },
      { id: 'stg-5', name: 'Fechamento', color: '#10B981', orderIndex: 4 },
    ];

    for (const stage of stages) {
      await connection.execute(`
        INSERT IGNORE INTO gone_pipeline_stages (id, name, color, orderIndex)
        VALUES (?, ?, ?, ?)
      `, [stage.id, stage.name, stage.color, stage.orderIndex]);
    }

    // Leads Exemplo
    await connection.execute(`
       INSERT IGNORE INTO gone_leads (id, name, company, email, assignedUserId) 
       VALUES ('lead-1', 'Bruno Oliveira', 'Tech Solutions', 'bruno@tech.com', 'admin-id'),
              ('lead-2', 'Carla Mendes', 'Studio Zen', 'carla@zen.com', 'admin-id')
    `);

    // Deals Exemplo
    await connection.execute(`
       INSERT IGNORE INTO gone_deals (id, title, estimatedValue, leadId, stageId, assignedUserId) 
       VALUES ('deal-1', 'Renovação Contrato Tech', 12000, 'lead-1', 'stg-4', 'admin-id'),
              ('deal-2', 'Consultoria Studio Zen', 4500, 'lead-2', 'stg-2', 'admin-id')
    `);

    // Activities Exemplo
    await connection.execute(`
      INSERT IGNORE INTO gone_activities (id, type, origin, leadId, dealId, title, dueAt, priority, status, assignedUserId)
      VALUES ('act-1', 'FOLLOW_UP', 'SYSTEM', NULL, NULL, 'Follow-up proposta — Studio Que', DATE_SUB(NOW(), INTERVAL 1 DAY), 'HIGH', 'OPEN', 'admin-id'),
             ('act-2', 'FOLLOW_UP', 'CRM', 'lead-1', NULL, 'Ligar para lead Bruno', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'MEDIUM', 'OPEN', 'admin-id'),
             ('act-3', 'TASK', 'SYSTEM', NULL, NULL, 'Enviar contrato revisado', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'HIGH', 'OPEN', 'admin-id'),
             ('act-4', 'MEETING', 'CRM', 'lead-2', 'deal-2', 'Reunião Studio Zen', DATE_ADD(NOW(), INTERVAL 20 HOUR), 'MEDIUM', 'OPEN', 'admin-id'),
             ('act-5', 'TASK', 'CRM', 'lead-1', 'deal-1', 'Revisar proposta Alpha', DATE_ADD(NOW(), INTERVAL 3 DAY), 'LOW', 'OPEN', 'admin-id')
    `);

    console.log('Setup concluído com sucesso!');
  } catch (error) {
    console.error('Erro no setup do banco:', error);
  } finally {
    await connection.end();
  }
}

setup();
