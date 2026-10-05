import csv
import json
import re
import urllib.request
from collections import Counter

def clean_amount(val):
    if not val:
        return None
    val = val.strip().replace('$', '').replace(',', '').replace('"', '').strip()
    if not val or val.upper() == 'TBD':
        return None
    try:
        return float(val)
    except ValueError:
        return None

def build_payload():
    csv_path = r"C:\Users\luisc\Downloads\relacion de cotizaciones (2).csv"
    updates = []
    
    quote_counts = {}
    
    with open(csv_path, mode='r', encoding='latin1') as f:
        reader = csv.reader(f)
        header = next(reader)
        
        for line_num, row in enumerate(reader, start=2):
            if not row or len(row) < 9:
                continue
            quote_raw = row[1].strip()
            if not quote_raw or not re.match(r'^\d+$', quote_raw):
                continue
            
            client = row[3].strip() if len(row) > 3 else ''
            # Skip empty reservation rows
            if not client:
                continue
                
            quote_num = int(quote_raw)
            if quote_num == 112:
                quote_counts[112] = quote_counts.get(112, 0) + 1
                suffix = 'A' if quote_counts[112] == 1 else 'B'
                cot_id = f"COT-0112{suffix}"
            elif quote_num == 276:
                quote_counts[276] = quote_counts.get(276, 0) + 1
                suffix = 'A' if quote_counts[276] == 1 else 'B'
                cot_id = f"COT-0276{suffix}"
            else:
                cot_id = f"COT-{quote_num:04d}"
                
            cost_mx_raw = row[7].strip() if len(row) > 7 else ''
            cost_usd_raw = row[8].strip() if len(row) > 8 else ''
            
            cost_mx = clean_amount(cost_mx_raw)
            cost_usd = clean_amount(cost_usd_raw)
            
            # Follow TKT-BQS-005 rules:
            # Regla USD: Si COSTO USD tiene un valor numérico -> Moneda strictly USD
            # Regla MXN: Si COSTO MX tiene un valor -> Moneda MXN
            # Regla Nulos: Para cotizaciones con ambas columnas en blanco / no numéricas -> monto en 0.00 y Moneda NULL
            if cost_usd is not None and cost_usd > 0:
                currency = 'USD'
                amount = cost_usd
            elif cost_mx is not None and cost_mx > 0:
                currency = 'MXN'
                amount = cost_mx
            else:
                currency = None
                amount = 0.0
                
            updates.append({
                'ID_Cotizacion': cot_id,
                'Moneda': currency,
                'Monto_Autorizado': amount
            })
            
    return updates

def run_update():
    updates = build_payload()
    print(f"Generated {len(updates)} update payloads.")
    currencies = Counter(u['Moneda'] for u in updates)
    print("Currency distribution in payload:", currencies)

    url = 'https://bqs.dataholics.com.mx/api/admin/update-cotizaciones-monedas'
    headers = {
        'User-Agent': 'BQS-Admin-Setup/1.0',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    data_bytes = json.dumps(updates).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method='POST')

    print(f"Sending POST to {url}...")
    try:
        with urllib.request.urlopen(req) as resp:
            res_body = resp.read().decode('utf-8')
            res_json = json.loads(res_body)
            print("Response from server:", res_json)
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} - {e.reason}")
        print(e.read().decode('utf-8', errors='ignore'))
        return

    # Verify against production DB
    print("\n--- VERIFICANDO BASE DE DATOS EN PRODUCCIÓN ---")
    req_verify = urllib.request.Request('https://bqs.dataholics.com.mx/api/cotizaciones', headers={'User-Agent': 'BQS-Admin-Setup/1.0', 'Accept': 'application/json'})
    with urllib.request.urlopen(req_verify) as resp:
        db_data = json.loads(resp.read().decode('utf-8'))

    db_map = {d['ID_Cotizacion']: d for d in db_data}
    new_currencies = Counter(d.get('Moneda') for d in db_data)
    print("New currency distribution in DB:", new_currencies)

    # QA Verification Cases from ticket:
    # Casos de prueba QA USD: Folios 1, 4, 6 y 7
    # Casos de prueba QA MXN: Folios 2, 3, 8 y 12
    # Casos de prueba QA Nulos: Folios 5, 13 y 14
    qa_cases = [
        ('COT-0001', 'USD', 450.00),
        ('COT-0004', 'USD', 450.00),
        ('COT-0006', 'USD', 1304.16),
        ('COT-0007', 'USD', 22394.88),
        ('COT-0002', 'MXN', 163587.60),
        ('COT-0003', 'MXN', 134460.00),
        ('COT-0008', 'MXN', 49863.60),
        ('COT-0012', 'MXN', 9000.00),
        ('COT-0005', None, 0.00),
        ('COT-0013', None, 0.00),
        ('COT-0014', None, 0.00),
    ]

    all_passed = True
    print("\n--- QA TEST CASES AUDIT ---")
    for cot_id, expected_moneda, expected_monto in qa_cases:
        row = db_map.get(cot_id)
        if not row:
            print(f"❌ {cot_id}: NOT FOUND IN DB!")
            all_passed = False
            continue
        actual_moneda = row.get('Moneda')
        actual_monto = float(row.get('Monto_Autorizado') or 0)
        moneda_match = (actual_moneda == expected_moneda)
        monto_match = abs(actual_monto - expected_monto) < 0.01

        status = "[PASS]" if (moneda_match and monto_match) else "[FAIL]"
        if not (moneda_match and monto_match):
            all_passed = False
        print(f"{status} | {cot_id}: Moneda={actual_moneda} (exp: {expected_moneda}), Monto={actual_monto} (exp: {expected_monto})")

    if all_passed:
        print("\n=== TODOS LOS CASOS DE QA PASARON CON EXITO ===")
    else:
        print("\n=== HUBO DISCREPANCIAS EN LOS CASOS DE QA ===")

if __name__ == '__main__':
    run_update()

