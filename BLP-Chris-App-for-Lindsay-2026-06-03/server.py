#!/usr/bin/env python3
import http.server, json, subprocess, os, urllib.parse, re
from datetime import datetime, timedelta

SHEET_ID = '1ZunbPKygpQlcXfTyPowDHdUE9spJ3uV1XA4iX1eoKRc'
SEQUENCE_SHEET_ID = '1k9ToAeueEg5WOtaY91xXzL-a0l_AJsSZWw23tcAWECU'
FRIDAY_REPORT_SHEET_ID = '11RoeVRETag5rZYX6_tEH-rf6x8JL0JeZU0P5AT0WI-I'
WEEKLY_COMPLETION_SHEET_ID = '1PrD_X-Ktx7Uh-mCxciu9i_zPk4CdifKIhB7F8AEXxhI'
REFINISHING_SHEET_ID = '1bfF4pmuGv7TefVlDG4lo_04gRjiX9QYerK4o9qih6kc'
MOVING_CALENDAR_ID = 'pianomoving.blp@gmail.com'
TECH_CALENDARS = {
    'Courtney Charter': 'courtneycharter.blp@gmail.com',
    'Curtis Biggs': 'curtisbiggs.blp@gmail.com',
    'Doris Arancibia': 'dorisarancibia.blp@gmail.com',
    'Garrett Taylor': 'garretttaylor.blp@gmail.com',
    'Jake Pulver': 'jakepulver.blp@gmail.com',
    'Korban Greenhalgh': 'korbangreenhalgh.blp@gmail.com',
    'Lupita Chavoya': 'lupitachavoya.blp@gmail.com',
    'Marcelo Cornejo': 'marcelocornejo.blp@gmail.com',
    'Mark Hales': 'markhales.blp@gmail.com',
    'Matthew Wessman': 'matthewwessman.blp@gmail.com',
    'McKinly Lopp': 'mckinlylopp.blp@gmail.com',
    'Myrrhanda Lamping': 'myrrhandalamping.blp@gmail.com',
    'Syd Long': 'sydlong.blp@gmail.com',
}
QC_APPROVED_TECHS = ['Curtis Biggs', 'Jake Pulver', 'McKinly Lopp']
PORT = 8901
DIR = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(DIR, 'skills-data.json')) as f:
    SKILLS_MATRIX = json.load(f)

# Verified display names only. Do not guess unverified surnames.
TECH_NAME_MAP = {
    'Courtney': 'Courtney Charter',
    'Courtney Charter': 'Courtney Charter',
    'Curtis': 'Curtis Biggs',
    'Curtis Biggs': 'Curtis Biggs',
    'Doris': 'Doris Arancibia',
    'Doris Arancibia': 'Doris Arancibia',
    'Garrett': 'Garrett Taylor',
    'Garrett Taylor': 'Garrett Taylor',
    'Jake': 'Jake Pulver',
    'Jake Pulver': 'Jake Pulver',
    'Jacob': 'Jacob Mower',
    'Jacob Mower': 'Jacob Mower',
    'Korban': 'Korban Greenhalgh',
    'Korban Greenhalgh': 'Korban Greenhalgh',
    'Lupita': 'Lupita Chavoya',
    'Lupita Chavoya': 'Lupita Chavoya',
    'Marcelo': 'Marcelo Cornejo',
    'Marcelo Cornejo': 'Marcelo Cornejo',
    'Mark': 'Mark Hales',
    'Mark Hales': 'Mark Hales',
    'Matthew': 'Matthew Wessman',
    'Matthew Wessman': 'Matthew Wessman',
    'McKinly': 'McKinly Lopp',
    'Mckinly': 'McKinly Lopp',
    'McKinly Lopp': 'McKinly Lopp',
    'Myrrhanda': 'Myrrhanda Lamping',
    'Myrrhanda Lamping': 'Myrrhanda Lamping',
    'Syd': 'Syd Long',
    'Syd Long': 'Syd Long',
    'Sydney Long': 'Syd Long',
}

def display_tech_name(name):
    n = str(name if name is not None else '').strip()
    return TECH_NAME_MAP.get(n, n)

# Extract verified techs from skills data plus staff calendars. Include empty-skill rows like Myrrhanda and QC-approved McKinly.
TECHS = sorted({display_tech_name(m['tech']) for m in SKILLS_MATRIX['matrix']} | set(TECH_CALENDARS.keys()))

def display_skills_matrix():
    out = []
    for m in SKILLS_MATRIX.get('matrix', []):
        x = dict(m)
        x['tech'] = display_tech_name(x.get('tech', ''))
        out.append(x)
    return {**SKILLS_MATRIX, 'matrix': out}

SECTIONS = ['CUSTOM SHOPWORK','CUSTOM SHOP WORK - FOLLOW UP','PENDING SHOPWORK','CURRENT SHOPWORK (SPEC)','TECHNOLOGY SHOP & QUEUE','MAIN STORAGE USED','ATTIC BACKSTOCK','BOXED NEW STORAGE','BOXED STORAGE DOWNSTAIRS (KITCHEN)','STORAGE: HOLDING ROOM','SHOWROOM','NEW SHOWROOM','USED SHOWROOM','BALCONY SHOWROOM','USED VESTIBULE SHOWROOM','NEW VESTIBULE','GRAND PIANOS','NEW GRAND PIANOS','UPRIGHT PIANOS','NEW UPRIGHT PIANOS','CONSIGNMENT SHOWROOM','CONSIGNMENT','CONSIGNMENT ON HOLD','CURRENTLY RENTED','SOLD']

SKIP_SUMMARIES = ['PIANO SUMMARY','SHOPIFY','Year / Make / Model','Search log before adding','Training Notes','UPDATED AT','WEB','ADMIN','WEB*','Tag','Tag + Category','Collections']

def is_piano(summary, make, serial):
    s = summary.strip()
    if not s or len(s) < 5: return False
    for skip in SKIP_SUMMARIES:
        if s.startswith(skip): return False
    return bool(make.strip() or serial.strip() or summary.strip())

