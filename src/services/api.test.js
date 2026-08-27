import { addPost, deletePost, getPosts, updatePost } from './api';

describe('api service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches posts from the backend API', async () => {
    const expected = [
      {
        id: 1,
        title: 'Test post',
        category: 'News',
        description: 'Demo content',
        image: 'https://example.com/image.jpg',
        summary: 'Demo content',
        content: 'Demo content',
      },
    ];

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => expected,
    });

    const result = await getPosts();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/posts');
    expect(result).toEqual(expected);
  });

  it('uploads a post and converts an uploaded file into a data URL', async () => {
    const formData = new FormData();
    formData.append('title', 'New post');
    formData.append('description', 'Uploaded from admin dashboard');
    formData.append('category', 'Amakuru');
    formData.append('image', new File(['image content'], 'news.png', { type: 'image/png' }));

    const expected = {
      id: 2,
      title: 'New post',
      category: 'Amakuru',
      description: 'Uploaded from admin dashboard',
      image: 'data:image/png;base64,aW1hZ2UgY29udGVudA==',
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => expected,
    });

    const result = await addPost(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/posts',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      title: 'New post',
      description: 'Uploaded from admin dashboard',
      category: 'Amakuru',
    });
    expect(requestBody.image).toContain('data:image/png;base64,');
    expect(result).toEqual(expected);
  });

  it('updates and deletes posts through the API service', async () => {
    const formData = new FormData();
    formData.append('title', 'Updated post');
    formData.append('description', 'Updated content');
    formData.append('category', 'Ubukungu');

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 7, title: 'Updated post', category: 'Ubukungu', description: 'Updated content', image: null }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const updated = await updatePost(7, formData);
    const deleted = await deletePost(7);

    expect(updated.title).toBe('Updated post');
    expect(deleted).toBe(true);
  });
});
