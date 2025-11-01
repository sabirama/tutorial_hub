import { Router } from "express";

const Api = Router();

Api.use('/tutors', (await import('./routes/tutors.js')).default);
Api.use('/parents', (await import('./routes/parents.js')).default);
Api.use('/sessions', (await import('./routes/sessions.js')).default);

export default Api;