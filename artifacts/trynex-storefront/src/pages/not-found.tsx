import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { ArrowLeft, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead title="Page Not Found" noindex />
      <Navbar />
      <main className="flex-1 pt-header flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-5xl font-black font-display tracking-tighter text-gray-900 mb-4">
            404
          </h1>
          <p className="text-xl font-bold text-gray-600 mb-2">Page Not Found</p>
          <p className="text-gray-400 mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #E85D04, #FB8500)",
                boxShadow: "0 6px 24px rgba(232,93,4,0.35)",
              }}
            >
              <ArrowLeft className="w-4 h-4" /> Go Home
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-orange-400 hover:text-orange-600 transition-all"
            >
              <Search className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
