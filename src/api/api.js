import { Router } from "express";

const Api = Router();

Api.use('/tutors', (await import('./routes/tutors.js')).default);
Api.use('/parents', (await import('./routes/parents.js')).default);
Api.use('/sessions', (await import('./routes/sessions.js')).default);
Api.use('/ratings', (await import('./routes/ratings.js')).default);
Api.use('/parent-ratings', (await import('./routes/parent_rating.js')).default);
Api.use('messages', (await import('./routes/messages.js')).default);
Api.use('/subjects', (await import('./routes/subjects.js')).default);

export default Api;