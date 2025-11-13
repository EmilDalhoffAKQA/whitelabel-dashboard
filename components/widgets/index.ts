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

export const widgetRegistry: Record<string, React.ComponentType> = {
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
};

export function getWidgetComponent(
  componentName: string
): React.ComponentType | null {
  return widgetRegistry[componentName] || null;
}
