/**
 * 安全に日付オブジェクトを作成する
 * @param dateValue - 日付値（string | Date | null | undefined）
 * @returns Date オブジェクトまたは null
 */
export function safeDate(dateValue: string | Date | null | undefined): Date | null {
  if (!dateValue || dateValue === null || dateValue === undefined) {
    return null;
  }
  
  try {
    const date = new Date(dateValue);
    // Invalid Date チェック
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
}

/**
 * 日付を日本語形式でフォーマット
 * @param dateValue - 日付値
 * @param defaultValue - デフォルト値（日付が無効な場合）
 * @returns フォーマットされた日付文字列
 */
export function formatDateJP(dateValue: string | Date | null | undefined, defaultValue: string = '-'): string {
  const date = safeDate(dateValue);
  if (!date) return defaultValue;
  
  return date.toLocaleDateString('ja-JP');
}

/**
 * 時刻を日本語形式でフォーマット
 * @param dateValue - 日付値
 * @param defaultValue - デフォルト値（日付が無効な場合）
 * @returns フォーマットされた時刻文字列
 */
export function formatTimeJP(dateValue: string | Date | null | undefined, defaultValue: string = '-'): string {
  const date = safeDate(dateValue);
  if (!date) return defaultValue;
  
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 日付と時刻を日本語形式でフォーマット
 * @param dateValue - 日付値
 * @param defaultValue - デフォルト値（日付が無効な場合）
 * @returns フォーマットされた日時文字列
 */
export function formatDateTimeJP(dateValue: string | Date | null | undefined, defaultValue: string = '-'): string {
  const date = safeDate(dateValue);
  if (!date) return defaultValue;
  
  return `${formatDateJP(date)} ${formatTimeJP(date)}`;
}

/**
 * 2つの日付が同じ日かチェック
 * @param date1 - 日付1
 * @param date2 - 日付2
 * @returns 同じ日なら true
 */
export function isSameDay(date1: string | Date | null | undefined, date2: string | Date | null | undefined): boolean {
  const d1 = safeDate(date1);
  const d2 = safeDate(date2);
  
  if (!d1 || !d2) return false;
  
  return d1.toDateString() === d2.toDateString();
}