import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  Circle,
  MoreVertical,
  Flag,
  Trophy,
  Clock,
  BookOpen,
  Heart,
  Briefcase,
  Activity,
  Users,
  Settings,
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
import { Badge } from './ui/badge';
import CategoryManager from './CategoryManager';
import useStore from '../stores/useStore';

const GoalManager = () => {
  const {
    goals,
    goalCategories,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  } = useStore();

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCategoryManager, setShowCategoryManager] =
    useState(false);

  const statuses = [
    {
      id: 'active',
      name: 'Active',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'paused',
      name: 'Paused',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'completed',
      name: 'Completed',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'archived',
      name: 'Archived',
      color: 'bg-gray-100 text-gray-800',
    },
  ];

  // Filter goals
  const filteredGoals = goals.filter((goal) => {
    const categoryMatch =
      selectedCategory === 'all' ||
      goal.category === selectedCategory;
    const statusMatch =
      selectedStatus === 'all' || goal.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getStatusColor = (status) => {
    const statusObj = statuses.find((s) => s.id === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (categoryName) => {
    const category = goalCategories.find(
      (c) => c.name === categoryName
    );
    if (category) {
      // Map icon names to actual Lucide React components
      const iconMap = {
        Heart,
        Briefcase,
        BookOpen,
        Activity,
        Users,
        Target,
      };
      return iconMap[category.icon] || Target;
    }
    return Target;
  };

  const getCategoryColor = (categoryName) => {
    const category = goalCategories.find(
      (c) => c.name === categoryName
    );
    return category?.color || '#6B7280';
  };

  const getCategoryData = (categoryName) => {
    return goalCategories.find((c) => c.name === categoryName);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Goal Management
          </h2>
          <p className="text-muted-foreground">
            Track your long-term goals and milestones
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCategoryManager(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Categories
          </Button>
          <Button onClick={() => setIsCreatingGoal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={
              selectedCategory === 'all' ? 'default' : 'outline'
            }
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {goalCategories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.name
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="gap-1"
              >
                <Icon className="h-3 w-3" />
                {category.name}
              </Button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            All Status
          </Button>
          {statuses.map((status) => (
            <Button
              key={status.id}
              variant={
                selectedStatus === status.id ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setSelectedStatus(status.id)}
              className="capitalize"
            >
              {status.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Goals
                </p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">
                  {goals.filter((g) => g.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold">
                  {
                    goals.filter((g) => g.status === 'completed')
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Progress
                </p>
                <p className="text-2xl font-bold">
                  {goals.length > 0
                    ? Math.round(
                        goals.reduce(
                          (acc, g) => acc + g.progress,
                          0
                        ) / goals.length
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const Icon = getCategoryIcon(goal.category);
          const categoryColor = getCategoryColor(goal.category);

          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              Icon={Icon}
              categoryColor={categoryColor}
              categoryData={getCategoryData(goal.category)}
              getStatusColor={getStatusColor}
              onEdit={() => setEditingGoal(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onUpdateMilestone={updateMilestone}
              onDeleteMilestone={deleteMilestone}
              onAddMilestone={addMilestone}
            />
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No goals found
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or create a new goal.'
                : 'Start by creating your first goal to track your progress.'}
            </p>
            <Button onClick={() => setIsCreatingGoal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Goal Modal */}
      {(isCreatingGoal || editingGoal) && (
        <GoalFormModal
          goal={editingGoal}
          categories={goalCategories}
          onSave={async (goalData) => {
            if (editingGoal) {
              await updateGoal(editingGoal.id, goalData);
            } else {
              await addGoal(goalData);
            }
            setIsCreatingGoal(false);
            setEditingGoal(null);
          }}
          onCancel={() => {
            setIsCreatingGoal(false);
            setEditingGoal(null);
          }}
        />
      )}

      {/* Category Manager */}
      {showCategoryManager && (
        <CategoryManager
          onClose={() => setShowCategoryManager(false)}
        />
      )}
    </div>
  );
};

// Goal Card Component
const GoalCard = ({
  goal,
  Icon,
  categoryColor,
  categoryData,
  getStatusColor,
  onEdit,
  onDelete,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddMilestone,
}) => {
  const [showMilestones, setShowMilestones] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');

  const completedMilestones =
    goal.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = goal.milestones?.length || 0;

  const handleAddMilestone = async () => {
    if (newMilestone.trim()) {
      await onAddMilestone({
        goal_id: goal.id,
        title: newMilestone.trim(),
        description: '',
      });
      setNewMilestone('');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: categoryColor }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(goal.status)}>
                  {goal.status}
                </Badge>
                <span className="text-sm text-muted-foreground capitalize">
                  {goal.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {goal.description && (
          <p className="text-sm text-muted-foreground">
            {goal.description}
          </p>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${goal.progress}%`,
                backgroundColor: categoryColor,
              }}
            />
          </div>
        </div>

        {/* Target Date */}
        {goal.target_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Target:{' '}
              {format(new Date(goal.target_date), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Milestones */}
        {totalMilestones > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
              className="w-full justify-between p-0"
            >
              <span className="text-sm font-medium">
                Milestones ({completedMilestones}/{totalMilestones})
              </span>
              <Clock className="h-4 w-4" />
            </Button>

            {showMilestones && (
              <div className="space-y-2 ml-4">
                {goal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-2"
                  >
                    <button
                      onClick={() =>
                        onUpdateMilestone(milestone.id, {
                          completed: !milestone.completed,
                        })
                      }
                      className="flex-shrink-0"
                    >
                      {milestone.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    <span
                      className={`text-sm ${
                        milestone.completed
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      {milestone.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteMilestone(milestone.id)}
                      className="ml-auto h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Milestone */}
        <div className="flex gap-2">
          <Input
            placeholder="Add milestone..."
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            onKeyPress={(e) =>
              e.key === 'Enter' && handleAddMilestone()
            }
            className="text-sm"
          />
          <Button size="sm" onClick={handleAddMilestone}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Goal Form Modal Component
const GoalFormModal = ({ goal, categories, onSave, onCancel }) => {
  const { generateSmartField } = useStore();
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    description: goal?.description || '',
    category: goal?.category || categories[0]?.name || 'Personal',
    target_date: goal?.target_date
      ? format(new Date(goal.target_date), 'yyyy-MM-dd')
      : '',
    specific: goal?.specific || '',
    measurable: goal?.measurable || '',
    achievable: goal?.achievable || '',
    relevant: goal?.relevant || '',
    time_bound: goal?.time_bound || '',
    is_smart: goal?.is_smart ?? true,
  });

  const [loadingField, setLoadingField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      target_date: formData.target_date
        ? new Date(formData.target_date).toISOString()
        : null,
    };
    onSave(submitData);
  };

  const handleGenerateField = async (fieldType) => {
    if (!formData.title.trim()) {
      alert('Please enter a goal title first');
      return;
    }

    setLoadingField(fieldType);
    try {
      const generated = await generateSmartField(
        formData.title,
        fieldType,
        formData.category,
        formData // Pass existing content for context
      );

      setFormData({
        ...formData,
        [fieldType]: generated,
      });
    } catch (error) {
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoadingField(null);
    }
  };

  const AIGenerateButton = ({ fieldType, size = 'sm' }) => (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={() => handleGenerateField(fieldType)}
      disabled={loadingField === fieldType || !formData.title.trim()}
      className="ml-2 flex-shrink-0"
    >
      {loadingField === fieldType ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
          AI
        </div>
      )}
      {size !== 'sm' && <span className="ml-1">Generate</span>}
    </Button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </CardTitle>
          <CardDescription>
            {formData.is_smart
              ? 'Create a SMART goal with specific criteria'
              : 'Create a simple goal'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Learn Spanish, Get good at DSA"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Description
                  </label>
                  <AIGenerateButton fieldType="description" />
                </div>
                <textarea
                  className="w-full h-20 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your goal in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Category
                  </label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Target Date
                  </label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* SMART Criteria */}
            {formData.is_smart && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">SMART Criteria</h4>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Specific
                    </label>
                    <AIGenerateButton fieldType="specific" />
                  </div>
                  <Input
                    value={formData.specific}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specific: e.target.value,
                      })
                    }
                    placeholder="What exactly do you want to achieve?"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Define exactly what will be accomplished, avoiding
                    vague terms.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Measurable
                    </label>
                    <AIGenerateButton fieldType="measurable" />
                  </div>
                  <Input
                    value={formData.measurable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        measurable: e.target.value,
                      })
                    }
                    placeholder="How will you measure progress?"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include numbers, quantities, or clear completion
                    criteria.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Achievable
                    </label>
                    <AIGenerateButton fieldType="achievable" />
                  </div>
                  <Input
                    value={formData.achievable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        achievable: e.target.value,
                      })
                    }
                    placeholder="Is this goal realistic?"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider time, resources, and skills needed.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Relevant
                    </label>
                    <AIGenerateButton fieldType="relevant" />
                  </div>
                  <Input
                    value={formData.relevant}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        relevant: e.target.value,
                      })
                    }
                    placeholder="Why is this goal important?"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Explain how this aligns with broader objectives or
                    values.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Time-bound
                    </label>
                    <AIGenerateButton fieldType="time_bound" />
                  </div>
                  <Input
                    value={formData.time_bound}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        time_bound: e.target.value,
                      })
                    }
                    placeholder="What's your timeline?"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Set specific deadlines or milestones.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                {goal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalManager;
