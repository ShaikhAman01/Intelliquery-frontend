'use client';

import { Database, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/use-auth';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export const Header = () => {
  const { user } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push('/sign-in');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?';

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

      <div className="flex items-center gap-4">

        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                {initials}
              </div>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
