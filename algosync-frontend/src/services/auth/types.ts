// 用户信息接口
export interface IUser {
  id: number;
  user_id?:number;
  username: string;
  email: string;
  avatar: string;
  role: string;
  last_login_at: string;  
}



//登录成功后的数据接口
export interface ILoginData {
  token: string;
  refresh_token: string;
  expires_at: string; // 或者使用 Date 类型
  token_type: string;
  user: IUser;
}

// 登录请求的响应体接口
 export interface ILoginResponse {
  code: number;
  message: string;
  data: ILoginData;
}

 // 用户信息接口
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

//注册成功后的数据体接口
export interface IRegisterData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: IRegisterUser;
}

//注册接口的完整响应体接口
export interface IRegisterResponse {
  code: number;
  data: IRegisterData;
  message: string;
}

export interface IRefreshTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: IRegisterUser;
}


export interface IRefreshTokenResponse {
  code: number;
  data: IRefreshTokenData;
  message: string;
}


//用户信息核心数据接口
export interface IUserInfo {
  email: string;
  role: string;
  user_id: number;
  username: string;
}

//获取用户信息的API响应体接口
export interface IUserInfoResponse {
  code: number;
  data: IUserInfo;
  message?: string;
}