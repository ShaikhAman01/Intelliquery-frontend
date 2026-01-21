'use client';

import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileBarChart, Table as TableIcon } from 'lucide-react';

export const Visualizer = ({ data, config }: { data: any[], config: any }) => {
  if (!data || data.length === 0) return <div className="text-muted-foreground text-sm">No data available.</div>;
  
  const keys = Object.keys(data[0]);
  const xKey = keys[0];
  const dataKey = keys[1];

  const renderChart = () => {
    if (config?.chart_type === 'line') {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
          <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      );
    }
    return (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey={xKey} stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
        <Bar dataKey={dataKey} fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  };

  return (
    <Card className="w-full h-full border-0 shadow-none">
      <Tabs defaultValue="chart" className="w-full h-full flex flex-col">
        <div className="flex justify-between px-1 mb-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">{config?.chart_type || 'Table'} View</span>
          <TabsList className="h-8">
            <TabsTrigger value="chart" className="text-xs h-7 px-2"><FileBarChart size={14} className="mr-1"/> Chart</TabsTrigger>
            <TabsTrigger value="table" className="text-xs h-7 px-2"><TableIcon size={14} className="mr-1"/> Data</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chart" className="flex-1 min-h-0"><ResponsiveContainer width="100%" height="100%" minHeight={250}>{renderChart()}</ResponsiveContainer></TabsContent>
        <TabsContent value="table" className="flex-1 min-h-0 overflow-auto border rounded-md">
          <Table><TableHeader><TableRow>{keys.map(k => <TableHead key={k} className="h-8">{k}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{data.map((row, i) => <TableRow key={i} className="h-8">{keys.map(k => <TableCell key={k} className="py-2">{row[k]}</TableCell>)}</TableRow>)}</TableBody></Table>
        </TabsContent>
      </Tabs>
    </Card>
  );
};