def gog(*a):
    r = subprocess.run(['gog','-a','chris@brighamlarsonpianos.com','--json','sheets','get',SHEET_ID]+list(a), capture_output=True, text=True, timeout=30)
    return json.loads(r.stdout)

def gog_sheet(sheet_id, rng, timeout=30):
    r = subprocess.run(['gog','-a','chris@brighamlarsonpianos.com','--json','sheets','get',sheet_id,rng], capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or 'gog sheets get failed')
    return json.loads(r.stdout or '{}').get('values', [])

def norm(v):
    return str(v if v is not None else '').strip()

def parse_sheet_date(v):
    s = norm(v)
    if not s or s.upper() in ('FALSE','TRUE'):
        return None
    for fmt in ('%m/%d/%y','%m/%d/%Y','%Y-%m-%d'):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    return None

def best_date_col(header, prefer='past'):
    now = datetime.now()
    candidates = []
    for i, cell in enumerate(header):
        d = parse_sheet_date(cell)
        if d:
            candidates.append((i, d))
    if not candidates:
        return None, ''
    if prefer == 'future':
        future = [(i,d) for i,d in candidates if d.date() >= now.date()]
        i,d = min(future, key=lambda x: x[1]) if future else max(candidates, key=lambda x: x[1])
    else:
        past = [(i,d) for i,d in candidates if d.date() <= now.date()]
        i,d = max(past, key=lambda x: x[1]) if past else min(candidates, key=lambda x: x[1])
    return i, d.strftime('%-m/%-d/%y')

def piano_from_row(i, r):
    summary=norm(r[3] if len(r)>3 else '')
    make=norm(r[5] if len(r)>5 else '')
    serial=norm(r[2] if len(r)>2 else '')
    return {
        'row': i, 'owner': norm(r[0] if len(r)>0 else ''), 'section': norm(r[1] if len(r)>1 else ''),
        'serial': serial, 'summary': summary, 'year': norm(r[4] if len(r)>4 else ''), 'make': make,
        'model': norm(r[6] if len(r)>6 else ''), 'size': norm(r[7] if len(r)>7 else ''),
        'category': norm(r[9] if len(r)>9 else ''), 'finish': norm(r[10] if len(r)>10 else ''),
        'status': norm(r[18] if len(r)>18 else ''), 'location': norm(r[20] if len(r)>20 else ''),
        'project_category': norm(r[23] if len(r)>23 else ''), 'notes': norm(r[26] if len(r)>26 else '')
    }

def get_piano_log(limit=900):
    rows = gog(f'Piano Log!A2:AH{limit}').get('values', [])
    pianos=[]
    for i,r in enumerate(rows, start=2):
        p = piano_from_row(i, r)
        if is_piano(p['summary'], p['make'], p['serial']):
            pianos.append(p)
    return pianos

def is_for_sale_showroom(p):
    hay = ' '.join([p.get('status',''), p.get('location',''), p.get('section','')]).lower()
    showroom_section = p.get('section','') in ('GRAND PIANOS','UPRIGHT PIANOS','NEW GRAND PIANOS','NEW UPRIGHT PIANOS','USED SHOWROOM','NEW SHOWROOM','CONSIGNMENT SHOWROOM')
    return ('for sale' in hay or 'showroom' in hay or showroom_section) and 'sold' not in hay

def find_hours_col(header, date_col):
    for idx in (date_col + 1, date_col - 1):
        if 0 <= idx < len(header) and 'estimated hours' in norm(header[idx]).lower():
            return idx
    for idx, cell in enumerate(header):
        if 'estimated hours' in norm(cell).lower():
            return idx
    return None

def parse_hours(v):
    s = norm(v).lower()
    if not s:
        return None
    # Only trust simple numeric hour cells or explicit hr/hour phrasing.
    # Avoid false positives like “see L47”.
    if re.fullmatch(r'\d+(?:\.\d+)?', s):
        return float(s)
    multi = re.search(r'(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b', s)
    if multi:
        return float(multi.group(1)) * float(multi.group(2))
    m = re.search(r'(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b', s)
    return float(m.group(1)) if m else None

def read_sequence_intake():
    weekly_rows = gog_sheet(SEQUENCE_SHEET_ID, "'weekly notes'!A1:AT90")
    on_deck_rows = gog_sheet(SEQUENCE_SHEET_ID, "'On deck/underway'!A1:AZ40")
    header = weekly_rows[0] if weekly_rows else []
    col, label = best_date_col(header, 'past')
    hours_col = find_hours_col(header, col) if col is not None else None
    categories = {'tuning','moving','showroom repairs','admin','prsb','refurb','shop','refinishing'}
    ignore = {'curtis','brigham'}
    categorized={c:[] for c in categories}
    weekly_items=[]
    current_category=''
    if col is not None:
        for rownum, r in enumerate(weekly_rows[1:], start=2):
            first = norm(r[0] if r else '')
            first_l = first.lower()
            if first_l in ignore:
                current_category = first_l
            elif first_l in categories:
                current_category = first_l
            elif first and first_l not in categories:
                pass
            if current_category in ignore:
                continue
            item = norm(r[col] if col < len(r) else '')
            if not item or item.upper() == 'FALSE':
                continue
            hours = parse_hours(r[hours_col]) if hours_col is not None and hours_col < len(r) else None
            entry = {'row': rownum, 'category': current_category or 'notes', 'section': current_category or 'notes', 'text': item, 'hours': hours, 'hours_text': norm(r[hours_col] if hours_col is not None and hours_col < len(r) else '')}
            weekly_items.append(entry)
            if current_category in categorized:
                categorized[current_category].append(entry)
    shop_plans=[]
    for r in on_deck_rows:
        if not r or not norm(r[0]):
            continue
        tech = norm(r[0])
        items = [norm(x) for x in r[1:] if norm(x)]
        if items:
            shop_plans.append({'tech': tech, 'items': items[:12]})
    return {'week_label': label, 'date_col': col, 'hours_col': hours_col, 'weekly_notes': weekly_items, 'categorized': categorized, 'shop_plans': shop_plans}

