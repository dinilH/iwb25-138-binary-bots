import { AuthReactConfig } from "@asgardeo/auth-react";

// Asgardeo configuration for SheCare application
export const asgardeoConfig: AuthReactConfig = {
  signInRedirectURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  signOutRedirectURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  clientID: process.env.NEXT_PUBLIC_ASGARDEO_CLIENT_ID || "your-client-id",
  baseUrl: process.env.NEXT_PUBLIC_ASGARDEO_BASE_URL || "https://api.asgardeo.io/t/your-org",
  scope: ["openid", "profile", "email"],
  resourceServerURLs: [],
  enablePKCE: true,
  clockTolerance: 300,
  endpoints: {
    authorizationEndpoint: "/oauth2/authorize",
    tokenEndpoint: "/oauth2/token",
    userinfoEndpoint: "/oauth2/userinfo",
    endSessionEndpoint: "/oidc/logout"
  },
  validateIDToken: true,
  storage: "localStorage" // Use localStorage for client-side storage
};

// Type definitions for user profile from Asgardeo
export interface AsgardeoUser {
  sub: string;
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  preferred_username?: string;
  picture?: string;
  groups?: string[];
  organization?: string;
}
