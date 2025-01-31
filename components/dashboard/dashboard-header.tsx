// components/dashboard-header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, LogOut, PenSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Session } from '@supabase/auth-helpers-nextjs';

interface DashboardHeaderProps {
  session: Session;
}

export default function DashboardHeader({ session }: DashboardHeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <PenSquare className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Admin Blog</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}