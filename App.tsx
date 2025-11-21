import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { AuthState, User, ChatSession, Message, Role } from './types';
import { streamResponse } from './services/geminiService';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(AuthState.UNAUTHENTICATED);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Scroll to bottom ---
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, currentSessionId, scrollToBottom]);

  // --- Auto-resize textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // --- Auth Handlers ---
  const handleLogin = (email: string, name: string) => {
    setCurrentUser({ id: '1', email, name });
    setAuthState(AuthState.AUTHENTICATED);
    // Initialize first chat
    createNewSession();
  };

  const handleLogout = () => {
    setAuthState(AuthState.UNAUTHENTICATED);
    setCurrentUser(null);
    setSessions([]);
    setCurrentSessionId(null);
  };

  // --- Session Management ---
  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false); // Close mobile sidebar if open
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setIsSidebarOpen(false);
  };

  // --- Chat Logic ---
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating || !currentSessionId) return;

    const userMsgText = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Add User Message
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: userMsgText,
      timestamp: Date.now()
    };

    // Add Placeholder AI Message
    const newAiMsgId = (Date.now() + 1).toString();
    const newAiMsg: Message = {
      id: newAiMsgId,
      role: Role.MODEL,
      content: '',
      isStreaming: true,
      timestamp: Date.now()
    };

    // Optimistically update UI with User message and Empty AI message
    let updatedMessages: Message[] = [];
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        updatedMessages = [...session.messages, newUserMsg, newAiMsg];
        // Update title if it's the first message
        const title = session.messages.length === 0 ? userMsgText.slice(0, 30) : session.title;
        return { ...session, messages: updatedMessages, title };
      }
      return session;
    }));

    setIsGenerating(true);

    try {
      let fullResponse = "";
      // We pass the history (excluding the placeholder AI message we just added, technically, 
      // but `streamResponse` filters out empty/streaming messages so it's fine to pass `updatedMessages` 
      // OR we can pass everything up to newUserMsg. Let's pass updatedMessages, service handles filtering.)
      
      await streamResponse(updatedMessages, (chunkText) => {
        fullResponse += chunkText;
        
        setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
            const messages = session.messages.map(msg => {
              if (msg.id === newAiMsgId) {
                return { ...msg, content: fullResponse };
              }
              return msg;
            });
            return { ...session, messages };
          }
          return session;
        }));
      });

    } catch (error) {
      console.error(error);
      // Error handling is done inside streamResponse largely (returning error text), 
      // but we ensure state is consistent here.
    } finally {
       setIsGenerating(false);
       setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          const messages = session.messages.map(msg => {
            if (msg.id === newAiMsgId) {
              return { ...msg, isStreaming: false };
            }
            return msg;
          });
          return { ...session, messages };
        }
        return session;
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // --- Render ---
  if (authState === AuthState.UNAUTHENTICATED) {
    return <Login onLogin={handleLogin} />;
  }

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-full bg-[#343541]">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 h-12 flex items-center justify-between px-4 z-10">
        <button onClick={() => setIsSidebarOpen(true)} className="text-white">
           <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span className="text-gray-200 font-medium text-sm truncate max-w-[200px]">
            {currentSession?.title || 'New Chat'}
        </span>
        <button onClick={createNewSession} className="text-white">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        user={currentUser!}
        onNewChat={createNewSession}
        onSelectSession={handleSelectSession}
        onLogout={handleLogout}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col relative w-full max-w-full h-full overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pt-12 md:pt-0 scroll-smooth">
          {(!currentSession || currentSession.messages.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-100 px-4">
              <div className="bg-white/10 p-4 rounded-full mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold mb-2">GeminiGPT</h1>
              <p className="text-center max-w-md opacity-70">
                Capable of answering questions, assisting with code, and creative writing. 
                Powered by Google Gemini.
              </p>
            </div>
          ) : (
            <div className="flex flex-col pb-32">
              {currentSession.messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Sticky Bottom */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pt-10 pb-6 px-4">
           <div className="md:max-w-2xl lg:max-w-3xl mx-auto relative">
               <div className="relative flex h-full w-full flex-row items-center rounded-xl border border-black/10 dark:border-gray-900/50 bg-white dark:bg-[#40414f] shadow-[0_0_10px_rgba(0,0,0,0.10)]">
                 <textarea 
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating}
                    placeholder="Send a message..."
                    className="m-0 w-full resize-none border-0 bg-transparent p-3 pr-10 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:py-4 md:pr-12 pl-4 text-gray-100 max-h-[200px] overflow-y-auto scrollbar-hide"
                    rows={1}
                 />
                 <button 
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isGenerating}
                    className="absolute right-3 md:right-4 p-1 rounded-md text-gray-400 hover:bg-gray-900/50 disabled:hover:bg-transparent disabled:opacity-40 transition-colors"
                 >
                    {isGenerating ? (
                        <div className="w-4 h-4">
                            <div className="animate-spin h-full w-full border-2 border-gray-400 border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    )}
                 </button>
               </div>
               <div className="text-center text-xs text-gray-500 mt-2 hidden md:block">
                  Free Research Preview. GeminiGPT may display inaccurate information about people, places, or facts.
               </div>
           </div>
        </div>
      </main>
    </div>
  );
}
