import React, { useEffect, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  Brain,
  RefreshCw,
  ChevronDown,
  Eye,
  EyeOff,
  History,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import useStore from '../stores/useStore';

function AnalyticsView() {
  const {
    analytics,
    isLoadingAnalytics,
    analyticsDateRange,
    analyticsType,
    analyticsSubView,
    loadAnalytics,
    setAnalyticsDateRange,
    setAnalyticsType,
    setAnalyticsSubView,
    clearAnalytics,
  } = useStore();

  const [selectedPattern, setSelectedPattern] = useState(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] =
    useState(false);

  useEffect(() => {
    // Load analytics when component mounts
    loadAnalytics();
  }, [loadAnalytics]);

  const handleDateRangeChange = (field, value) => {
    setAnalyticsDateRange({ [field]: value });
  };

  const handleRefresh = () => {
    loadAnalytics();
  };

  const analysisTypes = [
    { value: 'patterns', label: 'Patterns & Habits', icon: Brain },
    { value: 'trends', label: 'Activity Trends', icon: TrendingUp },
    { value: 'goals', label: 'Goal Progress', icon: Target },
    { value: 'weekly', label: 'Weekly Summary', icon: Calendar },
    { value: 'monthly', label: 'Monthly Summary', icon: BarChart3 },
  ];

  const priorityColors = {
    high: 'border-red-500 bg-red-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
  };

  const categoryColors = {
    activity_level: 'bg-blue-100 text-blue-700',
    weekly_entries: 'bg-green-100 text-green-700',
    monthly_entries: 'bg-purple-100 text-purple-700',
    default: 'bg-gray-100 text-gray-700',
  };

  // Function to extract key points from verbose summary
  const extractKeyPoints = (summary) => {
    if (!summary) return [];

    // Split by sentences and paragraphs, then extract key insights
    const sentences = summary
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 20);
    const keyPoints = [];

    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed) {
        // Look for key indicators of important insights
        if (
          trimmed.includes('consistently') ||
          trimmed.includes('pattern') ||
          trimmed.includes('notably') ||
          trimmed.includes('significant') ||
          trimmed.includes('frequent') ||
          trimmed.includes('trend') ||
          trimmed.includes('behavior') ||
          trimmed.includes('activity') ||
          trimmed.includes('progress') ||
          trimmed.includes('goal') ||
          trimmed.includes('improvement') ||
          trimmed.includes('struggle')
        ) {
          // Clean up and format the sentence
          let cleaned = trimmed.replace(
            /^(however|additionally|furthermore|moreover|notably|interestingly),?\s*/i,
            ''
          );
          cleaned =
            cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          if (cleaned.length > 30 && cleaned.length < 200) {
            keyPoints.push(cleaned);
          }
        }
      }
    });

    // If no key points found, take first few meaningful sentences
    if (keyPoints.length === 0) {
      return sentences
        .slice(0, 3)
        .map((s) => s.trim())
        .filter((s) => s.length > 20);
    }

    return keyPoints.slice(0, 5); // Limit to 5 key points
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics & Trends
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnalyticsSubView('history')}
            >
              <History className="mr-2 h-4 w-4" />
              View History
            </Button>
          </CardTitle>
          <CardDescription>
            Comprehensive analysis of your personal development
            patterns and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date Range
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={analyticsDateRange.start}
                  onChange={(e) =>
                    handleDateRangeChange('start', e.target.value)
                  }
                  className="text-xs"
                />
                <Input
                  type="date"
                  value={analyticsDateRange.end}
                  onChange={(e) =>
                    handleDateRangeChange('end', e.target.value)
                  }
                  className="text-xs"
                />
              </div>
            </div>

            {/* Analysis Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Analysis Type
              </label>
              <div className="relative">
                <select
                  value={analyticsType}
                  onChange={(e) => setAnalyticsType(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background text-sm appearance-none pr-8"
                >
                  {analysisTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button
                  onClick={handleRefresh}
                  disabled={isLoadingAnalytics}
                  size="sm"
                  className="flex-1"
                >
                  {isLoadingAnalytics ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Analyze
                    </>
                  )}
                </Button>
                <Button
                  onClick={clearAnalytics}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Results */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Analysis Summary
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowDetailedAnalysis(!showDetailedAnalysis)
                    }
                    className="h-8 px-2"
                  >
                    {showDetailedAnalysis ? (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" />
                        Quick View
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-4 w-4" />
                        Detailed View
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {analyticsType.charAt(0).toUpperCase() +
                    analyticsType.slice(1)}{' '}
                  analysis for{' '}
                  {format(parseISO(analytics.start_date), 'MMM d')} -{' '}
                  {format(
                    parseISO(analytics.end_date),
                    'MMM d, yyyy'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showDetailedAnalysis ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">
                      {analytics.summary}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {extractKeyPoints(analytics.summary).map(
                      (point, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <p className="text-sm text-gray-700">
                            {point}
                          </p>
                        </div>
                      )
                    )}
                    {extractKeyPoints(analytics.summary).length ===
                      0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No key insights detected. Switch to detailed
                        view for full analysis.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patterns */}
            {analytics.patterns && analytics.patterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Identified Patterns
                  </CardTitle>
                  <CardDescription>
                    Recurring behaviors and habits discovered in your
                    data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.patterns.map((pattern, index) => (
                      <div
                        key={index}
                        className={`p-4 border-l-4 rounded-r cursor-pointer transition-colors ${
                          selectedPattern === index
                            ? 'bg-accent'
                            : 'hover:bg-muted/50'
                        } ${
                          pattern.confidence > 0.8
                            ? 'border-green-500'
                            : pattern.confidence > 0.6
                            ? 'border-yellow-500'
                            : 'border-red-500'
                        }`}
                        onClick={() =>
                          setSelectedPattern(
                            selectedPattern === index ? null : index
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {pattern.pattern_type}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {pattern.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs">
                              <span className="text-muted-foreground">
                                Frequency: {pattern.frequency}
                              </span>
                              <span className="text-muted-foreground">
                                Confidence:{' '}
                                {Math.round(pattern.confidence * 100)}
                                %
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Recommendations */}
                        {selectedPattern === index &&
                          pattern.recommendations && (
                            <div className="mt-3 pt-3 border-t">
                              <h5 className="font-medium text-sm mb-2">
                                Recommendations:
                              </h5>
                              <ul className="space-y-1">
                                {pattern.recommendations.map(
                                  (rec, recIndex) => (
                                    <li
                                      key={recIndex}
                                      className="text-sm text-muted-foreground flex items-start"
                                    >
                                      <span className="mr-2">•</span>
                                      <span>{rec}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trends Chart */}
            {analytics.trends && analytics.trends.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Activity Trends
                  </CardTitle>
                  <CardDescription>
                    Visual representation of your activity patterns
                    over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Simple Bar Chart */}
                    <div className="h-64 flex items-end justify-center gap-2 p-4 border rounded">
                      {analytics.trends
                        .slice(0, 15)
                        .map((trend, index) => {
                          const maxValue = Math.max(
                            ...analytics.trends.map((t) => t.value)
                          );
                          const height =
                            (trend.value / maxValue) * 100;

                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center gap-1"
                            >
                              <div
                                className={`w-8 rounded-t transition-all duration-300 ${
                                  categoryColors[trend.category] ||
                                  categoryColors.default
                                }`}
                                style={{
                                  height: `${height}%`,
                                  minHeight: '4px',
                                }}
                                title={`${trend.date}: ${trend.value}`}
                              />
                              <span className="text-xs text-muted-foreground transform -rotate-45 origin-top-left w-8">
                                {format(parseISO(trend.date), 'M/d')}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Trend Legend */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        analytics.trends.reduce((acc, trend) => {
                          acc[trend.category] =
                            (acc[trend.category] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([category, count]) => (
                        <div
                          key={category}
                          className="flex items-center gap-1 text-xs"
                        >
                          <div
                            className={`w-3 h-3 rounded ${
                              categoryColors[category] ||
                              categoryColors.default
                            }`}
                          />
                          <span className="capitalize">
                            {category.replace('_', ' ')} ({count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Insights */}
          <div className="space-y-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Key Insights
                  {analytics.insights &&
                    analytics.insights.length > 3 && (
                      <span className="text-xs text-muted-foreground font-normal">
                        {showDetailedAnalysis ? 'All' : 'Top 3'}
                      </span>
                    )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.insights &&
                  analytics.insights.length > 0 ? (
                    (showDetailedAnalysis
                      ? analytics.insights
                      : analytics.insights.slice(0, 3)
                    ).map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 p-2 rounded bg-blue-50/50"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">
                          {insight}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No specific insights available for this
                      analysis.
                    </p>
                  )}
                  {!showDetailedAnalysis &&
                    analytics.insights &&
                    analytics.insights.length > 3 && (
                      <button
                        onClick={() => setShowDetailedAnalysis(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        View {analytics.insights.length - 3} more
                        insights...
                      </button>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Analysis Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Type:
                    </span>
                    <span className="capitalize">
                      {analytics.analysis_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Date Range:
                    </span>
                    <span>
                      {format(
                        parseISO(analytics.start_date),
                        'MMM d'
                      )}{' '}
                      -{' '}
                      {format(parseISO(analytics.end_date), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Processing Time:
                    </span>
                    <span>
                      {analytics.processing_time?.toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Data Points:
                    </span>
                    <span>{analytics.trends?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Patterns Found:
                    </span>
                    <span>{analytics.patterns?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Quick Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysisTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={
                          analyticsType === type.value
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setAnalyticsType(type.value)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analytics && !isLoadingAnalytics && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No Analytics Data
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              Click "Analyze" to generate insights from your journal
              entries and goal progress. Make sure you have some
              journal entries in the selected date range.
            </p>
            <Button
              onClick={handleRefresh}
              disabled={isLoadingAnalytics}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Analytics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AnalyticsView;
