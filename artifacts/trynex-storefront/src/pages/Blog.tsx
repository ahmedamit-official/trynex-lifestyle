import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Calendar, Tag, ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/utils";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  author: string;
  tags: string[];
  published: boolean;
  createdAt: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(getApiUrl('/api/blog?published=true&limit=50'));
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags || [])));

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || (p.tags || []).includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-header pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 mb-12"
          >
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6"
              style={{ background: 'rgba(232,93,4,0.08)', border: '1px solid rgba(232,93,4,0.15)' }}>
              <BookOpen className="w-7 h-7 text-orange-500" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-3">Stories & Updates</p>
            <h1 className="text-6xl font-black font-display tracking-tighter mb-4 text-gray-900">TryNex Blog</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Style tips, brand updates, and inspiration for your lifestyle.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 bg-white text-gray-900 placeholder:text-gray-400"
                style={{ border: '1px solid #e5e7eb' }}
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => setActiveTag("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!activeTag ? 'text-white bg-orange-500' : 'text-gray-500 hover:text-gray-700 bg-gray-100'}`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? "" : tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTag === tag ? 'text-white bg-orange-500' : 'text-gray-500 hover:text-gray-700 bg-gray-100'}`}
                  >
                    <Tag className="inline w-3 h-3 mr-1" />{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-3xl overflow-hidden animate-pulse bg-gray-50 border border-gray-100">
                  <div className="aspect-video bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 rounded bg-gray-200" style={{ width: '60%' }} />
                    <div className="h-6 rounded bg-gray-200" />
                    <div className="h-4 rounded bg-gray-200" style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-14 h-14 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-black mb-2">
                {posts.length === 0 ? "No Posts Yet" : "No matching posts"}
              </p>
              <p className="text-gray-400 text-sm">
                {posts.length === 0 ? "Check back soon for style tips and brand updates." : "Try a different search or tag."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <div className="rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 bg-white border border-gray-100"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                      {post.imageUrl ? (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100/50">
                          <BookOpen className="w-10 h-10 text-orange-200" />
                        </div>
                      )}
                      <div className="p-6">
                        {post.tags?.length > 0 && (
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 rounded-lg text-[10px] font-black text-gray-500 bg-gray-100">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="font-black text-lg leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2 text-gray-900">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-orange-500 group-hover:gap-2 transition-all">
                            Read <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
