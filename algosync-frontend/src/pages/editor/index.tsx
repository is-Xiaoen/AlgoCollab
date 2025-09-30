import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProblemPanel from './components/ProblemPanel';
import CodeEditor from './components/CodeEditor';
import ChatPanel from './components/ChatPanel';
import BackButton from '../../components/common/BackButton';
import Breadcrumb from '../../components/common/Breadcrumb';
import { EditorToolbar } from './components/EditorToolbar';

type Language = 'javascript' | 'python' | 'java' | 'cpp';

interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
}

const EditorPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  
  // 判断是否为协作模式
  const isCollaborative = Boolean(roomId);
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  const [theme, setTheme ] = useState<'vs-dark'|'vs-light'>('vs-dark');
  const [fontSize,setFontSize] = useState(14);
  const [language, setLanguage] = useState<Language>('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  // TODO(human): 实现根据problemId获取题目数据的逻辑
  useEffect(() => {
    // 模拟数据，实际应该从API获取
    const mockProblem: Problem = {
      id: parseInt(problemId || '1'),
      title: '两数之和',
      difficulty: 'easy',
      description: `给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target 的那 两个 整数，并返回它们的数组下标。
你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。
你可以按任意顺序返回答案。`,
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: '因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。'
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        '只会存在一个有效答案'
      ]
    };
    setProblem(mockProblem);
    // 设置初始代码模板
    setCode(`function twoSum(nums, target) {
    // TODO: 实现你的解决方案
}`);
  }, [problemId]);

  const handleRunCode = async () => {
    setIsRunning(true);
    // 模拟代码运行
    setTimeout(() => {
      setOutput('代码运行成功！\n输出: [0, 1]');
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmitCode = async () => {
    // TODO(human): 实现代码提交逻辑
    alert('代码提交功能待实现');
  };

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载题目中...</p>
        </div>
      </div>
    );
  }
  const breadcrumbItems = [
    { label: '首页', href: '/home' },
    { label: '算法题库', href: '/home?tab=algorithm' },
    { label: `${problem.id}. ${problem.title}`, active: true }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b px-4 py-3">
        <Breadcrumb items={breadcrumbItems} className="mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BackButton 
              to="/home?tab=algorithm" 
              variant="ghost" 
              className="mr-2"
              label="返回题库"
            />
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">
              {problem.id}. {problem.title}
            </h1>
          <span className={`px-2 py-1 text-xs rounded-full ${
            problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {problem.difficulty === 'easy' ? '简单' : 
             problem.difficulty === 'medium' ? '中等' : '困难'}
          </span>
          {isCollaborative && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
              协作模式
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
        
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {isRunning ? '运行中...' : '运行'}
          </button>
          
          <button
            onClick={handleSubmitCode}
            className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            提交
          </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r bg-white">
          <ProblemPanel problem={problem} />
        </div>
        <div className={`${isCollaborative ? 'w-1/2' : 'w-2/3'} flex flex-col`}>
          <EditorToolbar
          theme = {theme}
          fontSize={fontSize}
          language={language}
            onFormat={()=>{
              console.log('format');
            }}
            onThemeChange={(newTheme)=>setTheme(newTheme)}
            onFontSizeChange={(newSize)=>setFontSize(newSize)}
            onLanguageChange={(newLanguage)=>{
              setLanguage(newLanguage);
              const templates = {
                javascript: `function twoSum(nums, target) {\n    // TODO:
  实现你的解决方案\n    \n}`,
          python: `def twoSum(nums, target):\n    # TODO:
  实现你的解决方案\n    pass`,
          java: `class Solution {\n    public int[] twoSum(int[] nums, int     
  target) {\n        // TODO: 实现你的解决方案\n        \n    }\n}`,
          cpp: `class Solution {\npublic:\n    vector<int>
  twoSum(vector<int>& nums, int target) {\n        // TODO:
  实现你的解决方案\n        \n    }\n};`
              }
              setCode(templates[newLanguage])
            }}
          >

          </EditorToolbar>
          <CodeEditor
            code={code}
            onChange={setCode}
            language={language}
            output={output}
            isRunning={isRunning}
          />
        </div>
        {isCollaborative && (
          <div className="w-1/3 border-l bg-white">
            <ChatPanel roomId={roomId!} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPage;