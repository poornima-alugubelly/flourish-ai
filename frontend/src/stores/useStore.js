import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { format } from 'date-fns';

const API_BASE = 'http://localhost:8000';

// Auto-save debounce helper
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const useStore = create(
  subscribeWithSelector((set, get) => {
    // Create persistent debounced save function
    const debouncedSaveNote = debounce((time) => {
      get().saveNote(time);
    }, 1000);

    return {
      // Current date
      currentDate: format(new Date(), 'yyyy-MM-dd'),

      // Notes state
      notes: Array(24)
        .fill(null)
        .map((_, index) => ({
          time: index,
          note: '',
          rich_content: null,
          tags: [],
          template_id: null,
          id: null,
          is_sleep: false,
          sleep_quality: null,
          sleep_notes: '',
        })),

      // Goals state (long-term goals with milestones)
      goals: [],

      // Goal categories state
      goalCategories: [],

      // Daily reflection (simplified from goals)
      dailyReflection: '', // For daily thoughts/reflection instead of goals

      // Tags state
      tags: [],

      // Templates state
      templates: [],

      // Sleep schedule state
      sleepSchedule: null, // Current active sleep schedule

      // Analysis state
      analysis: 'Your analysis will appear here...',
      analysisHistory: [],
      analysisHistoryPagination: {
        page: 1,
        page_size: 20,
        total_count: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      },
      analysisHistoryFilters: {
        search: '',
        start_date: '',
        end_date: '',
      },
      isAnalyzing: false,

      // Timetable state
      timetable: null,
      isGeneratingTimetable: false,
      timetablePreferences: {
        wake_time: '7',
        sleep_time: '23',
        focus_hours: '4',
        break_frequency: '90',
      },

      // Analytics state
      analytics: null,
      isLoadingAnalytics: false,
      analyticsDateRange: {
        start: format(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          'yyyy-MM-dd'
        ), // 30 days ago
        end: format(new Date(), 'yyyy-MM-dd'),
      },
      analyticsType: 'patterns',

      // UI state
      selectedTags: [],
      searchQuery: '',
      selectedDate: new Date(),
      activeView: 'journal', // 'journal', 'goals', or 'analytics'
      analyticsSubView: 'current', // 'current' or 'history'

      // Auto-save state
      hasUnsavedChanges: false,
      lastSaved: null,

      // Actions
      setCurrentDate: async (date) => {
        set({ currentDate: date });
        await get().loadNotesForDate(date);
        // Auto-apply sleep schedule to new dates
        await get().autoApplySleepSchedule(date);
      },

      setActiveView: (view) => set({ activeView: view }),

      setAnalyticsSubView: (subView) =>
        set({ analyticsSubView: subView }),

      updateNote: (time, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.time === time ? { ...note, ...updates } : note
          ),
          hasUnsavedChanges: true,
        }));
        // Use the persistent debounced save function
        debouncedSaveNote(time);
      },

      updateNoteContent: (time, content) => {
        get().updateNote(time, { note: content });
      },

      updateNoteRichContent: (time, richContent) => {
        get().updateNote(time, { rich_content: richContent });
      },

      updateNoteTags: (time, tags) => {
        get().updateNote(time, { tags });
      },

      applyTemplate: (time, templateId) => {
        const template = get().templates.find(
          (t) => t.id === templateId
        );
        if (template) {
          get().updateNote(time, {
            note: template.content,
            template_id: templateId,
          });
        }
      },

      // Daily reflection actions
      setDailyReflection: (reflection) => {
        set({ dailyReflection: reflection, hasUnsavedChanges: true });
      },

      // Goals actions (long-term goals)
      loadGoalsWithMilestones: async (filters = {}) => {
        try {
          const params = new URLSearchParams(filters);
          const response = await fetch(
            `${API_BASE}/goals-with-milestones?${params}`
          );
          const goals = await response.json();
          set({ goals });
        } catch (error) {
          console.error('Failed to load goals:', error);
        }
      },

      addGoal: async (goalData) => {
        try {
          const response = await fetch(`${API_BASE}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goalData),
          });
          const newGoal = await response.json();

          // Reload goals to get full data with milestones
          await get().loadGoalsWithMilestones();
          return newGoal;
        } catch (error) {
          console.error('Failed to add goal:', error);
        }
      },

      updateGoal: async (goalId, updates) => {
        try {
          const response = await fetch(
            `${API_BASE}/goals/${goalId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );
          const updatedGoal = await response.json();

          // Update local state
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === goalId ? { ...goal, ...updatedGoal } : goal
            ),
          }));
        } catch (error) {
          console.error('Failed to update goal:', error);
        }
      },

      deleteGoal: async (goalId) => {
        try {
          await fetch(`${API_BASE}/goals/${goalId}`, {
            method: 'DELETE',
          });

          set((state) => ({
            goals: state.goals.filter((goal) => goal.id !== goalId),
          }));
        } catch (error) {
          console.error('Failed to delete goal:', error);
        }
      },

      // Milestone actions
      addMilestone: async (milestoneData) => {
        try {
          const response = await fetch(`${API_BASE}/milestones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(milestoneData),
          });
          const newMilestone = await response.json();

          // Update local state - add milestone to the correct goal
          set((state) => ({
            goals: state.goals.map((goal) =>
              goal.id === milestoneData.goal_id
                ? {
                    ...goal,
                    milestones: [
                      ...(goal.milestones || []),
                      newMilestone,
                    ],
                  }
                : goal
            ),
          }));

          return newMilestone;
        } catch (error) {
          console.error('Failed to add milestone:', error);
        }
      },

      updateMilestone: async (milestoneId, updates) => {
        try {
          const response = await fetch(
            `${API_BASE}/milestones/${milestoneId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );
          const updatedMilestone = await response.json();

          // Update local state
          set((state) => ({
            goals: state.goals.map((goal) => ({
              ...goal,
              milestones:
                goal.milestones?.map((milestone) =>
                  milestone.id === milestoneId
                    ? updatedMilestone
                    : milestone
                ) || [],
            })),
          }));

          // Reload goals to get updated progress
          await get().loadGoalsWithMilestones();
        } catch (error) {
          console.error('Failed to update milestone:', error);
        }
      },

      deleteMilestone: async (milestoneId) => {
        try {
          await fetch(`${API_BASE}/milestones/${milestoneId}`, {
            method: 'DELETE',
          });

          // Update local state
          set((state) => ({
            goals: state.goals.map((goal) => ({
              ...goal,
              milestones:
                goal.milestones?.filter(
                  (milestone) => milestone.id !== milestoneId
                ) || [],
            })),
          }));

          // Reload goals to get updated progress
          await get().loadGoalsWithMilestones();
        } catch (error) {
          console.error('Failed to delete milestone:', error);
        }
      },

      loadGoals: async (filters = {}) => {
        // Legacy function - redirect to new implementation
        return get().loadGoalsWithMilestones(filters);
      },

      // Goal Categories actions
      loadGoalCategories: async () => {
        try {
          const response = await fetch(`${API_BASE}/goal-categories`);
          const categories = await response.json();
          set({ goalCategories: categories });
        } catch (error) {
          console.error('Failed to load goal categories:', error);
        }
      },

      addGoalCategory: async (categoryData) => {
        try {
          const response = await fetch(
            `${API_BASE}/goal-categories`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(categoryData),
            }
          );
          const newCategory = await response.json();
          set((state) => ({
            goalCategories: [...state.goalCategories, newCategory],
          }));
          return newCategory;
        } catch (error) {
          console.error('Failed to add goal category:', error);
          throw error;
        }
      },

      updateGoalCategory: async (categoryId, updates) => {
        try {
          const response = await fetch(
            `${API_BASE}/goal-categories/${categoryId}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            }
          );
          const updatedCategory = await response.json();

          set((state) => ({
            goalCategories: state.goalCategories.map((category) =>
              category.id === categoryId ? updatedCategory : category
            ),
          }));
          return updatedCategory;
        } catch (error) {
          console.error('Failed to update goal category:', error);
          throw error;
        }
      },

      deleteGoalCategory: async (categoryId) => {
        try {
          await fetch(`${API_BASE}/goal-categories/${categoryId}`, {
            method: 'DELETE',
          });

          set((state) => ({
            goalCategories: state.goalCategories.filter(
              (category) => category.id !== categoryId
            ),
          }));
        } catch (error) {
          console.error('Failed to delete goal category:', error);
          throw error;
        }
      },

      // Tags actions
      loadTags: async () => {
        try {
          const response = await fetch(`${API_BASE}/tags`);
          const tags = await response.json();
          set({ tags });
        } catch (error) {
          console.error('Failed to load tags:', error);
        }
      },

      addTag: async (tagData) => {
        try {
          const response = await fetch(`${API_BASE}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tagData),
          });
          const newTag = await response.json();
          set((state) => ({ tags: [...state.tags, newTag] }));
          return newTag;
        } catch (error) {
          console.error('Failed to add tag:', error);
        }
      },

      // Templates actions
      loadTemplates: async () => {
        try {
          const response = await fetch(`${API_BASE}/templates`);
          const templates = await response.json();
          set({ templates });
        } catch (error) {
          console.error('Failed to load templates:', error);
        }
      },

      // Sleep Schedule actions
      loadSleepSchedule: async () => {
        try {
          const response = await fetch(`${API_BASE}/sleep-schedule`);
          const sleepSchedule = await response.json();
          set({ sleepSchedule });
        } catch (error) {
          console.error('Failed to load sleep schedule:', error);
        }
      },

      saveSleepSchedule: async (scheduleData) => {
        try {
          const response = await fetch(`${API_BASE}/sleep-schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData),
          });
          const newSchedule = await response.json();
          set({ sleepSchedule: newSchedule });
          return newSchedule;
        } catch (error) {
          console.error('Failed to save sleep schedule:', error);
          throw error;
        }
      },

      applySleepScheduleToDate: async (date) => {
        try {
          const response = await fetch(
            `${API_BASE}/apply-sleep-schedule/${date}`,
            {
              method: 'POST',
            }
          );
          const result = await response.json();

          // Reload notes for the current date to reflect changes
          if (date === get().currentDate) {
            await get().loadNotesForDate(date);
          }

          return result;
        } catch (error) {
          console.error('Failed to apply sleep schedule:', error);
          throw error;
        }
      },

      autoApplySleepSchedule: async (date) => {
        const state = get();
        if (!state.sleepSchedule) return;

        // Check if this date already has sleep notes
        const existingSleepNotes = state.notes.some(
          (note) => note.is_sleep
        );

        // Only auto-apply if no existing sleep notes for this date
        if (!existingSleepNotes) {
          try {
            await state.applySleepScheduleToDate(date);
          } catch (error) {
            console.error(
              'Failed to auto-apply sleep schedule:',
              error
            );
          }
        }
      },

      // Notes API actions
      loadNotesForDate: async (date) => {
        try {
          const response = await fetch(
            `${API_BASE}/notes/date/${date}`
          );
          const notesData = await response.json();
          set({ notes: notesData, hasUnsavedChanges: false });
        } catch (error) {
          console.error('Failed to load notes:', error);
        }
      },

      saveNote: async (time) => {
        const state = get();
        const note = state.notes.find((n) => n.time === time);
        if (!note) return;

        // Only skip saving if it's a new note (no ID) with no content and not a sleep note
        if (
          !note.id &&
          !note.note &&
          !note.rich_content &&
          !note.is_sleep
        )
          return;

        const noteData = {
          date: state.currentDate,
          hour: time,
          content: note.note,
          rich_content: note.rich_content,
          tag_names: note.tags,
          template_id: note.template_id,
          is_sleep: note.is_sleep || false,
          sleep_quality: note.sleep_quality,
          sleep_notes: note.sleep_notes || '',
        };

        try {
          if (note.id) {
            // Update existing note
            await fetch(`${API_BASE}/notes/${note.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(noteData),
            });
          } else {
            // Create new note
            const response = await fetch(`${API_BASE}/notes`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(noteData),
            });
            const savedNote = await response.json();
            set((state) => ({
              notes: state.notes.map((n) =>
                n.time === time ? { ...n, id: savedNote.id } : n
              ),
            }));
          }

          set({ lastSaved: new Date(), hasUnsavedChanges: false });
        } catch (error) {
          console.error('Failed to save note:', error);
        }
      },

      // Batch save multiple notes (useful for sleep period updates)
      batchSaveNotes: async (times) => {
        const state = get();
        const savePromises = times.map(async (time) => {
          const note = state.notes.find((n) => n.time === time);
          if (
            !note ||
            (!note.note && !note.rich_content && !note.is_sleep)
          )
            return;

          const noteData = {
            date: state.currentDate,
            hour: time,
            content: note.note,
            rich_content: note.rich_content,
            tag_names: note.tags,
            template_id: note.template_id,
            is_sleep: note.is_sleep || false,
            sleep_quality: note.sleep_quality,
            sleep_notes: note.sleep_notes || '',
          };

          try {
            if (note.id) {
              // Update existing note
              await fetch(`${API_BASE}/notes/${note.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData),
              });
            } else {
              // Create new note
              const response = await fetch(`${API_BASE}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData),
              });
              const savedNote = await response.json();
              return { time, id: savedNote.id };
            }
          } catch (error) {
            console.error(
              `Failed to save note for hour ${time}:`,
              error
            );
          }
        });

        try {
          const results = await Promise.all(savePromises);

          // Update IDs for newly created notes
          const newIds = results.filter(Boolean);
          if (newIds.length > 0) {
            set((state) => ({
              notes: state.notes.map((n) => {
                const newId = newIds.find(
                  (result) => result.time === n.time
                );
                return newId ? { ...n, id: newId.id } : n;
              }),
            }));
          }

          set({ lastSaved: new Date(), hasUnsavedChanges: false });
        } catch (error) {
          console.error('Failed to batch save notes:', error);
        }
      },

      // Analysis actions
      analyzeDay: async () => {
        const state = get();
        set({ isAnalyzing: true });

        // Get active goals for context
        const activeGoals = state.goals
          .filter((g) => g.status === 'active')
          .map((g) => `${g.title}: ${g.description}`)
          .join('\n');

        try {
          const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              notes: state.notes.map((note) => ({
                time: note.time,
                note: note.note || '',
              })),
              goals:
                state.dailyReflection +
                (activeGoals
                  ? `\n\nActive Goals:\n${activeGoals}`
                  : ''),
              date: state.currentDate,
            }),
          });

          const result = await response.json();
          set({
            analysis: result.analysis,
            isAnalyzing: false,
          });

          // Reload analysis history
          get().loadAnalysisHistory();
        } catch (error) {
          console.error('Analysis failed:', error);
          set({
            analysis: 'Analysis failed. Please try again.',
            isAnalyzing: false,
          });
        }
      },

      loadAnalysisHistory: async (page = 1, filters = null) => {
        try {
          const state = get();
          const currentFilters =
            filters || state.analysisHistoryFilters;

          const params = new URLSearchParams({
            page: page.toString(),
            page_size:
              state.analysisHistoryPagination.page_size.toString(),
          });

          if (currentFilters.search) {
            params.append('search', currentFilters.search);
          }
          if (currentFilters.start_date) {
            params.append('start_date', currentFilters.start_date);
          }
          if (currentFilters.end_date) {
            params.append('end_date', currentFilters.end_date);
          }

          const response = await fetch(
            `${API_BASE}/analysis/history?${params.toString()}`
          );
          const result = await response.json();

          set({
            analysisHistory: result.analyses,
            analysisHistoryPagination: result.pagination,
            analysisHistoryFilters: currentFilters,
          });
        } catch (error) {
          console.error('Failed to load analysis history:', error);
        }
      },

      // Timetable actions
      generateTimetable: async () => {
        const state = get();
        set({ isGeneratingTimetable: true });

        // Calculate next day
        const currentDate = new Date(state.currentDate);
        const nextDay = new Date(
          currentDate.getTime() + 24 * 60 * 60 * 1000
        );
        const nextDayString = nextDay.toISOString().split('T')[0];

        // Get active goals for context
        const activeGoals = state.goals
          .filter((g) => g.status === 'active')
          .map((g) => `${g.title}: ${g.description}`)
          .join('\n');

        try {
          const response = await fetch(
            `${API_BASE}/generate-timetable`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                analysis: state.analysis,
                goals:
                  state.dailyReflection +
                  (activeGoals
                    ? `\n\nActive Goals:\n${activeGoals}`
                    : ''),
                date: nextDayString,
                preferences: state.timetablePreferences,
              }),
            }
          );

          const result = await response.json();
          set({
            timetable: result,
            isGeneratingTimetable: false,
          });
        } catch (error) {
          console.error('Timetable generation failed:', error);
          set({
            timetable: null,
            isGeneratingTimetable: false,
          });
        }
      },

      updateTimetablePreferences: (preferences) => {
        set({
          timetablePreferences: {
            ...get().timetablePreferences,
            ...preferences,
          },
        });
      },

      clearTimetable: () => {
        set({ timetable: null });
      },

      // Analytics actions
      loadAnalytics: async (analysisType = null) => {
        const state = get();
        const type = analysisType || state.analyticsType;

        set({ isLoadingAnalytics: true });

        try {
          const response = await fetch(`${API_BASE}/analytics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              start_date: state.analyticsDateRange.start,
              end_date: state.analyticsDateRange.end,
              analysis_type: type,
            }),
          });

          const result = await response.json();
          set({
            analytics: result,
            analyticsType: type,
            isLoadingAnalytics: false,
          });
        } catch (error) {
          console.error('Analytics loading failed:', error);
          set({
            analytics: null,
            isLoadingAnalytics: false,
          });
        }
      },

      setAnalyticsDateRange: (dateRange) => {
        set({
          analyticsDateRange: {
            ...get().analyticsDateRange,
            ...dateRange,
          },
        });
      },

      setAnalyticsType: (type) => {
        set({ analyticsType: type });
        // Auto-load analytics when type changes
        get().loadAnalytics(type);
      },

      clearAnalytics: () => {
        set({ analytics: null });
      },

      // Analysis history pagination and filtering
      setAnalysisHistoryPage: (page) => {
        get().loadAnalysisHistory(page);
      },

      setAnalysisHistoryFilters: (filters) => {
        get().loadAnalysisHistory(1, filters);
      },

      clearAnalysisHistoryFilters: () => {
        const emptyFilters = {
          search: '',
          start_date: '',
          end_date: '',
        };
        get().loadAnalysisHistory(1, emptyFilters);
      },

      // Search and filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedTags: (tags) => set({ selectedTags: tags }),
      setSelectedDate: (date) => set({ selectedDate: date }),

      // Export actions
      exportNotes: async (format = 'json') => {
        try {
          const response = await fetch(
            `${API_BASE}/export/notes?format=${format}`
          );
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `notes_export_${
            new Date().toISOString().split('T')[0]
          }.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error('Failed to export notes:', error);
        }
      },

      exportGoals: async (format = 'json') => {
        try {
          const response = await fetch(
            `${API_BASE}/export/goals?format=${format}`
          );
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `goals_export_${
            new Date().toISOString().split('T')[0]
          }.${format}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error('Failed to export goals:', error);
        }
      },

      // AI Generation for SMART goal fields
      generateSmartField: async (
        goalTitle,
        fieldType,
        category,
        existingContent = {}
      ) => {
        try {
          const response = await fetch(
            `${API_BASE}/generate-smart-field`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                goal_title: goalTitle,
                field_type: fieldType,
                category: category,
                existing_content: existingContent,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to generate field content');
          }

          const result = await response.json();
          return result.generated_content;
        } catch (error) {
          console.error('Failed to generate SMART field:', error);
          throw error;
        }
      },

      // Initialize store
      initialize: async () => {
        const state = get();
        try {
          await Promise.all([
            state.loadNotesForDate(state.currentDate).catch((err) => {
              console.error('Failed to load notes:', err);
              // Set default notes if loading fails
              set({
                notes: Array(24)
                  .fill(null)
                  .map((_, index) => ({
                    time: index,
                    note: '',
                    rich_content: null,
                    tags: [],
                    template_id: null,
                    id: null,
                    is_sleep: false,
                    sleep_quality: null,
                    sleep_notes: '',
                  })),
              });
            }),
            state
              .loadGoalsWithMilestones()
              .catch((err) =>
                console.error('Failed to load goals:', err)
              ),
            state
              .loadGoalCategories()
              .catch((err) =>
                console.error('Failed to load goal categories:', err)
              ),
            state
              .loadTags()
              .catch((err) =>
                console.error('Failed to load tags:', err)
              ),
            state
              .loadTemplates()
              .catch((err) =>
                console.error('Failed to load templates:', err)
              ),
            state
              .loadAnalysisHistory()
              .catch((err) =>
                console.error('Failed to load analysis history:', err)
              ),
            state
              .loadSleepSchedule()
              .catch((err) =>
                console.error('Failed to load sleep schedule:', err)
              ),
          ]);

          // Auto-apply sleep schedule to current date after loading everything
          await get().autoApplySleepSchedule(get().currentDate);
        } catch (error) {
          console.error('Failed to initialize store:', error);
          // App should still work with default state
        }
      },
    };
  })
);

export default useStore;
