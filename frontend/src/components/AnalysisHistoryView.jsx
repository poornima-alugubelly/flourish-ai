import React, { useState, useEffect } from 'react';
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  Search,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  Calendar as CalendarIcon,
  X,
  BarChart3,
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

function AnalysisHistoryView() {
  const {
    analysisHistory,
    analysisHistoryPagination,
    analysisHistoryFilters,
    setAnalyticsSubView,
    loadAnalysisHistory,
    setAnalysisHistoryPage,
    setAnalysisHistoryFilters,
    clearAnalysisHistoryFilters,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState(
    analysisHistoryFilters.search
  );
  const [showFilters, setShowFilters] = useState(false);
  const [expandedAnalysis, setExpandedAnalysis] = useState(null);

  useEffect(() => {
    loadAnalysisHistory();
  }, [loadAnalysisHistory]);

  const handleSearch = (e) => {
    e.preventDefault();
    setAnalysisHistoryFilters({
      ...analysisHistoryFilters,
      search: searchQuery,
    });
  };

  const handleDateFilter = (field, value) => {
    setAnalysisHistoryFilters({
      ...analysisHistoryFilters,
      [field]: value,
    });
  };

  const groupAnalysesByPeriod = (analyses) => {
    const groups = {};

    analyses.forEach((analysis) => {
      const date = parseISO(analysis.date);
      const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
      const monthKey = format(date, 'yyyy-MM');

      if (!groups[monthKey]) {
        groups[monthKey] = {
          month: format(date, 'MMMM yyyy'),
          weeks: {},
        };
      }

      if (!groups[monthKey].weeks[weekStart]) {
        groups[monthKey].weeks[weekStart] = {
          weekStart,
          weekEnd: format(endOfWeek(date), 'yyyy-MM-dd'),
          analyses: [],
        };
      }

      groups[monthKey].weeks[weekStart].analyses.push(analysis);
    });

    return groups;
  };

  const renderPagination = () => {
    const { page, total_pages, has_next, has_prev } =
      analysisHistoryPagination;

    if (total_pages <= 1) return null;

    return (
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {total_pages} (
          {analysisHistoryPagination.total_count} total analyses)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalysisHistoryPage(page - 1)}
            disabled={!has_prev}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalysisHistoryPage(page + 1)}
            disabled={!has_next}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderAnalysisCard = (analysis) => {
    const isExpanded = expandedAnalysis === analysis.id;

    return (
      <Card key={analysis.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {format(
                    parseISO(analysis.date),
                    'EEEE, MMMM d, yyyy'
                  )}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {analysis.processing_time?.toFixed(2)}s
                </div>
              </div>

              <div className="text-sm text-gray-700">
                {isExpanded ? (
                  <div className="whitespace-pre-wrap">
                    {analysis.analysis}
                  </div>
                ) : (
                  <div>
                    {analysis.summary}
                    {analysis.analysis.length > 200 && (
                      <button
                        onClick={() =>
                          setExpandedAnalysis(analysis.id)
                        }
                        className="text-blue-600 hover:text-blue-800 ml-1 text-xs"
                      >
                        Read more...
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setExpandedAnalysis(isExpanded ? null : analysis.id)
              }
              className="ml-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const groupedAnalyses = groupAnalysesByPeriod(analysisHistory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Analysis History
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnalyticsSubView('current')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Current Analysis
            </Button>
          </CardTitle>
          <CardDescription>
            Browse and search through your past AI analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search analyses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </form>

            {/* Date Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={analysisHistoryFilters.start_date}
                    onChange={(e) =>
                      handleDateFilter('start_date', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={analysisHistoryFilters.end_date}
                    onChange={(e) =>
                      handleDateFilter('end_date', e.target.value)
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAnalysisHistoryFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisHistory.length > 0 ? (
        <div className="space-y-6">
          {/* Pagination Info */}
          {renderPagination()}

          {/* Grouped Analyses */}
          {Object.entries(groupedAnalyses).map(
            ([monthKey, monthData]) => (
              <Card key={monthKey}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {monthData.month}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(monthData.weeks).map(
                    ([weekStart, weekData]) => (
                      <div key={weekStart} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">
                          Week of{' '}
                          {format(
                            parseISO(weekData.weekStart),
                            'MMM d'
                          )}{' '}
                          -{' '}
                          {format(
                            parseISO(weekData.weekEnd),
                            'MMM d'
                          )}
                          <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                            {weekData.analyses.length} analysis
                            {weekData.analyses.length !== 1
                              ? 'es'
                              : ''}
                          </span>
                        </h4>
                        <div className="space-y-2">
                          {weekData.analyses.map(renderAnalysisCard)}
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )
          )}

          {/* Bottom Pagination */}
          {renderPagination()}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No Analyses Found
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              {analysisHistoryFilters.search ||
              analysisHistoryFilters.start_date ||
              analysisHistoryFilters.end_date
                ? 'Try adjusting your search criteria or filters.'
                : 'No analyses have been generated yet. Create your first analysis to get started.'}
            </p>
            {(analysisHistoryFilters.search ||
              analysisHistoryFilters.start_date ||
              analysisHistoryFilters.end_date) && (
              <Button
                variant="outline"
                onClick={clearAnalysisHistoryFilters}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AnalysisHistoryView;
