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

          {/* File Previews */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {files.map((file, index) => (
                <Card key={index} className="relative p-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {previews[index] ? (
                    <img src={previews[index]} alt={file.name} className="w-full h-24 object-cover rounded" />
                  ) : (
                    <div className="w-full h-24 bg-slate-100 rounded flex items-center justify-center">
                      <p className="text-xs text-slate-600 truncate px-2">{file.name}</p>
                    </div>
                  )}
                </Card>
              ))}
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
