import { initializeDB, createTable } from './connection.js';
import fs from 'fs';
import path from 'path';

const tables_dir = path.join(process.cwd(), 'src', 'database', 'modules', 'tables');
const tableFiles = fs.readdirSync(tables_dir);

async function loadTables() {
    const TABLES = {};

    for (const file of tableFiles) {
        if (file.endsWith('.js')) {
            const tableName = path.basename(file, '.js');
            try {
                // Use dynamic import with proper path
                const modulePath = path.join(tables_dir, file);
                const tableModule = await import(modulePath);
                TABLES[tableName] = tableModule.default || tableModule;
                console.log(`✅ Loaded table: ${tableName}`);
            } catch (error) {
                console.error(`❌ Error loading table ${tableName}:`, error.message);
            }
        }
    }
    
    return TABLES;
}

async function setupDatabase() {
    try {
        console.log('🚀 STARTING DATABASE SETUP...');

        // Step 1: Load all tables first
        const TABLES = await loadTables();
        
        if (Object.keys(TABLES).length === 0) {
            console.error('❌ No tables found to create!');
            process.exit(1);
        }

        console.log(`📋 Found ${Object.keys(TABLES).length} tables to create:`);
        console.log(Object.keys(TABLES));

        // Step 2: Initialize database
        const db = await initializeDB();

        // Step 3: CREATE ALL TABLES
        for (const [tableName, columns] of Object.entries(TABLES)) {
            console.log(`\n🚀 CREATING TABLE: ${tableName}`);
            console.log(`Columns:`, Object.keys(columns));
            await createTable(tableName, columns);
            console.log(`✅ TABLE CREATED: ${tableName}`);
        }

        await db.end();

        console.log('\n🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
        console.log(`📊 Created ${Object.keys(TABLES).length} tables`);

    } catch (error) {
        console.error('💥 DATABASE SETUP FAILED:', error);
        process.exit(1);
    }
}

// Run the setup
setupDatabase();