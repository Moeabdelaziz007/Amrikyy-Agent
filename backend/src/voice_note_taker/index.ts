import express, { Request, Response } from 'express';

const app = express();
const port = process.env.VOICE_NOTE_TAKER_PORT || 3003; // Using a different port

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Voice Note Taker service is running!');
});

// TODO: Add routes for transcription, organization, storage

app.listen(port, () => {
  console.log(`Voice Note Taker service listening on port ${port}`);
});
