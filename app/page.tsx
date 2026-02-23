'use client';

import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { QueryInput } from '@/components/Query/QueryInput';
import { SQLDisplay } from '@/components/Query/SQLDisplay';
import { ResultsPanel } from '@/components/Results/ResultsPanel';
import { InsightsPanel } from '@/components/Results/InsightsPanel';
import { ChartPanel } from '@/components/Chat/Visualizer';
import { HistoryPanel } from '@/components/History/HistoryPanel';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, BarChart3, Sparkles, Clock, MessageSquarePlus } from 'lucide-react';
import { AuthGuard } from '@/lib/use-auth';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { activeConnectionId, isLoading, setLoading } = useStore();
  const [input, setInput] = useState('');
  const [sql, setSql] = useState('');
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [explanation, setExplanation] = useState('');
  const [chartRec, setChartRec] = useState<{ chart_type: string; reason?: string; } | undefined>();
  const [activeTab, setActiveTab] = useState('chart');
  const [showHistory, setShowHistory] = useState(false);
  const [querySource, setQuerySource] = useState('');
  const [executionTime, setExecutionTime] = useState(0);

  const handleSubmit = async () => {
    if (!input.trim() || !activeConnectionId) return;
    setLoading(true);
    setSql('');
    setData([]);
    setChartRec(undefined);
    setQuerySource('');
    setExecutionTime(0);

    try {
      const res = await api.post('/query/generate', null, {
        params: { user_query: input, connection_id: activeConnectionId }
      });
      setSql(res.data.sql || '');
      setData(res.data.data || []);
      setExplanation(res.data.explanation || res.data.visualization?.explanation || '');
      setChartRec(res.data.chart_recommendation || undefined);
      setQuerySource(res.data.query_source || '');
      setExecutionTime(res.data.execution_time_ms || 0);

      // Auto-switch to chart tab when results arrive
      if (res.data.data?.length > 0) {
        setActiveTab('chart');
      }
    } catch (err) {
      console.error('Error generating query:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template: string) => {
    setInput(template);
  };

  // Replay a query from history
  const handleReplay = useCallback((question: string, historySql: string) => {
    setInput(question);
    setSql(historySql);
    setShowHistory(false);
    // Auto-submit the replayed query
    if (activeConnectionId) {
      setLoading(true);
      setData([]);
      setChartRec(undefined);
      api.post('/query/generate', null, {
        params: { user_query: question, connection_id: activeConnectionId }
      }).then(res => {
        setSql(res.data.sql || '');
        setData(res.data.data || []);
        setExplanation(res.data.explanation || res.data.visualization?.explanation || '');
        setChartRec(res.data.chart_recommendation || undefined);
        setQuerySource(res.data.query_source || '');
        setExecutionTime(res.data.execution_time_ms || 0);
        if (res.data.data?.length > 0) setActiveTab('chart');
      }).catch(err => {
        console.error('Replay failed:', err);
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [activeConnectionId, setLoading]);

  // Ask follow-up (prefill with context hint)
  const handleFollowUp = () => {
    const prefix = data.length > 0 ? 'Based on the previous results, ' : '';
    setInput(prefix);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar for database connections */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Left Panel - Query Input + History toggle */}
          <div className="w-[400px] flex-shrink-0 flex flex-col gap-4">
            {/* Query Input card */}
            <div className={`bg-card rounded-xl p-6 border border-border glow-border ${showHistory ? 'flex-shrink-0' : 'flex-1'}`}>
              <QueryInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                onTemplateClick={handleTemplateClick}
                isLoading={isLoading}
                disabled={!activeConnectionId}
              />
            </div>

            {/* Context indicator + History toggle */}
            <div className="flex items-center gap-2">
              {/* Follow-up button */}
              {data.length > 0 && (
                <button
                  onClick={handleFollowUp}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg
                             bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Ask follow-up
                </button>
              )}

              {/* Execution badge */}
              {querySource && (
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${querySource === 'DYNAMIC'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-violet-500/10 text-violet-400'
                  }`}>
                  {querySource === 'DYNAMIC' ? '⚡' : '🤖'} {querySource}
                  {executionTime > 0 && ` · ${executionTime}ms`}
                </span>
              )}

              {/* History toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${showHistory
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Clock className="h-3.5 w-3.5" />
                History
              </button>
            </div>

            {/* History panel (expandable) */}
            {showHistory && (
              <div className="flex-1 min-h-0 bg-card rounded-xl p-4 border border-border overflow-hidden">
                <HistoryPanel
                  connectionId={activeConnectionId}
                  onReplay={handleReplay}
                />
              </div>
            )}
          </div>

          {/* Right Panel - SQL & Results */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* SQL Display */}
            <div className="h-[280px] flex-shrink-0 bg-card rounded-xl p-6 border border-border">
              <SQLDisplay sql={sql} />
            </div>

            {/* Results / Chart / Insights Tabs */}
            <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-6 pt-4 border-b border-border">
                  <TabsList className="bg-muted/50">
                    <TabsTrigger
                      value="chart"
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Chart
                    </TabsTrigger>
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
                      <Sparkles className="h-4 w-4" />
                      Insights
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                  <TabsContent value="chart" className="h-full m-0">
                    <ChartPanel data={data} chartRecommendation={chartRec as any} />
                  </TabsContent>
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