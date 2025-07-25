import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Palette,
  Shield,
  AlertTriangle,
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
import useStore from '../stores/useStore';

// Available Lucide React icons for categories
const AVAILABLE_ICONS = [
  'Target',
  'Heart',
  'Briefcase',
  'BookOpen',
  'Activity',
  'Users',
  'Home',
  'Car',
  'Music',
  'Camera',
  'Coffee',
  'Gamepad2',
  'Plane',
  'DollarSign',
  'Code',
  'Dumbbell',
  'PaintBrush',
  'Utensils',
];

// Preset colors
const PRESET_COLORS = [
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#F59E0B', // amber-500
  '#EAB308', // yellow-500
  '#84CC16', // lime-500
  '#22C55E', // green-500
  '#10B981', // emerald-500
  '#14B8A6', // teal-500
  '#06B6D4', // cyan-500
  '#0EA5E9', // sky-500
  '#3B82F6', // blue-500
  '#6366F1', // indigo-500
  '#8B5CF6', // violet-500
  '#A855F7', // purple-500
  '#D946EF', // fuchsia-500
  '#EC4899', // pink-500
];

const CategoryManager = ({ onClose }) => {
  const {
    goalCategories,
    addGoalCategory,
    updateGoalCategory,
    deleteGoalCategory,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleCreateCategory = async (categoryData) => {
    try {
      await addGoalCategory(categoryData);
      setIsCreating(false);
    } catch (error) {
      alert(error.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      await updateGoalCategory(categoryId, categoryData);
      setEditingCategory(null);
    } catch (error) {
      alert(error.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteGoalCategory(categoryId);
      setDeleteConfirm(null);
    } catch (error) {
      alert(error.message || 'Failed to delete category');
    }
  };

  const defaultCategories = goalCategories.filter(
    (cat) => cat.is_default
  );
  const customCategories = goalCategories.filter(
    (cat) => !cat.is_default
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manage Goal Categories
              </CardTitle>
              <CardDescription>
                Create, edit, and organize your goal categories
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Create New Category */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Categories</h3>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            {/* Default Categories */}
            {defaultCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Default Categories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {defaultCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => setEditingCategory(category)}
                      onDelete={null} // Can't delete default categories
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Custom Categories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={() => setEditingCategory(category)}
                      onDelete={() => setDeleteConfirm(category)}
                    />
                  ))}
                </div>
              </div>
            )}

            {customCategories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No custom categories yet.</p>
                <p className="text-sm">
                  Create your first custom category to get started.
                </p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Create/Edit Category Modal */}
        {(isCreating || editingCategory) && (
          <CategoryFormModal
            category={editingCategory}
            onSave={
              isCreating
                ? handleCreateCategory
                : (data) =>
                    handleUpdateCategory(editingCategory.id, data)
            }
            onCancel={() => {
              setIsCreating(false);
              setEditingCategory(null);
            }}
          />
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <DeleteConfirmModal
            category={deleteConfirm}
            onConfirm={() => handleDeleteCategory(deleteConfirm.id)}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </Card>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, onEdit, onDelete }) => {
  // Dynamically import the icon
  const getIcon = (iconName) => {
    try {
      const iconMap = {
        Target: '🎯',
        Heart: '❤️',
        Briefcase: '💼',
        BookOpen: '📖',
        Activity: '⚡',
        Users: '👥',
        Home: '🏠',
        Car: '🚗',
        Music: '🎵',
        Camera: '📷',
        Coffee: '☕',
        Gamepad2: '🎮',
        Plane: '✈️',
        DollarSign: '💰',
        Code: '💻',
        Dumbbell: '🏋️',
        PaintBrush: '🎨',
        Utensils: '🍽️',
      };
      return iconMap[iconName] || '🎯';
    } catch {
      return '🎯';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
              style={{ backgroundColor: category.color }}
            >
              {getIcon(category.icon)}
            </div>
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
              {category.is_default && (
                <Badge variant="secondary" className="text-xs mt-1">
                  <Shield className="mr-1 h-3 w-3" />
                  Default
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Category Form Modal
const CategoryFormModal = ({ category, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'Target',
    color: category?.color || '#3B82F6',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const getIconEmoji = (iconName) => {
    const iconMap = {
      Target: '🎯',
      Heart: '❤️',
      Briefcase: '💼',
      BookOpen: '📖',
      Activity: '⚡',
      Users: '👥',
      Home: '🏠',
      Car: '🚗',
      Music: '🎵',
      Camera: '📷',
      Coffee: '☕',
      Gamepad2: '🎮',
      Plane: '✈️',
      DollarSign: '💰',
      Code: '💻',
      Dumbbell: '🏋️',
      PaintBrush: '🎨',
      Utensils: '🍽️',
    };
    return iconMap[iconName] || '🎯';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </CardTitle>
          <CardDescription>
            {category?.is_default
              ? 'You can edit the name and description of default categories'
              : 'Create a custom category for your goals'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Travel, Cooking, Finance"
                required
                disabled={category?.is_default}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Description
              </label>
              <textarea
                className="w-full h-20 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background text-sm"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                placeholder="Describe what goals fit in this category..."
              />
            </div>

            {!category?.is_default && (
              <>
                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, icon: iconName })
                        }
                        className={`p-2 rounded border text-lg hover:bg-accent ${
                          formData.icon === iconName
                            ? 'border-primary bg-accent'
                            : ''
                        }`}
                      >
                        {getIconEmoji(iconName)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color })
                        }
                        className={`w-8 h-8 rounded border-2 ${
                          formData.color === color
                            ? 'border-foreground'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        color: e.target.value,
                      })
                    }
                    className="w-full mt-2"
                  />
                </div>
              </>
            )}

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: formData.color }}
                >
                  {getIconEmoji(formData.icon)}
                </div>
                <div>
                  <div className="font-medium">
                    {formData.name || 'Category Name'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formData.description || 'Category description'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                {category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ category, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Category
          </CardTitle>
          <CardDescription>
            Are you sure you want to delete the "{category.name}"
            category?
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Warning:</strong> This action cannot be
                undone. Make sure no goals are using this category.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirm}>
                Delete Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
