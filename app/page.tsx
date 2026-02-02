'use client';

import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { QueryInput } from '@/components/Query/QueryInput';
import { SQLDisplay } from '@/components/Query/SQLDisplay';
import { ResultsPanel } from '@/components/Results/ResultsPanel';
import { InsightsPanel } from '@/components/Results/InsightsPanel';
import { useStore, Message } from '@/lib/store';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { activeConnectionId, isLoading, setLoading } = useStore();
  const [input, setInput] = useState('');
  const [sql, setSql] = useState('');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [explanation, setExplanation] = useState('');
  const [activeTab, setActiveTab] = useState('results');

  const handleSubmit = async () => {
    if (!input.trim() || !activeConnectionId) return;
    setLoading(true);
    setSql('');
    setData([]);

    try {
      const res = await api.post('/query/generate', null, { 
        params: { user_query: input, connection_id: activeConnectionId } 
      });
      setSql(res.data.sql || '');
      setData(res.data.data || []);
      setExplanation(res.data.visualization?.explanation || '');
    } catch (err) {
      console.error('Error generating query:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    setInput(template);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar for database connections */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Panel - Query Input */}
        <div className="w-[400px] flex-shrink-0">
          <div className="h-full bg-card rounded-xl p-6 border border-border glow-border">
            <QueryInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onTemplateClick={handleTemplateClick}
              isLoading={isLoading}
              disabled={!activeConnectionId}
            />
          </div>
        </div>

        {/* Right Panel - SQL & Results */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* SQL Display */}
          <div className="h-[280px] flex-shrink-0 bg-card rounded-xl p-6 border border-border">
            <SQLDisplay sql={sql} />
          </div>

          {/* Results/Insights Tabs */}
          <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 pt-4 border-b border-border">
                <TabsList className="bg-muted/50">
                  <TabsTrigger 
                    value="results" 
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2"
                  >
                    <Table className="h-4 w-4" />
                    Results
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 p-6 overflow-hidden">
                <TabsContent value="results" className="h-full m-0">
                  <ResultsPanel data={data} />
                </TabsContent>
                <TabsContent value="insights" className="h-full m-0">
                  <InsightsPanel data={data} explanation={explanation} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>

      </div>

      {/* Connection Status - subtle banner instead of blocking overlay */}
      {!activeConnectionId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 z-50">
          <p className="text-amber-400 text-sm">
            💡 Connect a database from the sidebar to start generating queries
          </p>
        </div>
      )}
    </div>
  );
}