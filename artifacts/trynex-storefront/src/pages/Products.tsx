import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/ui/Loader";
import { SEOHead } from "@/components/SEOHead";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { Search, SlidersHorizontal, X, ArrowUpDown, Grid3X3, LayoutList } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type SortOption = "default" | "price-asc" | "price-desc" | "name" | "rating";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
  { value: "rating", label: "Best Rated" },
];

export default function Products() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | undefined>(undefined);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categoriesData } = useListCategories();
  const { data: productsData, isLoading } = useListProducts({
    search: search || undefined,
    categoryId: activeCategory,
    limit: 48
  });

  const products = productsData?.products || [];

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price-asc") return (a.discountPrice || a.price) - (b.discountPrice || b.price);
    if (sort === "price-desc") return (b.discountPrice || b.price) - (a.discountPrice || a.price);
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "rating") return (parseFloat(String(b.rating || 0))) - (parseFloat(String(a.rating || 0)));
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEOHead
        title="Shop All Products"
        description="Browse premium custom T-shirts, Hoodies, Mugs & Caps from TryNex Lifestyle. Best prices in Bangladesh with fast delivery to all 64 districts."
        canonical="/products"
        keywords="buy custom tshirt bangladesh, premium hoodie bd, custom mug dhaka, branded cap bangladesh"
      />
      <Navbar />

      <main className="flex-1 pt-header pb-20">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
                <span>Home</span>
                <span>/</span>
                <span className="text-orange-600">Shop</span>
              </div>
              <h1 className="text-4xl font-black font-display tracking-tight text-gray-900">All Collection</h1>
              <p className="text-gray-500 mt-2">
                {isLoading ? "Loading..." : `${products.length} premium products — custom-crafted for you`}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium focus:outline-none bg-white border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="py-2.5 px-3 rounded-xl text-sm font-semibold focus:outline-none bg-white border border-gray-200 focus:border-orange-400 text-gray-700 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-orange-50 text-orange-600" : "text-gray-400 hover:text-gray-600")}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-orange-50 text-orange-600" : "text-gray-400 hover:text-gray-600")}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className={cn("md:w-56 shrink-0", mobileFiltersOpen ? "block" : "hidden md:block")}>
              <div className="sticky top-24">
                {/* Category filter */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Categories</p>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveCategory(undefined)}
                      className={cn(
                        "w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-between",
                        activeCategory === undefined
                          ? "bg-orange-50 text-orange-600 border border-orange-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <span>All Products</span>
                      <span className="text-xs font-bold opacity-60">{productsData?.total ?? 0}</span>
                    </button>
                    {categoriesData?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-all",
                          activeCategory === cat.id
                            ? "bg-orange-50 text-orange-600 border border-orange-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promo box */}
                <div className="mt-4 p-5 rounded-2xl text-white text-center"
                  style={{ background: 'linear-gradient(135deg, #E85D04, #FB8500)' }}>
                  <div className="text-3xl mb-2">🎨</div>
                  <p className="font-bold text-sm mb-1">Custom Order?</p>
                  <p className="text-xs text-orange-100 mb-3">Starting from ৳750. WhatsApp us!</p>
                  <a href="https://wa.me/8801XXXXXXXXX" target="_blank" rel="noopener noreferrer"
                    className="inline-block px-4 py-2 rounded-xl bg-white text-orange-600 text-xs font-black hover:bg-orange-50 transition-colors">
                    Chat Now
                  </a>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-gray-500 font-medium">
                  {isLoading ? "Loading..." : `Showing ${sortedProducts.length} product${sortedProducts.length !== 1 ? 's' : ''}`}
                </p>
                {(search || activeCategory) && (
                  <button
                    onClick={() => { setSearch(""); setActiveCategory(undefined); }}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                          <div className="skeleton aspect-[4/5]" />
                          <div className="p-4 space-y-2">
                            <div className="skeleton h-4 rounded w-3/4" />
                            <div className="skeleton h-4 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : sortedProducts.length > 0 ? (
                  <motion.div
                    key="grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={cn(
                      "grid gap-5",
                      viewMode === "grid"
                        ? "grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    {sortedProducts.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-24 rounded-3xl bg-white border border-dashed border-gray-200"
                  >
                    <div className="text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-6">Try a different search term or browse all categories.</p>
                    <button
                      onClick={() => { setSearch(""); setActiveCategory(undefined); }}
                      className="font-bold text-orange-600 hover:underline text-sm"
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
