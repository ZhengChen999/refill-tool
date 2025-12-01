
// This service replaces the external AI call with a robust local generator
// to meet the "No env vars" and "No backend" requirements while keeping the tone professional.

import { PatientReminder } from "../types";

const TAIWAN_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Taipei'
};

const formatTwDate = (date: Date): string => {
  // Format to YYYY/MM/DD using Taiwan locale
  return date.toLocaleDateString('zh-TW', TAIWAN_DATE_OPTIONS).replace(/\//g, '/');
};

export const generateEmailLink = (reminder: PatientReminder): string => {
  const subject = `慢箋領藥提醒`;
  
  const startDateStr = formatTwDate(reminder.windowStart);
  const endDateStr = formatTwDate(reminder.windowEnd);

  // Template strictly following the user's tone requirements
  const body = `
${reminder.name} 您好，

這是慢箋領藥提醒。您的可領藥期間為 ${startDateStr} 起至 ${endDateStr} 止。

提醒您攜帶：
1. 健保卡
2. 慢性處方箋

請前往本藥局領藥。如有任何問題歡迎與我們聯繫。

祝 平安健康
`.trim();

  return `mailto:${reminder.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
