# Guest Reviews Update Guide

## 🎯 How to Add Your Guest Review Screenshots

### Location
The guest reviews section is in: `/app/app/page.js` (around line 468)

---

## 📝 Step-by-Step Instructions

### Step 1: Upload Your Review Screenshots
1. Take screenshots of guest reviews from:
   - WhatsApp conversations
   - Instagram DMs or posts
   - Google Reviews
   - Facebook messages
   - Any other platform

2. Upload them to a hosting service or use the direct URLs from the file upload

### Step 2: Replace Image URLs

Find this section in `/app/app/page.js`:

```jsx
{/* Review 1 */}
<Card className="elegant-shadow-hover border-0 overflow-hidden group">
  <CardContent className="p-0">
    <div className="relative h-[400px] overflow-hidden">
      <img
        src="YOUR_IMAGE_URL_HERE"  👈 REPLACE THIS
        alt="Guest Review 1"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
```

### Step 3: Update Review Text

Replace the placeholder text with actual guest reviews:

```jsx
<p className="text-sm italic mb-3">
  "YOUR ACTUAL REVIEW TEXT HERE"  👈 REPLACE THIS
</p>
<p className="text-sm font-semibold">- Guest Name</p>  👈 REPLACE THIS
<p className="text-xs text-slate-300">Location</p>  👈 REPLACE THIS
```

### Step 4: Update Review Source Badge

Change the badge text to match where the review came from:

```jsx
<div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
  Instagram Review  👈 CHANGE TO: WhatsApp Review, Google Review, etc.
</div>
```

---

## 🖼️ Example with Real URLs

```jsx
{/* Review 1 - Example */}
<Card className="elegant-shadow-hover border-0 overflow-hidden group">
  <CardContent className="p-0">
    <div className="relative h-[400px] overflow-hidden">
      <img
        src="https://customer-assets.emergentagent.com/job_YOUR_JOB_ID/artifacts/YOUR_FILE_ID.jpg"
        alt="Guest Review from Rahul"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-sm italic mb-3">
          "Had an amazing weekend at this villa! The pool was fantastic and the caretaker was very helpful. Highly recommend for family stays."
        </p>
        <p className="text-sm font-semibold">- Rahul Mehta</p>
        <p className="text-xs text-slate-300">Mumbai</p>
      </div>
      <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
        WhatsApp Review
      </div>
    </div>
  </CardContent>
</Card>
```

---

## ➕ How to Add More Reviews

To add a 4th, 5th, or more review cards, simply copy the entire Card block and paste it:

```jsx
{/* Review 4 - Copy this entire block */}
<Card className="elegant-shadow-hover border-0 overflow-hidden group">
  <CardContent className="p-0">
    <div className="relative h-[400px] overflow-hidden">
      {/* ... copy all the content ... */}
    </div>
  </CardContent>
</Card>
```

**Note:** The grid automatically adjusts:
- 1 column on mobile
- 2 columns on tablet  
- 3 columns on desktop

---

## 🎨 Design Tips

### Image Requirements:
- **Recommended size:** 600x800px (portrait orientation works best)
- **Format:** JPG, PNG, or WebP
- **Quality:** High resolution for sharp display

### Review Screenshots:
- Crop to show just the review message
- Include profile picture if visible
- Make sure text is readable
- Remove any sensitive information

### Star Rating:
- Currently shows 5 stars for all reviews
- To change, modify the Array number: `[...Array(4)]` for 4 stars

---

## 🗑️ Remove Instruction Box

After you've added your real reviews, remove the yellow instruction box:

Find and delete this entire section (around line 550):

```jsx
{/* Instructions for Admin - Hidden in Production */}
<div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-6 max-w-3xl mx-auto">
  {/* ... DELETE THIS ENTIRE DIV ... */}
</div>
```

---

## 📱 Testing

After updating:
1. Save the file
2. Refresh your browser
3. Scroll to "What Our Guests Say" section
4. Check on mobile and desktop views
5. Test hover effects

---

## 💡 Pro Tips

1. **Mix review types:** Show a variety (WhatsApp, Instagram, Google)
2. **Keep it authentic:** Real reviews build trust
3. **Use high-quality images:** Blurry screenshots look unprofessional
4. **Update regularly:** Add new reviews as you receive them
5. **Highlight specifics:** Choose reviews that mention specific features

---

## 🆘 Need Help?

The section is located at:
- **File:** `/app/app/page.js`
- **Section:** Guest Reviews Section
- **Line:** Around 468-570

Happy updating! 🎉
