# Asgardeo Authentication Setup Guide

## Overview
Your SheCare application has been successfully configured with WSO2 Asgardeo authentication! The integration includes:

- ✅ Asgardeo SDK installation (@asgardeo/auth-react, @asgardeo/auth-spa)
- ✅ Authentication context updated for Asgardeo
- ✅ Navbar redesigned with user profile dropdown
- ✅ Protected route component created
- ✅ Configuration files set up
- ✅ Environment variables prepared

## Next Steps - Complete Your Setup

### 1. Create Asgardeo Application

1. Go to [Asgardeo Console](https://console.asgardeo.io/)
2. Sign up or log in to your account
3. Create a new organization or use existing one
4. Click "Applications" → "New Application"
5. Choose "Single Page Application (SPA)"
6. Name your application (e.g., "SheCare Frontend")

### 2. Configure Application Settings

In your Asgardeo application settings:

**Authorized redirect URLs:**
```
http://localhost:3001
http://localhost:3001/
```

**Allowed origins:**
```
http://localhost:3001
```

**Access Token Type:** `JWT`

### 3. Update Environment Variables

Update your `.env.local` file with your actual Asgardeo credentials:

```env
# Replace with your actual values from Asgardeo console
NEXT_PUBLIC_ASGARDEO_CLIENT_ID=your_actual_client_id_here
NEXT_PUBLIC_ASGARDEO_ORGANIZATION_NAME=your_org_name_here
NEXT_PUBLIC_ASGARDEO_BASE_URL=https://api.asgardeo.io/t/your_org_name_here
```

### 4. Test the Authentication

1. Start your development server:
   ```bash
   cd front-end
   npm run dev
   ```

2. Navigate to `http://localhost:3001`
3. Click "Sign In" in the navbar
4. You should be redirected to Asgardeo login
5. After successful login, you'll be redirected back with user info

## Features Implemented

### User Authentication Flow
- **Login**: Redirects to Asgardeo OAuth login
- **Logout**: Clears session and redirects to home
- **User Profile**: Displays user information from Asgardeo
- **Protected Routes**: Automatic redirection for authenticated pages

### User Interface Updates
- **Navbar**: Shows user avatar, name, and email when logged in
- **Profile Dropdown**: Quick access to profile and logout
- **User Profile Page**: Comprehensive profile management
- **Loading States**: Smooth transitions during auth operations

### Security Features
- **JWT Tokens**: Secure token-based authentication
- **Protected Routes**: Component wrapper for authenticated pages
- **Session Management**: Automatic token refresh and validation
- **PKCE Flow**: Enhanced security for single-page applications

## File Structure

```
front-end/
├── config/
│   └── asgardeo.config.ts         # Asgardeo configuration
├── contexts/
│   └── auth-context.tsx           # Authentication context with Asgardeo
├── components/
│   ├── navbar.tsx                 # Updated navbar with user profile
│   └── protected-route.tsx        # Route protection component
├── app/
│   ├── layout.tsx                 # Root layout with Asgardeo provider
│   └── profile/
│       └── page.tsx               # User profile page
└── .env.local                     # Environment variables
```

## Troubleshooting

### Common Issues

1. **"Client ID not found" error**
   - Ensure you've updated `.env.local` with your actual client ID
   - Restart the development server after updating environment variables

2. **Redirect URI mismatch**
   - Verify your Asgardeo app has `http://localhost:3001` in authorized redirect URLs
   - Check that the URLs match exactly (no trailing slashes inconsistency)

3. **CORS errors**
   - Ensure `http://localhost:3001` is added to allowed origins in Asgardeo

4. **User data not displaying**
   - Check browser console for any API errors
   - Verify the user has the required scopes in Asgardeo

### Development Tips

- Use browser developer tools to inspect authentication tokens
- Check the Asgardeo console logs for detailed error information
- Test with different user accounts to verify the flow

## Advanced Configuration

### Custom User Claims
To include additional user information, configure custom claims in your Asgardeo application:

1. Go to your application settings
2. Navigate to "User Attributes"
3. Add required attributes (e.g., `given_name`, `family_name`, `picture`)

### Production Deployment
When deploying to production:

1. Update redirect URLs to your production domain
2. Use environment-specific `.env` files
3. Enable proper HTTPS configuration
4. Set up proper domain verification in Asgardeo

## Support

For additional help:
- [Asgardeo Documentation](https://wso2.com/asgardeo/docs/)
- [Asgardeo React SDK Guide](https://github.com/asgardeo/asgardeo-auth-react-sdk)
- [WSO2 Community](https://discord.gg/wso2)

Your Asgardeo authentication integration is now complete! 🎉
