import { TIMESTAMP } from "../../connection.js"

const parent_preferred_subjects = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    parent_id: 'INT NOT NULL',
    subject_id: 'INT NOT NULL',
    ...TIMESTAMP
}

export default parent_preferred_subjects