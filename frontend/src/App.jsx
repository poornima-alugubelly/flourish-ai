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
    initialize,
    setCurrentDate,
    setDailyReflection,
    setActiveView,
    analyzeDay,
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
                    disabled
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    disabled
                  >
                    <History className="mr-2 h-4 w-4" />
                    View History
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
        ) : (
          /* Goals View */
          <GoalManager />
        )}
      </div>
    </div>
  );
}

export default App;
