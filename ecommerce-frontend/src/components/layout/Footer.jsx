import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 mt-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Brand and Description */}
                    <div className="space-y-4">
                        <h4 className="text-2xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors">
                            TobaHome | SICATE
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed border-l-4 border-yellow-400 pl-4">
                            Platform catering online yang menyediakan berbagai pilihan menu untuk acara Anda.
                            Kami berkomitmen untuk memberikan layanan terbaik dengan menu berkualitas.
                        </p>
                    </div>

                    {/* Contact */}
                    <div>                        <h5 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                            <i className="bi bi-geo-alt-fill mr-2"></i>Info Toba Home
                        </h5>
                        <div className="space-y-3">
                            <a href="mailto:info@tobahome.com"
                               className="flex items-center text-gray-300 hover:text-yellow-400 transition-all duration-200 text-sm hover:translate-x-1 transform">
                                <i className="bi bi-envelope-fill mr-2"></i>info@tobahome.com
                            </a>
                            <a href="tel:+62211234567" 
                               className="flex items-center text-gray-300 hover:text-yellow-400 transition-all duration-200 text-sm hover:translate-x-1 transform">
                                <i className="bi bi-telephone-fill mr-2"></i>+62 21 1234 5678
                            </a>
                            <div className="flex items-start text-gray-300 text-sm">
                                <i className="bi bi-building mr-2 mt-1"></i>
                                <span>Perumahan Adiguna Unggul Blok B2 Rt. 34 No. 34</span>
                            </div>                            <a href="https://www.google.com/maps/place/1%C2%B011'57.3%22S+116%C2%B051'42.8%22E/@-1.1992413,116.8593211,885m/data=!3m2!1e3!4b1!4m4!3m3!8m2!3d-1.1992413!4d116.861896?hl=en&entry=ttu&g_ep=EgoyMDI1MDUxMy4xIKXMDSoASAFQAw%3D%3D" 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-yellow-400 hover:text-yellow-300 transition-all duration-200 text-sm group">
                                <i className="bi bi-map mr-2"></i>
                                LIHAT DI PETA
                                <i className="bi bi-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                            </a>
                        </div>
                    </div>

                    {/* Navigation and Social Media */}
                    <div>
                        <h5 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                            <i className="bi bi-list mr-2"></i>IKUTI KAMI
                        </h5>
                        <nav className="space-y-2">
                            <Link to="/" className="flex items-center text-gray-300 hover:text-yellow-400 hover:translate-x-1 transform duration-200 transition-colors text-sm">
                                <i className="bi bi-house-door mr-2"></i>Beranda
                            </Link>
                            <Link to="/products" className="flex items-center text-gray-300 hover:text-yellow-400 hover:translate-x-1 transform duration-200 transition-colors text-sm">
                                <i className="bi bi-grid mr-2"></i>Menu
                            </Link>                            <Link to="/about" className="flex items-center text-gray-300 hover:text-yellow-400 hover:translate-x-1 transform duration-200 transition-colors text-sm">
                                <i className="bi bi-info-circle mr-2"></i>Tentang Kami
                            </Link>
                        </nav>
                        
                        <div className="mt-6">
                            <h5 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
                                <i className="bi bi-share mr-2"></i>SOCIAL MEDIA
                            </h5>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-300 hover:text-green-500 transition-all duration-300 transform hover:scale-110 p-2">
                                    <i className="bi bi-whatsapp text-xl"></i>
                                </a>
                                <a href="#" className="text-gray-300 hover:text-pink-500 transition-all duration-300 transform hover:scale-110 p-2">
                                    <i className="bi bi-instagram text-xl"></i>
                                </a>
                                <a href="#" className="text-gray-300 hover:text-blue-500 transition-all duration-300 transform hover:scale-110 p-2">
                                    <i className="bi bi-facebook text-xl"></i>
                                </a>
                                <a href="#" className="text-gray-300 hover:text-gray-100 transition-all duration-300 transform hover:scale-110 p-2">
                                    <i className="bi bi-twitter-x text-xl"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-gray-700">
                    <p className="text-center text-gray-400 text-sm">
                        © {new Date().getFullYear()} TobaHome | SICATE. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;