//登录用户
export interface IUser {
  id: number;
  user_id?:number;
  username: string;
  email: string;
  avatar: string;
  role: string;
  last_login_at: string;  
}

//登录data
export interface ILoginData {
  token: string;
  refresh_token: string;
  expires_at: string;  
  token_type: string;
  user: IUser;
}

// 登录响应
 export interface ILoginResponse {
  code: number;
  message: string;
  data: ILoginData;
}

 // 注册用户信息
export interface IRegisterUser {
  id: number;
  created_at: string;  
  updated_at: string;  
  uuid: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  status: string;
  last_login_at: string | null; 
}

//注册data
export interface IRegisterData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: IRegisterUser;
}

//注册响应
export interface IRegisterResponse {
  code: number;
  data: IRegisterData;
  message: string;
}

//token刷新data
export interface IRefreshTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: IRegisterUser;
}

//token刷新响应
export interface IRefreshTokenResponse {
  code: number;
  data: IRefreshTokenData;
  message: string;
}


//用户data
export interface IUserInfo {
  email: string;
  role: string;
  user_id: number;
  username: string;
}

//获取用户响应
export interface IUserInfoResponse {
  code: number;
  data: IUserInfo;
  message?: string;
}