  import { TIMESTAMP } from "../../connection.js";

  const parents = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    full_name: 'VARCHAR(100) NOT NULL',
    contact_number: 'VARCHAR(20)',
    email: 'VARCHAR(100) UNIQUE NOT NULL',
    location: 'VARCHAR(100)',
    facebook: 'VARCHAR(100)',
    username: 'VARCHAR(50) UNIQUE NOT NULL',
    password: 'VARCHAR(255) NOT NULL',
    profile_image: 'VARCHAR(500)',
    bio: 'TEXT',
    status: "VARCHAR(50) DEFAULT 'pending'",
    verified: 'BOOLEAN DEFAULT FALSE',
    ...TIMESTAMP
  }

  export default parents;