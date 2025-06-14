import express from 'express';
import * as git from 'isomorphic-git';
import fs from 'fs';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.static('public'));

app.get('/api/commits', async (_, res) => {
  try {
    const commits = await git.log({ fs, dir: '.', depth: 10 });
    res.json(commits);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
