import React, { useEffect, useMemo, useState } from "react";
import { shopApi } from "@/lib/api";
import { Link } from "react-router-dom";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingId, setAddingId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const list = await shopApi.listProducts();
      const processList = (arr) => {
        // Hide sample placeholders and de-duplicate by name+price, newest first
        const filtered = (arr || []).filter(p => !/^Sample Accessory/i.test(p?.name || ''));
        const deduped = Array.from(
          new Map(filtered.map(p => [`${(p.name || '').toLowerCase()}|${p.price}`, p])).values()
        );
        deduped.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return deduped;
      };
      if (!list || list.length === 0) {
        await shopApi.seedProducts();
        const seeded = await shopApi.listProducts();
        setProducts(processList(seeded));
      } else {
        setProducts(processList(list));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const slugify = (s = "") => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const SmartImage = ({ product, className }) => {
    const candidates = useMemo(() => {
      const list = [];
      const img = product?.image || "";
      if (img) list.push(img); // absolute or /products/... set from backend
      const nameSlug = slugify(product?.name || "");
      const catSlug = slugify(product?.category || "");
      const exts = ["jpg", "png", "jpeg", "webp"];
      if (nameSlug) exts.forEach((ext) => list.push(`/products/${nameSlug}.${ext}`));
      if (catSlug) exts.forEach((ext) => list.push(`/products/${catSlug}.${ext}`));
      // Product-specific placeholder based on product ID or name
      list.push(`https://via.placeholder.com/200x200/9333ea/ffffff?text=${encodeURIComponent(product?.name?.slice(0, 10) || 'Product')}`);
      return list;
    }, [product]);

    const [idx, setIdx] = useState(0);
    const src = candidates[idx] || candidates[candidates.length - 1];
    return (
      <div className={`${className} bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center`}>
        <img
          src={src}
          alt={product?.name || 'Product'}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
        />
      </div>
    );
  };

  const addToCart = async (product) => {
    try {
      setAddingId(product._id);
      await shopApi.addToCart(product, 1);
  window.dispatchEvent(new Event('cart:updated'));
    } catch (e) {
      setError(e.message);
    } finally {
      setAddingId("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-purple-700">Pet Shop</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => { await shopApi.appendProducts(); await load(); }}
              className="hidden md:inline bg-white border border-purple-200 text-purple-600 px-3 py-1.5 rounded-full hover:bg-purple-50 cursor-pointer"
              title="Append 20 sample products"
            >+20</button>
            <button
              onClick={async () => { await shopApi.seedProductsForce(); await load(); }}
              className="hidden md:inline bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-50 cursor-pointer"
              title="Force reseed catalog"
            >Reseed</button>
            <Link to="/shop/cart" className="text-purple-700 font-medium">View Cart →</Link>
          </div>
        </div>
        <p className="text-gray-600 mb-8">Browse our selection of quality products for your pets.</p>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:scale-105 transition-transform h-full">
                <SmartImage product={product} className="w-32 h-32 object-cover rounded-lg mb-4" />
                <h2 className="text-lg font-semibold text-purple-600 mb-2 text-center">{product.name}</h2>
                <p className="text-gray-700 mb-2 text-center flex-grow">{product.description}</p>
                <span className="text-pink-600 font-bold mb-4">${product.price.toFixed(2)}</span>
                <button onClick={() => addToCart(product)} disabled={addingId === product._id} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium hover:scale-105 transition-all disabled:opacity-60 mt-auto cursor-pointer">
                  {addingId === product._id ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;