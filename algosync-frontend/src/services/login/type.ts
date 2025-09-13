export interface IUser {
  id: number;
  username: string;
  email: string;
  avatar: string;
  role: string;
  last_login_at: string; 
}

export interface ILoginData {
  token: string;
  refresh_token: string;
  expires_at: string; 
  token_type: 'Bearer';
  user: IUser;
}

export interface ILoginResponse {
  code: number;
  message: string;
  data: ILoginData;
}