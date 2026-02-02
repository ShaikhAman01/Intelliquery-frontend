'use client';

import { Sparkles } from 'lucide-react';
import { StatsCards } from './StatsCards';

interface InsightsPanelProps {
  data: Record<string, unknown>[];
  explanation?: string;
}

export const InsightsPanel = ({ data, explanation }: InsightsPanelProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Run a query to see insights
      </div>
    );
  }

  // Calculate data quality score (simple heuristic)
  const totalCells = data.length * Object.keys(data[0]).length;
  const nullCells = data.reduce((count, row) => {
    return count + Object.values(row).filter(v => v === null || v === undefined || v === '').length;
  }, 0);
  const dataQuality = Math.round(((totalCells - nullCells) / totalCells) * 100);

  return (
    <div className="flex flex-col gap-4 h-full overflow-auto">
      {/* Query Summary */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-foreground">Query Summary</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {explanation || `Query returned ${data.length} high-value results`}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards data={data} />

      {/* Key Metrics */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h3 className="font-medium text-foreground mb-4">Key Metrics</h3>
        
        {/* Data Quality */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Data Quality</span>
            <span className="text-foreground">{dataQuality}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${dataQuality}%` }}
            />
          </div>
        </div>

        {/* Row Count */}
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted-foreground">Total Rows</span>
          <span className="text-foreground">{data.length}</span>
        </div>

        {/* Column Count */}
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Columns</span>
          <span className="text-foreground">{Object.keys(data[0]).length}</span>
        </div>
      </div>
    </div>
  );
};
