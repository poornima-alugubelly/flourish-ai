import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus, Tag } from 'lucide-react';
import useStore from '../stores/useStore';

const TagSelector = ({
  selectedTags,
  onTagsChange,
  className = '',
}) => {
  const { tags, addTag } = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');

  const handleTagToggle = (tagName) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newTags);
  };

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      await addTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setNewTagName('');
      setNewTagColor('#3B82F6');
      setIsCreating(false);
    }
  };

  const handleRemoveTag = (tagName) => {
    onTagsChange(selectedTags.filter((t) => t !== tagName));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tagName) => {
            const tag = tags.find((t) => t.name === tagName);
            return (
              <Badge
                key={tagName}
                variant="secondary"
                className="text-xs px-2 py-1 cursor-pointer"
                style={{
                  backgroundColor: tag?.color || '#3B82F6',
                  color: 'white',
                }}
              >
                {tagName}
                <X
                  className="ml-1 h-3 w-3 hover:text-red-200"
                  onClick={() => handleRemoveTag(tagName)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Available Tags */}
      <div className="flex flex-wrap gap-1">
        {tags
          .filter((tag) => !selectedTags.includes(tag.name))
          .map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs px-2 py-1 cursor-pointer hover:bg-accent"
              onClick={() => handleTagToggle(tag.name)}
            >
              <Tag
                className="mr-1 h-3 w-3"
                style={{ color: tag.color }}
              />
              {tag.name}
            </Badge>
          ))}
      </div>

      {/* Create New Tag */}
      {isCreating ? (
        <div className="flex gap-2 items-center p-2 border rounded-md bg-muted">
          <Input
            type="text"
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-1 h-8"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-8 h-8 rounded border"
          />
          <Button size="sm" onClick={handleCreateTag}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsCreating(true)}
          className="text-xs h-6"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Tag
        </Button>
      )}
    </div>
  );
};

export default TagSelector;
