import { TIMESTAMP } from "../../connection.js";

const tutors_subjects = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    tutor_id: 'INT NOT NULL',
    subject_id: 'INT NOT NULL',
    ...TIMESTAMP
}

export default tutors_subjects;