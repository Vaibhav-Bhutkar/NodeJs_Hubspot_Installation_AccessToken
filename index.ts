import express from 'express';
const app: express.Application = express();

const routes = require('./routes/route');

const PORT: number = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));