def read_friday_status():
    rows = gog_sheet(FRIDAY_REPORT_SHEET_ID, "'2026'!A1:BA30", timeout=45)
    col, label = best_date_col(rows[0] if rows else [], 'past')
    reports=[]; missing=[]
    if col is not None:
        for r in rows[1:]:
            name = norm(r[0] if r else '')
            if not name:
                continue
            display = {'Jake':'Jake Pulver','Jacob':'Jacob Mower'}.get(name, name)
            text = norm(r[col] if col < len(r) else '')
            submitted = bool(text) and text.upper() != 'N/A' and len(text) > 5
            if submitted:
                reports.append({'tech': display, 'text': text})
            elif name.lower() not in ('admin','in-store tuning','moving'):
                missing.append(display)
    return {'week_label': label, 'reports': reports, 'missing': missing}

def read_weekly_completion():
    rows = gog_sheet(WEEKLY_COMPLETION_SHEET_ID, "'2026'!A1:BC35", timeout=45)
    header = rows[1] if len(rows) > 1 else []
    col, label = best_date_col(header, 'future')
    checks=[]
    if col is not None:
        for r in rows[2:]:
            name = norm(r[1] if len(r)>1 else r[0] if r else '')
            if not name:
                continue
            val = norm(r[col] if col < len(r) else '')
            checks.append({'name': name, 'done': val.upper() == 'TRUE', 'value': val})
    return {'week_label': label, 'checks': checks}

