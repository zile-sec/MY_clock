"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { CategoryBadge } from "./category-badge"

interface Category {
  id: string
  name: string
  color: string
}

interface CategoryManagerProps {
  categories: Category[]
  onAddCategory: (category: Omit<Category, "id">) => void
  onDeleteCategory: (id: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Predefined colors for categories - updated with more blue tones
const CATEGORY_COLORS = [
  "#3B82F6", // Blue (primary)
  "#2563EB", // Royal Blue
  "#1D4ED8", // Darker Blue
  "#4F46E5", // Indigo
  "#6366F1", // Lighter Indigo
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#0EA5E9", // Sky Blue
]

export function CategoryManager({
  categories,
  onAddCategory,
  onDeleteCategory,
  open,
  onOpenChange,
}: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0])

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return

    onAddCategory({
      name: newCategoryName,
      color: selectedColor,
    })

    setNewCategoryName("")
    // Select a different color for the next category
    const currentIndex = CATEGORY_COLORS.indexOf(selectedColor)
    const nextIndex = (currentIndex + 1) % CATEGORY_COLORS.length
    setSelectedColor(CATEGORY_COLORS[nextIndex])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="category-name">New Category</Label>
            <div className="flex gap-2">
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="bg-background border-input"
              />
              <Button onClick={handleAddCategory} size="icon">
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full ${selectedColor === color ? "ring-2 ring-foreground" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2 mt-4">
            <Label>Existing Categories</Label>
            {categories.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <CategoryBadge name={category.name} color={category.color} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCategory(category.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No categories yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
