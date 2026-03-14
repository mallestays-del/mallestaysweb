import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `review_${Date.now()}_${uuidv4().substring(0, 8)}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'reviews');
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    
    console.log('✅ File uploaded successfully:', fileName);
    console.log('   Path:', filePath);
    console.log('   Size:', file.size, 'bytes');

    // Return the full public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const url = `${baseUrl}/uploads/reviews/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url,
      fileName,
      message: 'Image uploaded successfully!'
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file: ' + error.message 
    }, { status: 500 });
  }
}
