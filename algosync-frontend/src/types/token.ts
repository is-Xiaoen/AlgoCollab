// 标准化的Token对
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// 认证响应基本结构
export interface AuthResponse<T = any> {
  user: T;
  tokens: TokenPair;
}

// 刷新Token回调函数类型
export type RefreshTokenCallback = (refreshToken: string) => Promise<TokenPair | null>;

// Token管理器事件类型
export interface TokenEvent {
  hasToken: boolean;
}

// JWT Payload 基本结构
export interface JWTPayload {
  sub: string;   
  email?: string;
  username?: string;
  roles?: string[];
  iat?: number;  
  exp?: number;   
  iss?: string;  
  aud?: string;  
}

// Token存储键名
export const TOKEN_KEYS = {
  REFRESH_TOKEN: 'algo_refresh_token',
  TOKEN_TIMESTAMP: 'algo_token_timestamp',
} as const;

// Token相关常量
export const TOKEN_CONFIG = {
  BUFFER_TIME: 5 * 60 * 1000,      
  REFRESH_THRESHOLD: 15 * 60 * 1000,  
  REFRESH_RATIO: 0.8,                
  MIN_REFRESH_TIME: 10 * 60 * 1000, 
} as const;