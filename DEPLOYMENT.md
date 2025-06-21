# Deployment Guide for WorkOut App

## Vercel Deployment

This guide will help you deploy your WorkOut app to Vercel with MediaPipe support.

### Prerequisites

1. Make sure all MediaPipe files are in the `public/mediapipe/` directory
2. Ensure your `vercel.json` configuration is in place
3. Verify your Vite configuration is optimized for production

### Deployment Steps

1. **Build the project locally first:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Verify the deployment:**
   - Check that the MediaPipe files are accessible at `your-domain.com/mediapipe/`
   - Test camera access and pose detection
   - Verify fallback mode works if MediaPipe fails to load

### Troubleshooting

#### MediaPipe Model Not Loading

If MediaPipe fails to load on Vercel:

1. **Check file paths:** Ensure all MediaPipe files are in `public/mediapipe/`
2. **Verify CORS headers:** The `vercel.json` should include proper CORS headers
3. **Check browser console:** Look for any 404 errors for MediaPipe files
4. **Test fallback mode:** The app should automatically switch to demo mode

#### Common Issues

1. **WebAssembly not supported:** The app will fall back to demo mode
2. **Camera permissions:** Users need to grant camera access
3. **HTTPS required:** Vercel provides HTTPS by default, which is required for camera access

### Fallback Mode

The app includes a fallback mode that:
- Uses mock pose data when MediaPipe fails to load
- Provides a demo experience for users
- Still counts repetitions (demo data)
- Shows visual feedback with pose keypoints

### Performance Optimization

1. **MediaPipe files are served from your domain** (not CDN)
2. **WebAssembly files are properly configured** in `vercel.json`
3. **Lazy loading** of MediaPipe library
4. **Error handling** with graceful fallback

### Environment Variables

No environment variables are required for basic functionality. The app works entirely client-side.

### Browser Support

- **Chrome/Edge:** Full support with MediaPipe
- **Firefox:** Full support with MediaPipe
- **Safari:** May fall back to demo mode due to WebAssembly restrictions
- **Mobile browsers:** Full support with MediaPipe

### Monitoring

Monitor your deployment for:
- MediaPipe loading success/failure rates
- Camera access success rates
- User engagement with fallback mode
- Performance metrics

The app is designed to work even if MediaPipe fails to load, ensuring a good user experience in all scenarios. 