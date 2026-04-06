import { AdminLayout } from "@/components/layout/AdminLayout";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, FileText, Calendar, Tag, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders, getApiUrl } from "@/lib/utils";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  imageUrl?: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all placeholder:text-gray-400 border border-gray-200 bg-white text-gray-900";

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

async function fetchPosts(): Promise<BlogPost[]> {
  const res = await fetch(getApiUrl('/api/blog?limit=100'), {
    headers: { ...getAuthHeaders(), 'x-admin-token': 'admin_authenticated' }
  });
  const data = await res.json();
  return data.posts || [];
}

async function createPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(getApiUrl('/api/blog'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Failed to create post');
  return res.json();
}

async function updatePost(id: number, post: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(getApiUrl(`/api/blog/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Failed to update post');
  return res.json();
}

async function deletePost(id: number): Promise<void> {
  await fetch(getApiUrl(`/api/blog/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

const EMPTY_POST: Partial<BlogPost> = {
  title: '', slug: '', excerpt: '', content: '', imageUrl: '', author: 'TryNex Team', tags: [], published: false
};

export default function AdminBlog() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => { loadPosts(); }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditorOpen) closeEditor();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPosts();
      setPosts(data);
    } catch {
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditing({ ...post });
      setTagsInput((post.tags || []).join(', '));
    } else {
      setEditing({ ...EMPTY_POST });
      setTagsInput('');
    }
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditing(null);
    setTagsInput('');
  };

  const handleTitleChange = (title: string) => {
    setEditing(prev => ({
      ...prev!,
      title,
      slug: prev?.id ? prev.slug : slugify(title)
    }));
  };

  const handleSave = async () => {
    if (!editing?.title || !editing?.content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { ...editing, tags };
      if (!payload.slug) payload.slug = slugify(editing.title!);

      if (editing.id) {
        const updated = await updatePost(editing.id, payload);
        setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
        toast({ title: "✓ Post updated!" });
      } else {
        const created = await createPost(payload);
        setPosts(prev => [created, ...prev]);
        toast({ title: "✓ Post published!" });
      }
      closeEditor();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deletePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast({ title: "✓ Post deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const updated = await updatePost(post.id, { published: !post.published });
      setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
      toast({ title: updated.published ? "✓ Post published!" : "Post moved to drafts" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Content</p>
          <h1 className="text-3xl font-black font-display tracking-tighter text-gray-900">Blog Posts</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">{posts.length} total posts</p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 6px 24px rgba(232,93,4,0.3)' }}
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 rounded-3xl bg-gray-50 border border-gray-100">
          <FileText className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="font-bold text-xl text-gray-400 mb-2">No blog posts yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your first post to engage with customers</p>
          <button
            onClick={() => openEditor()}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}
          >
            <Plus className="w-4 h-4 inline mr-2" />Create First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl overflow-hidden group bg-white"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}
            >
              {post.imageUrl ? (
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-50">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${post.published ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                    {post.published ? '● Published' : '○ Draft'}
                  </span>
                  {post.tags?.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-500 border border-orange-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-black text-base text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                {post.excerpt && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <Calendar className="w-3 h-3" />
                  {new Date(post.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditor(post)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 bg-orange-50 border border-orange-200 text-orange-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105"
                    style={{
                      background: post.published ? 'rgba(239,68,68,0.08)' : 'rgba(74,222,128,0.1)',
                      border: `1px solid ${post.published ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`,
                      color: post.published ? '#ef4444' : '#16a34a'
                    }}
                    title={post.published ? 'Move to Draft' : 'Publish'}
                  >
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 py-8"
            onClick={e => e.target === e.currentTarget && closeEditor()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl rounded-3xl overflow-hidden bg-white"
              style={{ border: '1px solid #e5e7eb', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div>
                  <h2 className="text-xl font-black font-display text-gray-900">
                    {editing.id ? 'Edit Post' : 'Create New Post'}
                  </h2>
                  {editing.id && <p className="text-xs text-gray-400 mt-0.5">ID #{editing.id}</p>}
                </div>
                <button onClick={closeEditor} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Title *</label>
                  <input
                    value={editing.title || ''}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="Post title..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Slug (URL)</label>
                  <input
                    value={editing.slug || ''}
                    onChange={e => setEditing(prev => ({ ...prev!, slug: e.target.value }))}
                    placeholder="post-url-slug"
                    className={inputClass}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Cover Image URL</label>
                  <input
                    value={editing.imageUrl || ''}
                    onChange={e => setEditing(prev => ({ ...prev!, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className={inputClass}
                  />
                  {editing.imageUrl && (
                    <img src={editing.imageUrl} alt="preview" className="mt-2 h-24 rounded-xl object-cover w-full border border-gray-100" onError={e => (e.currentTarget.style.display = 'none')} />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Excerpt</label>
                  <textarea
                    value={editing.excerpt || ''}
                    onChange={e => setEditing(prev => ({ ...prev!, excerpt: e.target.value }))}
                    placeholder="Brief summary shown in listings..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Content *</label>
                  <textarea
                    value={editing.content || ''}
                    onChange={e => setEditing(prev => ({ ...prev!, content: e.target.value }))}
                    placeholder="Write your full blog post content here..."
                    rows={12}
                    className={`${inputClass} resize-none font-mono text-xs leading-relaxed`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Author</label>
                    <input
                      value={editing.author || ''}
                      onChange={e => setEditing(prev => ({ ...prev!, author: e.target.value }))}
                      placeholder="Author name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      placeholder="fashion, tips, style"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${editing.published ? 'bg-green-500' : 'bg-gray-300'}`}
                    onClick={() => setEditing(prev => ({ ...prev!, published: !prev?.published }))}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${editing.published ? 'left-7' : 'left-1'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {editing.published ? 'Published' : 'Draft'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {editing.published ? 'Visible to all customers' : 'Hidden from public view'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={closeEditor}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)', boxShadow: '0 4px 16px rgba(232,93,4,0.3)' }}
                >
                  {isSaving ? (
                    <><span className="animate-spin inline-block">↻</span> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> {editing.id ? 'Update Post' : 'Publish Post'}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
