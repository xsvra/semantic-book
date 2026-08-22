import re
from typing import Tuple, Optional

def validate_search_query(query: str) -> Tuple[bool, Optional[str]]:
    """
    Validates a search query string.
    Returns (is_valid, error_message)
    """
    if not query or not isinstance(query, str):
        return False, "Kata kunci pencarian tidak boleh kosong."

    trimmed = query.strip()

    # 1. Input kosong
    if len(trimmed) == 0:
        return False, "Kata kunci pencarian tidak boleh kosong. Masukkan topik atau judul buku yang ingin Anda cari."

    # 2. Input terlalu pendek (< 2 karakter)
    if len(trimmed) < 2:
        return False, "Kata kunci pencarian terlalu pendek. Masukkan minimal 2 karakter bermakna."

    # 3. Input terlalu panjang (> 200 karakter)
    if len(trimmed) > 200:
        return False, "Kata kunci pencarian terlalu panjang (maksimal 200 karakter)."

    # 4. Input hanya angka
    if trimmed.isdigit():
        return False, f'Pencarian "{trimmed}" hanya berisi angka. Harap masukkan judul buku atau topik non-fiksi yang bermakna.'

    # 5. Input hanya simbol / karakter khusus
    if not re.search(r'[a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\u4e00-\u9fff]', trimmed):
        return False, "Pencarian hanya berisi simbol atau karakter khusus. Harap masukkan kata atau kalimat topik yang bermakna."

    # 6. Input berupa URL / Link
    url_pattern = re.compile(r'(https?://[^\s]+|ftp://[^\s]+|www\.[^\s]+\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|id|gov|edu)[^\s]*)', re.IGNORECASE)
    if url_pattern.search(trimmed):
        return False, "Pencarian tidak boleh berupa alamat link/URL web. Masukkan topik atau judul buku."

    # 7. Input berupa HTML / XML Tag
    html_pattern = re.compile(r'</?\w+((\s+[\w\-]+(\s*=\s*(?:".*?"|\'.*?\'|[^\'">\s]+))?)+\s*|\s*)/?>', re.IGNORECASE)
    if html_pattern.search(trimmed) or re.search(r'<[a-z][\s\S]*>', trimmed, re.IGNORECASE):
        return False, "Pencarian mengandung tag HTML/XML yang tidak diizinkan."

    # 8. Input berupa Kode Program / Syntax Injection
    code_pattern = re.compile(r'\b(import\s+[\w{}]|def\s+\w+\s*\(|function\s*\w*\s*\(|class\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|SELECT\s+.*\s+FROM|INSERT\s+INTO|DROP\s+TABLE|UPDATE\s+.*\s+SET|DELETE\s+FROM|console\.log\(|eval\(|system\(|exec\()', re.IGNORECASE)
    if code_pattern.search(trimmed):
        return False, "Pencarian mengandung sintaks kode program atau query database. Harap masukkan topik non-fiksi biasa."

    # 9. Input berupa karakter berulang tanpa makna
    # 9a. Karakter sama diulang > 4 kali
    if re.search(r'(.)\1{4,}', trimmed, re.IGNORECASE):
        return False, "Pencarian mengandung pengulangan karakter yang sama berturut-turut. Masukkan kata yang valid."

    # 9b. Pola 2-4 karakter diulang > 3 kali
    if re.search(r'(.{2,4})\1{3,}', trimmed, re.IGNORECASE):
        return False, "Pencarian mengandung pengulangan pola karakter tanpa makna. Masukkan kata kunci yang valid."

    # 10. Teks acak / Gibberish (konsonan berurutan > 6)
    if re.search(r'[bcdfghjklmnpqrstvwxyz]{7,}', trimmed, re.IGNORECASE):
        return False, "Kata kunci tampaknya berupa susunan karakter acak tanpa vokal. Harap gunakan kata yang bermakna."

    return True, None
