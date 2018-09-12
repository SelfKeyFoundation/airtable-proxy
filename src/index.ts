import { Request, Response } from 'express';
import Airtable from 'airtable';

const base = new Airtable({apiKey: process.env.apiKey}).base(process.env.baseId)

export function airtable(req: Request, res: Response) {
  // Set CORS headers
  // e.g. allow GETs from https://mydomain.com with an Authorization header
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Authorization");
  res.set("Access-Control-Allow-Credentials", "true");
  // Send response to OPTIONS requests and terminate the function execution
  if (req.method == 'OPTIONS') {
    res.status(204).send('');
  }

  const tableName = req.query.tableName;

  if (!tableName) {
    res.status(400).send({'Error:': 'Missing Table Name Query Parameter'});
  }

  let records:Array<any> = [];
  base(tableName).select().eachPage((recordsInPage: Array<any>, fetchNextPage: Function) => {
    // merge records from all pages
    records = [...records, ...recordsInPage];
    fetchNextPage();

  }, (err: Error) => {
      if (err) { res.status(500).send({'Error:': err}); return; }
      // change json to be retrieved 

      let entities:Array<any> = [];  
      entities = records.map((record:any) => {
        return {
          data: record.fields
        }
      });

      res.json({entities});
  });
};
