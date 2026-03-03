const mysql = require('mysql2/promise');

async function fix() {
    const url = 'mysql://controle:Controle_DB_2026%21@192.168.18.58:3306/controle';
    console.log('--- G•ONE DATABASE FIX v3.1 ---');
    try {
        const connection = await mysql.createConnection(url);
        console.log('Connected to MySQL.');

        const runSQL = async (sql) => {
            try {
                console.log(`Executing: ${sql}`);
                await connection.execute(sql);
            } catch (e) {
                if (e.message.includes('Duplicate column name')) {
                    console.log('  -> Column already exists.');
                } else {
                    console.error(`  -> SQL ERROR: ${e.message}`);
                }
            }
        };

        // Table: gone_activities
        await runSQL('ALTER TABLE gone_activities ADD COLUMN snoozedUntil DATETIME(3) NULL AFTER assignedUserId');
        await runSQL('ALTER TABLE gone_activities ADD COLUMN completedAt DATETIME(3) NULL AFTER snoozedUntil');
        await runSQL('ALTER TABLE gone_activities ADD COLUMN canceledAt DATETIME(3) NULL AFTER completedAt');

        // Table: gone_deals
        await runSQL('ALTER TABLE gone_deals ADD COLUMN closedAt DATETIME(3) NULL AFTER assignedUserId');
        await runSQL('ALTER TABLE gone_deals ADD COLUMN lostReason VARCHAR(191) NULL AFTER closedAt');

        console.log('✅ REPARO CONCLUÍDO.');
        await connection.end();
    } catch (error) {
        console.error('❌ ERRO CRÍTICO NO REPARO:', error.message);
    }
    process.exit(0);
}

fix();
