import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';
import { Dialog, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';

const CartList = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

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
            toast.error('Gagal mengupdate jumlah item');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await cartService.removeFromCart(productId);
            fetchCart();
            toast.success('Item berhasil dihapus dari keranjang');
        } catch (err) {
            toast.error('Gagal menghapus item');
        }
    };

    const openCheckoutModal = () => {
        if (cartItems.length === 0) {
             toast.error("Keranjang Anda kosong!");
             return;
        }
        setIsCheckoutModalOpen(true);
    };

    const closeCheckoutModal = () => {
        setIsCheckoutModalOpen(false);
        setSelectedPaymentMethod('');
    };

    const handlePaymentMethodChange = (event) => {
        setSelectedPaymentMethod(event.target.value);
    };

    const handleConfirmPayment = async () => {
        if (!selectedPaymentMethod) {
            toast.error('Silakan pilih metode pembayaran terlebih dahulu.');
            return;
        }

        const orderData = {
            paymentMethod: selectedPaymentMethod,
            items: cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: total
        };

        const loadingToast = toast.loading('Memproses pesanan...');

        try {
            const result = await orderService.createOrder(orderData);
            
            toast.dismiss(loadingToast);
            toast.success(result.message || 'Pesanan berhasil dibuat!', {
                 icon: '✅',
                 duration: 4000,
            });

            closeCheckoutModal();
            setCartItems([]);
            setTimeout(() => {
                 navigate('/pesanan');
            }, 1000);

        } catch (error) {
            toast.dismiss(loadingToast);
            console.error("Error creating order:", error);
            const errorMessage = error?.response?.data?.error || 'Gagal membuat pesanan. Silakan coba lagi.';
            toast.error(errorMessage);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paymentMethods = [
        { value: '', label: '-- Pilih Metode Pembayaran --' },
        { value: 'cod', label: 'Bayar di Lokasi Pengambilan' },
        { value: 'qris', label: 'QRIS' },
        { value: 'dana', label: 'DANA' },
        { value: 'gopay', label: 'GoPay' },
    ];

    return (
        <div className="bg-white">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="max-w-2xl mx-auto pt-16 pb-24 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Keranjang Belanja</h1>

                {cartItems.length === 0 && !loading && (
                    <div className="text-center mt-10 text-gray-500">
                        Keranjang belanja Anda kosong.
                    </div>
                )}

                {cartItems.length > 0 && (
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
                                                  src={`http://localhost:5000/${item.image_url}`}
                                                  alt={item.name}
                                                  className="w-24 h-24 rounded-md object-center object-cover sm:w-48 sm:h-48"
                                              />
                                          </div>
  
                                          <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                                              <div className="flex">
                                                  <div className="min-w-0 flex-1">
                                                      <h3 className="text-sm font-medium text-gray-900">
                                                          {item.name}
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
                                  onClick={openCheckoutModal}
                                  disabled={cartItems.length === 0}
                                  className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                  Checkout
                              </button>
                          </div>
                      </section>
                  </div>
                )}
            </div>

            {/* Checkout Modal */}
            <Transition appear show={isCheckoutModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={closeCheckoutModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Konfirmasi Pesanan
                                    </Dialog.Title>
                                    <div className="mt-4">
                                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                                            Metode Pembayaran
                                        </label>
                                        <select
                                            id="paymentMethod"
                                            name="paymentMethod"
                                            value={selectedPaymentMethod}
                                            onChange={handlePaymentMethodChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        >
                                            {paymentMethods.map((method) => (
                                                <option key={method.value} value={method.value} disabled={method.value === ''}>
                                                    {method.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500">
                                        Setelah konfirmasi pembayaran, Anda dapat mengecek halaman "Pesanan" untuk melihat status pesanan Anda.
                                    </p>
                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={closeCheckoutModal}
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!selectedPaymentMethod}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            onClick={handleConfirmPayment}
                                        >
                                            Konfirmasi Pembayaran
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default CartList; 