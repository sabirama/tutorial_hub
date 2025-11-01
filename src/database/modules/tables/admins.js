import { TIMESTAMP } from "../../connection.js";

const admins = {
    id: "INT PRIMARY KEY AUTO_INCREMENT",
    admin: "VARCHAR(100) NOT NULL",
    email: "VARCHAR(255) UNIQUE NOT NULL",
    password: "VARCHAR(255) NOT NULL",
    ...TIMESTAMP
}

export default admins;