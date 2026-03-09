'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GalleryPage() {
  const galleryImages = {
    villas: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
    ],
    pools: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1664876080601-acf03b40c5e3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1664876080601-acf03b40c5e3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
    ],
    interiors: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjB2aWxsYXxlbnwwfHx8fDE3NzMwOTQ4NjF8MA&ixlib=rb-4.1.0&q=85',
    ],
    nature: [
      'https://images.unsplash.com/photo-1664876080601-acf03b40c5e3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
      'https://images.unsplash.com/photo-1664876080601-acf03b40c5e3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxyZXNvcnQlMjBwb29sfGVufDB8fHx8MTc3MzA5NDg3Mnww&ixlib=rb-4.1.0&q=85',
    ]
  };

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="gallery-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Gallery</h1>
          <p className="text-slate-600 text-lg">Explore the beauty of our luxury villas and resorts</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="villas" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
            <TabsTrigger value="villas" data-testid="tab-villas">Villas</TabsTrigger>
            <TabsTrigger value="pools" data-testid="tab-pools">Pools</TabsTrigger>
            <TabsTrigger value="interiors" data-testid="tab-interiors">Interiors</TabsTrigger>
            <TabsTrigger value="nature" data-testid="tab-nature">Nature</TabsTrigger>
          </TabsList>

          {Object.entries(galleryImages).map(([category, images]) => (
            <TabsContent key={category} value={category} data-testid={`gallery-${category}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image, index) => (
                  <Card 
                    key={index} 
                    className="overflow-hidden cursor-pointer group hover:shadow-xl transition-shadow"
                    onClick={() => setSelectedImage(image)}
                    data-testid={`image-${category}-${index}`}
                  >
                    <img 
                      src={image} 
                      alt={`${category} ${index + 1}`}
                      className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          data-testid="lightbox"
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl font-light hover:text-slate-300"
            onClick={() => setSelectedImage(null)}
            data-testid="close-lightbox"
          >
            ×
          </button>
          <img 
            src={selectedImage} 
            alt="Gallery image" 
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
