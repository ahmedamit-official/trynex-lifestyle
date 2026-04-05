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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 mb-12"
          >
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6"
              style={{ background: 'rgba(255,107,43,0.1)', border: '1px solid rgba(255,107,43,0.15)' }}>
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">Stories & Updates</p>
            <h1 className="text-6xl font-black font-display tracking-tighter mb-4">TryNex Blog</h1>
            <p className="text-foreground/45 text-lg max-w-md mx-auto">
              Style tips, brand updates, and inspiration for your lifestyle.
            </p>
          </motion.div>

          {/* Search + Tags */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--foreground))' }}
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <button
                  onClick={() => setActiveTag("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!activeTag ? 'text-white' : 'text-foreground/40 hover:text-foreground'}`}
                  style={!activeTag ? { background: 'hsl(var(--primary))' } : { background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag === activeTag ? "" : tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTag === tag ? 'text-white' : 'text-foreground/40 hover:text-foreground'}`}
                    style={activeTag === tag ? { background: 'hsl(var(--primary))' } : { background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <Tag className="inline w-3 h-3 mr-1" />{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-3xl overflow-hidden animate-pulse"
                  style={{ background: 'hsl(0 0% 8%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="aspect-video" style={{ background: 'hsl(0 0% 10%)' }} />
                  <div className="p-6 space-y-3">
                    <div className="h-4 rounded" style={{ background: 'hsl(0 0% 12%)', width: '60%' }} />
                    <div className="h-6 rounded" style={{ background: 'hsl(0 0% 12%)' }} />
                    <div className="h-4 rounded" style={{ background: 'hsl(0 0% 12%)', width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-14 h-14 text-foreground/15 mx-auto mb-4" />
              <p className="text-foreground/40 text-xl font-black mb-2">
                {posts.length === 0 ? "No Posts Yet" : "No matching posts"}
              </p>
              <p className="text-foreground/25 text-sm">
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
                    <div className="rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                      style={{
                        background: 'hsl(0 0% 7%)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
                      }}>
                      {post.imageUrl ? (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, hsl(0 0% 9%) 0%, hsl(0 0% 11%) 100%)' }}>
                          <BookOpen className="w-10 h-10 text-foreground/10" />
                        </div>
                      )}
                      <div className="p-6">
                        {post.tags?.length > 0 && (
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {post.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-1 rounded-lg text-[10px] font-black text-foreground/40"
                                style={{ background: 'rgba(255,255,255,0.05)' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="font-black text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-foreground/40 line-clamp-2 mb-4">{post.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-foreground/30">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(post.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
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
