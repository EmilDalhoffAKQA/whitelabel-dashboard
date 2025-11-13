"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecentConversationsWidget() {
  const conversations = [
    {
      id: 1,
      customer: "John Doe",
      subject: "Order inquiry",
      status: "open",
      time: "2m ago",
    },
    {
      id: 2,
      customer: "Jane Smith",
      subject: "Refund request",
      status: "pending",
      time: "15m ago",
    },
    {
      id: 3,
      customer: "Bob Johnson",
      subject: "Technical issue",
      status: "resolved",
      time: "1h ago",
    },
    {
      id: 4,
      customer: "Alice Brown",
      subject: "Product question",
      status: "open",
      time: "2h ago",
    },
    {
      id: 5,
      customer: "Charlie Wilson",
      subject: "Shipping update",
      status: "resolved",
      time: "3h ago",
    },
  ];

  const statusColors: Record<string, string> = {
    open: "bg-blue-500",
    pending: "bg-yellow-500",
    resolved: "bg-green-500",
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-base font-medium">
          Recent Conversations
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Latest customer interactions
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-0">
          {conversations.map((conv, index) => (
            <div
              key={conv.id}
              className={`flex items-center justify-between p-4 hover:bg-accent/30 transition-colors ${
                index !== conversations.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{conv.customer}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {conv.subject}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <Badge className={statusColors[conv.status]}>
                  {conv.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {conv.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
