import { readFileSync } from 'fs';
import { importPKCS8, SignJWT } from 'jose';

// Read service account from .env.local
const envContent = readFileSync('.env.local', 'utf8');
let saJson = '';
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=');
  if (idx === -1 || line.trimStart().startsWith('#')) continue;
  const key = line.substring(0, idx).trim();
  if (key === 'FIREBASE_SERVICE_ACCOUNT_KEY') {
    saJson = line.substring(idx + 1).trim();
    break;
  }
}

const sa = JSON.parse(saJson);
if (sa.private_key) {
  sa.private_key = sa.private_key.split('\\n').join('\n');
}

// Use jose (Web Crypto) to create JWT - Node.js 25 compatible
const privateKey = await importPKCS8(sa.private_key, 'RS256');
const now = Math.floor(Date.now() / 1000);

const jwt = await new SignJWT({
  scope: 'https://www.googleapis.com/auth/datastore'
})
  .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
  .setIssuer(sa.client_email)
  .setAudience('https://oauth2.googleapis.com/token')
  .setIssuedAt(now)
  .setExpirationTime(now + 3600)
  .sign(privateKey);

// Exchange JWT for access token
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
});
const tokenData = await tokenRes.json();
const accessToken = tokenData.access_token;

if (!accessToken) {
  console.error('Failed to get token:', tokenData);
  process.exit(1);
}

const BASE = 'https://firestore.googleapis.com/v1/projects/exam-affiliate-ads/databases/(default)/documents';

async function fetchCollection(name) {
  let allDocs = [];
  let pageToken = '';
  do {
    const url = `${BASE}/${name}?pageSize=100${pageToken ? '&pageToken=' + pageToken : ''}`;
    const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + accessToken } });
    const data = await res.json();
    if (data.documents) allDocs.push(...data.documents);
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return allDocs;
}

function getVal(field) {
  if (!field) return '';
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.integerValue !== undefined) return Number(field.integerValue);
  if (field.doubleValue !== undefined) return field.doubleValue;
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.arrayValue) return (field.arrayValue.values || []).map(v => getVal(v));
  if (field.mapValue) return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([k,v]) => [k, getVal(v)]));
  if (field.timestampValue) return field.timestampValue;
  if (field.nullValue !== undefined) return null;
  return JSON.stringify(field);
}

function docId(name) {
  return name.split('/').pop();
}

// 1. Apps
console.log('=== APPS ===');
const apps = await fetchCollection('apps');
console.log(`총 ${apps.length}개\n`);
for (const doc of apps) {
  const f = doc.fields || {};
  console.log(`  [${docId(doc.name)}]`);
  console.log(`    이름: ${getVal(f.app_name)} (${getVal(f.app_name_full)})`);
  console.log(`    상태: ${getVal(f.status)} | 분류: ${getVal(f.app_category)}`);
  console.log(`    과목: ${JSON.stringify(getVal(f.categories))}`);
  console.log(`    평점: ${getVal(f.rating)} | 리뷰: ${getVal(f.review_count)} | 다운로드: ${getVal(f.download_count)}`);
  console.log(`    아이콘: ${getVal(f.icon_url) ? 'O' : 'X'} | 스토어URL: ${getVal(f.app_store_url) ? 'O' : 'X'}`);
  console.log('');
}

// 2. Concepts
console.log('=== CONCEPTS ===');
const concepts = await fetchCollection('concepts');
console.log(`총 ${concepts.length}개\n`);
const cByApp = {};
for (const doc of concepts) {
  const f = doc.fields || {};
  const appId = getVal(f.app_id) || 'unknown';
  if (!cByApp[appId]) cByApp[appId] = [];
  cByApp[appId].push({ id: docId(doc.name), title: getVal(f.title), category: getVal(f.category), importance: getVal(f.importance) });
}
for (const [appId, items] of Object.entries(cByApp)) {
  const cats = [...new Set(items.map(i => i.category))];
  console.log(`  [app: ${appId}] ${items.length}개 | 카테고리: ${cats.join(', ')}`);
  items.slice(0, 3).forEach(c => {
    console.log(`    - ${c.title} (중요도: ${c.importance}, ${c.category})`);
  });
  if (items.length > 3) console.log(`    ... 외 ${items.length - 3}개`);
  console.log('');
}

// 3. Lectures
console.log('=== LECTURES ===');
const lectures = await fetchCollection('lectures');
console.log(`총 ${lectures.length}개\n`);
if (lectures.length === 0) {
  console.log('  (등록된 강의 없음)\n');
} else {
  const lByApp = {};
  for (const doc of lectures) {
    const f = doc.fields || {};
    const appId = getVal(f.app_id) || 'unknown';
    if (!lByApp[appId]) lByApp[appId] = [];
    lByApp[appId].push({ id: docId(doc.name), title: getVal(f.title), category: getVal(f.category), duration: getVal(f.duration_seconds) });
  }
  for (const [appId, items] of Object.entries(lByApp)) {
    console.log(`  [app: ${appId}] ${items.length}개`);
    items.slice(0, 3).forEach(l => {
      console.log(`    - ${l.title} (${l.category}, ${l.duration}초)`);
    });
    if (items.length > 3) console.log(`    ... 외 ${items.length - 3}개`);
    console.log('');
  }
}

// 4. Contact Submissions
console.log('=== CONTACT_SUBMISSIONS ===');
const contacts = await fetchCollection('contact_submissions');
console.log(`총 ${contacts.length}개\n`);
if (contacts.length === 0) {
  console.log('  (문의 없음)\n');
} else {
  for (const doc of contacts) {
    const f = doc.fields || {};
    console.log(`  [${docId(doc.name)}] ${getVal(f.subject)} | status: ${getVal(f.status)}`);
  }
}

// 5. Affiliate Ads
console.log('\n=== AFFILIATE_ADS ===');
const ads = await fetchCollection('affiliate_ads');
console.log(`총 ${ads.length}개\n`);
if (ads.length === 0) {
  console.log('  (등록된 광고 없음)\n');
} else {
  for (const doc of ads) {
    const f = doc.fields || {};
    console.log(`  [${docId(doc.name)}] ${getVal(f.title)} | type: ${getVal(f.type)} | active: ${getVal(f.isActive)} | 노출: ${getVal(f.impressions)} | 클릭: ${getVal(f.clicks)}`);
  }
}

console.log('\n=== 요약 ===');
console.log(`앱: ${apps.length}개, 개념: ${concepts.length}개, 강의: ${lectures.length}개, 문의: ${contacts.length}개, 광고: ${ads.length}개`);
