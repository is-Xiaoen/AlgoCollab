/**
 * 用户信息接口
 */
export interface IUser {
  id: number | string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  permissions?: string[];
  last_login_at?: string;
  created_at?: string;
  email_verified?: boolean;
  phone?: string;
  bio?: string;
}

/**
 * 登录响应数据
 */
export interface ILoginData {
  token: string;
  refresh_token: string;
  expires_at: string;
  token_type: 'Bearer';
  user: IUser;
}

/**
 * API响应包装
 */
export interface ILoginResponse {
  code: number;
  message: string;
  data: ILoginData;
}

/**
 * 注册请求参数
 */
export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password?: string;
  agree_terms?: boolean;
}

/**
 * TODO(human): 添加更多认证相关类型
 * 建议添加：
 * 1. IPasswordResetRequest - 密码重置请求
 * 2. ITwoFactorAuthRequest - 双因素认证请求
 * 3. ILoginHistoryItem - 登录历史记录项
 * 4. ISessionInfo - 会话信息
 * 
 * 示例：
 * export interface IPasswordResetRequest {
 *   email: string;
 *   token?: string;
 *   new_password?: string;
 * }
 */

/**
 * 认证错误类型
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * 认证状态
 */
export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

/**
 * Token信息
 */
export interface ITokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}