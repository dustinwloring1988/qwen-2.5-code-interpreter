import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Trash2, PlusCircle, MoreVertical, Download, Pencil } from "lucide-react";
import Link from "next/link";
import { Github } from "lucide-react";

interface ChatMessage {
  userInput: string;
  result: string | null;
  codeOutput: string | null;
  explanation: string | null;
  hasError: boolean;
  timestamp: number;
}

interface ChatThread {
  id: string;
  name: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

interface ChatHistoryProps {
  onNewChat: () => void;
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onSidebarOpenChange: (isOpen: boolean) => void;
}

export default function ChatHistory({ onNewChat, activeThreadId, onThreadSelect, onSidebarOpenChange }: ChatHistoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    onSidebarOpenChange(isOpen);
  }, [isOpen, onSidebarOpenChange]);

  useEffect(() => {
    const loadThreads = () => {
      const savedThreads = localStorage.getItem('chatThreads');
      if (savedThreads) {
        setThreads(JSON.parse(savedThreads));
      }
    };

    // Initial load
    loadThreads();

    // Listen for changes in other tabs/windows
    window.addEventListener('storage', loadThreads);

    // Create an interval to check for updates
    const interval = setInterval(loadThreads, 1000);

    return () => {
      window.removeEventListener('storage', loadThreads);
      clearInterval(interval);
    };
  }, []);

  const filteredThreads = threads
    .filter(thread => 
      thread.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.messages.some(msg => 
        msg.userInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (msg.result && msg.result.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    )
    .sort((a, b) => b.lastUpdated - a.lastUpdated);

  const clearHistory = () => {
    localStorage.removeItem('chatThreads');
    setThreads([]);
  };

  const getThreadTitle = (thread: ChatThread) => {
    const firstMessage = thread.messages[0];
    if (!firstMessage) return 'New Chat';
    return firstMessage.userInput.slice(0, 30) + (firstMessage.userInput.length > 30 ? '...' : '');
  };

  const getMessagePreview = (message: ChatMessage) => {
    if (message.hasError) return 'Error: ' + message.result;
    return message.result || 'No response yet';
  };

  const handleNewChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNewChat();
  };

  const handleRenameThread = (threadId: string, newName: string) => {
    const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
    const threadIndex = threads.findIndex((t: ChatThread) => t.id === threadId);
    if (threadIndex !== -1) {
      threads[threadIndex].name = newName.trim() || 'New Chat';
      localStorage.setItem('chatThreads', JSON.stringify(threads));
      setThreads(threads);
      setEditingThreadId(null);
    }
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
    const newThreads = threads.filter((t: ChatThread) => t.id !== threadId);
    localStorage.setItem('chatThreads', JSON.stringify(newThreads));
    setThreads(newThreads);
    if (activeThreadId === threadId) {
      onNewChat();
    }
  };

  const handleExportThread = (thread: ChatThread, e: React.MouseEvent) => {
    e.stopPropagation();
    const exportData = {
      name: thread.name,
      messages: thread.messages,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${thread.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_chat_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed top-0 left-0 h-full bg-card border-r border-border transition-all duration-300 z-20 ${isOpen ? 'w-80' : 'w-12'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground rounded-full p-1 hover:bg-primary/90 transition-colors"
      >
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="flex flex-col h-full p-4">
          <Button
            onClick={handleNewChatClick}
            className="mb-4 w-full"
            variant="outline"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Chat
          </Button>

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chat history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex-grow overflow-y-auto space-y-2">
            {filteredThreads.map((thread) => (
              <div key={thread.id} className="space-y-1">
                <div className={`w-full rounded-lg transition-colors ${
                  thread.id === activeThreadId
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}>
                  <div 
                    onClick={() => onThreadSelect(thread.id)}
                    className="p-3 cursor-pointer"
                  >
                    {editingThreadId === thread.id ? (
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRenameThread(thread.id, editingName);
                            } else if (e.key === 'Escape') {
                              setEditingThreadId(null);
                            }
                          }}
                          className="h-6 py-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRenameThread(thread.id, editingName)}
                          className="h-6 px-2"
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">{thread.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(thread.lastUpdated).toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingThreadId(thread.id);
                                setEditingName(thread.name);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleExportThread(thread, e)}
                              className="h-6 w-6 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => handleDeleteThread(thread.id, e)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {thread.id === activeThreadId && thread.messages.length > 0 && (
                  <div className="ml-3 pl-3 border-l border-border space-y-2">
                    {thread.messages.map((message, idx) => (
                      <button
                        key={message.timestamp}
                        onClick={() => onThreadSelect(thread.id)}
                        className="w-full text-left p-2 rounded bg-muted/50 hover:bg-muted/70 transition-colors"
                      >
                        <p className="text-xs font-medium truncate">{message.userInput}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {getMessagePreview(message)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {threads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={clearHistory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            )}
            <Link
              href="https://github.com/dustinwloring1988/qwen-2.5-code-interpreter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full text-white gap-2 border border-primary text-primary/70 px-3 py-2 rounded-md hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm font-medium">Star on GitHub</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 