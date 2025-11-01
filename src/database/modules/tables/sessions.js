import { TIMESTAMP } from "../../connection.js";

const sessions = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    parent_id: 'INT NOT NULL',
    tutor_id: 'INT NOT NULL',
    child_id: 'INT NOT NULL',
    message: 'TEXT',
    subject_id: 'INT NOT NULL',
    date: 'DATE',
    time: 'VARCHAR(50)',
    status: 'VARCHAR(50) DEFAULT "pending"',
    hourly_rate: 'VARCHAR(50)',
    duration: 'VARCHAR(50)',
    location: 'VARCHAR(100)',
    notes: 'TEXT',
    ...TIMESTAMP
  }

  export default sessions;