import { TIMESTAMP } from "../../connection.js";

const schedules = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    schedule: 'VARCHAR(100) UNIQUE NOT NULL',
    ...TIMESTAMP
}

export default schedules;