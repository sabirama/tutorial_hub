import { TIMESTAMP } from "../../connection.js";

const subjects = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    subject: 'VARCHAR(100) UNIQUE NOT NULL',
    description: "TEXT",
    ...TIMESTAMP
}

export default subjects;