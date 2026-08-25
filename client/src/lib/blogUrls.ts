import { EnneagramType } from '@/lib/enneagramData';

export const ENNEAGRAM_BLOG_URLS: Record<EnneagramType, string> = {
  '1': 'https://mampulgo.com/enneagram-type-1/',
  '2': 'https://mampulgo.com/enneagram-type-2/',
  '3': 'https://mampulgo.com/enneagram-type-3/',
  '4': 'https://mampulgo.com/enneagram-type-4/',
  '5': 'https://mampulgo.com/enneagram-type-5/',
  '6': 'https://mampulgo.com/enneagram-type-6/',
  '7': 'https://mampulgo.com/enneagram-type-7/',
  '8': 'https://mampulgo.com/enneagram-type-8/',
  '9': 'https://mampulgo.com/enneagram-type-9/',
};

export function getEnneagramBlogUrl(type: EnneagramType): string {
  return ENNEAGRAM_BLOG_URLS[type];
}
