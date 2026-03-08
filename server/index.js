import { loadLocalEnv } from './loadEnv.js';

loadLocalEnv();

const { default: app } = await import('./app.js');

const port = Number(process.env.PORT || 8787);

app.listen(port, () => {
  console.log(`Career Platform API listening on http://127.0.0.1:${port}`);
});
