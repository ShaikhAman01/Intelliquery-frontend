'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { createConnection } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';

export function AddConnectionDialog() {
  const { addConnection } = useStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', db_type: 'postgres', host: 'localhost', port: '5432',
    username: 'postgres', password: '', db_name: '', user_id: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createConnection(formData);
      if (res.status === 'success') {
        addConnection({ 
          id: res.connection_id, name: formData.name, 
          db_type: formData.db_type, host: formData.host 
        });
        setOpen(false);
      }
    } catch (err: any) {
      alert("Failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 mt-4 border-dashed text-muted-foreground hover:text-foreground">
          <Plus size={16} /> Add Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Connect Database</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Name</Label><Input name="name" onChange={handleChange} required placeholder="My DB" /></div>
            <div className="space-y-2"><Label>Type</Label>
              <Select onValueChange={(val) => setFormData({...formData, db_type: val})} defaultValue="postgres">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="postgres">PostgreSQL</SelectItem><SelectItem value="mysql">MySQL</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Host</Label><Input name="host" onChange={handleChange} required placeholder="localhost" /></div>
            <div className="space-y-2"><Label>Port</Label><Input name="port" onChange={handleChange} required placeholder="5432" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>User</Label><Input name="username" onChange={handleChange} required placeholder="postgres" /></div>
            <div className="space-y-2"><Label>DB Name</Label><Input name="db_name" onChange={handleChange} required placeholder="sales" /></div>
          </div>
          <div className="space-y-2"><Label>Password</Label><Input name="password" type="password" onChange={handleChange} required /></div>
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Connect
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}