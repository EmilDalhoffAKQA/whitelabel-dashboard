// Widget Registry - mapper component_name til React komponenter
import { TotalConversationsWidget } from "./TotalConversationsWidget";
import { LongConversationsWidget } from "./LongConversationsWidget";
import { NPSScoreWidget } from "./NPSScoreWidget";
import { ConversationVolumeWidget } from "./ConversationVolumeWidget";
import { AverageResponseTimeWidget } from "./AverageResponseTimeWidget";
import { ResolutionRateWidget } from "./ResolutionRateWidget";
import { ActiveUsersTodayWidget } from "./ActiveUsersTodayWidget";
import { CustomerSentimentWidget } from "./CustomerSentimentWidget";
import { PeakHoursWidget } from "./PeakHoursWidget";
import { ChannelDistributionWidget } from "./ChannelDistributionWidget";
import { RecentConversationsWidget } from "./RecentConversationsWidget";
import { AgentPerformanceWidget } from "./AgentPerformanceWidget";
import { SatisfactionTrendWidget } from "./SatisfactionTrendWidget";
import { ResponseTimeTrendWidget } from "./ResponseTimeTrendWidget";

// Define common widget props interface
export interface WidgetProps {
  primaryColor?: string;
  marketId?: number;
  workspaceId?: number;
}

export const widgetRegistry: Record<
  string,
  React.ComponentType<WidgetProps>
> = {
  TotalConversationsWidget,
  LongConversationsWidget,
  NPSScoreWidget,
  ConversationVolumeWidget,
  AverageResponseTimeWidget,
  ResolutionRateWidget,
  ActiveUsersTodayWidget,
  CustomerSentimentWidget,
  PeakHoursWidget,
  ChannelDistributionWidget,
  RecentConversationsWidget,
  AgentPerformanceWidget,
  SatisfactionTrendWidget,
  ResponseTimeTrendWidget,
};

export function getWidgetComponent(
  componentName: string
): React.ComponentType<WidgetProps> | null {
  return widgetRegistry[componentName] || null;
}
