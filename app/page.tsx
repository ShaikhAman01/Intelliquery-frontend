'use client';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Visualizer } from '@/components/Chat/Visualizer';
import { useStore, Message } from '@/lib/store';
import { api } from '@/lib/api';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Dashboard() {
  const { messages, addMessage, activeConnectionId, isLoading, setLoading } = useStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConnectionId) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/query/generate', null, { params: { user_query: userMsg.text, connection_id: activeConnectionId } });
      addMessage({
        id: (Date.now() + 1).toString(), role: 'ai',
        text: res.data.visualization?.explanation || "Here is your data.",
        data: res.data.data, visualization: res.data.visualization, sql: res.data.sql, timestamp: new Date()
      });
    } catch (err) {
      addMessage({ id: Date.now().toString(), role: 'ai', text: "Error executing query.", timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
          {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50"><Bot size={48} className="mb-4" /><p>Select a database and ask a question.</p></div>}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground"><Bot size={16} /></AvatarFallback></Avatar>}
              <div className="max-w-[80%] space-y-4">
                <Card className={`p-4 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}><p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p></Card>
                {msg.role === 'ai' && msg.data && <Card className="p-4 w-full h-[350px]"><Visualizer data={msg.data} config={msg.visualization || { chart_type: 'table' }} /></Card>}
              </div>
              {msg.role === 'user' && <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted text-muted-foreground"><User size={16} /></AvatarFallback></Avatar>}
            </div>
          ))}
          {isLoading && <div className="flex items-center gap-2 text-muted-foreground text-sm ml-12"><Loader2 className="animate-spin h-4 w-4" /> Analyzing...</div>}
        </div>
        <div className="p-4 border-t bg-background/95 backdrop-blur"><div className="max-w-4xl mx-auto flex gap-2">
          <Input placeholder="Ask a question..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1" disabled={!activeConnectionId || isLoading} />
          <Button onClick={handleSend} disabled={!activeConnectionId || isLoading}><Send size={16} /></Button>
        </div></div>
      </main>
    </div>
  );
}