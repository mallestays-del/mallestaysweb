'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, ChevronLeft, ChevronRight, X, Loader2, ImageOff } from 'lucide-react';

export default function GalleryPage() {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [allImages, setAllImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    try {
      const response = await fetch('/api/villas');
      const data = await response.json();
      if (data.villas) {
        setVillas(data.villas);
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValidImages = (villa) => {
    return (villa.images || []).filter(img => img && typeof img === 'string' && img.trim().length > 0);
  };

  const getLocations = () => {
    const locations = new Set();
    villas.forEach(villa => {
      if (villa.location) locations.add(villa.location);
    });
    return Array.from(locations);
  };

  const getFilteredVillas = (tab) => {
    const villasWithImages = villas.filter(v => getValidImages(v).length > 0);
    if (tab === 'all') return villasWithImages;
    return villasWithImages.filter(v => v.location?.toLowerCase() === tab.toLowerCase());
  };

  const openLightbox = (images, index) => {
    setAllImages(images);
    setCurrentIndex(index);
    setSelectedImage(images[index]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setAllImages([]);
    setCurrentIndex(0);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const newIndex = (currentIndex + 1) % allImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(allImages[newIndex]);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowLeft') prevImage(e);
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex, allImages]);

  const scrollContainer = (containerId, direction) => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 320;
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const locations = getLocations();
  const tabs = ['all', ...locations];

  const getTotalPhotos = () => {
    return villas.reduce((total, villa) => total + getValidImages(villa).length, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-600 mx-auto" />
          <p className="mt-4 text-slate-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  const renderVillaGallery = (villa) => {
    const images = getValidImages(villa);
    if (images.length === 0) return null;

    const containerId = `scroll-${villa.id || villa._id || villa.slug}`;
    const lightboxImages = images.map(img => ({
      url: img.trim(),
      villaName: villa.name,
      villaSlug: villa.slug,
      location: villa.location || 'Unknown',
    }));

    return (
      <div key={villa.id || villa._id} className="mb-10">
        {/* Villa Header */}
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-2xl font-bold text-slate-900">{villa.name}</h2>
          <span className="flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            <MapPin className="h-3 w-3 mr-1" />
            {villa.location}
          </span>
          <Link 
            href={`/villa/${villa.slug}`}
            className="text-sm text-yellow-600 hover:text-yellow-700 underline ml-1"
          >
            View Details →
          </Link>
          <span className="text-sm text-slate-400 ml-auto">{images.length} photos</span>
        </div>

        {/* Scrollable Image Row */}
        <div className="relative group">
          {/* Left Arrow */}
          {images.length > 4 && (
            <button
              onClick={() => scrollContainer(containerId, 'left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-5 w-5 text-slate-700" />
            </button>
          )}

          {/* Images Container */}
          <div
            id={containerId}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <style jsx>{`#${containerId}::-webkit-scrollbar { display: none; }`}</style>
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 h-52 rounded-lg overflow-hidden cursor-pointer group/img hover:shadow-xl transition-all duration-300 relative bg-slate-100"
                onClick={() => openLightbox(lightboxImages, index)}
              >
                <img
                  src={image.trim()}
                  alt={`${villa.name} - Photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><line x1="13.5" y1="13.5" x2="6" y2="21"/><line x1="18" y1="12" x2="21" y2="15"/><path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59"/><path d="M21 15V5a2 2 0 0 0-2-2H9"/></svg><span class="text-xs mt-2">Image unavailable</span></div>`;
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs">{index + 1} / {images.length}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          {images.length > 4 && (
            <button
              onClick={() => scrollContainer(containerId, 'right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-5 w-5 text-slate-700" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="gallery-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-slate-600 text-lg">Explore the beauty of our luxury villas and properties</p>
          <p className="text-slate-500 text-sm mt-2">
            {villas.length} Properties • {getTotalPhotos()} Photos
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {villas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No properties added yet.</p>
            <p className="text-slate-400 mt-2">Check back soon for stunning villa photos!</p>
          </div>
        ) : (
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              {locations.map(loc => (
                <TabsTrigger key={loc} value={loc} data-testid={`tab-${loc}`}>
                  {loc}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map(tab => (
              <TabsContent key={tab} value={tab} data-testid={`gallery-${tab}`}>
                {getFilteredVillas(tab).length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-slate-500">No photos available for {tab} yet.</p>
                  </div>
                ) : (
                  getFilteredVillas(tab).map(villa => renderVillaGallery(villa))
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white z-50 p-2"
            onClick={closeLightbox}
          >
            <X className="h-8 w-8" />
          </button>

          <div className="absolute top-4 left-4 text-white/80 text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-white font-semibold text-lg">{selectedImage.villaName}</p>
            <p className="text-white/60 text-sm flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3" /> {selectedImage.location}
            </p>
          </div>

          {allImages.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          <img 
            src={selectedImage.url} 
            alt={selectedImage.villaName}
            className="max-w-[90vw] max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {allImages.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
              onClick={nextImage}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
