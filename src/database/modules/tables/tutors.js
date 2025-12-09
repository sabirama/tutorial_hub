    import { TIMESTAMP } from "../../connection.js";

    const tutors = {
        id: 'INT AUTO_INCREMENT PRIMARY KEY',
        full_name: 'VARCHAR(100) NOT NULL',
        contact_number: 'VARCHAR(20)',
        email: 'VARCHAR(100) UNIQUE NOT NULL',
        course: 'VARCHAR(100)',
        location: 'VARCHAR(100)',
        facebook: 'VARCHAR(100)',
        bio: "TEXT",
        username: 'VARCHAR(50) UNIQUE NOT NULL',
        password: 'VARCHAR(255) NOT NULL',
        rating: 'DECIMAL(3,2) DEFAULT 0.0',
        hourly_rate: 'DECIMAL(10,2) DEFAULT 0.0',
        status: "VARCHAR(50) DEFAULT 'pending'",
        verified: "BOOLEAN DEFAULT FALSE",
        profile_image: 'VARCHAR(500)',
        ...TIMESTAMP
    }

    export default tutors;