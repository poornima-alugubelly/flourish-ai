import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Clock, Edit, Eye, Save, Moon, Star } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import TagSelector from './TagSelector';
import TemplateSelector from './TemplateSelector';
import useStore from '../stores/useStore';

const Hour = ({
  time,
  note,
  tags = [],
  rich_content,
  template_id,
  id,
  is_sleep = false,
  sleep_quality = null,
  sleep_notes = '',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(note || '');
  const [tempRichContent, setTempRichContent] = useState(
    rich_content || ''
  );
  const [tempTags, setTempTags] = useState(tags || []);
  const [tempSleepQuality, setTempSleepQuality] = useState(
    sleep_quality || null
  );
  const [tempSleepNotes, setTempSleepNotes] = useState(
    sleep_notes || ''
  );
  const [showRichEditor, setShowRichEditor] = useState(
    !!rich_content
  );

  const { updateNote, applyTemplate, templates } = useStore();

  const handleSave = () => {
    updateNote(time, {
      note: is_sleep ? '' : showRichEditor ? '' : tempContent,
      rich_content: is_sleep
        ? null
        : showRichEditor
        ? tempRichContent
        : null,
      tags: is_sleep ? [] : tempTags,
      template_id: is_sleep ? null : template_id,
      is_sleep: is_sleep,
      sleep_quality: is_sleep ? tempSleepQuality : null,
      sleep_notes: is_sleep ? tempSleepNotes : '',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempContent(note || '');
    setTempRichContent(rich_content || '');
    setTempTags(tags || []);
    setTempSleepQuality(sleep_quality || null);
    setTempSleepNotes(sleep_notes || '');
    setIsEditing(false);
  };

  const handleTemplateSelect = (template) => {
    setTempContent(template.content);
    if (showRichEditor) {
      setTempRichContent(template.content);
    }
    applyTemplate(time, template.id);
  };

  const toggleSleepMode = () => {
    updateNote(time, {
      note: is_sleep ? tempContent : '',
      rich_content: is_sleep ? tempRichContent : null,
      tags: is_sleep ? tempTags : [],
      template_id: is_sleep ? template_id : null,
      is_sleep: !is_sleep,
      sleep_quality: !is_sleep ? null : tempSleepQuality,
      sleep_notes: !is_sleep ? '' : tempSleepNotes,
    });
  };

  const timeFormatted = time.toString().padStart(2, '0') + ':00';
  const hasContent =
    note || rich_content || (tags && tags.length > 0);
  const hasSleepData = sleep_quality || sleep_notes;
  const currentTemplate = templates.find((t) => t.id === template_id);

  const getSleepQualityColor = (quality) => {
    switch (quality) {
      case 5:
        return 'text-green-600';
      case 4:
        return 'text-green-500';
      case 3:
        return 'text-yellow-500';
      case 2:
        return 'text-orange-500';
      case 1:
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  // Compact sleep view
  if (is_sleep && !isEditing) {
    return (
      <Card className="transition-all duration-200 border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm text-blue-800">
                {timeFormatted}
              </span>
              <Badge
                variant="outline"
                className="text-xs bg-blue-100 text-blue-700 border-blue-300"
              >
                Sleep
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleSleepMode}
                className="h-6 w-6 p-0"
                title="Exit sleep mode"
              >
                <Moon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          <div className="flex items-center gap-2 text-sm">
            {sleep_quality && (
              <div className="flex items-center gap-1">
                <Star
                  className={`h-3 w-3 ${getSleepQualityColor(
                    sleep_quality
                  )}`}
                />
                <span className="text-xs text-muted-foreground">
                  {sleep_quality}/5
                </span>
              </div>
            )}
            {sleep_notes && (
              <span className="text-xs text-muted-foreground truncate">
                {sleep_notes}
              </span>
            )}
            {!hasSleepData && (
              <span className="text-xs text-muted-foreground italic">
                Sleeping...
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        is_sleep
          ? 'border-blue-200 bg-blue-50'
          : hasContent
          ? 'border-primary/20 bg-primary/5'
          : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {is_sleep ? (
              <Moon className="h-4 w-4 text-blue-600" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`font-medium text-sm ${
                is_sleep ? 'text-blue-800' : ''
              }`}
            >
              {timeFormatted}
            </span>
            {is_sleep && (
              <Badge
                variant="outline"
                className="text-xs bg-blue-100 text-blue-700 border-blue-300"
              >
                Sleep
              </Badge>
            )}
            {currentTemplate && !is_sleep && (
              <Badge variant="outline" className="text-xs">
                {currentTemplate.name}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleSleepMode}
              className="h-6 w-6 p-0"
              title={is_sleep ? 'Exit sleep mode' : 'Mark as sleep'}
            >
              <Moon
                className={`h-3 w-3 ${
                  is_sleep ? 'text-blue-600' : ''
                }`}
              />
            </Button>
            {!isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            {is_sleep ? (
              // Sleep editing interface
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sleep Quality (1-5)
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        size="sm"
                        variant={
                          tempSleepQuality === rating
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => setTempSleepQuality(rating)}
                        className="w-8 h-8 p-0"
                      >
                        <Star
                          className={`h-3 w-3 ${
                            tempSleepQuality === rating
                              ? 'fill-current'
                              : ''
                          }`}
                        />
                      </Button>
                    ))}
                    {tempSleepQuality && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTempSleepQuality(null)}
                        className="text-xs px-2"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sleep Notes (optional)
                  </label>
                  <textarea
                    className="w-full h-16 p-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                    value={tempSleepNotes}
                    onChange={(e) =>
                      setTempSleepNotes(e.target.value)
                    }
                    placeholder="Dreams, sleep quality, disturbances..."
                  />
                </div>
              </div>
            ) : (
              // Regular editing interface
              <div className="space-y-3">
                {/* Template Selector */}
                <TemplateSelector
                  onTemplateSelect={handleTemplateSelect}
                />

                {/* Editor Toggle */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!showRichEditor ? 'default' : 'outline'}
                    onClick={() => setShowRichEditor(false)}
                    className="text-xs"
                  >
                    Simple
                  </Button>
                  <Button
                    size="sm"
                    variant={showRichEditor ? 'default' : 'outline'}
                    onClick={() => setShowRichEditor(true)}
                    className="text-xs"
                  >
                    Rich Text
                  </Button>
                </div>

                {/* Content Editor */}
                {showRichEditor ? (
                  <RichTextEditor
                    value={tempRichContent}
                    onChange={setTempRichContent}
                    placeholder="What's on your mind?"
                  />
                ) : (
                  <textarea
                    className="w-full h-24 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    value={tempContent}
                    onChange={(e) => setTempContent(e.target.value)}
                    placeholder="What's on your mind?"
                  />
                )}

                {/* Tag Selector */}
                <TagSelector
                  selectedTags={tempTags}
                  onTagsChange={setTempTags}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Content Display */}
            {rich_content ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: rich_content }}
              />
            ) : note ? (
              <p className="text-sm whitespace-pre-wrap">{note}</p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Click to add your thoughts for {timeFormatted}
              </p>
            )}

            {/* Tags Display */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tagName) => {
                  const tagInfo = useStore
                    .getState()
                    .tags.find((t) => t.name === tagName);
                  return (
                    <Badge
                      key={tagName}
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: tagInfo?.color || '#3B82F6',
                        color: 'white',
                      }}
                    >
                      {tagName}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Click area to start editing */}
            {!hasContent && (
              <div
                className="h-16 border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                <span className="text-muted-foreground text-sm">
                  Add note
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Hour;
