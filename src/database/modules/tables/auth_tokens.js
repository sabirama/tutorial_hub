import { TIMESTAMP } from "../../connection.js";

const auth_tokens = {
    id: "INT PRIMARY KEY AUTO_INCREMENT",
    user_id: "INT (10) NOT NULL",
    type: "VARCHAR(50) NOT NULL",
    token: "VARCHAR(100) NOT NULL",
    ...TIMESTAMP
};

export default auth_tokens