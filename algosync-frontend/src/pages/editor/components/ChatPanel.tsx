import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system';
}

interface ChatPanelProps {
  roomId: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = { id: 'user1', username: '当前用户' }; // 实际应该从 auth store 获取

  // 模拟初始消息
  useEffect(() => {
    const initialMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'system',
        username: '系统',
        content: `欢迎加入房间 ${roomId}！大家可以在这里讨论解题思路。`,
        timestamp: new Date(Date.now() - 300000),
        type: 'system'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'Alice',
        content: '这题可以用哈希表来解决，时间复杂度是O(n)',
        timestamp: new Date(Date.now() - 120000),
        type: 'message'
      },
      {
        id: '3',
        userId: 'user3',
        username: 'Bob',
        content: '同意，用两个指针的方法也可以',
        timestamp: new Date(Date.now() - 60000),
        type: 'message'
      }
    ];
    setMessages(initialMessages);
    setIsConnected(true);
  }, [roomId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // TODO(human): 实现实时聊天功能
    // 这里应该通过 WebSocket 发送消息到服务器
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 聊天头部 */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">协作聊天</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? '已连接' : '连接中...'}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          房间: {roomId} • 3人在线
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`${
            message.type === 'system' ? 'text-center' : ''
          }`}>
            {message.type === 'system' ? (
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {message.content}
              </div>
            ) : (
              <div className={`flex ${
                message.userId === currentUser.id ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.userId === currentUser.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.userId !== currentUser.id && (
                    <div className="text-xs font-medium mb-1 text-gray-600">
                      {message.username}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.userId === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Enter发送，Shift+Enter换行)"
              className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={2}
              disabled={!isConnected}
            />
          </div>
          <button
            title='chat'
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* 在线用户列表 */}
        <div className="mt-3 pt-3 border-t">
          <div className="text-xs text-gray-500 mb-2">在线用户 (3)</div>
          <div className="flex flex-wrap gap-2">
            {['Alice', 'Bob', '当前用户'].map((user) => (
              <div key={user} className="flex items-center space-x-1 bg-white px-2 py-1 rounded-md text-xs">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">{user}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;