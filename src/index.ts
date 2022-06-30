import { Request, Response } from 'express';
import Airtable from 'airtable';
import cors from 'cors';

const base = new Airtable({ apiKey: process.env.apiKey }).base(process.env.baseId);

export function airtable(req: Request, res: Response) {
  // Set CORS headers
  cors({ maxAge: 3600 })(req, res, () => { handleRequest(req, res); });
}

const handleRequest = (req: Request, res: Response) => {
  // Send response to OPTIONS requests and terminate the function execution
  if (req.method == 'OPTIONS') {
    res.status(204).send('');
  }

  const tableName = req.query.tableName;

  if (!tableName) {
    res.status(400).json({'Error:': 'Missing Table Name Query Parameter'});
  }

  let records: Array<any> = [];

  const handleEachPage = ((recordsInPage: Array<any>, fetchNextPage: Function) => {
    // merge records from all pages
    records = [...records, ...recordsInPage];
    fetchNextPage()
  });

  const handleDone = (err: Error) => {
    if (err) { res.status(500).send({'Error:': err}); return; }
      // change json to be retrieved

      let entities: Array<any> = []
      entities = records.map((record: any) => {
        return {
          data: record.fields
        };
      });

      res.json({entities});
  };

  base(tableName).select().eachPage(handleEachPage, handleDone);
};
