import React, { useState } from 'react';

//定义接口的传入类型
interface PasswordInputProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string; 
  touched?: boolean; 
  required?: boolean; 
  disabled?: boolean; 
  autoComplete?: string; 
  showStrengthIndicator?: boolean; 
  className?: string; 
}

// 密码强度计算函数
const calculatePasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;
  if (!password) return { score: 0, label: '无', color: 'gray' };
  
  // 长度评分
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // 复杂度评分
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // 返回强度等级
  if (score <= 2) return { score: 1, label: '弱', color: 'red' };
  if (score <= 4) return { score: 2, label: '中等', color: 'yellow' };
  if (score <= 5) return { score: 3, label: '强', color: 'green' };
  return { score: 4, label: '很强', color: 'green' };
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  autoComplete = 'current-password',
  showStrengthIndicator = false,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const hasError = touched && error;
  const strength = showStrengthIndicator ? calculatePasswordStrength(value) : null;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          {...(hasError && { 'aria-invalid': 'true' })}
          {...(hasError && { 'aria-describedby': `${name}-error` })}
          className={`
            w-full px-3 py-2 pr-10 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            transition-colors duration-200
            ${hasError 
              ? 'border-red-500 focus:ring-red-500 focus:ring-inset focus:border-red-500' 
              : 'border-gray-300'
            }
          `}
        />
        
        {/* 显示/隐藏密码按钮 */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label={showPassword ? '隐藏密码' : '显示密码'}
        >
          {showPassword ? (
            // 眼睛关闭图标
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
              />
            </svg>
          ) : (
            // 眼睛打开图标
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
              />
            </svg>
          )}
        </button>
      </div>

      {/* 密码强度指示器 */}
      {showStrengthIndicator && value && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">密码强度</span>
            <span className={`text-xs font-medium text-${strength!.color}-600`}>
              {strength!.label}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  level <= strength!.score
                    ? strength!.color === 'red' ? 'bg-red-500'
                    : strength!.color === 'yellow' ? 'bg-yellow-500'
                    : 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* 错误信息 */}
      {hasError && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;