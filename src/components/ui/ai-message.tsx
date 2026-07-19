"use client";

import { cn } from "@/lib/utils";

interface AIMessageProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

export function AIMessage({ content, isStreaming, className }: AIMessageProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white text-xs font-bold">
        AI
      </div>
      <div className="flex-1 bg-stone-50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-stone-700 leading-relaxed">
        {content}
        {isStreaming && (
          <span className="inline-block w-1 h-4 ml-0.5 bg-stone-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

interface UserMessageProps {
  content: string;
  className?: string;
}

export function UserMessage({ content, className }: UserMessageProps) {
  return (
    <div className={cn("flex gap-3 flex-row-reverse", className)}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600 text-xs font-bold">
        私
      </div>
      <div className="flex-1 bg-stone-900 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}
