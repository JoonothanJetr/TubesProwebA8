import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';

const CartList = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const data = await cartService.getCart();
            setCartItems(data);
            setLoading(false);
        } catch (err) {
            setError('Gagal memuat keranjang');
            setLoading(false);
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            await cartService.updateCartItem(productId, newQuantity);
            fetchCart();
        } catch (err) {
            alert('Gagal mengupdate jumlah item');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await cartService.removeFromCart(productId);
            fetchCart();
        } catch (err) {
            alert('Gagal menghapus item');
        }
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="bg-white">
            <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Keranjang Belanja</h1>

                <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7">
                        <h2 id="cart-heading" className="sr-only">
                            Items in your shopping cart
                        </h2>

                        <div className="mt-8">
                            <ul className="divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.product_id} className="flex py-6 sm:py-10">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-24 h-24 rounded-md object-center object-cover sm:w-48 sm:h-48"
                                            />
                                        </div>

                                        <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                                            <div className="flex">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        <a href={`/products/${item.product_id}`}>{item.name}</a>
                                                    </h3>
                                                    <p className="mt-1 text-sm font-medium text-gray-500">Rp {item.price}</p>
                                                </div>
                                                <div className="ml-4 flex-shrink-0 flex">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(item.product_id)}
                                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex-1 flex items-end justify-between">
                                                <div className="flex items-center">
                                                    <label htmlFor={`quantity-${item.product_id}`} className="mr-2 text-sm text-gray-600">
                                                        Jumlah
                                                    </label>
                                                    <select
                                                        id={`quantity-${item.product_id}`}
                                                        name={`quantity-${item.product_id}`}
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item.product_id, Number(e.target.value))}
                                                        className="rounded-md border-gray-300 py-1.5 text-base leading-5 focus:border-indigo-300 focus:outline-none focus:ring-indigo-500 focus:ring-1 sm:text-sm"
                                                    >
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <option key={num} value={num}>
                                                                {num}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Total: Rp {item.price * item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Order summary */}
                    <section aria-labelledby="summary-heading" className="mt-16 bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                        <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                            Ringkasan Pesanan
                        </h2>

                        <dl className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <dt className="text-sm text-gray-600">Subtotal</dt>
                                <dd className="text-sm font-medium text-gray-900">Rp {total}</dd>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                                <dt className="text-base font-medium text-gray-900">Total</dt>
                                <dd className="text-base font-medium text-gray-900">Rp {total}</dd>
                            </div>
                        </dl>

                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:bg-gray-400"
                            >
                                Checkout
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CartList; 