"use client";

import { useState, useEffect } from "react";
import TypingAnimation from "./components/TypingAnimation";
import { usePyodide } from "./hooks/usePyodide";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleUserInput } from "../lib/llm";
import MarkdownRenderer from './components/MarkdownRenderer';
import { CompletionUsage } from "@mlc-ai/web-llm";
import { useModelLoading } from "./hooks/useModelLoading";
import FAQ from "./components/FAQ";
import ExamplePrompts from "./components/ExamplePrompts";
import ChatHistory from './components/ChatHistory';
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

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
  messages: ChatMessage[];
  lastUpdated: number;
}

const THREAD_NAME_PROMPT = `You are a thread naming assistant. Your task is to create a concise, descriptive title for a chat thread based on the user's message.

Rules:
1. The title must be 2-4 words long
2. Be descriptive but concise
3. Focus on the main topic or question
4. Use title case
5. Do not use punctuation
6. Only respond with the title, nothing else

User message:
`;

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [resultExplanation, setResultExplanation] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const { runPython, isLoading: isPyodideLoading } = usePyodide();
  const [isStreaming, setIsStreaming] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [usage, setUsage] = useState<CompletionUsage | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();

  const { isModelLoaded, isModelLoading, loadingProgress, handleLoadModel } = useModelLoading();

  // Remove the loading progress toast effect
  useEffect(() => {
    if (isModelLoaded && !isModelLoading) {
      toast({
        title: "Model Loaded",
        description: "The model is ready to use!",
        duration: 3000,
      })
    }
  }, [isModelLoaded, isModelLoading, toast]);

  const getThreadName = async (message: string): Promise<string> => {
    // Get first 3 sentences or whole message if shorter
    const sentences = message.match(/[^.!?]+[.!?]+/g) || [message];
    const preview = sentences.slice(0, 3).join(' ');
    
    try {
      let threadName = '';
      await handleUserInput(
        THREAD_NAME_PROMPT + preview,
        runPython,
        {
          onResultUpdate: (newResult) => {
            threadName = newResult.trim();
          },
          onCodeOutputUpdate: () => {},
          onExplanationUpdate: () => {},
          onErrorUpdate: () => {},
          onUsageUpdate: () => {},
        }
      );
      return threadName || 'New Chat';
    } catch (err) {
      return 'New Chat';
    }
  };

  const handleNewChat = () => {
    // Just clear the UI state
    setActiveThreadId(null);
    setUserInput('');
    setResult(null);
    setResultExplanation(null);
    setCodeOutput(null);
    setHasError(false);
    setUsage(null);
  };

  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
    const thread = threads.find((t: ChatThread) => t.id === threadId);
    if (thread && thread.messages.length > 0) {
      // Clear current state
      setUserInput('');
      setResult(null);
      setCodeOutput(null);
      setResultExplanation(null);
      setHasError(false);
      setUsage(null);

      // Load the last message's content
      const lastMessage = thread.messages[thread.messages.length - 1];
      setResult(lastMessage.result);
      setCodeOutput(lastMessage.codeOutput);
      setResultExplanation(lastMessage.explanation);
      setHasError(lastMessage.hasError);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    if (!isModelLoaded || isStreaming) return;
    if (!userInput.trim()) return;

    setIsStreaming(true);
    setResult("");
    setResultExplanation("");
    setCodeOutput(null);
    setHasError(false);
    setUsage(null);

    try {
      let currentThreadId = activeThreadId;
      
      // If no active thread, get thread name first
      if (!currentThreadId) {
        const threadName = await getThreadName(userInput);
        currentThreadId = Date.now().toString();
        const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
        const newThread = {
          id: currentThreadId,
          name: threadName,
          messages: [],
          lastUpdated: Date.now()
        };
        localStorage.setItem('chatThreads', JSON.stringify([newThread, ...threads]));
        setActiveThreadId(currentThreadId);
      }

      // Add message to thread
      const threads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
      const threadIndex = threads.findIndex((t: ChatThread) => t.id === currentThreadId);
      if (threadIndex !== -1) {
        const newMessage = {
          userInput: userInput.trim(),
          result: null,
          codeOutput: null,
          explanation: null,
          hasError: false,
          timestamp: Date.now()
        };
        threads[threadIndex].messages.push(newMessage);
        threads[threadIndex].lastUpdated = Date.now();
        localStorage.setItem('chatThreads', JSON.stringify(threads));
      }

      await handleUserInput(
        userInput,
        runPython,
        {
          onResultUpdate: (newResult) => {
            setResult(newResult);
            // Update the result in thread
            const currentThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
            const threadIndex = currentThreads.findIndex((t: ChatThread) => t.id === currentThreadId);
            if (threadIndex !== -1) {
              const messageIndex = currentThreads[threadIndex].messages.length - 1;
              if (messageIndex >= 0) {
                currentThreads[threadIndex].messages[messageIndex].result = newResult;
                currentThreads[threadIndex].messages[messageIndex].hasError = hasError;
                localStorage.setItem('chatThreads', JSON.stringify(currentThreads));
              }
            }
          },
          onCodeOutputUpdate: (output) => {
            setCodeOutput(output);
            // Update code output in thread
            const currentThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
            const threadIndex = currentThreads.findIndex((t: ChatThread) => t.id === currentThreadId);
            if (threadIndex !== -1) {
              const messageIndex = currentThreads[threadIndex].messages.length - 1;
              if (messageIndex >= 0) {
                currentThreads[threadIndex].messages[messageIndex].codeOutput = output;
                localStorage.setItem('chatThreads', JSON.stringify(currentThreads));
              }
            }
          },
          onExplanationUpdate: (explanation) => {
            setResultExplanation(explanation);
            // Update explanation in thread
            const currentThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
            const threadIndex = currentThreads.findIndex((t: ChatThread) => t.id === currentThreadId);
            if (threadIndex !== -1) {
              const messageIndex = currentThreads[threadIndex].messages.length - 1;
              if (messageIndex >= 0) {
                currentThreads[threadIndex].messages[messageIndex].explanation = explanation;
                localStorage.setItem('chatThreads', JSON.stringify(currentThreads));
              }
            }
          },
          onErrorUpdate: (error) => {
            setHasError(error);
            // Update error state in thread
            const currentThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
            const threadIndex = currentThreads.findIndex((t: ChatThread) => t.id === currentThreadId);
            if (threadIndex !== -1) {
              const messageIndex = currentThreads[threadIndex].messages.length - 1;
              if (messageIndex >= 0) {
                currentThreads[threadIndex].messages[messageIndex].hasError = error;
                localStorage.setItem('chatThreads', JSON.stringify(currentThreads));
              }
            }
          },
          onUsageUpdate: setUsage,
        }
      );
    } catch (err) {
      setHasError(true);
      setResult((err as Error).message);
      // Update error in thread
      const currentThreads = JSON.parse(localStorage.getItem('chatThreads') || '[]');
      const threadIndex = currentThreads.findIndex((t: ChatThread) => t.id === activeThreadId);
      if (threadIndex !== -1) {
        const messageIndex = currentThreads[threadIndex].messages.length - 1;
        if (messageIndex >= 0) {
          currentThreads[threadIndex].messages[messageIndex].hasError = true;
          currentThreads[threadIndex].messages[messageIndex].result = (err as Error).message;
          localStorage.setItem('chatThreads', JSON.stringify(currentThreads));
        }
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setUserInput(prompt);
    
    const formEvent = new Event('submit') as unknown as React.FormEvent<HTMLFormElement>;
    
    setTimeout(() => {
      handleSubmit(formEvent);
    }, 0);
  };

  const formatTokensPerSecond = (value: number) => {
    return value.toFixed(2);
  };

  const hasChatStarted = Boolean(result || isStreaming || codeOutput || resultExplanation);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className={`flex-grow flex flex-col items-center justify-center transition-all duration-300 ${
        isModelLoaded 
          ? isSidebarOpen 
            ? 'ml-80 px-4'
            : 'ml-12 px-4' 
          : 'px-4'
      }`}>
        <div className="w-full max-w-2xl">
          <div className="font-alphaLyrae text-center mb-8">
            <h1 className="font-extrabold text-foreground text-4xl sm:text-6xl">
              Qwen Code Interpreter
            </h1>
            <p className="text-muted-foreground text-xl sm:text-2xl mt-4">
              <TypingAnimation speed={60} text="Qwen-2.5-Coder 1.5B with access to an in-browser code interpreter." />
            </p>
          </div>

          {!isModelLoaded && (
            <>
              <div className="flex justify-center">
                <Button
                  onClick={handleLoadModel}
                  disabled={isPyodideLoading || isModelLoading}
                  className="mb-4 font-alphaLyrae px-6 py-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out font-semibold text-lg shadow-md"
                >
                  {isModelLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5 text-primary-foreground" />
                      Loading Model...
                    </span>
                  ) : (
                    "Load AGI Mini 1.5B"
                  )}
                </Button>
              </div>
              <FAQ />
            </>
          )}

          {isModelLoaded && (
            <>
              <form onSubmit={handleSubmit} className="w-full mb-4">
                <div className="relative">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pr-12 p-8 font-mono text-sm bg-muted text-foreground border-input focus:ring-ring focus:border-input rounded-md resize-none placeholder:text-muted-foreground/70"
                    placeholder="How many r's are in 'strawberry'?"
                    disabled={!isModelLoaded || isStreaming}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!isModelLoaded || isStreaming || !userInput.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {isStreaming && (
                <p className="text-muted-foreground mt-4">Streaming response...</p>
              )}
              {hasError && (
                <div className="bg-destructive/50 border border-destructive p-4 rounded-md mt-4 w-full">
                  <h3 className="text-destructive-foreground font-semibold mb-2">Error:</h3>
                  <pre className="text-destructive-foreground whitespace-pre-wrap text-sm">
                    {result}
                  </pre>
                </div>
              )}
              {result && !hasError && (
                <div className="bg-card p-4 rounded-t mt-4 w-full overflow-auto">
                  <MarkdownRenderer content={result} className="text-card-foreground" />
                </div>
              )}
              {codeOutput && (
                <div className="bg-[hsl(var(--code-background))] p-4 w-full overflow-auto border-t border-border">
                  <h3 className="text-popover-foreground font-semibold mb-2">Code Output:</h3>
                  <MarkdownRenderer content={`\`\`\`output\n${codeOutput}\n\`\`\``} />
                </div>
              )}
              {resultExplanation && (
                <div className="bg-accent p-4 rounded-b w-full overflow-auto border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-accent-foreground font-semibold">Explanation:</h3>
                    {usage && (
                      <div className="bg-secondary/20 text-secondary-foreground/80 rounded px-2 py-1 text-xs font-mono tracking-wide">
                        {formatTokensPerSecond(usage.extra.decode_tokens_per_s)} tok/s
                      </div>
                    )}
                  </div>
                  <MarkdownRenderer content={resultExplanation} className="text-accent-foreground" />
                </div>
              )}

              {!hasChatStarted && <ExamplePrompts onPromptSelect={handlePromptSelect} />}
            </>
          )}
        </div>
      </main>

      {isModelLoaded && (
        <ChatHistory 
          onNewChat={handleNewChat}
          activeThreadId={activeThreadId}
          onThreadSelect={handleThreadSelect}
          onSidebarOpenChange={setIsSidebarOpen}
        />
      )}
      <Toaster />
    </div>
  );
}
