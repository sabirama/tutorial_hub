import { TIMESTAMP } from "../../connection.js";

const parent_tutors = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    parent_id: 'INT NOT NULL',
    tutor_id: 'INT NOT NULL',
    subject_id: 'INT NOT NULL',
    status: "VARCHAR(50) DEFAULT 'active'",
    ...TIMESTAMP
  }

  export default parent_tutors;