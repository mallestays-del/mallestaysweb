'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

export default function GalleryPage() {
  const [villas, setVillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVilla, setSelectedVilla] = useState(null);
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

  // Get all images with villa info
  const getImagesWithInfo = () => {
    const images = [];
    villas.forEach(villa => {
      const villaImages = villa.images || [];
      villaImages.forEach(img => {
        if (img && typeof img === 'string' && img.trim()) {
          images.push({
            url: img.trim(),
            villaName: villa.name,
            villaSlug: villa.slug,
            location: villa.location || 'Unknown',
          });
        }
      });
    });
    return images;
  };

  // Get unique locations
  const getLocations = () => {
    const locations = new Set();
    villas.forEach(villa => {
      if (villa.location) locations.add(villa.location);
    });
    return Array.from(locations);
  };

  // Filter images by location
  const getFilteredImages = (tab) => {
    const allImgs = getImagesWithInfo();
    if (tab === 'all') return allImgs;
    return allImgs.filter(img => img.location.toLowerCase() === tab.toLowerCase());
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

  const locations = getLocations();
  const tabs = ['all', ...locations];
  const filteredImages = getFilteredImages(activeTab);

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

  return (
    <div className="min-h-screen bg-slate-50" data-testid="gallery-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-slate-600 text-lg">Explore the beauty of our luxury villas and properties</p>
          <p className="text-slate-500 text-sm mt-2">
            {villas.length} Properties • {getImagesWithInfo().length} Photos
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
            <TabsList className={`grid w-full max-w-2xl mx-auto`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              {locations.map(loc => (
                <TabsTrigger key={loc} value={loc} data-testid={`tab-${loc}`}>
                  {loc}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map(tab => (
              <TabsContent key={tab} value={tab} data-testid={`gallery-${tab}`}>
                {/* Group by Villa */}
                {tab === 'all' ? (
                  // Show grouped by villa
                  villas.filter(v => v.images && v.images.length > 0).map(villa => (
                    <div key={villa.id || villa._id} className="mb-12">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">{villa.name}</h2>
                        <span className="flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          <MapPin className="h-3 w-3 mr-1" />
                          {villa.location}
                        </span>
                        <Link 
                          href={`/villa/${villa.slug}`}
                          className="text-sm text-yellow-600 hover:text-yellow-700 underline ml-2"
                        >
                          View Details →
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(villa.images || []).filter(img => img && typeof img === 'string' && img.trim()).map((image, index) => {
                          const villaImages = (villa.images || [])
                            .filter(img => img && typeof img === 'string' && img.trim())
                            .map(img => ({
                              url: img.trim(),
                              villaName: villa.name,
                              villaSlug: villa.slug,
                              location: villa.location || 'Unknown',
                            }));
                          return (
                            <Card 
                              key={index} 
                              className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
                              onClick={() => openLightbox(villaImages, index)}
                            >
                              <div className="relative">
                                <img 
                                  src={image.trim()} 
                                  alt={`${villa.name} - Photo ${index + 1}`}
                                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                                  <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white text-sm font-medium drop-shadow-lg">{villa.name}</p>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  // Show filtered by location
                  <div>
                    {villas
                      .filter(v => v.location?.toLowerCase() === tab.toLowerCase() && v.images && v.images.length > 0)
                      .map(villa => (
                        <div key={villa.id || villa._id} className="mb-12">
                          <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-2xl font-bold text-slate-900">{villa.name}</h2>
                            <Link 
                              href={`/villa/${villa.slug}`}
                              className="text-sm text-yellow-600 hover:text-yellow-700 underline ml-2"
                            >
                              View Details →
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {(villa.images || []).filter(img => img && typeof img === 'string' && img.trim()).map((image, index) => {
                              const villaImages = (villa.images || [])
                                .filter(img => img && typeof img === 'string' && img.trim())
                                .map(img => ({
                                  url: img.trim(),
                                  villaName: villa.name,
                                  villaSlug: villa.slug,
                                  location: villa.location || 'Unknown',
                                }));
                              return (
                                <Card 
                                  key={index} 
                                  className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300"
                                  onClick={() => openLightbox(villaImages, index)}
                                >
                                  <div className="relative">
                                    <img 
                                      src={image.trim()} 
                                      alt={`${villa.name} - Photo ${index + 1}`}
                                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end">
                                      <div className="p-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white text-sm font-medium drop-shadow-lg">{villa.name}</p>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    {villas.filter(v => v.location?.toLowerCase() === tab.toLowerCase() && v.images && v.images.length > 0).length === 0 && (
                      <div className="text-center py-20">
                        <p className="text-slate-500">No photos available for {tab} yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Lightbox with Navigation */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          data-testid="lightbox"
        >
          {/* Close Button */}
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white z-50 p-2"
            onClick={closeLightbox}
            data-testid="close-lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>

          {/* Villa Name */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-white font-semibold text-lg">{selectedImage.villaName}</p>
            <p className="text-white/60 text-sm flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3" /> {selectedImage.location}
            </p>
          </div>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 bg-black/30 rounded-full hover:bg-black/50 transition-colors"
              onClick={prevImage}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <img 
            src={selectedImage.url} 
            alt={selectedImage.villaName}
            className="max-w-[90vw] max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next Button */}
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
