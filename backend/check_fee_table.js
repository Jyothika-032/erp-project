const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function checkTables() {
    try {
        const tables = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `, { type: QueryTypes.SELECT });
        console.log('Tables in database:', tables.map(t => t.table_name));
        
        // Check fee_structure specifically
        const feeTable = tables.find(t => t.table_name === 'fee_structure');
        if (feeTable) {
            const columns = await sequelize.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'fee_structure'
            `, { type: QueryTypes.SELECT });
            console.log('Columns in fee_structure:', columns);
        } else {
            console.log('fee_structure table NOT found!');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkTables();
