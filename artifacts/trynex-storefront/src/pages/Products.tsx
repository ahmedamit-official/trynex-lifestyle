import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/ui/Loader";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Products() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: categoriesData } = useListCategories();
  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    categoryId: activeCategory,
    limit: 48
  });

  const products = productsData?.products || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="py-8 border-b border-white/5 mb-10">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Shop</p>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-5xl font-black font-display tracking-tighter">All Collection</h1>
                <div className="flex gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary w-52 transition-all"
                      style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)', color: 'hsl(var(--foreground))' }}
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="md:hidden p-2.5 rounded-xl transition-colors"
                    style={{ background: 'hsl(0 0% 9%)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className={cn("md:w-52 shrink-0", mobileFiltersOpen ? "block" : "hidden md:block")}>
              <div className="sticky top-24">
                <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/30 mb-4 px-1">Categories</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory(undefined)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
                      activeCategory === undefined
                        ? "bg-primary text-white"
                        : "text-foreground/50 hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    All Products
                    <span className="float-right text-xs opacity-60">{productsData?.total ?? 0}</span>
                  </button>
                  {categoriesData?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200",
                        activeCategory === cat.id
                          ? "bg-primary text-white"
                          : "text-foreground/50 hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-foreground/40 font-medium">
                  {isLoading ? "Loading..." : `${products.length} products`}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader />
                  </motion.div>
                ) : products.length > 0 ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    {products.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 rounded-3xl"
                    style={{ background: 'hsl(0 0% 7%)', border: '1px dashed rgba(255,255,255,0.07)' }}
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(0 0% 10%)' }}>
                      <Search className="w-6 h-6 text-foreground/30" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No products found</h3>
                    <p className="text-foreground/40 mb-6">Try adjusting your search or filters.</p>
                    <button
                      onClick={() => { setSearch(""); setActiveCategory(undefined); }}
                      className="font-bold text-primary hover:underline text-sm"
                    >
                      Clear all filters
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
