import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Moon, Clock, Save } from 'lucide-react';
import useStore from '../stores/useStore';

const SleepPeriodSelector = () => {
  const [startHour, setStartHour] = useState(22); // 10 PM default
  const [endHour, setEndHour] = useState(7); // 7 AM default
  const [sleepQuality, setSleepQuality] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    updateNote,
    batchSaveNotes,
    notes,
    sleepSchedule,
    saveSleepSchedule,
    applySleepScheduleToDate,
    currentDate,
  } = useStore();

  // Load existing sleep schedule on component mount
  useEffect(() => {
    if (sleepSchedule) {
      setStartHour(sleepSchedule.start_hour);
      setEndHour(sleepSchedule.end_hour);
      setSleepQuality(sleepSchedule.default_quality);
    }
  }, [sleepSchedule]);

  const handleSaveSchedule = async () => {
    setIsSaving(true);
    try {
      await saveSleepSchedule({
        start_hour: startHour,
        end_hour: endHour,
        default_quality: sleepQuality,
      });
    } catch (error) {
      console.error('Failed to save sleep schedule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetSleepPeriod = async () => {
    setIsSaving(true);
    try {
      // First save the schedule as a preference
      await saveSleepSchedule({
        start_hour: startHour,
        end_hour: endHour,
        default_quality: sleepQuality,
      });

      // Then apply it to the current date
      await applySleepScheduleToDate(currentDate);
    } catch (error) {
      console.error('Failed to set sleep period:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSleep = async () => {
    const clearedHours = [];

    // Clear sleep mode from all hours
    for (let hour = 0; hour < 24; hour++) {
      const currentNote = notes.find((n) => n.time === hour);
      if (currentNote?.is_sleep) {
        updateNote(hour, {
          is_sleep: false,
          sleep_quality: null,
          sleep_notes: '',
        });
        clearedHours.push(hour);
      }
    }

    // Batch save all cleared hours
    if (clearedHours.length > 0) {
      await batchSaveNotes(clearedHours);
    }
  };

  const formatHour = (hour) => {
    return hour.toString().padStart(2, '0') + ':00';
  };

  const currentSleepHours = notes.filter((n) => n.is_sleep).length;
  const avgSleepQuality = notes
    .filter((n) => n.is_sleep && n.sleep_quality)
    .reduce(
      (sum, n, _, arr) => sum + n.sleep_quality / arr.length,
      0
    );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Moon className="h-5 w-5 text-blue-600" />
          Sleep Period
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Sleep Stats */}
        {currentSleepHours > 0 && (
          <div className="text-sm bg-blue-50 p-3 rounded-md border border-blue-200">
            <div className="flex justify-between items-center">
              <span>Current Sleep:</span>
              <span className="font-medium">
                {currentSleepHours} hours
              </span>
            </div>
            {avgSleepQuality > 0 && (
              <div className="flex justify-between items-center mt-1">
                <span>Avg Quality:</span>
                <span className="font-medium">
                  {avgSleepQuality.toFixed(1)}/5
                </span>
              </div>
            )}
          </div>
        )}

        {/* Sleep Period Selection */}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              Sleep Start Time
            </label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(parseInt(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Wake Up Time
            </label>
            <select
              value={endHour}
              onChange={(e) => setEndHour(parseInt(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {formatHour(i)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Overall Sleep Quality (optional)
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant={
                    sleepQuality === rating ? 'default' : 'outline'
                  }
                  onClick={() =>
                    setSleepQuality(
                      sleepQuality === rating ? null : rating
                    )
                  }
                  className="w-8 h-8 p-0"
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              onClick={handleSaveSchedule}
              className="flex-1"
              variant="outline"
              size="sm"
              disabled={isSaving}
            >
              <Save className="mr-1 h-3 w-3" />
              {isSaving ? 'Saving...' : 'Save as Default Schedule'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSetSleepPeriod}
              className="flex-1"
              variant="default"
              size="sm"
              disabled={isSaving}
            >
              <Moon className="mr-1 h-3 w-3" />
              {isSaving ? 'Applying...' : 'Apply to Today'}
            </Button>

            {currentSleepHours > 0 && (
              <Button
                onClick={handleClearSleep}
                variant="outline"
                size="sm"
                disabled={isSaving}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Sleep Period Preview */}
        <div className="text-xs text-muted-foreground">
          {startHour < endHour ? (
            <>
              Sleep period: {formatHour(startHour)} -{' '}
              {formatHour(endHour)} ({endHour - startHour} hours)
            </>
          ) : (
            <>
              Sleep period: {formatHour(startHour)} -{' '}
              {formatHour(endHour)} next day (
              {24 - startHour + endHour} hours)
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepPeriodSelector;
