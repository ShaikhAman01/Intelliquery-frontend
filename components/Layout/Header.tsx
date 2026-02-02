'use client';

import { Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg glow-cyan">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-foreground">Intelliquery</h1>
          <p className="text-xs text-muted-foreground">AI-Powered SQL Insights</p>
        </div>
      </div>
      <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
        Beta
      </Badge>
    </header>
  );
};
