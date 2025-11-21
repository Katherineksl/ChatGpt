import React from 'react';
import { ChatSession, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  user: User;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onLogout: () => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  sessions,
  currentSessionId,
  user,
  onNewChat,
  onSelectSession,
  onLogout,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 overflow-y-auto transition-transform duration-300 ease-in-out transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-0 flex flex-col border-r border-gray-800
      `}>
        <div className="p-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onCloseMobile();
            }}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-md border border-gray-700 text-white cursor-pointer hover:bg-gray-800 transition-colors text-sm mb-2"
          >
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <div className="flex flex-col gap-2 pb-2 text-gray-100 text-sm">
            {sessions.length === 0 && (
               <div className="px-3 py-3 text-gray-500 text-xs">No history yet.</div>
            )}
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 768) onCloseMobile();
                }}
                className={`flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all hover:bg-[#2A2B32] group ${
                  currentSessionId === session.id ? 'bg-[#343541]' : ''
                }`}
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <div className="flex-1 text-ellipsis max-h-5 overflow-hidden break-all relative text-left">
                  {session.title}
                  {/* Fade out effect for long titles */}
                  <div className="absolute inset-y-0 right-0 w-8 z-10 bg-gradient-to-l from-[#2A2B32] group-hover:from-[#2A2B32] to-transparent" style={{background: currentSessionId === session.id ? 'linear-gradient(to left, #343541, transparent)' : ''}}></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 p-2">
          <div className="group relative">
            <button className="flex w-full items-center gap-2.5 rounded-md px-3 py-3 text-sm text-white hover:bg-gray-800 transition-colors">
                <div className="w-6 h-6 bg-purple-600 rounded-sm flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="grow text-left overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.name}
                </div>
                 <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
            {/* Simple Popover implementation via absolute positioning on hover/click logic in a real app. Here just a logout button directly. */}
             <div className="absolute bottom-full left-0 w-full mb-2 hidden group-hover:block">
                 <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm text-red-400 border border-gray-700 shadow-lg"
                 >
                    Log out
                 </button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};