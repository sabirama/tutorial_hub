import { initializeDB, createTable } from './connection.js';
import fs from 'fs';
import path from 'path';

import subjects from './modules/data/subjects.js';

const tables_dir = path.join(process.cwd(), 'src', 'database', 'modules', 'tables');
const tableFiles = fs.readdirSync(tables_dir);

async function loadTables() {
    const TABLES = {};

    for (const file of tableFiles) {
        if (file.endsWith('.js')) {
            const tableName = path.basename(file, '.js');
            try {
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

// Function to seed subjects data
async function seedSubjects(db) {
    try {
        console.log('\n🌱 SEEDING SUBJECTS DATA...');
        
        // First, check if subjects table exists and has data
        const existingSubjects = await db.query('SELECT COUNT(*) as count FROM subject');
        
        if (existingSubjects[0].count > 0) {
            console.log('📚 Subjects already seeded, skipping...');
            return;
        }
        
        // Insert each subject
        for (const subject of subjects) {
            const category = subject.name.includes('Mathematics') || 
                           subject.name.includes('Algebra') || 
                           subject.name.includes('Geometry') || 
                           subject.name.includes('Calculus') || 
                           subject.name.includes('Statistics') || 
                           subject.name.includes('Trigonometry') ? 'Mathematics' :
                           subject.name.includes('Physics') || 
                           subject.name.includes('Chemistry') || 
                           subject.name.includes('Biology') || 
                           subject.name.includes('Earth Science') || 
                           subject.name.includes('Environmental Science') || 
                           subject.name.includes('Anatomy') || 
                           subject.name.includes('Genetics') ? 'Science' :
                           subject.name.includes('History') || 
                           subject.name.includes('Political Science') || 
                           subject.name.includes('Sociology') || 
                           subject.name.includes('Economics') || 
                           subject.name.includes('Psychology') ? 'Social Sciences' :
                           subject.name.includes('English') || 
                           subject.name.includes('Filipino') || 
                           subject.name.includes('Spanish') || 
                           subject.name.includes('Japanese') || 
                           subject.name.includes('Korean') || 
                           subject.name.includes('Chinese') || 
                           subject.name.includes('Literature') || 
                           subject.name.includes('Writing') ? 'Languages & Literature' :
                           subject.name.includes('Computer') || 
                           subject.name.includes('Programming') || 
                           subject.name.includes('Web Development') || 
                           subject.name.includes('Information Technology') || 
                           subject.name.includes('Graphic Design') ? 'Technology' :
                           subject.name.includes('Art') || 
                           subject.name.includes('Music') ? 'Arts' :
                           subject.name.includes('Physical Education') || 
                           subject.name.includes('Health') ? 'Physical Education' :
                           subject.name.includes('Accounting') || 
                           subject.name.includes('Business') || 
                           subject.name.includes('Marketing') ? 'Business' :
                           subject.name.includes('Exam') || 
                           subject.name.includes('Review') ? 'Test Preparation' :
                           subject.name.includes('Elementary') || 
                           subject.name.includes('High School') || 
                           subject.name.includes('College') ? 'Grade Level' : 'Other';
            
            await db.query(
                'INSERT INTO subject (subject, description, category) VALUES (?, ?, ?)',
                [subject.name, subject.description, category]
            );
            console.log(`   ✅ Added: ${subject.name}`);
        }
        
        console.log(`🌱 Successfully seeded ${subjects.length} subjects`);
        
    } catch (error) {
        console.error('❌ Error seeding subjects:', error);
    }
}

async function setupDatabase() {
    let db;
    
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
        db = await initializeDB();

        // Step 3: CREATE ALL TABLES
        for (const [tableName, columns] of Object.entries(TABLES)) {
            console.log(`\n🚀 CREATING TABLE: ${tableName}`);
            console.log(`Columns:`, Object.keys(columns));
            await createTable(tableName, columns);
            console.log(`✅ TABLE CREATED: ${tableName}`);
        }

        // Step 4: Seed subjects data
        await seedSubjects(db);

        await db.end();

        console.log('\n🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
        console.log(`📊 Created ${Object.keys(TABLES).length} tables`);

    } catch (error) {
        console.error('💥 DATABASE SETUP FAILED:', error);
        if (db) await db.end();
        process.exit(1);
    }
}

// Run the setup
setupDatabase();