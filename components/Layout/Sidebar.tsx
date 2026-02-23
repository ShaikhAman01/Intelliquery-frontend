'use client';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getConnections } from '@/lib/api';
import { AddConnectionDialog } from '@/components/Shared/AddConnectionDialog';
import { Database, LayoutGrid, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const Sidebar = () => {
  const { connections, activeConnectionId, setConnections, setActiveConnection } = useStore();

  useEffect(() => {
    getConnections().then((data) => setConnections(data)).catch((err) => console.error(err));
  }, []);

  return (
    <div className="w-64 h-screen flex flex-col bg-background border-r">
      <div className="p-6 flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg"><Database className="h-5 w-5 text-primary" /></div>
        <span className="font-bold text-lg tracking-tight">Intelliquery</span>
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase">Databases</div>
        <div className="space-y-1 px-2">
          {connections.map((conn) => (
            <Button key={conn.id} variant={activeConnectionId === conn.id ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-10 font-normal" onClick={() => setActiveConnection(conn.id)}>
              <LayoutGrid size={16} className="text-muted-foreground" /><span className="truncate flex-1 text-left">{conn.name}</span>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal uppercase">{conn.db_type}</Badge>
            </Button>
          ))}
          <AddConnectionDialog />
        </div>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <Settings size={16} /> Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};