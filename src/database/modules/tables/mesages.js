import { TIMESTAMP } from "../../connection.js";

const messages = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    parent_id: 'INT NOT NULL',
    tutor_id: 'INT NOT NULL',
    sender: 'VARCHAR(50) NOT NULL',
    message: 'TEXT NOT NULL',
    ...TIMESTAMP
}
export default messages;