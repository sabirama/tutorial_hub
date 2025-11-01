import { TIMESTAMP } from "../../connection.js";

const children = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    parent_id: 'INT NOT NULL',
    name: 'VARCHAR(100) NOT NULL',
    grade: 'VARCHAR(50)',
    age: 'INT',
    ...TIMESTAMP
}

export default children;