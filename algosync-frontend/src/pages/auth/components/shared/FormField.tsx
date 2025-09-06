import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; //输入框及时更新
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; //触发字段的验证逻辑
  error?: string; //验证错误信息
  touched?: boolean; //判断用户是否输入过 该状态通常在 onBlur 事件后被设置为 true
  autoFocus?: boolean; 
  required?: boolean; //字段是否为必填项
  disabled?: boolean; //禁用该输入框
  autoComplete?: string;//是否让浏览器的自动完成（或自动填充）功能
  className?: string;//给组件的根元素添加额外的 CSS 类名
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  autoFocus = false,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
}) => {
  const hasError = !!(touched && error);

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        {...(hasError && { 'aria-invalid': 'true' })}
        {...(hasError && { 'aria-describedby': `${name}-error` })}
        className={`
          w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
          ${hasError 
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
        `}
      />
      {hasError && (
        <p id={`${name}-error`} className="text-red-500 text-sm mt-1 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
