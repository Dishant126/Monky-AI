import DashboardPageLayout from "@/components/dashboard/layout";
import DashboardStat from "@/components/dashboard/stat";
import CodeTutorRanking from "@/components/codetutor/codetutor-ranking";
import DashboardChart from "@/components/dashboard/chart";
import ProcessorIcon from "@/components/icons/proccesor";
import GearIcon from "@/components/icons/gear";
import BoomIcon from "@/components/icons/boom";
import AtomIcon from "@/components/icons/atom";
import { Bullet } from "@/components/ui/bullet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDashboardData } from "@/lib/dashboard-data";

const statConfigs = [
  { label: "BUGS FIXED", icon: GearIcon },
  { label: "CODE QUALITY", icon: AtomIcon },
  { label: "LEARNING STREAK", icon: ProcessorIcon },
  { label: "LANGUAGES MASTERED", icon: BoomIcon },
];

export default async function CodeTutorDashboard() {
  const dashboardData = await getDashboardData();
  const statsByLabel = new Map(
    dashboardData.mockData.dashboardStats.map((stat) => [stat.label, stat]),
  );

  return (
    <DashboardPageLayout
      header={{
        title: "CodeTutor",
        description: "Your AI Debugging Partner",
        icon: ProcessorIcon,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statConfigs.map(({ label, icon }) => {
          const stat = statsByLabel.get(label);

          return (
            <DashboardStat
              key={label}
              label={label}
              value={stat?.value ?? "0"}
              description={stat?.description ?? ""}
              icon={icon}
              tag={stat?.tag}
              intent={stat?.intent ?? "positive"}
              direction={stat?.direction}
            />
          );
        })}
      </div>

      <div className="mb-6">
        <DashboardChart chartData={dashboardData.mockData.chartData} />
      </div>

      <div className="mb-6">
        <Card className="ring-2 ring-pop">
          <CardHeader>
            <CardTitle className="flex items-center gap-2.5 text-sm font-medium uppercase">
              <Bullet />
              Weekly Learning Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-accent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-background border border-pop rounded">
                <p className="text-xs text-foreground/60 mb-2 uppercase">
                  Most Fixed Errors
                </p>
                <p className="text-lg font-bold">
                  {dashboardData.insights.mostFixedErrors}
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  {dashboardData.insights.mostFixedErrorsCount} fixes this week
                </p>
              </div>
              <div className="p-4 bg-background border border-pop rounded">
                <p className="text-xs text-foreground/60 mb-2 uppercase">
                  Top Language
                </p>
                <p className="text-lg font-bold">
                  {dashboardData.insights.topLanguage}
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  {dashboardData.insights.topLanguageCount} bugs debugged
                </p>
              </div>
              <div className="p-4 bg-background border border-pop rounded">
                <p className="text-xs text-foreground/60 mb-2 uppercase">
                  Avg Debug Time
                </p>
                <p className="text-lg font-bold">
                  {dashboardData.insights.avgDebugTime}
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  Based on saved backend snippets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <CodeTutorRanking users={dashboardData.leaderboard} />
    </DashboardPageLayout>
  );
}
