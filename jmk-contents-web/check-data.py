import json
import os
from google.cloud import firestore
from google.oauth2 import service_account

# Read service account from .env.local
sa_json = None
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip()
        if line.startswith('#') or '=' not in line:
            continue
        idx = line.index('=')
        key = line[:idx].strip()
        if key == 'FIREBASE_SERVICE_ACCOUNT_KEY':
            val = line[idx+1:].strip()
            if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
                val = val[1:-1]
            sa_json = json.loads(val)
            break

if not sa_json:
    print("FIREBASE_SERVICE_ACCOUNT_KEY not found")
    exit(1)

# Fix escaped newlines in private key
if 'private_key' in sa_json:
    sa_json['private_key'] = sa_json['private_key'].replace('\\n', '\n')

credentials = service_account.Credentials.from_service_account_info(sa_json)
db = firestore.Client(project='exam-affiliate-ads', credentials=credentials)

# 1. Apps
print('=== APPS ===')
apps = list(db.collection('apps').stream())
print(f'총 {len(apps)}개\n')
for doc in apps:
    d = doc.to_dict()
    print(f'  [{doc.id}]')
    print(f'    이름: {d.get("app_name", "")} ({d.get("app_name_full", "")})')
    print(f'    상태: {d.get("status", "")} | 분류: {d.get("app_category", "")}')
    print(f'    과목: {d.get("categories", [])}')
    print(f'    평점: {d.get("rating", 0)} | 리뷰: {d.get("review_count", 0)} | 다운로드: {d.get("download_count", 0)}')
    print(f'    아이콘: {"O" if d.get("icon_url") else "X"} | 스토어URL: {"O" if d.get("app_store_url") else "X"}')
    print()

# 2. Concepts
print('=== CONCEPTS ===')
concepts = list(db.collection('concepts').stream())
print(f'총 {len(concepts)}개\n')
c_by_app = {}
for doc in concepts:
    d = doc.to_dict()
    app_id = d.get('app_id', 'unknown')
    if app_id not in c_by_app:
        c_by_app[app_id] = []
    c_by_app[app_id].append({
        'id': doc.id,
        'title': d.get('title', ''),
        'category': d.get('category', ''),
        'importance': d.get('importance', 0)
    })

for app_id, items in c_by_app.items():
    cats = list(set(i['category'] for i in items))
    print(f'  [app: {app_id}] {len(items)}개 | 카테고리: {", ".join(cats)}')
    for c in items[:3]:
        print(f'    - {c["title"]} (중요도: {c["importance"]}, {c["category"]})')
    if len(items) > 3:
        print(f'    ... 외 {len(items) - 3}개')
    print()

# 3. Lectures
print('=== LECTURES ===')
lectures = list(db.collection('lectures').stream())
print(f'총 {len(lectures)}개\n')
if not lectures:
    print('  (등록된 강의 없음)\n')
else:
    l_by_app = {}
    for doc in lectures:
        d = doc.to_dict()
        app_id = d.get('app_id', 'unknown')
        if app_id not in l_by_app:
            l_by_app[app_id] = []
        l_by_app[app_id].append({
            'id': doc.id,
            'title': d.get('title', ''),
            'category': d.get('category', ''),
            'duration': d.get('duration_seconds', 0)
        })
    for app_id, items in l_by_app.items():
        print(f'  [app: {app_id}] {len(items)}개')
        for l in items[:3]:
            print(f'    - {l["title"]} ({l["category"]}, {l["duration"]}초)')
        if len(items) > 3:
            print(f'    ... 외 {len(items) - 3}개')
        print()

# 4. Contact Submissions
print('=== CONTACT_SUBMISSIONS ===')
contacts = list(db.collection('contact_submissions').stream())
print(f'총 {len(contacts)}개\n')
if not contacts:
    print('  (문의 없음)\n')
else:
    for doc in contacts:
        d = doc.to_dict()
        print(f'  [{doc.id}] {d.get("subject", "")} | status: {d.get("status", "")}')

# 5. Affiliate Ads
print('\n=== AFFILIATE_ADS ===')
ads = list(db.collection('affiliate_ads').stream())
print(f'총 {len(ads)}개\n')
if not ads:
    print('  (등록된 광고 없음)\n')
else:
    for doc in ads:
        d = doc.to_dict()
        print(f'  [{doc.id}] {d.get("title", "")} | type: {d.get("type", "")} | active: {d.get("isActive", False)} | 노출: {d.get("impressions", 0)} | 클릭: {d.get("clicks", 0)}')

print(f'\n=== 요약 ===')
print(f'앱: {len(apps)}개, 개념: {len(concepts)}개, 강의: {len(lectures)}개, 문의: {len(contacts)}개, 광고: {len(ads)}개')
