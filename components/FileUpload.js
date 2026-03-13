'use client';

import { useState } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function FileUpload({ onFilesChange, accept = 'image/*,.pdf', multiple = true, label = 'Upload Files' }) {
  const [files, setFiles] = useState([]);
  const [urlMode, setUrlMode] = useState(false);
  const [urls, setUrls] = useState(['']);
  const [previews, setPreviews] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Create previews
    const newPreviews = [];
    const fileData = [];

    for (const file of selectedFiles) {
      // Convert to base64 for storage
      const reader = new FileReader();
      
      await new Promise((resolve) => {
        reader.onloadend = () => {
          const base64String = reader.result;
          fileData.push({
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64String
          });
          
          // Create preview for images
          if (file.type.startsWith('image/')) {
            newPreviews.push(base64String);
          } else {
            newPreviews.push(null); // For PDFs
          }
          
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setFiles([...files, ...selectedFiles]);
    setPreviews([...previews, ...newPreviews]);
    onFilesChange([...files, ...fileData]);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange(newFiles);
  };

  const addUrl = () => {
    setUrls([...urls, '']);
  };

  const removeUrl = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls.length > 0 ? newUrls : ['']);
    onFilesChange(newUrls.filter(url => url.trim() !== ''));
  };

  const updateUrl = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
    onFilesChange(newUrls.filter(url => url.trim() !== ''));
  };

  return (
    <div className="space-y-4">
      {/* Toggle between Upload and URL */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={!urlMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUrlMode(false)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
        <Button
          type="button"
          variant={urlMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUrlMode(true)}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Add URLs
        </Button>
      </div>

      {!urlMode ? (
        // File Upload Mode
        <div>
          <label className="block">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">Images (JPG, PNG, WebP) or PDFs</p>
              <p className="text-xs text-slate-500 mt-1">Max size: 5MB per file</p>
              <input
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </label>

          {/* File Previews with Slideshow */}
          {files.length > 0 && (
            <div className="space-y-4 mt-4">
              {/* Main Preview Slideshow */}
              {previews.filter(p => p).length > 0 && (
                <div className="relative">
                  <div className="relative h-64 rounded-xl overflow-hidden bg-slate-100 group">
                    <img 
                      src={previews.filter(p => p)[currentPreviewIndex]} 
                      alt={files[currentPreviewIndex]?.name || 'Preview'} 
                      className="w-full h-full object-contain animate-fade-in"
                      style={{ animation: 'fadeIn 0.4s ease-in-out' }}
                    />
                    
                    {/* Navigation Arrows */}
                    {previews.filter(p => p).length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setCurrentPreviewIndex((prev) => 
                            prev === 0 ? previews.filter(p => p).length - 1 : prev - 1
                          )}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setCurrentPreviewIndex((prev) => 
                            prev === previews.filter(p => p).length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                      {currentPreviewIndex + 1} / {previews.filter(p => p).length}
                    </div>
                  </div>
                  
                  <style jsx>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: scale(1.05); }
                      to { opacity: 1; transform: scale(1); }
                    }
                  `}</style>
                </div>
              )}
              
              {/* Thumbnail Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {files.map((file, index) => (
                  <Card key={index} className="relative group">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div
                      onClick={() => previews[index] && setCurrentPreviewIndex(index)}
                      className={`cursor-pointer transition-all duration-300 ${
                        currentPreviewIndex === index && previews[index]
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                    >
                      {previews[index] ? (
                        <img 
                          src={previews[index]} 
                          alt={file.name} 
                          className="w-full h-20 object-cover rounded hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center p-2">
                          <p className="text-xs text-slate-600 truncate">{file.name}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // URL Mode
        <div className="space-y-4">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1"
              />
              {urls.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeUrl(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addUrl} className="w-full">
            <LinkIcon className="h-4 w-4 mr-2" />
            Add Another URL
          </Button>
          <p className="text-xs text-slate-500">
            Tip: You can use image hosting services like Imgur, Cloudinary, or upload to Google Drive and get shareable links
          </p>
        </div>
      )}
    </div>
  );
}
