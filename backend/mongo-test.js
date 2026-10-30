require('dotenv').config({ path: [__dirname + '/.env.local', __dirname + '/.env'] });
const { MongoClient } = require('mongodb');
(async () => {
  if (!process.env.MONGODB_URI) return console.log('MONGODB_URI is not set in backend/.env.local');
  const c = await MongoClient.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  const db = c.db(process.env.MONGODB_DB || 'mbono');
  await db.collection('audit').insertOne({ at: new Date(), r: 'System', m: 'Connection test' });
  console.log('Connected. Test entry written to ' + db.databaseName + '.audit');
  await c.close();
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });
