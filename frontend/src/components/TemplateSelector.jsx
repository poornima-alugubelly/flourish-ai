import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import useStore from '../stores/useStore';

const TemplateSelector = ({ onTemplateSelect, className = '' }) => {
  const { templates } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'all',
    ...new Set(templates.map((t) => t.category)),
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleTemplateClick = (template) => {
    onTemplateSelect(template);
    setIsExpanded(false);
  };

  if (templates.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-xs"
      >
        <span className="flex items-center">
          <FileText className="mr-2 h-3 w-3" />
          Quick Templates
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>

      {isExpanded && (
        <Card className="p-2">
          <CardContent className="p-0 space-y-2">
            {/* Category Filter */}
            <div className="flex gap-1 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category
                      ? 'default'
                      : 'ghost'
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs h-6 px-2 capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Templates */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-2 rounded border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="font-medium text-sm">
                    {template.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {template.description}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    "{template.content.substring(0, 80)}..."
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateSelector;
