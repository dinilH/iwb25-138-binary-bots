const config = {
  clientID: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID,
  clientSecret: process.env.ASGARDEO_CLIENT_SECRET,
  baseUrl: process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL,
  scope: ["openid", "profile", "email"],
  signInRedirectURL: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/signin`,
  signOutRedirectURL: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/signout`,
};

module.exports = config;
