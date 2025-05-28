import { translations } from '@/contexts/language-context';

export function t(key: string, language: 'en' | 'sv' = 'en'): string {
  return translations[language][key as keyof typeof translations.en] || key;
} 