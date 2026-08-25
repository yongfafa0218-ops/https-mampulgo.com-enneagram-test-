import { describe, expect, it } from 'vitest';
import { ENNEAGRAM_BLOG_URLS, getEnneagramBlogUrl } from './blogUrls';

const expectedTypes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

describe('Enneagram blog URLs', () => {
  it('contains one exact blog URL for each Enneagram type', () => {
    expect(Object.keys(ENNEAGRAM_BLOG_URLS)).toEqual([...expectedTypes]);

    for (const type of expectedTypes) {
      expect(getEnneagramBlogUrl(type)).toBe(`https://mampulgo.com/enneagram-type-${type}/`);
    }
  });
});
