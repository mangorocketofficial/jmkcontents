const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  // Find first = sign to split key and value
  const idx = line.indexOf('=');
  if (idx === -1 || line.trimStart().startsWith('#')) return;
  const key = line.substring(0, idx).trim();
  let val = line.substring(idx + 1).trim();
  if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
});

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

const app = initializeApp({ credential: cert(serviceAccount), projectId: 'exam-affiliate-ads' });
const db = getFirestore(app);

async function checkAll() {
  // 1. Apps
  const apps = await db.collection('apps').get();
  console.log('=== APPS (' + apps.size + '개) ===');
  apps.docs.forEach(doc => {
    const d = doc.data();
    console.log('  [' + doc.id + '] ' + (d.app_name || '') + ' | status: ' + (d.status || '') + ' | app_category: ' + (d.app_category || '') + ' | rating: ' + (d.rating || 0) + ' | downloads: ' + (d.download_count || 0));
  });

  // 2. Concepts
  const concepts = await db.collection('concepts').get();
  console.log('\n=== CONCEPTS (' + concepts.size + '개) ===');
  const conceptsByApp = {};
  concepts.docs.forEach(doc => {
    const d = doc.data();
    const appId = d.app_id || 'unknown';
    if (!conceptsByApp[appId]) conceptsByApp[appId] = [];
    conceptsByApp[appId].push({ id: doc.id, title: d.title, category: d.category, importance: d.importance });
  });
  for (const appId of Object.keys(conceptsByApp)) {
    console.log('  [app: ' + appId + '] ' + conceptsByApp[appId].length + '개');
    conceptsByApp[appId].slice(0, 5).forEach(c => {
      console.log('    - ' + c.id + ' | ' + c.title + ' | cat: ' + c.category + ' | importance: ' + c.importance);
    });
    if (conceptsByApp[appId].length > 5) console.log('    ... 외 ' + (conceptsByApp[appId].length - 5) + '개');
  }

  // 3. Lectures
  const lectures = await db.collection('lectures').get();
  console.log('\n=== LECTURES (' + lectures.size + '개) ===');
  const lecturesByApp = {};
  lectures.docs.forEach(doc => {
    const d = doc.data();
    const appId = d.app_id || 'unknown';
    if (!lecturesByApp[appId]) lecturesByApp[appId] = [];
    lecturesByApp[appId].push({ id: doc.id, title: d.title, category: d.category, duration: d.duration_seconds });
  });
  for (const appId of Object.keys(lecturesByApp)) {
    console.log('  [app: ' + appId + '] ' + lecturesByApp[appId].length + '개');
    lecturesByApp[appId].slice(0, 5).forEach(l => {
      console.log('    - ' + l.id + ' | ' + l.title + ' | cat: ' + l.category + ' | duration: ' + (l.duration || 'N/A') + 's');
    });
    if (lecturesByApp[appId].length > 5) console.log('    ... 외 ' + (lecturesByApp[appId].length - 5) + '개');
  }

  // 4. Contact Submissions
  const contacts = await db.collection('contact_submissions').get();
  console.log('\n=== CONTACT_SUBMISSIONS (' + contacts.size + '개) ===');
  contacts.docs.forEach(doc => {
    const d = doc.data();
    console.log('  [' + doc.id + '] ' + (d.subject || '') + ' | status: ' + (d.status || '') + ' | email: ' + (d.email || ''));
  });

  // 5. Affiliate Ads
  const ads = await db.collection('affiliate_ads').get();
  console.log('\n=== AFFILIATE_ADS (' + ads.size + '개) ===');
  ads.docs.forEach(doc => {
    const d = doc.data();
    console.log('  [' + doc.id + '] ' + (d.title || '') + ' | type: ' + (d.type || '') + ' | active: ' + (d.isActive || false) + ' | impressions: ' + (d.impressions || 0) + ' | clicks: ' + (d.clicks || 0));
  });
}

checkAll().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
