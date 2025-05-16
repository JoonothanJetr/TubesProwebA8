import React from 'react';
import { FaReact, FaHeart, FaUsers, FaGlobe } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-yellow-400 py-16">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover mix-blend-multiply filter brightness-75"
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Restaurant Background"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <FaReact className="text-6xl text-white animate-spin-slow" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Tentang Kami</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Menyajikan makanan tradisional dan nusantara dengan kualitas terbaik sejak 2015.
          </p>
        </div>
      </div>

      {/* Perjalanan Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative h-96 md:h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Our Restaurant"
              className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-xl"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Perjalanan Kami</h2>
            <p className="text-gray-600 leading-relaxed">
              TobaHome | SICATE dimulai dari sebuah dapur kecil dengan impian besar untuk memperkenalkan kekayaan 
              kuliner Indonesia kepada lebih banyak orang. Dengan resep turun temurun dan pengalaman bertahun-tahun
              dalam dunia kuliner, kami berkomitmen untuk selalu menyajikan makanan berkualitas dengan cita rasa otentik.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Kini, TobaHome | SICATE telah melayani ribuan pelanggan dengan berbagai kebutuhan katering, 
              mulai dari acara kantor, pesta keluarga, hingga perayaan besar. Kesuksesan kami adalah 
              ketika pelanggan puas dengan layanan dan makanan yang kami sajikan.
            </p>
          </div>
        </div>
      </div>

      {/* Nilai-Nilai Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nilai-Nilai Kami</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Kualitas */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHeart className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Kualitas</h3>
              <p className="text-gray-600 text-center">
                Kami hanya menggunakan bahan-bahan terbaik dan segar untuk setiap hidangan yang kami sajikan.
              </p>
            </div>

            {/* Kepuasan Pelanggan */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUsers className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Kepuasan Pelanggan</h3>
              <p className="text-gray-600 text-center">
                Kepuasan pelanggan adalah prioritas utama kami. Kami selalu berusaha memberikan pelayanan terbaik.
              </p>
            </div>

            {/* Keberlanjutan */}
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGlobe className="text-2xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">Keberlanjutan</h3>
              <p className="text-gray-600 text-center">
                Kami berusaha untuk selalu ramah lingkungan dalam setiap aspek bisnis kami, dari penggunaan kemasan hingga pengolahan limbah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tim Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Tim Kami</h2>
        <div className="flex justify-center">
          {/* Chef */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow max-w-sm">
            <div className="aspect-w-4 aspect-h-5 relative overflow-hidden">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="Chef"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Budi Santoso</h3>
              <p className="text-sm text-yellow-600 mb-4">Head Chef</p>
              <p className="text-gray-600">
                Dengan pengalaman lebih dari 15 tahun dalam dunia kuliner Indonesia dan internasional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lokasi Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Lokasi Kami</h2>          <div className="rounded-xl overflow-hidden shadow-lg mb-8">            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8408765864787!2d116.85970731475556!3d-1.1992413991392275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMTEnNTcuMyJTIDExNsKwNTEnNDIuOCJF!5e0!3m2!1sen!2sid!4v1684231854367!5m2!1sen!2sid"
              className="w-full h-[400px]"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            ></iframe>
          </div>          <div className="text-center space-y-2">
            <p className="text-gray-600">Perumahan Adiguna Unggul Blok B2 Rt. 34 No. 34, Balikpapan</p>
            <p className="text-gray-600">Email: info@tobahome.com</p>
            <p className="text-gray-600">Telepon: (021) 1234-5678</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
