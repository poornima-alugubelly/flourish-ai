import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  BarChart3,
  Download,
  Brain,
  History,
  Target,
  Clock,
  BookOpen,
  PenTool,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import Hour from './components/Hour';
import GoalManager from './components/GoalManager';
import SleepPeriodSelector from './components/SleepPeriodSelector';
import AnalyticsView from './components/AnalyticsView';
import AnalysisHistoryView from './components/AnalysisHistoryView';
import useStore from './stores/useStore';

function App() {
  const {
    notes,
    dailyReflection,
    analysis,
    isAnalyzing,
    currentDate,
    hasUnsavedChanges,
    lastSaved,
    goals,
    analysisHistory,
    activeView,
    timetable,
    isGeneratingTimetable,
    timetablePreferences,
    analytics,
    isLoadingAnalytics,
    analyticsDateRange,
    analyticsType,
    analyticsSubView,
    initialize,
    setCurrentDate,
    setDailyReflection,
    setActiveView,
    setAnalyticsSubView,
    analyzeDay,
    generateTimetable,
    updateTimetablePreferences,
    clearTimetable,
    loadAnalytics,
    setAnalyticsDateRange,
    setAnalyticsType,
    clearAnalytics,
    exportNotes,
    exportGoals,
  } = useStore();

  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setCurrentDate(newDate);
    setSelectedDate(new Date(newDate));
  };

  const handleAnalysis = () => {
    analyzeDay();
  };

  const handleExport = (type, format) => {
    if (type === 'notes') {
      exportNotes(format);
    } else if (type === 'goals') {
      exportGoals(format);
    }
  };

  const activeGoalsCount = goals.filter(
    (g) => g.status === 'active'
  ).length;
  const completedGoalsCount = goals.filter(
    (g) => g.status === 'completed'
  ).length;
  const notesWithContentCount = notes.filter(
    (n) => n.note || n.rich_content
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Flourish.ai
              </h1>
              <p className="text-muted-foreground">
                AI-powered insights for your personal development
                journey
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Navigation */}
              <div className="flex gap-2">
                <Button
                  variant={
                    activeView === 'journal' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setActiveView('journal')}
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Journal
                </Button>
                <Button
                  variant={
                    activeView === 'goals' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setActiveView('goals')}
                >
                  <Target className="mr-2 h-4 w-4" />
                  Goals
                </Button>
                <Button
                  variant={
                    activeView === 'analytics' ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setActiveView('analytics')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </div>

              {/* Date Selector - fixed width container */}
              <div className="w-40 flex items-center gap-2">
                {activeView === 'journal' && (
                  <>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={currentDate}
                      onChange={handleDateChange}
                      className="rounded-md border border-input bg-background px-3 py-1 text-sm flex-1"
                    />
                  </>
                )}
              </div>

              {/* Auto-save indicator - fixed width container */}
              <div className="w-32 text-right">
                {activeView === 'journal' && (
                  <>
                    {hasUnsavedChanges && (
                      <div className="text-xs text-muted-foreground">
                        Unsaved changes...
                      </div>
                    )}
                    {lastSaved && !hasUnsavedChanges && (
                      <div className="text-xs text-muted-foreground">
                        Last saved: {format(lastSaved, 'HH:mm')}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Export Menu */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('notes', 'json')}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export Notes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('goals', 'json')}
                >
                  <Download className="mr-1 h-3 w-3" />
                  Export Goals
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {activeView === 'journal' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Stats & Quick Actions */}
            <div className="lg:col-span-1 space-y-4">
              {/* Daily Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Today's Overview
                  </CardTitle>
                  <CardDescription>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Notes</span>
                    </div>
                    <span className="font-medium">
                      {notesWithContentCount}/24
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Active Goals</span>
                    </div>
                    <span className="font-medium">
                      {activeGoalsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="font-medium">
                      {completedGoalsCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">Sleep Hours</span>
                    </div>
                    <span className="font-medium">
                      {notes.filter((n) => n.is_sleep).length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Period Selector */}
              <SleepPeriodSelector />

              {/* Daily Reflection */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Daily Reflection
                  </CardTitle>
                  <CardDescription>
                    How are you progressing today? Any thoughts on
                    your goals and growth?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                    placeholder="Reflect on your day, progress, growth opportunities, or anything on your mind..."
                    value={dailyReflection}
                    onChange={(e) =>
                      setDailyReflection(e.target.value)
                    }
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveView('goals')}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Manage Goals
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleExport('notes', 'csv')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setActiveView('analytics')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Hourly Journal */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hourly Journal
                  </CardTitle>
                  <CardDescription>
                    Document your thoughts, feelings, and activities
                    throughout the day
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map((hourData) => (
                      <Hour
                        key={hourData.time}
                        time={hourData.time}
                        note={hourData.note}
                        rich_content={hourData.rich_content}
                        tags={hourData.tags}
                        template_id={hourData.template_id}
                        id={hourData.id}
                        is_sleep={hourData.is_sleep}
                        sleep_quality={hourData.sleep_quality}
                        sleep_notes={hourData.sleep_notes}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - AI Analysis */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Analysis
                  </CardTitle>
                  <CardDescription>
                    Get insights about your growth and optimization
                    patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleAnalysis}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze My Day
                      </>
                    )}
                  </Button>

                  <div className="border rounded-md p-4 bg-muted/30">
                    <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {analysis}
                    </div>
                  </div>

                  {/* Timetable Generation */}
                  {analysis !==
                    'Your analysis will appear here...' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          Tomorrow's Schedule
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={generateTimetable}
                          disabled={isGeneratingTimetable}
                        >
                          {isGeneratingTimetable ? (
                            <>
                              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Clock className="mr-2 h-3 w-3" />
                              Generate Timetable
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Timetable Preferences */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-muted-foreground mb-1">
                            Wake Time
                          </label>
                          <Input
                            type="number"
                            min="5"
                            max="11"
                            value={timetablePreferences.wake_time}
                            onChange={(e) =>
                              updateTimetablePreferences({
                                wake_time: e.target.value,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1">
                            Sleep Time
                          </label>
                          <Input
                            type="number"
                            min="20"
                            max="24"
                            value={timetablePreferences.sleep_time}
                            onChange={(e) =>
                              updateTimetablePreferences({
                                sleep_time: e.target.value,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1">
                            Focus Hours
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="8"
                            value={timetablePreferences.focus_hours}
                            onChange={(e) =>
                              updateTimetablePreferences({
                                focus_hours: e.target.value,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1">
                            Break Frequency (min)
                          </label>
                          <Input
                            type="number"
                            min="30"
                            max="180"
                            step="15"
                            value={
                              timetablePreferences.break_frequency
                            }
                            onChange={(e) =>
                              updateTimetablePreferences({
                                break_frequency: e.target.value,
                              })
                            }
                            className="h-8"
                          />
                        </div>
                      </div>

                      {/* Timetable Display */}
                      {timetable && (
                        <div className="border rounded-md p-4 bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">
                              Schedule for {timetable.date}
                            </h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearTimetable}
                            >
                              Clear
                            </Button>
                          </div>

                          <p className="text-xs text-muted-foreground mb-3">
                            {timetable.summary}
                          </p>

                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {timetable.schedule.map((slot, index) => (
                              <div
                                key={index}
                                className={`flex items-start p-2 rounded text-xs border-l-4 ${
                                  slot.priority === 'high'
                                    ? 'border-red-500 bg-red-50'
                                    : slot.priority === 'medium'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-blue-500 bg-blue-50'
                                }`}
                              >
                                <div className="font-mono text-muted-foreground w-12 flex-shrink-0">
                                  {String(slot.hour).padStart(2, '0')}
                                  :00
                                </div>
                                <div className="flex-1 ml-2">
                                  <div className="font-medium">
                                    {slot.activity}
                                  </div>
                                  <div className="text-muted-foreground text-xs mt-1">
                                    {slot.description}
                                  </div>
                                  <div className="flex gap-1 mt-1">
                                    <span
                                      className={`px-1 py-0.5 rounded text-xs ${
                                        slot.category === 'study'
                                          ? 'bg-purple-100 text-purple-700'
                                          : slot.category === 'work'
                                          ? 'bg-blue-100 text-blue-700'
                                          : slot.category === 'break'
                                          ? 'bg-green-100 text-green-700'
                                          : slot.category ===
                                            'personal'
                                          ? 'bg-orange-100 text-orange-700'
                                          : slot.category ===
                                            'exercise'
                                          ? 'bg-red-100 text-red-700'
                                          : slot.category === 'meal'
                                          ? 'bg-yellow-100 text-yellow-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}
                                    >
                                      {slot.category}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analysis History */}
                  {analysisHistory.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        Recent Analyses
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {analysisHistory.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="text-xs p-2 rounded border hover:bg-accent cursor-pointer"
                          >
                            <div className="font-medium">
                              {item.date}
                            </div>
                            <div className="text-muted-foreground line-clamp-2">
                              {item.analysis.substring(0, 100)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeView === 'goals' ? (
          /* Goals View */
          <GoalManager />
        ) : (
          /* Analytics View */
          <div className="space-y-6">
            {/* Analytics Sub-navigation */}
            {activeView === 'analytics' && (
              <div className="flex gap-2">
                <Button
                  variant={
                    analyticsSubView === 'current'
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => setAnalyticsSubView('current')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Current Analysis
                </Button>
                <Button
                  variant={
                    analyticsSubView === 'history'
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => setAnalyticsSubView('history')}
                >
                  <History className="mr-2 h-4 w-4" />
                  Analysis History
                </Button>
              </div>
            )}

            {analyticsSubView === 'current' ? (
              <AnalyticsView />
            ) : (
              <AnalysisHistoryView />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
