import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('semua');
    const [categories, setCategories] = useState([
        'semua',
        'makanan-utama',
        'makanan-pembuka',
        'makanan-penutup',
        'minuman'
    ]);

    const categoryLabels = {
        'semua': 'Semua Menu',
        'makanan-utama': 'Makanan Utama',
        'makanan-pembuka': 'Makanan Pembuka',
        'makanan-penutup': 'Makanan Penutup',
        'minuman': 'Minuman'
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat produk');
            setLoading(false);
        }
    };

    const filteredProducts = selectedCategory === 'semua'
        ? products
        : products.filter(product => product.category === selectedCategory);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="text-center text-red-600 p-4">
            {error}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Category Filter */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Katalog Menu</h2>
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                selectedCategory === category
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            } transition-colors duration-200`}
                        >
                            {categoryLabels[category]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    Tidak ada produk dalam kategori ini
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                    {filteredProducts.map((product) => (
                        <Link key={product.id} to={`/products/${product.id}`} className="group">
                            <div className="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-center object-cover group-hover:opacity-75"
                                />
                            </div>
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500">{categoryLabels[product.category]}</p>
                                </div>
                                <p className="text-lg font-medium text-gray-900">
                                    Rp {product.price.toLocaleString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;