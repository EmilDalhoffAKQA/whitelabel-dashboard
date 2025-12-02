"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Earth } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Market {
  id: number;
  name: string;
  market_code: string;
  language: string;
}

interface Workspace {
  id: number;
  name: string;
  logo_url: string | null;
  theme_config: {
    primaryColor: string;
    [key: string]: any;
  };
}

// Simulated LLM responses
const MOCK_RESPONSES = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Welcome! How may I help you?",
  ],
  product: [
    "I'd be happy to help you find information about our products. What specifically are you looking for?",
    "Our product range includes nutrition, beverages, and pet care. Which area interests you?",
    "Let me help you with product information. Could you tell me more about what you need?",
  ],
  support: [
    "I'm here to assist with any questions or concerns. How can I help resolve your issue?",
    "Let me help you with that. Could you provide more details about your concern?",
    "I'd be glad to support you. What seems to be the problem?",
  ],
  default: [
    "I understand you're asking about {topic}. Let me provide some information...",
    "That's a great question about {topic}. Here's what I can tell you...",
    "Thanks for asking. Regarding {topic}, here's what you should know...",
  ],
};

const ChatSimulator = () => {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadWorkspaceData();
  }, [workspaceId]);

  const loadWorkspaceData = async () => {
    try {
      // Fetch workspace
      const { data: workspaceData } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();

      if (workspaceData) {
        setWorkspace(workspaceData);

        // Update welcome message with workspace name
        setMessages([
          {
            id: 1,
            role: "assistant",
            content: `Hello! I'm your ${workspaceData.name} assistant. How can I help you today?`,
            timestamp: new Date(),
          },
        ]);
      }

      // Fetch markets
      const { data: marketsData } = await supabase
        .from("markets")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true)
        .order("name");

      if (marketsData && marketsData.length > 0) {
        setMarkets(marketsData);
        setSelectedMarket(marketsData[0]);
      }
    } catch (error) {
      console.error("Error loading workspace data:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getRandomResponse = (category: string) => {
    const responses =
      MOCK_RESPONSES[category as keyof typeof MOCK_RESPONSES] ||
      MOCK_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const detectIntent = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.match(/hello|hi|hey|greetings/)) return "greeting";
    if (lower.match(/product|buy|purchase|price|cost/)) return "product";
    if (lower.match(/help|support|problem|issue|complaint/)) return "support";
    return "default";
  };

  const simulateTyping = async (responseText: string) => {
    setIsTyping(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 800 + Math.random() * 1200)
    );

    const newMessage = {
      id: messages.length + 1,
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const intent = detectIntent(input);
    const response = getRandomResponse(intent).replace("{topic}", input);

    await simulateTyping(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const primaryColor = workspace?.theme_config?.primaryColor || "#3b82f6";
  const logoUrl = workspace?.logo_url;
  const workspaceName = workspace?.name || "Assistant";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        {/* Header with workspace branding */}
        <div className="bg-white rounded-t-2xl shadow-lg p-3 sm:p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center p-2 flex-shrink-0"
                style={{ backgroundColor: `${primaryColor}10` }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={workspaceName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span
                    className="text-lg sm:text-xl md:text-2xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    {workspaceName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                  {workspaceName} Assistant
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Powered by AI • Always here to help
                </p>
              </div>
            </div>

            {markets.length > 0 && selectedMarket && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {" "}
                <select
                  value={selectedMarket.market_code}
                  onChange={(e) => {
                    const market = markets.find(
                      (m: Market) => m.market_code === e.target.value
                    );
                    if (market) {
                      setSelectedMarket(market);
                    }
                  }}
                  className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium bg-white hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    // @ts-ignore - CSS custom property
                    "--tw-ring-color": primaryColor,
                  }}
                >
                  {markets.map((market: Market) => (
                    <option key={market.market_code} value={market.market_code}>
                      {market.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white h-[400px] sm:h-[450px] md:h-[500px] overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                  message.role === "user"
                    ? "text-white shadow-md"
                    : "bg-gray-100 text-gray-900"
                }`}
                style={{
                  backgroundColor:
                    message.role === "user" ? primaryColor : undefined,
                }}
              >
                <p className="text-xs sm:text-sm leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={`text-[10px] sm:text-xs mt-1 ${
                    message.role === "user" ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-gray-400" />
                <span className="text-xs sm:text-sm text-gray-500">
                  Typing...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-3 sm:p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-gray-300 transition-colors text-gray-900 placeholder-gray-400"
                disabled={isTyping}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 flex-shrink-0"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="mt-2 sm:mt-3 flex gap-1.5 sm:gap-2 flex-wrap">
            {[
              "Tell me about your products",
              "I need help with an order",
              "What are your opening hours?",
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(suggestion);
                  inputRef.current?.focus();
                }}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-lg border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSimulator;
