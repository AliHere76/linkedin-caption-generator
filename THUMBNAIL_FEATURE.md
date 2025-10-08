# Thumbnail Image Upload Feature with BlurHash

## Overview
This feature allows users to optionally upload a thumbnail image when generating LinkedIn captions. The image is sent to Google's Gemini AI for better contextual caption generation, and a BlurHash is generated and stored in the database for visual representation in the history.

## Features Implemented

### 1. **Image Upload in Caption Generator**
- **Optional Image Upload**: Users can click "Add Image" button to upload a thumbnail
- **Image Preview**: Selected images are displayed as a preview before submission
- **Image Removal**: Users can remove the selected image using the X button
- **File Size Validation**: Maximum file size of 5MB
- **Supported Formats**: All standard image formats (JPEG, PNG, GIF, WebP, etc.)

### 2. **BlurHash Generation**
- **Server-Side Processing**: Images are processed on the server using `sharp`
- **Efficient Storage**: Only the BlurHash string is stored in the database (not the actual image)
- **Optimized Performance**: Images are resized to 32x32 pixels for BlurHash generation
- **Component Grid**: 4x4 component grid for balanced quality and performance

### 3. **Gemini AI Integration**
- **Vision API**: Images are sent to Gemini's vision model for analysis
- **Contextual Captions**: AI generates captions based on both the text prompt and image content
- **Base64 Encoding**: Images are converted to base64 and sent with proper MIME types

### 4. **History Display**
- **Visual History**: BlurHash images are displayed in caption history
- **Responsive Design**: Images are shown as 24x24 (96px) thumbnails
- **Smooth Loading**: BlurHash provides instant placeholder while maintaining visual appeal

## Technical Implementation

### Dependencies Added
```json
{
  "blurhash": "^2.0.5",        // BlurHash encoding
  "sharp": "^0.34.4",          // Image processing
  "react-blurhash": "^0.3.0"   // BlurHash React component
}
```

### Database Schema Update
```javascript
// Caption Model
{
  userId: ObjectId,
  prompt: String,
  caption: String,
  thumbnailBlurHash: String,  // NEW FIELD
  createdAt: Date
}
```

### API Flow
1. **Client Side** (`CaptionGenerator.jsx`):
   - User selects image → File is read as base64
   - Image preview is shown
   - On submit, base64 data is sent to API

2. **Server Side** (`/api/generate-caption/route.js`):
   - Receive image as base64
   - Generate BlurHash using Sharp
   - Send image to Gemini with text prompt
   - Save caption with BlurHash to database

3. **History Display** (`CaptionHistory.jsx`):
   - Fetch captions with BlurHash
   - Render BlurHash using `react-blurhash` component

### BlurHash Generation Process
```javascript
async function generateBlurHash(imageBase64) {
  // 1. Remove data URL prefix
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')
  
  // 2. Resize to 32x32 for optimal performance
  const image = await sharp(buffer)
    .resize(32, 32, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  
  // 3. Generate BlurHash with 4x4 components
  const { data, info } = image
  const blurHash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4)
  
  return blurHash
}
```

## Usage

### For Users
1. Navigate to the caption generator
2. Enter your prompt text
3. (Optional) Click "Add Image" to upload a thumbnail
4. Select an image from your device (max 5MB)
5. Preview the image
6. Click send to generate caption with image context
7. View generated captions with image thumbnails in history

### Component Props
```javascript
// CaptionGenerator
<CaptionGenerator onCaptionGenerated={callback} />

// CaptionHistory
<CaptionHistory refresh={refreshTrigger} />
```

## UI Components

### Image Upload Button
- **Location**: Bottom right of the prompt textarea
- **States**: 
  - "Add Image" - when no image is selected
  - "Change Image" - when an image is already selected
- **Disabled**: When caption generation is in progress

### Image Preview
- **Size**: 128x128 pixels (32x32 in Tailwind)
- **Features**: 
  - Rounded corners
  - Border styling
  - Remove button overlay (top-right)
  - Smooth animation on appearance

### History Thumbnails
- **Size**: 96x96 pixels (24x24 in Tailwind)
- **Display**: Left side of each history card
- **Rendering**: Instant BlurHash display with smooth gradient

## Benefits

1. **Better Context**: Gemini AI can analyze images for more relevant captions
2. **Visual History**: Users can visually identify past captions
3. **Efficient Storage**: BlurHash is only ~30-40 characters vs full image storage
4. **Fast Loading**: BlurHash renders instantly without loading delays
5. **Privacy Friendly**: No actual images are stored on the server
6. **Professional UI**: Enhanced user experience with visual elements

## Performance Considerations

- **Image Processing**: Done server-side to avoid client performance issues
- **BlurHash Size**: Minimal database impact (~40 bytes per caption)
- **Upload Limit**: 5MB ensures reasonable processing time
- **Resize Strategy**: 32x32 resize provides optimal BlurHash quality vs speed

## Error Handling

- File size validation with user feedback
- Image processing errors are logged but don't block caption generation
- Missing BlurHash gracefully degrades (history still works without thumbnails)
- Network errors during upload show appropriate error messages

## Future Enhancements

Potential improvements for future versions:
- Multiple image upload support
- Image cropping before upload
- More BlurHash customization options
- Image compression before upload
- Progress indicator for large uploads
- Drag and drop support

## Testing Checklist

- [ ] Upload image and verify preview appears
- [ ] Generate caption with image and verify it's contextual
- [ ] Check database for BlurHash storage
- [ ] Verify history displays BlurHash correctly
- [ ] Test with various image formats (JPEG, PNG, WebP)
- [ ] Test with images at size limit (5MB)
- [ ] Test removing image before submission
- [ ] Test generating caption without image (should still work)
- [ ] Verify error handling for oversized files
- [ ] Check mobile responsiveness

## Troubleshooting

### BlurHash not displaying in history
- Check database for `thumbnailBlurHash` field
- Verify `react-blurhash` package is installed
- Check console for React errors

### Image upload fails
- Verify file size is under 5MB
- Check network tab for API errors
- Ensure GEMINI_API_KEY is set in environment variables

### Caption generation is slow with images
- Normal behavior - vision AI processing takes longer
- Typical time: 3-5 seconds with image vs 1-2 seconds text-only

---

**Last Updated**: October 8, 2025
**Version**: 1.0.0
