import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Calendar, User, Tag, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/utils";

interface BlogPostData {
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
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await fetch(getApiUrl(`/api/blog/${slug}`));
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setPost(data);
    } catch {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;

  if (error || !post) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
            style={{ background: 'rgba(232,93,4,0.06)', border: '1px solid rgba(232,93,4,0.15)' }}>
            📄
          </div>
          <h2 className="text-4xl font-black font-display tracking-tighter mb-3 text-gray-900">Post Not Found</h2>
          <p className="text-gray-400 mb-8">This blog post may have been removed or is not yet published.</p>
          <Link href="/blog"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}>
            <ArrowLeft className="w-5 h-5" /> Back to Blog
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  const paragraphs = post.content.split('\n').filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-header pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {post.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-video rounded-3xl overflow-hidden mb-8"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}
            >
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </motion.div>
          )}

          {post.tags?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="flex gap-2 flex-wrap mb-5">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: 'rgba(232,93,4,0.06)', border: '1px solid rgba(232,93,4,0.12)', color: '#E85D04' }}>
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl font-black font-display tracking-tighter leading-tight mb-6 text-gray-900"
          >
            {post.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 text-sm text-gray-400 pb-8 mb-8 border-b border-gray-200 flex-wrap"
          >
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.createdAt).toLocaleDateString('en-BD', { dateStyle: 'long' })}
            </div>
          </motion.div>

          {post.excerpt && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xl text-gray-500 leading-relaxed mb-8 font-medium italic border-l-2 border-orange-400 pl-6"
            >
              {post.excerpt}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="prose max-w-none"
          >
            {paragraphs.map((para, i) => {
              if (para.startsWith('# ')) {
                return <h2 key={i} className="text-3xl font-black font-display tracking-tighter mt-10 mb-4 text-gray-900">{para.slice(2)}</h2>;
              }
              if (para.startsWith('## ')) {
                return <h3 key={i} className="text-2xl font-black font-display tracking-tight mt-8 mb-3 text-gray-900">{para.slice(3)}</h3>;
              }
              if (para.startsWith('### ')) {
                return <h4 key={i} className="text-xl font-black mt-6 mb-2 text-gray-900">{para.slice(4)}</h4>;
              }
              if (para.startsWith('- ')) {
                return (
                  <ul key={i} className="list-disc pl-6 mb-4">
                    <li className="text-gray-600 leading-relaxed">{para.slice(2)}</li>
                  </ul>
                );
              }
              return (
                <p key={i} className="text-gray-600 leading-relaxed mb-4 text-base">
                  {para}
                </p>
              );
            })}
          </motion.div>

          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/blog"
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> More Posts
            </Link>
            <Link href="/products"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}>
              <BookOpen className="w-4 h-4" /> Shop TryNex Collection
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
