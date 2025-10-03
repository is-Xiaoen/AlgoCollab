import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProblemPanel from './components/ProblemPanel';
import CodeEditor from './components/CodeEditor';
import ChatPanel from './components/ChatPanel';
import BackButton from '../../components/common/BackButton';
import Breadcrumb from '../../components/common/Breadcrumb';
import { useEditorStore } from '../../stores/editorStore';
import { useCollaborationStore } from '../../stores/collaborationStore';
import type { Language } from './components/EditorToolbar';
//  import { CodeExecutionAPI } from '../../services/api/codeExecutionApi';

interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>
  constraints: string[];
}

//代码模板
const CODE_TEMPLATES: Record<Language, string> = {
  javascript: ``,
  python: ``,
  java: ``,
  cpp: ``
};

const EditorPage: React.FC = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');

  const isCollaborative = Boolean(roomId);
  const { code, language, setCode } = useEditorStore();
  const { initCollaboration, manager } = useCollaborationStore();

  const [problem, setProblem] = useState<Problem | null>(null)
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('')

  // 加载题目数据
  useEffect(() => {
    // 模拟数据，实际应该从API获取
    const mockProblem: Problem = {
      id: parseInt(problemId || '1'),
      title: '两数之和',
      difficulty: 'easy',
      description: `给定一个整数数组 nums 和一个整数目标值
  target，请你在该数组中找出 和为目标值 target 的那 两个
  整数，并返回它们的数组下标。
  你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出     
  现。
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
    setCode(CODE_TEMPLATES[language]);
  }, [problemId]); // 移除 language 和 setCode 依赖，避免循环

  useEffect(() => {
    if (isCollaborative && roomId && !manager) {
      initCollaboration({
        roomId: roomId,
        userId: `user-${Math.random().toString(36).substring(2, 11)}`,
        username: `用户${Math.floor(Math.random() * 1000)}`,
        color: `#${Math.floor(Math.random() *
          16777215).toString(16).padStart(6, '0')}`,
      })
    }
  }, [isCollaborative, roomId, manager, initCollaboration])

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    //模拟结果
    try {
      // TODO: 实际应该调用后端 API 执行代码
      console.log('Running code:', code);
      console.log('Language:', language);

      // 模拟代码运行
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟输出结果
      setOutput(`✅ 执行成功！
  输入: nums = [2,7,11,15], target = 9
  输出: [0,1]
  执行用时: 68 ms
  内存消耗: 15.2 MB`);
    } catch (error) {
      setOutput(`❌ 执行失败！

  ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsRunning(false);
    }
  }
  // const handleRunCode = async () => {
  //   setIsRunning(true);
  //   setOutput('');

  //   try {
  //     const result = await CodeExecutionAPI.runCode({
  //       code,
  //       language,
  //       problemId
  //     });

  //     if (result.success) {
  //       setOutput(`✅ 执行成功！

  // 输出:
  // ${result.output}

  // 执行用时: ${result.executionTime}ms
  // 内存消耗: ${result.memoryUsage}MB`);
  //     } else {
  //       setOutput(`❌ 执行失败！

  // ${result.error}

  // ${result.output ? `标准输出:\n${result.output}` : ''}`);
  //     }
  //   } catch (error) {
  //     setOutput(`❌ 执行出错！

  // ${error instanceof Error ? error.message : '未知错误'}`);
  //   } finally {
  //     setIsRunning(false);
  //   }
  // };

  // const handleSubmitCode = async () => {
  //   try {
  //     setIsRunning(true);

  //     const result = await CodeExecutionAPI.submitCode({
  //       code,
  //       language,
  //       problemId,
  //       testCases: problem?.examples.map(ex => ({
  //         input: ex.input,
  //         expectedOutput: ex.output
  //       }))
  //     });

  //     if (result.success && result.testResults) {
  //       const passed = result.testResults.filter(t => t.passed).length;
  //       const total = result.testResults.length;

  //       alert(`代码提交成功！\n\n通过测试用例: ${passed}/${total}\n执行用时:       
  // ${result.executionTime}ms\n内存消耗: ${result.memoryUsage}MB`);
  //     } else {
  //       alert(`提交失败: ${result.error}`);
  //     }
  //   } catch (error) {
  //     alert('提交失败: ' + (error instanceof Error ? error.message :
  //       '未知错误'));
  //   } finally {
  //     setIsRunning(false);
  //   }
  // };

  const handleSubmitCode = async () => {
    //实现代码交互逻辑
    try {
      console.log('submit code', code);
      console.log('problem id', problemId);

      alert('代码提交成功')
    } catch (error) {
      alert('提交失败: ' + (error instanceof Error ? error.message :
        '未知错误'));
    }

  }
  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2
  border-blue-600 mx-auto"></div>
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
            <span className={`px-2 py-1 text-xs rounded-full ${problem.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
              {problem.difficulty === 'easy' ? '简单' :
                problem.difficulty === 'medium' ? '中等' : '困难'}
            </span>
            {isCollaborative && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-100        
  text-blue-700">
                协作模式
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-4 py-1 bg-green-600 text-white rounded-md
  hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm       
  transition-colors"
            >
              {isRunning ? '运行中...' : '▶ 运行'}
            </button>

            <button
              type="button"
              onClick={handleSubmitCode}
              className="px-4 py-1 bg-blue-600 text-white rounded-md
  hover:bg-blue-700 text-sm transition-colors"
            >
              ✓ 提交
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 题目 */}
        <div className="w-1/3 border-r bg-white">
          <ProblemPanel problem={problem} />
        </div>

        {/* 编辑器 */}
        <div className={`${isCollaborative ? 'w-1/2' : 'w-2/3'} flex
  flex-col`}>
          <CodeEditor
            roomId={roomId || ''}
            language={language}
            onExecute={handleRunCode}
          />

          {/* 输出 */}
          {output && (
            <div className="border-t bg-gray-900 text-gray-100 p-4
  overflow-auto" style={{ maxHeight: '200px' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">执行结果</h3>
                <button
                  type="button"
                  onClick={() => setOutput('')}
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  清除
                </button>
              </div>
              <pre className="text-xs whitespace-pre-wrap font-mono">{output}</pre>
            </div>
          )}
        </div>
        {/* 聊天（协作模式） */}
        {isCollaborative && (
          <div className="w-1/3 border-l bg-white">
            <ChatPanel roomId={roomId!} />
          </div>
        )}
      </div>
    </div>
  );

}
export default EditorPage;