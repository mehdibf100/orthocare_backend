export interface GoogleSignInRequest {
  email: string;
  name?: string;
  googleId: string;
  photoUrl?: string;
}
export interface JWTAuthenticationResponse {
  token: string;
  refreshToken: string;
}