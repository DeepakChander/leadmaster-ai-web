import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
}

interface ClarificationChatProps {
  open: boolean;
  messages: ChatMessage[];
  typing?: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

const ClarificationChat = ({ open, messages, typing, onSend, onClose }: ClarificationChatProps) => {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    onSend(value);
    setInput("");
  };

  return (
    <aside
      className="fixed bottom-4 right-4 left-4 md:left-auto md:w-[380px] z-50 animate-slide-in-right"
      aria-live="polite"
    >
      <div className="rounded-xl border border-border bg-background shadow-[var(--shadow-elevated)]">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Clarification</h3>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close clarification">
            Close
          </Button>
        </header>

        <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "assistant"
                  ? "bg-muted text-foreground/90 rounded-lg px-3 py-2 w-fit max-w-[85%]"
                  : "bg-primary/10 text-foreground rounded-lg px-3 py-2 ml-auto w-fit max-w-[85%]"
              }
            >
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          ))}
          {typing && (
            <div className="bg-muted rounded-lg px-3 py-2 w-fit max-w-[85%]">
              <p className="text-sm text-muted-foreground">Assistant is typing…</p>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-border">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your answer…"
            className="flex-1"
            aria-label="Clarification input"
          />
          <Button type="submit" variant="default">
            Send
          </Button>
        </form>
      </div>
    </aside>
  );
};

export default ClarificationChat;
