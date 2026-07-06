import React, { useState, useRef, useEffect } from 'react';
import { Send, HelpCircle, Sparkles, BrainCircuit, RotateCcw, User as UserIcon } from 'lucide-react';
import { User, AnalysisResult } from '../types';

interface StudentChatProps {
  user: User;
  token: string;
  analysis: AnalysisResult | null;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const PRESET_PROMPTS = [
  'How do I bridge my technical skill gaps?',
  'What are some good projects to build for my target role?',
  'Give me some typical interview questions for this role.',
  'How do I improve my resume content based on your suggestions?'
];

export default function StudentChat({ user, token, analysis }: StudentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `Hello ${user.name}! I am your AI Career Coach. I've initialized my system with your target role details${analysis ? ` (${analysis.jobRoleTargeted})` : ''}. I'm ready to help you prepare for interviews, improve your resume, or suggest step-by-step learning techniques. What can I answer for you today?`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Filter history to conform to what Gemini API expects
    const history = messages.map(m => ({ role: m.role, text: m.text }));

    try {
      const response = await fetch('/api/student/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          history,
          analysisId: analysis?._id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get chat response');
      }

      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "I apologize, but I encountered an issue connecting to the core advice engine. Let's discuss your roadmap steps, portfolio design, or technical interview preparations!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'model',
        text: `Chat initialized. Ask me any career-related questions about your ${analysis ? analysis.jobRoleTargeted : 'resume'} path!`
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-150 pb-6 mb-8">
        <div>
          <span className="text-indigo-600 font-sans text-xs font-bold tracking-wider uppercase">Active AI Mentoring</span>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mt-1">AI Career Advisor</h1>
          <p className="text-gray-500 text-sm mt-1">Get custom mentoring, portfolio guides, mock answers, and skill instructions.</p>
        </div>
        <button
          onClick={handleClear}
          title="Reset Chat Session"
          className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-sm bg-white"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Presets Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
            <h4 className="font-display font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-600" /> AI Shortcuts
            </h4>
            <p className="text-gray-400 text-[11px] leading-relaxed mb-4">Click any preset prompt to ask the career coach instantly:</p>
            <div className="space-y-2">
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="w-full text-left p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all leading-normal disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Window Container */}
        <div className="lg:col-span-3 flex flex-col h-[550px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm relative">
          
          {/* Active Context Banner */}
          {analysis && (
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between text-xs font-sans">
              <span className="text-gray-500 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Context Targeted Role:
              </span>
              <span className="text-indigo-700 font-bold">{analysis.jobRoleTargeted} ({analysis.score}% match)</span>
            </div>
          )}

          {/* Messages Flow List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => {
              const isAI = msg.role === 'model';
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3.5 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isAI ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'}`}>
                    {isAI ? <BrainCircuit className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed border shadow-sm ${
                    isAI 
                      ? 'bg-white border-gray-200 text-gray-800' 
                      : 'bg-indigo-600 border-indigo-600 text-white'
                  }`}>
                    {msg.text.split('\n').map((line, lidx) => (
                      <p key={lidx} className={lidx > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex items-center gap-2 mr-auto text-gray-500 text-xs pl-12 font-bold">
                <BrainCircuit className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Coach is analyzing advice parameters...</span>
              </div>
            )}
            <div ref={scrollRef}></div>
          </div>

          {/* Interactive Chat Input panel */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 bg-white border-t border-gray-200 flex gap-3 items-center"
          >
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ask about mock interviews, certification paths, or system architecture..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-40 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
