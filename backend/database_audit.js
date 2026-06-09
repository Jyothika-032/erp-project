const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function dumpFullSchema() {
    try {
        console.log("--- STARTING DATABASE AUDIT ---");
        
        // 1. Get all tables
        const tables = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `, { type: QueryTypes.SELECT });
        
        const tableNames = tables.map(t => t.table_name);
        console.log("Tables found:", tableNames.join(", "));

        // 2. Get columns for every table
        for (const tableName of tableNames) {
            const columns = await sequelize.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = :tableName
                ORDER BY ordinal_position
            `, { 
                replacements: { tableName },
                type: QueryTypes.SELECT 
            });
            
            console.log(`\n[TABLE: ${tableName}]`);
            console.table(columns);
        }

        console.log("\n--- AUDIT COMPLETE ---");
    } catch (err) {
        console.error('Audit Error:', err);
    } finally {
        process.exit();
    }
}

dumpFullSchema();
