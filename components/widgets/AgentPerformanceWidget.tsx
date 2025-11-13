"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AgentPerformanceWidget() {
  const agents = [
    {
      name: "Sarah Connor",
      conversations: 156,
      satisfaction: 98,
      avgTime: "2.1m",
    },
    {
      name: "John McClane",
      conversations: 142,
      satisfaction: 96,
      avgTime: "2.4m",
    },
    {
      name: "Ellen Ripley",
      conversations: 138,
      satisfaction: 97,
      avgTime: "2.2m",
    },
    {
      name: "Rick Deckard",
      conversations: 125,
      satisfaction: 94,
      avgTime: "2.8m",
    },
    {
      name: "Max Rockatansky",
      conversations: 118,
      satisfaction: 95,
      avgTime: "2.5m",
    },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-medium">
          Agent Performance
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top performers this month
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-2 font-medium">Agent</th>
                <th className="pb-2 font-medium text-right">Conversations</th>
                <th className="pb-2 font-medium text-right">CSAT</th>
                <th className="pb-2 font-medium text-right">Avg Time</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </td>
                  <td className="text-right">{agent.conversations}</td>
                  <td className="text-right">{agent.satisfaction}%</td>
                  <td className="text-right text-muted-foreground">
                    {agent.avgTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
