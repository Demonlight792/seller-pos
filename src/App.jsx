import React, { useState, useEffect, useMemo } from 'react';
import { 
  doc, collection, onSnapshot, addDoc, updateDoc, getDoc, setDoc 
} from 'firebase/firestore';
import { 
  Search, Plus, Edit2, Calculator, LogOut, Package, Image as ImageIcon, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, X 
} from 'lucide-react';
import { db } from './firebase';

const appId = 'seller-dashboard-app';

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price || 0);
};

const Navbar = ({ view, setView, handleLogout }) => (
  <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-indigo-600 p-2 rounded-lg mr-3 shadow-sm">
             <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 hidden sm:block">Toko Kevin</span>
        </div>
        
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto px-2 scrollbar-hide">
           <button onClick={() => setView('home')} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${view === 'home' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Home</button>
           <button onClick={() => setView('add-product')} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${view === 'add-product' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Tambah</button>
           <button onClick={() => setView('edit-product')} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${view === 'edit-product' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Ubah</button>
           <button onClick={() => setView('calculator')} className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${view === 'calculator' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>Kalkulator</button>
        </div>

        <div className="flex items-center">
          <button onClick={handleLogout} className="p-2 ml-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const HomeView = ({ products }) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('asc');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => { setPage(1); }, [search, sort]);

  const filteredAndSorted = useMemo(() => {
    let result = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    result = result.sort((a, b) => {
      if (sort === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
    return result;
  }, [products, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
  const displayedProducts = filteredAndSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-black text-slate-800">Daftar Produk</h2>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" placeholder="Cari nama produk..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          </div>
          <select 
            value={sort} onChange={(e) => setSort(e.target.value)}
            className="py-2.5 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="asc">A - Z (Ascending)</option>
            <option value="desc">Z - A (Descending)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition duration-300 flex flex-col group min-h-[160px]">
            <div className="p-5 flex flex-col items-center justify-center flex-grow text-center">
              <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-indigo-600 font-black text-xl mb-2">{formatPrice(product.price)}</p>
              {product.altPrice > 0 && (
                <p className="text-sm text-slate-500 font-medium mt-auto bg-slate-50 p-2 rounded-lg border border-slate-100 w-full">
                  Info Tambahan: <br/><span className="font-bold text-slate-700">{formatPrice(product.altPrice)}</span>
                </p>
              )}
            </div>
          </div>
        ))}
        {displayedProducts.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-100">
            <Package className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium text-lg">Tidak ada produk ditemukan.</p>
          </div>
        )}
      </div>

      {filteredAndSorted.length > itemsPerPage && (
        <div className="flex justify-center items-center mt-10 space-x-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex space-x-1">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition ${page === i + 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

const AddProductView = ({ appUser, showModal, setView }) => {
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const price = Number(formData.get('price'));
    const altPriceRaw = formData.get('altPrice');
    const altPrice = altPriceRaw ? Number(altPriceRaw) : 0;

    try {
      const productsRef = collection(db, 'artifacts', appId, 'public', 'data', `seller_products_${appUser.username}`);
      await addDoc(productsRef, { name, price, altPrice, createdAt: Date.now() });
      e.target.reset();
      showModal('success', 'Berhasil menambahkan produk baru!', 'OK', () => { setView('home'); });
    } catch (err) {
      console.error(err);
      showModal('error', 'Gagal menyimpan produk. Pastikan Firestore rules Anda sudah benar.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center mb-8 border-b border-slate-100 pb-4">
          <div className="bg-indigo-100 p-3 rounded-xl mr-4 text-indigo-600">
            <Plus size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Tambah Produk Baru</h2>
            <p className="text-slate-500 font-medium mt-1">Masukkan detail produk untuk ditambahkan ke toko Anda.</p>
          </div>
        </div>

        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama Produk <span className="text-red-500">*</span></label>
              <input required name="name" type="text" placeholder="Contoh: Sepatu Sneakers Pria" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Harga Utama (Rp) <span className="text-red-500">*</span></label>
              <input required name="price" type="number" min="0" placeholder="Contoh: 150000" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Info Tambahan / Harga Satuan (Rp)</label>
              <input name="altPrice" type="number" min="0" placeholder="Opsional (misal harga ecer: 140000)" className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button type="submit" className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditProductView = ({ appUser, products, showModal }) => {
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({ show: false, product: null });
  
  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const price = Number(formData.get('price'));
    const altPriceRaw = formData.get('altPrice');
    const altPrice = altPriceRaw ? Number(altPriceRaw) : 0;
    
    try {
      const productRef = doc(db, 'artifacts', appId, 'public', 'data', `seller_products_${appUser.username}`, editModal.product.id);
      await updateDoc(productRef, { name, price, altPrice });
      setEditModal({ show: false, product: null });
      showModal('success', 'Produk berhasil diubah!');
    } catch (err) {
      console.error(err);
      showModal('error', 'Gagal mengubah produk.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center">
          <div className="bg-amber-100 p-2.5 rounded-xl mr-3 text-amber-600">
            <Edit2 size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Ubah Produk</h2>
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text" placeholder="Cari produk untuk diubah..." 
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
          <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Produk</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Harga Utama</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Info Tambahan</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-600">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                    {product.altPrice > 0 ? formatPrice(product.altPrice) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setEditModal({ show: true, product })}
                      className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-bold transition"
                    >
                      <Edit2 size={16} className="mr-1.5" /> Ubah Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-medium">Data produk tidak ditemukan.</div>
          )}
        </div>
      </div>

      {editModal.show && editModal.product && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800">Ubah Data Produk</h3>
              <button onClick={() => setEditModal({ show: false, product: null })} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="editForm" onSubmit={handleUpdateProduct} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nama Produk</label>
                  <input required name="name" defaultValue={editModal.product.name} type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Harga Utama</label>
                    <input required name="price" defaultValue={editModal.product.price} type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Info Tambahan</label>
                    <input name="altPrice" defaultValue={editModal.product.altPrice || ''} type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button type="button" onClick={() => setEditModal({ show: false, product: null })} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl mr-3 transition">Batal</button>
              <button type="submit" form="editForm" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition">Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CalculatorView = ({ products }) => {
  const [calcSearch, setCalcSearch] = useState('');
  const [selectedProd, setSelectedProd] = useState(null);
  const [priceBasis, setPriceBasis] = useState('main');
  const [qty, setQty] = useState(1);
  const [cash, setCash] = useState('');

  const searchResults = useMemo(() => {
    if (!calcSearch.trim()) return [];
    return products.filter(p => p.name.toLowerCase().includes(calcSearch.toLowerCase())).slice(0, 5);
  }, [products, calcSearch]);

  const activePrice = selectedProd ? (priceBasis === 'main' ? selectedProd.price : (selectedProd.altPrice || 0)) : 0;
  const total = activePrice * (Number(qty) || 0);
  const numericCash = Number(cash) || 0;
  const change = numericCash > 0 ? numericCash - total : 0;

  const handleSelectProduct = (p) => {
    setSelectedProd(p);
    setCalcSearch('');
    setQty(1);
    setCash('');
    setPriceBasis('main');
  };

  const resetCalc = () => {
    setSelectedProd(null);
    setCalcSearch('');
    setQty(1);
    setCash('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <div className="bg-emerald-100 p-2.5 rounded-xl mr-3 text-emerald-600">
          <Calculator size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">Mini POS / Kalkulator</h2>
          <p className="text-slate-500 font-medium">Hitung transaksi cepat tanpa menyimpan ke database.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-6 relative">
            <label className="block text-sm font-bold text-slate-700 mb-2">Cari & Pilih Produk</label>
            <div className="relative">
              <input 
                type="text" placeholder="Ketik nama produk..." 
                value={calcSearch} onChange={(e) => setCalcSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            </div>
            
            {calcSearch.trim() !== '' && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                {searchResults.map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => handleSelectProduct(p)}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                  >
                    <span className="font-bold text-slate-800">{p.name}</span>
                    <span className="text-sm font-bold text-indigo-600">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedProd ? (
            <div className="flex-1 flex flex-col bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="h-16 w-16 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden">
                  <Package className="text-slate-400"/>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">{selectedProd.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium flex items-center">
                    Harga Utama: <span className="ml-1 font-bold text-slate-700">{formatPrice(selectedProd.price)}</span>
                  </p>
                  {selectedProd.altPrice > 0 && (
                     <p className="text-sm text-slate-500 font-medium flex items-center">
                       Info Tambahan: <span className="ml-1 font-bold text-slate-700">{formatPrice(selectedProd.altPrice)}</span>
                     </p>
                  )}
                </div>
              </div>

              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gunakan Basis Harga:</label>
                  <div className="flex space-x-4">
                    <label className={`flex-1 flex items-center p-3 border rounded-xl cursor-pointer transition ${priceBasis === 'main' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                      <input type="radio" checked={priceBasis === 'main'} onChange={() => setPriceBasis('main')} className="w-4 h-4 text-indigo-600" />
                      <span className="ml-2 font-bold text-slate-700 text-sm">Harga Utama</span>
                    </label>
                    <label className={`flex-1 flex items-center p-3 border rounded-xl cursor-pointer transition ${priceBasis === 'alt' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white'} ${!selectedProd.altPrice ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="radio" checked={priceBasis === 'alt'} onChange={() => setPriceBasis('alt')} disabled={!selectedProd.altPrice} className="w-4 h-4 text-indigo-600" />
                      <span className="ml-2 font-bold text-slate-700 text-sm">Info Tambahan</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kuantitas / Jumlah</label>
                  <input 
                    type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
              <Calculator className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">Silakan cari dan pilih produk terlebih dahulu untuk mulai menghitung.</p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-96 bg-slate-800 text-white p-6 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

          <h3 className="text-xl font-black mb-6 text-indigo-200 border-b border-slate-700 pb-4">Ringkasan Hitungan</h3>
          
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Harga Satuan</span>
              <span className="font-bold text-lg">{formatPrice(activePrice)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">Kuantitas</span>
              <span className="font-bold text-lg">x {qty || 0}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-700 flex justify-between items-end">
              <span className="text-slate-300 font-bold">Total Harga</span>
              <span className="font-black text-3xl text-emerald-400">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700 mb-6 backdrop-blur-md">
            <label className="block text-sm font-bold text-slate-300 mb-2">Uang Diterima dari Customer</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400 font-bold">Rp</span>
              <input 
                type="number" min="0" value={cash} onChange={(e) => setCash(e.target.value)} placeholder="0"
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold text-lg transition"
              />
            </div>
            
            <div className="mt-5 pt-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-slate-300 font-bold">Kembalian</span>
              <span className={`font-black text-2xl ${change < 0 ? 'text-red-400' : 'text-white'}`}>
                {cash !== '' ? (change < 0 ? 'Uang Kurang' : formatPrice(change)) : '-'}
              </span>
            </div>
          </div>

          <button 
            onClick={resetCalc}
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-black rounded-xl transition flex justify-center items-center group"
          >
            <X size={20} className="mr-2 text-slate-400 group-hover:text-white transition" /> Reset Kalkulator
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [appUser, setAppUser] = useState(null);
  const [view, setView] = useState('login');
  const [products, setProducts] = useState([]);
  const [modalConfig, setModalConfig] = useState({ show: false, type: 'info', message: '', action: null, buttonText: 'OK' });

  const showModal = (type, message, buttonText = 'OK', action = null) => {
    setModalConfig({ show: true, type, message, action, buttonText });
  };
  const closeModal = () => setModalConfig({ show: false, type: 'info', message: '', action: null, buttonText: 'OK' });

  useEffect(() => {
    if (!appUser) return;
    
    // Mengambil data produk berdasarkan username yang login
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', `seller_products_${appUser.username}`);
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      setProducts(items);
    }, (err) => {
      console.error("Fetch products error:", err);
      showModal('error', 'Akses ditolak. Pastikan Firebase Rules Anda diatur ke allow read, write: if true;');
    });

    return () => unsubProducts();
  }, [appUser]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim().toLowerCase();
    const password = e.target.password.value;

    if (!username || !password) {
      showModal('error', 'Username dan password wajib diisi.');
      return;
    }

    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'seller_users', username);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        showModal('error', 'Username sudah terdaftar! Silakan gunakan username lain.');
        return;
      }
      
      await setDoc(userRef, { username, password, createdAt: Date.now() });
      showModal('success', 'Registrasi berhasil!', 'Kembali ke Login', () => {
        setView('login');
        closeModal();
      });
    } catch (err) {
      console.error(err);
      showModal('error', 'Terjadi kesalahan saat mendaftar. Pastikan aturan database diizinkan.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim().toLowerCase();
    const password = e.target.password.value;

    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'seller_users', username);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        showModal('error', 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
        return;
      }
      
      if (userSnap.data().password !== password) {
        showModal('error', 'Password salah! Silakan coba lagi.');
        return;
      }
      
      setAppUser({ username });
      setView('home');
    } catch (err) {
      console.error(err);
      showModal('error', 'Terjadi kesalahan sistem saat login.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim().toLowerCase();
    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
    
    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'seller_users', username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        showModal('error', 'Username tidak ditemukan.');
        return;
      }

      if (userSnap.data().password !== oldPassword) {
        showModal('error', 'Password lama salah!');
        return;
      }

      await updateDoc(userRef, { password: newPassword });
      showModal('success', 'Berhasil mengubah password!', 'Back to Login', () => {
        setView('login');
        closeModal();
      });
    } catch (err) {
      console.error(err);
      showModal('error', 'Terjadi kesalahan saat mengubah password.');
    }
  };

  const handleLogout = () => {
    setAppUser(null);
    setView('login');
  };

  if (!appUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        {modalConfig.show && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
              <div className="flex justify-center mb-4">
                {modalConfig.type === 'success' ? <CheckCircle2 className="h-16 w-16 text-green-500" /> : <AlertCircle className="h-16 w-16 text-red-500" />}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${modalConfig.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {modalConfig.type === 'success' ? 'Berhasil' : 'Perhatian'}
              </h3>
              <p className="text-gray-600 mb-6 font-medium">{modalConfig.message}</p>
              <button 
                onClick={() => { 
                  if (modalConfig.action) { modalConfig.action(); } 
                  closeModal(); 
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold text-white transition shadow-md ${modalConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {modalConfig.buttonText}
              </button>
            </div>
          </div>
        )}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Toko Kevin</h1>
            <p className="text-slate-500 font-medium">
              {view === 'login' && 'Masuk ke dashboard toko Anda.'}
              {view === 'register' && 'Buat akun seller baru Anda.'}
              {view === 'change-password' && 'Ubah password akun Anda.'}
            </p>
          </div>
          
          {view === 'login' && (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                <input required name="username" type="text" placeholder="Masukkan username" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input required name="password" type="password" placeholder="Masukkan password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Login Masuk
                </button>
                <button type="button" onClick={() => setView('register')} className="w-full text-indigo-600 font-bold py-2 hover:underline transition">
                  Belum punya akun? Daftar
                </button>
                <button type="button" onClick={() => setView('change-password')} className="w-full text-slate-500 font-bold py-2 hover:text-slate-800 transition">
                  Ubah Password
                </button>
              </div>
            </form>
          )}

          {view === 'register' && (
            <form className="space-y-5" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Buat Username Baru</label>
                <input required name="username" type="text" placeholder="Contoh: tokobudi" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Buat Password</label>
                <input required name="password" type="password" placeholder="Minimal 6 karakter disarankan" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div className="pt-2 space-y-3">
                <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl hover:bg-slate-900 transition shadow-lg shadow-slate-200">
                  Daftar Sekarang
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full text-slate-500 font-bold py-2 hover:text-slate-800 transition">
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}

          {view === 'change-password' && (
            <form className="space-y-5" onSubmit={handleChangePassword}>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                <input required name="username" type="text" placeholder="Masukkan username" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password Lama</label>
                <input required name="oldPassword" type="password" placeholder="Masukkan password lama" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password Baru</label>
                <input required name="newPassword" type="password" placeholder="Masukkan password baru" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
              </div>
              <div className="pt-2 space-y-3">
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Simpan Password
                </button>
                <button type="button" onClick={() => setView('login')} className="w-full text-slate-500 font-bold py-2 hover:text-slate-800 transition">
                  Kembali ke Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {modalConfig.show && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform transition-all">
            <div className="flex justify-center mb-4">
              {modalConfig.type === 'success' ? <CheckCircle2 className="h-16 w-16 text-green-500" /> : <AlertCircle className="h-16 w-16 text-red-500" />}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${modalConfig.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {modalConfig.type === 'success' ? 'Berhasil' : 'Perhatian'}
            </h3>
            <p className="text-gray-600 mb-6 font-medium">{modalConfig.message}</p>
            <button 
              onClick={() => { 
                if (modalConfig.action) { modalConfig.action(); } 
                closeModal(); 
              }}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition shadow-md ${modalConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {modalConfig.buttonText}
            </button>
          </div>
        </div>
      )}
      
      <Navbar view={view} setView={setView} handleLogout={handleLogout} />
      
      <main>
        {view === 'home' && <HomeView products={products} />}
        {view === 'add-product' && <AddProductView appUser={appUser} showModal={showModal} setView={setView} />}
        {view === 'edit-product' && <EditProductView appUser={appUser} products={products} showModal={showModal} />}
        {view === 'calculator' && <CalculatorView products={products} />}
      </main>
    </div>
  );
}