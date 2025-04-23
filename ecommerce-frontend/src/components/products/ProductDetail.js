import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import { reviewService } from '../../services/reviewService';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProductDetails = useCallback(async () => {
        try {
            const [productData, reviewsData, statsData] = await Promise.all([
                productService.getProductById(id),
                reviewService.getProductReviews(id),
                reviewService.getProductRatingStats(id)
            ]);
            setProduct(productData);
            setReviews(reviewsData);
            setStats(statsData);
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat detail produk');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const handleAddToCart = async () => {
        try {
            await cartService.addToCart(id, quantity);
            alert('Produk berhasil ditambahkan ke keranjang');
        } catch (err) {
            alert('Gagal menambahkan produk ke keranjang');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!product) return <div>Produk tidak ditemukan</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                {/* Image */}
                <div className="w-full">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-center object-cover rounded-lg"
                    />
                </div>

                {/* Product info */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                        {product.name}
                    </h1>
                    
                    <div className="mt-3">
                        <h2 className="sr-only">Informasi Produk</h2>
                        <p className="text-3xl text-gray-900">
                            Rp {product.price.toLocaleString()}
                        </p>
                    </div>

                    <div className="mt-6">
                        <h3 className="sr-only">Deskripsi</h3>
                        <div className="text-base text-gray-700 space-y-6">
                            {product.description}
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="flex items-center">
                            <label htmlFor="quantity" className="mr-3 text-sm text-gray-600">
                                Jumlah:
                            </label>
                            <select
                                id="quantity"
                                name="quantity"
                                className="rounded-md border-gray-300 py-1.5 text-base leading-5 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <option key={num} value={num}>
                                        {num}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="mt-8 w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            </div>

            {/* Reviews section */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900">Ulasan Produk</h2>
                {stats && (
                    <div className="mt-4">
                        <div className="flex items-center">
                            <div className="flex items-center">
                                {[0, 1, 2, 3, 4].map((rating) => (
                                    <svg
                                        key={rating}
                                        className={`${
                                            rating < stats.average_rating ? 'text-yellow-400' : 'text-gray-200'
                                        } h-5 w-5 flex-shrink-0`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="ml-3 text-sm text-gray-700">
                                {stats.average_rating.toFixed(1)} dari 5 ({stats.total_reviews} ulasan)
                            </p>
                        </div>
                    </div>
                )}

                <div className="mt-6 space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-t border-gray-200 pt-6">
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {[0, 1, 2, 3, 4].map((rating) => (
                                        <svg
                                            key={rating}
                                            className={`${
                                                rating < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                            } h-5 w-5 flex-shrink-0`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="ml-3 text-sm text-gray-700">
                                    {review.username} - {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="mt-4 text-sm text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail; 