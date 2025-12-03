import { TIMESTAMP } from "../../connection.js";

const tutor_rating = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    tutor_id: 'INT NOT NULL',
    parent_id: 'INT NOT NULL',
    rating: 'INT NOT NULL',
    review: 'TEXT',
    ...TIMESTAMP
}

export default tutor_rating;