def read_moving_calendar():
    start = datetime.now().date()
    end = start + timedelta(days=10)
    try:
        r = subprocess.run(['gog','-a','chris@brighamlarsonpianos.com','--json','calendar','events',MOVING_CALENDAR_ID,'--from',start.isoformat(),'--to',end.isoformat(),'--max','80'], capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            raise RuntimeError(r.stderr.strip())
        data = json.loads(r.stdout or '{}')
        events = data.get('events', data if isinstance(data, list) else [])
        out=[]
        for ev in events:
            summary=norm(ev.get('summary',''))
            if not summary or 'cancel' in summary.lower():
                continue
            st=ev.get('start',{})
            dt=st.get('dateTime') or st.get('date') or ''
            out.append({'date': dt[:10], 'summary': summary, 'location': norm(ev.get('location','')), 'description': norm(ev.get('description',''))[:300]})
        return out
    except Exception as ex:
        return [{'date':'', 'summary':'Moving calendar unavailable', 'location':'', 'description':str(ex)}]


def read_tech_calendars(start_date=None, days=7):
    """Read-only technician calendar lookahead for draft placement."""
    start = start_date or next_monday()
    end = start + timedelta(days=days)
    calendars = {}
    for tech, cal_id in TECH_CALENDARS.items():
        try:
            r = subprocess.run([
                'gog','-a','chris@brighamlarsonpianos.com','--json','calendar','events',cal_id,
                '--from',start.isoformat(),'--to',end.isoformat(),'--max','120'
            ], capture_output=True, text=True, timeout=30)
            if r.returncode != 0:
                raise RuntimeError(r.stderr.strip())
            data = json.loads(r.stdout or '{}')
            events = data.get('events', data if isinstance(data, list) else [])
            busy=[]
            for ev in events:
                if norm(ev.get('status','')) == 'cancelled':
                    continue
                summary = norm(ev.get('summary',''))
                if not summary or 'cancel' in summary.lower():
                    continue
                st = ev.get('startLocal') or ev.get('start',{}).get('dateTime') or ev.get('start',{}).get('date') or ''
                en = ev.get('endLocal') or ev.get('end',{}).get('dateTime') or ev.get('end',{}).get('date') or ''
                busy.append({'start': st, 'end': en, 'summary': summary, 'location': norm(ev.get('location',''))})
            calendars[tech] = {'calendar_id': cal_id, 'busy': busy, 'error': ''}
        except Exception as ex:
            calendars[tech] = {'calendar_id': cal_id, 'busy': [], 'error': str(ex)}
    return calendars

def parse_local_dt(value):
    if not value or 'T' not in value:
        return None
    try:
        # Calendar returns offset-aware local times; draft slots are naive local wall-clock.
        # Strip tzinfo so conflict checks compare local wall-clock consistently without writing anything.
        return datetime.fromisoformat(value).replace(tzinfo=None)
    except Exception:
        return None

def slot_conflicts(tech, start_dt, duration_hours, tech_calendars, draft_slots=None):
    end_dt = start_dt + timedelta(hours=duration_hours or 1.5)
    for ev in tech_calendars.get(tech, {}).get('busy', []):
        st = parse_local_dt(ev.get('start'))
        en = parse_local_dt(ev.get('end'))
        if st and en and start_dt < en and end_dt > st:
            return ev.get('summary') or 'calendar busy'
    for slot in (draft_slots or {}).get(tech, []):
        if start_dt < slot['end'] and end_dt > slot['start']:
            return 'draft slot conflict'
    return ''

def draft_slot(tech, date_iso, duration_hours, tech_calendars, draft_slots, preferred_times=None, business_start=8, business_end=17):
    """Find an open read-only draft slot; returns local-ish ISO strings without posting anything."""
    duration_hours = duration_hours or 1.5
    date_obj = datetime.fromisoformat(date_iso).date() if isinstance(date_iso, str) else date_iso
    if date_obj.weekday() >= 5:
        date_obj = date_obj + timedelta(days=(7 - date_obj.weekday()))
    times = preferred_times or [8, 9.5, 11, 13, 14.5, 16]
    for day_offset in range(0, 10):
        d = date_obj + timedelta(days=day_offset)
        if d.weekday() >= 5:
            continue
        for hour in times:
            h = int(hour); minute = int(round((hour - h) * 60))
            st = datetime(d.year, d.month, d.day, h, minute)
            en = st + timedelta(hours=duration_hours)
            if en.date() != d or (en.hour + en.minute/60) > business_end:
                continue
            conflict = slot_conflicts(tech, st, duration_hours, tech_calendars, draft_slots)
            if not conflict:
                draft_slots.setdefault(tech, []).append({'start': st, 'end': en})
                return {'start': st.isoformat(timespec='minutes'), 'end': en.isoformat(timespec='minutes'), 'conflict': '', 'overflow': day_offset > 0}
    return {'start': '', 'end': '', 'conflict': 'No open draft slot found in lookahead', 'overflow': True}

def korban_tuning_slot(task, index, tech_calendars, draft_slots):
    base = next_monday()
    text = task.get('summary','').lower()
    # For-sale/showroom tuning rule: Korban only, 8:00/9:30, max two per day / ten per week.
    if 'must be monday' in text and '9:30' in text:
        preferred_dates = [base]
        preferred_times = [9.5]
    elif 'must be monday' in text and ('8am' in text or '8:00' in text):
        preferred_dates = [base]
        preferred_times = [8]
    else:
        preferred_dates = [base + timedelta(days=i//2) for i in range(10)]
        preferred_times = [8, 9.5]
    duration = task.get('hours') or 1.5
    # Try requested/sorted dates first, then let draft_slot overflow within weekday lookahead.
    for d in preferred_dates:
        slot = draft_slot('Korban Greenhalgh', d.isoformat(), duration, tech_calendars, draft_slots, preferred_times=preferred_times, business_start=8, business_end=11)
        if slot.get('start'):
            return slot
    return {'start':'', 'end':'', 'conflict':'No Korban 8:00/9:30 tuning slot found', 'overflow': True}

def choose_qc_owner(index, tech_calendars, draft_slots, preferred_date, duration=1.5):
    # Rotate across approved QC techs, choosing the first with an open slot.
    rotated = QC_APPROVED_TECHS[index % len(QC_APPROVED_TECHS):] + QC_APPROVED_TECHS[:index % len(QC_APPROVED_TECHS)]
    for tech in rotated:
        slot = draft_slot(tech, preferred_date, duration, tech_calendars, draft_slots, preferred_times=[8, 9.5, 11, 13, 14.5])
        if slot.get('start'):
            return tech, slot
    return rotated[0], {'start':'', 'end':'', 'conflict':'No approved QC tech slot found', 'overflow': True}

def classify_task_stage(text):
    s = text.lower()
    if 'dhrt' in s or 'damper' in s or 'regulat' in s or 'trap' in s:
        return 'DHRT'
    if 'prsb' in s or 'bridge' in s or 'soundboard' in s or 'rib' in s:
        return 'PRSB'
    if 'cap' in s or 'clean' in s or 'action prep' in s or 'teardown' in s:
        return 'CAP'
    if 'string' in s:
        return 'Restringing'
    if 'refinish' in s or 'spray' in s or 'lacquer' in s or 'paint' in s:
        return 'Refinishing'
    if 'tuning' in s or 'tune' in s:
        return 'Tuning'
    if 'qc' in s or 'quality' in s:
        return 'QC'
    return 'Shop Work'

def suggest_tech(stage, fallback=''):
    best = None
    for m in SKILLS_MATRIX.get('matrix',[]):
        skills = m.get('skills',{})
        hit = skills.get(stage) or skills.get(stage.upper())
        score = (hit or {}).get('count',0) - (m.get('total_projects',0) * 0.02)
        if best is None or score > best[0]:
            best = (score, m.get('tech'))
    return fallback or (best[1] if best else '')

def build_review_body(tasks, packets, calendar_drafts, showroom, friday, moving):
    lines = ['Brigham,', '', 'The weekly shop assignment packet is ready for review.', '', 'High priority:', f'- Showroom inspection packet: {len(showroom)} for-sale/showroom pianos', f'- Moving/delivery lookahead items: {len(moving)}', f'- Missing Friday reports: {", ".join(friday.get("missing",[])[:12]) if friday.get("missing") else "none"}', '', 'Suggested assignments:']
    for tech, items in sorted(packets.items()):
        lines.append(f'\n{tech}')
        for t in items[:8]:
            lines.append(f'- [{t["lane"]}] {t["stage"]}: {t["summary"][:140]}')
    lines += ['', 'Calendar draft packets:', f'- {len(calendar_drafts)} draft event details prepared in the app.', '- These are NOT posted to technician calendars until you approve.', '', '— Chris']
    return '\n'.join(lines)

def next_monday():
    today = datetime.now().date()
    days = (7 - today.weekday()) % 7
    if days == 0:
        days = 7
    return today + timedelta(days=days)

def default_owner_for_category(category, text):
    c = (category or '').lower()
    t = text.lower()
    if c == 'admin': return 'Melissa'
    if c == 'refinishing': return 'Doris'
    if c == 'prsb': return 'Matthew'
    if c == 'moving': return 'Moving Team'
    if c == 'tuning': return 'Korban'
    if c == 'showroom repairs':
        if 'mark' in t: return 'Mark'
        return 'Jake Pulver'
    if c == 'refurb': return 'Jake Pulver'
    stage = classify_task_stage(text)
    return suggest_tech(stage) or 'Brigham'


def mentioned_tech_owner(text):
    """Honor named technician in Brigham weekly inputs without guessing surnames."""
    t = text or ''
    checks = [
        ('Courtney', 'Courtney Charter'), ('Curtis', 'Curtis Biggs'), ('Doris', 'Doris Arancibia'),
        ('Garrett', 'Garrett Taylor'), ('Jake', 'Jake Pulver'), ('Jacob', 'Jacob Mower'),
        ('Korban', 'Korban Greenhalgh'), ('Lupita', 'Lupita Chavoya'), ('Marcelo', 'Marcelo Cornejo'),
        ('Mark', 'Mark Hales'), ('Matthew', 'Matthew Wessman'), ('McKinly', 'McKinly Lopp'),
        ('Mckinly', 'McKinly Lopp'), ('Myrrhanda', 'Myrrhanda Lamping'), ('Syd', 'Syd Long'),
        ('Sydney', 'Syd Long')
    ]
    hits = []
    for first, full in checks:
        # Strong signals in Brigham's notes: "Name:", "(Name)", starts with name, or name + action verb.
        pat = rf'(^|[\s(]){re.escape(first)}(?=\s*[:)]|\s+(?:take|finish|needs|need|can|should|prefers|do|on|off|calendar)\b)'
        m = re.search(pat, t, flags=re.I)
        if m:
            hits.append((m.start(), full))
    return sorted(hits)[0][1] if hits else ''

def proposed_date_for_task(category, index, text=''):
    base = next_monday()
    lower = text.lower()
    if 'must be monday' in lower or 'monday at' in lower:
        return base.isoformat()
    if 'tuesday' in lower:
        return (base + timedelta(days=1)).isoformat()
    if 'wednesday' in lower:
        return (base + timedelta(days=2)).isoformat()
    if 'thursday' in lower:
        return (base + timedelta(days=3)).isoformat()
    c=(category or '').lower()
    offsets = {'tuning':0, 'moving':0, 'admin':0, 'showroom repairs':1, 'prsb':1, 'shop':2, 'refurb':2, 'refinishing':0}
    return (base + timedelta(days=offsets.get(c, index // 5))).isoformat()

def lookup_piano_owner_type(text, pianos):
    s = text.lower()
    best = None
    for p in pianos:
        needles = [p.get('serial',''), p.get('summary',''), p.get('make','')]
        score = 0
        for n in needles:
            n = norm(n).lower()
            if n and len(n) >= 4 and n in s:
                score += 1 if n == p.get('make','').lower() else 3
        if score and (best is None or score > best[0]):
            best = (score, p)
    if not best:
        return {'owner_type':'unknown', 'piano': None, 'customer_owned': False}
    p = best[1]
    owner_blob = ' '.join([p.get('owner',''), p.get('section',''), p.get('status',''), p.get('project_category','')]).lower()
    section = p.get('section','') or ''
    contactish = ('@' in section) or bool(re.search(r'\d{3}[- .)]*\d{3}[- .]*\d{4}', section)) or ('customer' in owner_blob)
    internal = any(x in owner_blob for x in ['blp', 'brigham larson', 'store owned', 'inventory'])
    customer = (contactish or ('commission' in owner_blob) or ('family heirloom' in owner_blob)) and not internal
    return {'owner_type':'customer' if customer else 'blp', 'piano': p, 'customer_owned': customer}


def previous_business_day(date_iso):
    try:
        d = datetime.fromisoformat(date_iso).date()
    except Exception:
        return next_monday().isoformat()
    d = d - timedelta(days=1)
    while d.weekday() >= 5:
        d = d - timedelta(days=1)
    # If the ideal day-before slot is already in the past/current weekend, draft earliest review day and let Brigham see it.
    return max(d, next_monday()).isoformat()

def build_refinishing_append_plan(ref_items, pianos):
    rows=[]
    for idx,item in enumerate(ref_items, start=12):
        owner_info = lookup_piano_owner_type(item['text'], pianos)
        rows.append({'target_row': idx, 'text': item['text'], 'hours': item.get('hours'), 'owner_type': owner_info['owner_type'], 'customer_owned': owner_info['customer_owned'], 'fill': 'gray' if owner_info['customer_owned'] else 'white', 'matched_piano': owner_info['piano']})
    return rows

def build_admin_email_body(admin_items):
    lines = ['Melissa,', '', 'Here are Brigham’s admin follow-ups for this week:', '']
    for item in admin_items:
        lines.append(f'- {item["text"]}')
    lines += ['', 'Thank you!', 'Chris']
    return '\n'.join(lines)

def build_weekly_wizard():
    pianos = get_piano_log()
    showroom = [p for p in pianos if is_for_sale_showroom(p)][:80]
    sequence = read_sequence_intake()
    try:
        friday = read_friday_status()
    except Exception as ex:
        friday = {'week_label':'', 'reports':[], 'missing':[], 'error': str(ex)}
    try:
        completion = read_weekly_completion()
    except Exception as ex:
        completion = {'week_label':'', 'checks':[], 'error': str(ex)}
    moving = read_moving_calendar()
    tasks=[]
    categorized = sequence.get('categorized', {})
    # Brigham's dated weekly-notes inputs are the core scheduling queue.
    flat_inputs = sequence.get('weekly_notes', [])
    for idx, item in enumerate(flat_inputs):
        category = item.get('category','')
        if category == 'admin':
            continue
        stage = classify_task_stage(item['text']) if category not in ('tuning','moving','refinishing','prsb') else {'tuning':'Tuning','moving':'Moving','refinishing':'Refinishing','prsb':'PRSB'}.get(category, 'Shop Work')
        owner = mentioned_tech_owner(item['text']) or default_owner_for_category(category, item['text'])
        task_hours = item.get('hours') if item.get('hours') is not None else parse_hours(item['text'])
        tasks.append({'id': f'weekly-{item["row"]}', 'lane': category.title(), 'priority':'Urgent' if category in ('tuning','moving') else 'Normal', 'stage':stage, 'summary':item['text'], 'serial':'', 'location':category, 'row':item['row'], 'hours':task_hours, 'hours_text':item.get('hours_text',''), 'suggested_owner':owner, 'proposed_date': proposed_date_for_task(category, idx, item['text']), 'reason':f'Pulled from Sequence weekly notes category: {category}.'})
    # Showroom packet is an inspection packet, not necessarily all scheduled as work.
    for p in showroom[:20]:
        tasks.append({'id': f'showroom-check-{p["row"]}', 'lane':'Showroom Inspection Packet', 'priority':'Review', 'stage':'Inspection', 'summary':p['summary'], 'serial':p['serial'], 'location':p['location'], 'row':p['row'], 'hours':None, 'hours_text':'', 'suggested_owner':'Jake Pulver', 'proposed_date': next_monday().isoformat(), 'reason':'For-sale showroom piano included in in-app inspection packet.'})
    # Moving calendar adds delivery/QC urgency where the event appears to involve an outgoing BLP piano.
    for ev in moving:
        summary_l = ev['summary'].lower()
        if ' off' in f' {summary_l}' or 'options' in summary_l:
            continue
        is_delivery = any(w in summary_l for w in ('deliver', 'delivery', 'load up'))
        stage = 'QC' if is_delivery else 'Moving Review'
        owner = 'Curtis Biggs' if is_delivery else 'Moving Team'
        proposed = previous_business_day(ev.get('date','')) if is_delivery else (ev.get('date') or next_monday().isoformat())
        reason = 'Moving calendar delivery/load-up lookahead; tune/QC before exit. If the piano is not leaving BLP inventory, Brigham should skip this draft.' if is_delivery else 'Moving calendar item for human review; not automatically treated as a shop QC.'
        tasks.append({'id': f'moving-cal-{len(tasks)+1}', 'lane':'Moving Calendar', 'priority':'Urgent' if is_delivery else 'Review', 'stage':stage, 'summary':ev['summary'], 'serial':'', 'location':ev.get('location',''), 'row':'', 'hours':1.5 if is_delivery else 1, 'hours_text':'1.5' if is_delivery else '1', 'suggested_owner':owner, 'proposed_date': proposed, 'reason':reason})
    tech_calendars = read_tech_calendars(next_monday(), 10)
    assignment_packets={}
    for t in tasks[:100]:
        owner = display_tech_name(t.get('suggested_owner') or 'Brigham')
        t['suggested_owner'] = owner
        assignment_packets.setdefault(owner, []).append(t)
    calendar_drafts=[]
    draft_slots={}
    qc_index=0
    for owner, owner_tasks in assignment_packets.items():
        if owner == 'Melissa':
            continue
        for t in owner_tasks[:20]:
            if t.get('lane') == 'Showroom Inspection Packet':
                continue
            hrs = t.get('hours') or (1.5 if t['stage'] in ('Tuning','QC') else 2)
            slot_hours = 8 if t['stage'] not in ('Tuning','QC') and hrs and hrs > 8 else hrs
            draft_owner = owner
            slot = {'start':'', 'end':'', 'conflict':'', 'overflow': False}
            if t['stage'] == 'Tuning' and owner == 'Korban Greenhalgh':
                slot = korban_tuning_slot(t, len([d for d in calendar_drafts if d.get('tech') == 'Korban Greenhalgh' and d.get('stage') == 'Tuning']), tech_calendars, draft_slots)
            elif t['stage'] == 'QC':
                draft_owner, slot = choose_qc_owner(qc_index, tech_calendars, draft_slots, t.get('proposed_date') or next_monday().isoformat(), slot_hours)
                qc_index += 1
                t['suggested_owner'] = draft_owner
            elif draft_owner in TECH_CALENDARS:
                slot = draft_slot(draft_owner, t.get('proposed_date') or next_monday().isoformat(), slot_hours, tech_calendars, draft_slots)
            chunks = [hrs]
            if t['stage'] not in ('Tuning','QC') and hrs and hrs > 8:
                chunks = [8] * int(hrs // 8)
                if hrs % 8:
                    chunks.append(hrs % 8)
            for chunk_idx, chunk_hours in enumerate(chunks, start=1):
                use_slot = slot if chunk_idx == 1 else {'start':'', 'end':'', 'conflict':'', 'overflow': False}
                if chunk_idx > 1 and draft_owner in TECH_CALENDARS:
                    use_slot = draft_slot(draft_owner, t.get('proposed_date') or next_monday().isoformat(), chunk_hours, tech_calendars, draft_slots)
                title_suffix = f" (block {chunk_idx}/{len(chunks)})" if len(chunks) > 1 else ''
                calendar_drafts.append({'tech':draft_owner, 'stage': t['stage'], 'proposed_date':t.get('proposed_date'), 'proposed_start':use_slot.get('start',''), 'proposed_end':use_slot.get('end',''), 'slot_warning':use_slot.get('conflict',''), 'overflow':use_slot.get('overflow', False), 'title': f"{t['stage']}: {t['summary'][:70]}{title_suffix}", 'duration_hours':chunk_hours, 'total_estimated_hours': hrs, 'duration':f'{chunk_hours:g} hr' if chunk_hours else 'TBD', 'location':t.get('location',''), 'notes':f"Draft only — Brigham approval required. Source: {t['lane']}. Estimated total hours: {t.get('hours_text') or hrs or 'TBD'}. This draft block: {chunk_hours:g} hr. Reason: {t['reason']}"})
    showroom_slot = draft_slot('Jake Pulver', next_monday().isoformat(), 2, tech_calendars, draft_slots, preferred_times=[8, 10, 13, 15])
    calendar_drafts.append({'tech':'Jake Pulver', 'stage':'Inspection', 'proposed_date':next_monday().isoformat(), 'proposed_start':showroom_slot.get('start',''), 'proposed_end':showroom_slot.get('end',''), 'slot_warning':showroom_slot.get('conflict',''), 'overflow':showroom_slot.get('overflow', False), 'title': f'Showroom inspection packet: {len(showroom)} for-sale/showroom pianos', 'duration_hours':2, 'duration':'2 hr', 'location':'Showroom', 'notes':'Draft only — Brigham approval required. One inspection block for the in-app showroom packet; do not create one calendar event per piano.'})
    admin_items = categorized.get('admin', [])
    admin_email = {'to':'Melissa@brighamlarsonpianos.com', 'scheduled_for':'Monday 10:00 AM', 'subject':'Admin follow-ups from Brigham weekly planning', 'body': build_admin_email_body(admin_items)}
    refinishing_plan = build_refinishing_append_plan(categorized.get('refinishing', []), pianos)
    review_body = build_review_body(tasks, assignment_packets, calendar_drafts, showroom, friday, moving)
    return {'generated': datetime.now().strftime('%b %d, %Y at %I:%M %p'), 'links': {'friday_report': f'https://docs.google.com/spreadsheets/d/{FRIDAY_REPORT_SHEET_ID}/edit#gid=0', 'sequence_weekly_notes': f'https://docs.google.com/spreadsheets/d/{SEQUENCE_SHEET_ID}/edit', 'refinishing_list': f'https://docs.google.com/spreadsheets/d/{REFINISHING_SHEET_ID}/edit'}, 'sequence': sequence, 'friday': friday, 'completion': completion, 'moving': moving, 'tech_calendars': tech_calendars, 'showroom_packet': showroom, 'tasks': tasks[:120], 'assignment_packets': assignment_packets, 'calendar_drafts': calendar_drafts, 'admin_email': admin_email, 'refinishing_append_plan': refinishing_plan, 'review_email': {'to':'BrighamLarson@gmail.com', 'subject':'BLP weekly shop assignments ready for review', 'body': review_body}, 'text_alert': 'Weekly BLP shop assignment packets are ready in the Chris app for your review/approval. Calendar draft packets include proposed dates and estimated hours but are not posted.'}

def get_weekly_plan():
    d = gog('Piano Log!A2:AH300')
    rows = d.get('values',[])
    showroom=[]; shop_work=[]; deliveries=[]
    for i,r in enumerate(rows, start=2):
        summary=str(r[3] if len(r)>3 else '').strip()
        make=str(r[5] if len(r)>5 else '').strip()
        serial=str(r[2] if len(r)>2 else '').strip()
        if not is_piano(summary,make,serial): continue
        status=str(r[18] if len(r)>18 else '').lower()
        location=str(r[20] if len(r)>20 else '').strip()
        item={'row':i,'summary':summary,'location':location}
        if 'showroom' in location.lower() or 'for sale' in status or 'new' in status.lower():
            showroom.append(item)
        elif 'current shop' in status or 'rebuilt' in status or 'refurb' in status:
            shop_work.append(item)
        elif 'sold' in status or 'rent' in status:
            deliveries.append(item)
    tc={}
    for t in TECHS:
        tc[t]={'name':t,'active_projects':min(1+sum(1 for p in shop_work[:30] if t.lower() in str(p.get('summary','')).lower()),5)}
    return {'showroom_tunings':showroom[:10],'shop_work':shop_work[:12],'deliveries':deliveries[:6],'tech_capacity':tc,'generated':datetime.now().strftime('%b %d, %Y at %I:%M %p'),'friday_missing':[]}

class H(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.end_headers()

    def do_GET(self):
        p=urllib.parse.urlparse(self.path).path
        if p=='/api/health': return self.j({'ok': True, 'app': 'chris-weekly-wizard', 'port': PORT, 'generated': datetime.now().isoformat()})
        if p=='/api/sections': return self.j({'sections':SECTIONS})
        if p=='/api/techs': return self.j({'techs':TECHS})
        if p=='/api/skills-matrix': return self.j(display_skills_matrix())
        if p=='/api/weekly-plan': return self.j(get_weekly_plan())
        if p=='/api/weekly-wizard':
            try:
                return self.j(build_weekly_wizard())
            except Exception as ex:
                return self.j({'error': str(ex)}, 500)
        if p=='/api/prs': return self.handle_prs(p)
        if p=='/api/customer-search': return self.handle_customer_search()
        if p=='/api/customers': return self.handle_customers()
        if p=='/api/friday-report': return self.handle_friday_reports()
        if p=='/api/friday-reports': return self.handle_friday_reports()
        if p=='/api/shopping-list': return self.handle_static_json('shopping-list.json', {'items': []})
        if p=='/api/map-data': return self.handle_static_json('map-data.json', {})
        if p=='/api/pianos':
            try:
                d=gog('Piano Log!A2:AH500')
                ps=[]
                for i,r in enumerate(d.get('values',[]),start=2):
                    summary=str(r[3] if len(r)>3 else '').strip()
                    make=str(r[5] if len(r)>5 else '').strip()
                    serial=str(r[2] if len(r)>2 else '').strip()
                    if not is_piano(summary,make,serial): continue
                    s=str(r[1]).strip() if len(r)>1 else ''
                    sec=s if s in SECTIONS else 'General'
                    ps.append({'row':i,'owner':str(r[0] if len(r)>0 else ''),'serial':serial,'summary':summary,'year':str(r[4] if len(r)>4 else ''),'make':make,'model':str(r[6] if len(r)>6 else ''),'size':str(r[7] if len(r)>7 else ''),'category':str(r[9] if len(r)>9 else ''),'finish':str(r[10] if len(r)>10 else ''),'sheen':str(r[11] if len(r)>11 else ''),'trim':str(r[12] if len(r)>12 else ''),'status':str(r[18] if len(r)>18 else ''),'location':str(r[20] if len(r)>20 else ''),'project_category':str(r[23] if len(r)>23 else ''),'notes':str(r[26] if len(r)>26 else ''),'section':sec,'type':'','condition':'','phone':'','email':'','address':'','current_stage':'pending','stage_statuses':{}})
                return self.j({'pianos':ps})
            except Exception as ex:
                return self.j({'error':str(ex),'pianos':[]},500)
        return self.serve()
    def do_POST(self):
        p=urllib.parse.urlparse(self.path).path
        n=int(self.headers.get('Content-Length',0))
        b=json.loads(self.rfile.read(n)) if n else {}
        if p=='/api/prs':
            pass # already imported
            pr_file = os.path.join(DIR, 'prs.json')
            with open(pr_file) as pf: pr_data = json.load(pf)
            pr_data['records'].append({
                'tech': b.get('tech',''), 'skill': b.get('skill',''),
                'time': b.get('time',''), 'unit': b.get('unit','days'),
                'date': datetime.now().strftime('%Y-%m-%d'),
                'project': b.get('project','')
            })
            with open(pr_file, 'w') as pf: json.dump(pr_data, pf, indent=2)
            return self.j({'success': True, 'message': 'PR recorded!'})
        if p=='/api/add-piano':
            section=b.get('section',''); owner=b.get('owner_name','')
            serial=b.get('serial',''); make=b.get('make',''); model=b.get('model','')
            year=b.get('year',''); size=b.get('size',''); finish=b.get('finish','')
            trim=b.get('trim',''); ptype=b.get('type',''); status=b.get('status','Used, For Sale')
            location=b.get('location',''); notes=b.get('notes',''); phone=b.get('phone','')
            email=b.get('email',''); address=b.get('address','')
            cat='Grand' if ptype=='Grand' else ('Upright' if ptype=='Upright' else '')
            summary=f'{year} {make} {model}'.strip()
            if serial: summary=f'{summary} / #{serial}'.strip()
            extra=[x for x in [phone,email,address] if x]
            all_notes=' | '.join(extra)+('\n'+notes if notes else '') if extra else notes
            row=['']*35
            row[0]=owner; row[1]=section; row[2]=serial; row[3]=summary; row[4]=year
            row[5]=make; row[6]=model; row[7]=size; row[8]='TRUE'; row[9]=cat; row[10]=finish
            row[11]='Satin'; row[12]=trim; row[18]=status; row[20]=location; row[26]=all_notes
            vals=json.dumps([row])
            subprocess.run(['gog','-a','chris@brighamlarsonpianos.com','--json','sheets','append',SHEET_ID,'Piano Log!A:AH',vals],capture_output=True,text=True,timeout=30)
            return self.j({'success':True,'summary':summary})
        return self.j({'error':'not found'},404)
    def handle_static_json(self, filename, fallback):
        try:
            fp = os.path.join(DIR, 'data', filename)
            if os.path.exists(fp):
                with open(fp) as f: return self.j(json.load(f))
        except Exception as ex:
            return self.j({'error': str(ex), **(fallback if isinstance(fallback, dict) else {})}, 500)
        return self.j(fallback)

    def _load_customer_db(self):
        for rel in (('data','customer_db.json'), ('qbo_data','customer_db.json')):
            fp = os.path.join(DIR, *rel)
            if os.path.exists(fp):
                with open(fp) as f: return json.load(f)
        return {}

    def handle_customers(self):
        db = self._load_customer_db()
        rows = []
        for key, c in list(db.items())[:1000]:
            rows.append({'key': key, 'name': c.get('name',''), 'phone': c.get('phone',''), 'email': c.get('email',''), 'total_spent': c.get('total_spent',0), 'purchases': c.get('total_purchases',0)})
        return self.j({'customers': rows, 'total': len(db)})

    def handle_customer_search(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).get('q', [''])[0].strip().lower()
        if not q: return self.j({'results': []})
        results = []
        db = self._load_customer_db()
        for key, c in db.items():
            hay = ' '.join(str(c.get(k,'')) for k in ('name','phone','email','address')).lower()
            if q in key.lower() or q in hay:
                sales = c.get('sales', []) or []
                results.append({
                    'key': key,
                    'name': c.get('name',''),
                    'phone': c.get('phone',''),
                    'email': c.get('email',''),
                    'address': c.get('address',''),
                    'total_spent': c.get('total_spent',0),
                    'purchases': c.get('total_purchases', len(sales)),
                    'sales': sales[-25:][::-1]
                })
                if len(results) >= 50: break
        return self.j({'results': results})

    def handle_friday_reports(self):
        try:
            import subprocess, json
            SHEET = '11RoeVRETag5rZYX6_tEH-rf6x8JL0JeZU0P5AT0WI-I'
            techs_list = ['Courtney','Curtis','Garrett','Jake','Korban','Lupita','Marcelo','Mark','Matthew','Myrrhanda','Syd','Doris','Jacob','McKinly']
            current_techs = ['Courtney','Curtis','Garrett','Jake Pulver','Korban','Lupita','Marcelo','Mark','Matthew','Myrrhanda','Syd','Doris','Jacob Mower','McKinly Lopp']
            
            # Read 2026 tab for current week
            r = subprocess.run(['gog','-a','chris@brighamlarsonpianos.com','--json','sheets','get',SHEET,"'2026'!A1:Z30"],
                capture_output=True, text=True, timeout=20)
            d = json.loads(r.stdout)
            rows = d.get('values', [])
            
            current_week = None
            if rows:
                for i, h in enumerate(rows[0]):
                    if h and '5/8' in str(h):
                        current_week = i
                        break
                if current_week is None and len(rows[0]) > 1:
                    current_week = len(rows[0]) - 1  # last column
            
            reports = []
            for row in rows[1:]:
                if row and row[0].strip():
                    name = row[0].strip()
                    # Map sheet name to display name
                    display = 'Jake Pulver' if name == 'Jake' else name
                    if name in techs_list:
                        entry = str(row[current_week]).strip() if current_week and current_week < len(row) else ''
                        is_submitted = bool(entry) and entry != 'N/A' and len(entry) > 5
                        prev_entry = str(row[current_week-1]).strip() if current_week and current_week > 1 and current_week-1 < len(row) else ''
                        reports.append({
                            'tech': display,
                            'submitted': is_submitted,
                            'text': entry if is_submitted else '',
                            'prev_text': prev_entry if prev_entry else ''
                        })
            
            return self.j({'reports': reports, 'week': 'Week of May 8', 'current_week_idx': current_week})
        except Exception as ex:
            return self.j({'error': str(ex), 'reports': []}, 500)
    
    def handle_prs(self, path):
        prs_file = os.path.join(DIR, 'prs.json')
        with open(prs_file) as f: data = json.load(f)
        return self.j(data)
    
    def j(self,d,s=200):
        self.send_response(s); self.send_header('Content-Type','application/json'); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers()
        self.wfile.write(json.dumps(d).encode())
    def serve(self):
        p=urllib.parse.urlparse(self.path).path
        if p=='/': p='/index.html'
        fp=os.path.normpath(os.path.join(DIR,p.lstrip('/')))
        if not fp.startswith(DIR): return self.j({'error':'forbidden'},403)
        if not os.path.isfile(fp): return self.j({'error':'not found'},404)
        e={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'}
        ct=e.get(os.path.splitext(fp)[1],'application/octet-stream')
        self.send_response(200); self.send_header('Content-Type',ct); self.send_header('Access-Control-Allow-Origin','*'); self.end_headers()
        with open(fp,'rb') as f: self.wfile.write(f.read())

os.chdir(DIR)
http.server.ThreadingHTTPServer(('',PORT),H).serve_forever()
