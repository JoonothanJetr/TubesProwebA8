import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const carouselData = [
  {
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84',
    title: 'Masakan Tradisional Batak',
    description: 'Nikmati kelezatan otentik dari dapur Batak Toba'
  },
  {
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
    title: 'Sambal yang Menggugah Selera',
    description: 'Cita rasa pedas khas Indonesia'
  },
  {
    image: 'https://images.unsplash.com/photo-1562607635-4608ff48a859',
    title: 'Sajian Nasi Campur',
    description: 'Berbagai lauk pilihan yang menggugah selera'
  },
  {
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
    title: 'Hidangan Seafood',
    description: 'Seafood segar dengan bumbu special'
  },
  {
    image: 'https://images.unsplash.com/photo-1603088549155-6ae9395b928f',
    title: 'Hidangan Tradisional',
    description: 'Resep turun temurun yang terjaga kualitasnya'
  }
];

const AuthCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    fade: true
  };

  return (
    <div className="h-full overflow-hidden">
      <Slider {...settings}>
        {carouselData.map((slide, index) => (
          <div key={index} className="relative h-screen">
            <div
              className="absolute inset-0 bg-center bg-cover bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-white">
              <h2 className="text-4xl font-bold mb-4 text-center">{slide.title}</h2>
              <p className="text-xl text-center">{slide.description}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default AuthCarousel;
