import { TIMESTAMP } from "../../connection.js";

const parent_rating = {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    parent_id: 'INT NOT NULL',
    tutor_id: 'INT NOT NULL',
    rating: 'INT NOT NULL',
    review: 'TEXT',
    ...TIMESTAMP
}

export default parent_rating;