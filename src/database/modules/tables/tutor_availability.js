import { TIMESTAMP } from "../../connection.js";

const tutor_availability = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    tutor_id: 'INT NOT NULL',
    schedule_id: 'INT NOT NULL',
    ...TIMESTAMP
  }
export default tutor_availability;