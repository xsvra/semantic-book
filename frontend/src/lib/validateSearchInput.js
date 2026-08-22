/**
 * Search Input Validator for Nonfiction Book Recommendation System
 * Validates queries to ensure high-quality semantic recommendations and prevent invalid/malicious inputs.
 */

export function validateSearchInput(input) {
  if (!input || typeof input !== 'string') {
    return { isValid: false, message: 'Kata kunci pencarian tidak boleh kosong.' };
  }

  const trimmed = input.trim();

  // 1. Input kosong / hanya spasi
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Kata kunci pencarian tidak boleh kosong. Masukkan topik atau judul buku yang ingin Anda cari.' };
  }

  // 2. Input terlalu pendek (< 2 karakter)
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Kata kunci pencarian terlalu pendek. Masukkan minimal 2 karakter bermakna.' };
  }

  // 3. Input terlalu panjang (> 200 karakter)
  if (trimmed.length > 200) {
    return { isValid: false, message: 'Kata kunci pencarian terlalu panjang (maksimal 200 karakter).' };
  }

  // 4. Input hanya berupa angka (misal: "123456", "9999")
  if (/^\d+$/.test(trimmed)) {
    return {
      isValid: false,
      message: `Pencarian "${trimmed}" hanya berisi angka. Harap masukkan judul buku atau topik non-fiksi yang bermakna.`
    };
  }

  // 5. Input hanya berupa simbol / karakter khusus (misal: "!!@@", "###$$$")
  if (!/[a-zA-Z0-9\u00C0-\u024F\u0400-\u04FF\u4e00-\u9fff]/.test(trimmed)) {
    return {
      isValid: false,
      message: 'Pencarian hanya berisi simbol atau karakter khusus. Harap masukkan kata atau kalimat topik yang bermakna.'
    };
  }

  // 6. Input berupa URL / Link (misal: "http://example.com", "https://...", "www.google.com")
  const urlPattern = /(https?:\/\/[^\s]+|ftp:\/\/[^\s]+|www\.[^\s]+\.[^\s]+|[a-zA-Z0-9-]+\.(com|org|net|io|co|id|gov|edu)[^\s]*)/i;
  if (urlPattern.test(trimmed)) {
    return {
      isValid: false,
      message: 'Pencarian tidak boleh berupa alamat link/URL web. Masukkan topik atau judul buku.'
    };
  }

  // 7. Input berupa HTML / XML Tag (misal: "<h1>test</h1>", "<script>alert(1)</script>")
  const htmlPattern = /<\/?\w+((\s+[\w\-]+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/i;
  if (htmlPattern.test(trimmed) || /<[a-z][\s\S]*>/i.test(trimmed)) {
    return {
      isValid: false,
      message: 'Pencarian mengandung tag HTML/XML yang tidak diizinkan.'
    };
  }

  // 8. Input berupa Kode Program / Syntax Injection (misal: "import os", "def foo():", "SELECT * FROM")
  const codePattern = /\b(import\s+[\w{}]|def\s+\w+\s*\(|function\s*\w*\s*\(|class\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|SELECT\s+.*\s+FROM|INSERT\s+INTO|DROP\s+TABLE|UPDATE\s+.*\s+SET|DELETE\s+FROM|console\.log\(|eval\(|system\(|exec\()/i;
  if (codePattern.test(trimmed)) {
    return {
      isValid: false,
      message: 'Pencarian mengandung sintaks kode program atau query database. Harap masukkan topik non-fiksi biasa.'
    };
  }

  // 9. Input berupa karakter berulang tanpa makna (misal: "aaaaaaa", "qwqwqwqwqw", "asdfasdfasdf")
  // 9a. Karakter sama diulang > 4 kali berturut-turut (misal "aaaaa", "!!!!!!")
  if (/(.)\1{4,}/i.test(trimmed)) {
    return {
      isValid: false,
      message: 'Pencarian mengandung pengulangan karakter yang sama berturut-turut. Masukkan kata yang valid.'
    };
  }

  // 9b. Pola 2-4 karakter diulang > 3 kali berturut-turut (misal "qwqwqwqw", "asdfasdfasdf")
  if (/(.{2,4})\1{3,}/i.test(trimmed)) {
    return {
      isValid: false,
      message: 'Pencarian mengandung pengulangan pola karakter tanpa makna. Masukkan kata kunci yang valid.'
    };
  }

  // 10. Teks acak / Gibberish (konsonan berurutan tanpa vokal > 6 karakter, misal "bcdfghjklm")
  if (/[bcdfghjklmnpqrstvwxyz]{7,}/i.test(trimmed)) {
    return {
      isValid: false,
      message: 'Kata kunci tampaknya berupa susunan karakter acak tanpa vokal. Harap gunakan kata yang bermakna.'
    };
  }

  return { isValid: true, sanitized: trimmed };
}
