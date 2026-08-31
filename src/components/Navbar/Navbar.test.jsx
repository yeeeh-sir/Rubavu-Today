import { buildMixedPosts, MAX_MIXED_POSTS } from './Navbar';

describe('buildMixedPosts', () => {
    it('caps the mixed post list at 15 items', () => {
        const posts = Array.from({ length: 30 }, (_, index) => ({
            _id: `post-${index + 1}`,
            title: `Post ${index + 1}`,
            createdDate: `2024-01-${String((index % 28) + 1).padStart(2, '0')}`,
        }));

        const result = buildMixedPosts(posts);

        expect(result).toHaveLength(MAX_MIXED_POSTS);
        expect(result.every((post) => post && post._id)).toBe(true);
    });
});
