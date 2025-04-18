import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Tentang Kami</h3>
                        <p className="text-gray-300">
                            CateringKu adalah platform catering online yang menyediakan berbagai pilihan menu untuk acara Anda.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Kontak</h3>
                        <ul className="text-gray-300 space-y-2">
                            <li>Email: info@cateringku.com</li>
                            <li>Phone: (021) 1234-5678</li>
                            <li>Alamat: Jl. Contoh No. 123, Jakarta</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-semibold mb-4">Jam Operasional</h3>
                        <ul className="text-gray-300 space-y-2">
                            <li>Senin - Jumat: 08:00 - 20:00</li>
                            <li>Sabtu: 09:00 - 17:00</li>
                            <li>Minggu: 09:00 - 15:00</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-700 pt-8">
                    <p className="text-center text-gray-300">
                        © {new Date().getFullYear()} CateringKu. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 