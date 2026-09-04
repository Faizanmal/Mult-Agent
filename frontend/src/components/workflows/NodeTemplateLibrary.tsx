'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  Search,
  Star,
  Bookmark,
  Grid,
  List,
  Plus,
  Loader2
} from 'lucide-react'
import apiClient from '@/lib/api'

interface NodeTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  icon: string
  color: string
  config: Record<string, unknown>
  inputs: { id: string; name: string; type: string }[]
  outputs: { id: string; name: string; type: string }[]
  popularity: number
  rating: number
  author: string
  version: string
  isBookmarked: boolean
  isPremium?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  data_processing: 'Data Processing',
  content_generation: 'Content Generation',
  analysis: 'AI/ML',
  automation: 'Utility',
  integration: 'Integration',
  custom: 'Custom',
  'AI/ML': 'AI/ML',
  'Data Processing': 'Data Processing',
  Integration: 'Integration',
  Utility: 'Utility',
  Custom: 'Custom',
}

const CATEGORY_COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1']
const CATEGORY_ICONS = ['🧠', '✅', '🌐', '⚙️', '🔧', '📦']

const categories = ['All', 'AI/ML', 'Data Processing', 'Integration', 'Utility', 'Custom']

function unwrapList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.results)) return obj.results as Record<string, unknown>[]
    if (Array.isArray(obj.templates)) return obj.templates as Record<string, unknown>[]
    if (obj.data !== undefined) return unwrapList(obj.data)
  }
  return []
}

function mapApiTemplate(raw: Record<string, unknown>, index: number): NodeTemplate {
  const categoryKey = String(raw.category || 'custom')
  const category = CATEGORY_LABELS[categoryKey] || categoryKey
  const tags = Array.isArray(raw.tags) ? (raw.tags as string[]) : []
  const definition = (raw.workflow_definition || raw.config || {}) as Record<string, unknown>
  const nodes = Array.isArray(definition.nodes) ? definition.nodes as Record<string, unknown>[] : []
  const inputs = nodes.slice(0, 2).map((n, i) => ({
    id: String(n.id || `in-${i}`),
    name: String(n.name || n.node_type || `Input ${i + 1}`),
    type: String(n.type || 'any'),
  }))
  const outputs = nodes.slice(-2).map((n, i) => ({
    id: String(n.id || `out-${i}`),
    name: String(n.name || n.node_type || `Output ${i + 1}`),
    type: String(n.type || 'any'),
  }))

  return {
    id: String(raw.id ?? `template-${index}`),
    name: String(raw.name || 'Untitled Template'),
    description: String(raw.description || 'No description'),
    category,
    tags,
    icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    config: definition,
    inputs: inputs.length > 0 ? inputs : [{ id: 'input', name: 'Input', type: 'any' }],
    outputs: outputs.length > 0 ? outputs : [{ id: 'output', name: 'Output', type: 'any' }],
    popularity: Number(raw.usage_count ?? raw.popularity ?? 0),
    rating: Number(raw.rating ?? raw.average_rating ?? 0),
    author: String(raw.created_by_username || raw.author || 'System'),
    version: String(raw.version || '1.0.0'),
    isBookmarked: Boolean(raw.isBookmarked),
    isPremium: Boolean(raw.isPremium || raw.is_premium),
  }
}

interface NodeTemplateLibraryProps {
  onAddTemplate: (template: NodeTemplate) => void
}

const NodeTemplateLibrary: React.FC<NodeTemplateLibraryProps> = ({ onAddTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [templates, setTemplates] = useState<NodeTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadTemplates = async () => {
      setLoading(true)
      setError(null)
      try {
        const [builderRes, agentRes] = await Promise.allSettled([
          apiClient.getWorkflowTemplates(),
          apiClient.getAgentWorkflowTemplates(),
        ])

        const seen = new Set<string>()
        const mapped: NodeTemplate[] = []

        if (builderRes.status === 'fulfilled') {
          for (const raw of unwrapList(builderRes.value.data ?? builderRes.value)) {
            const tpl = mapApiTemplate(raw, mapped.length)
            if (!seen.has(tpl.id)) {
              seen.add(tpl.id)
              mapped.push(tpl)
            }
          }
        }

        if (agentRes.status === 'fulfilled') {
          for (const raw of unwrapList(agentRes.value)) {
            const tpl = mapApiTemplate(raw, mapped.length)
            if (!seen.has(tpl.id)) {
              seen.add(tpl.id)
              mapped.push(tpl)
            }
          }
        }

        if (!cancelled) setTemplates(mapped)
      } catch (err) {
        console.error('Failed to load workflow templates', err)
        if (!cancelled) {
          setError('Failed to load templates')
          setTemplates([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTemplates()
    return () => { cancelled = true }
  }, [])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => template.tags.includes(tag))
    
    const matchesBookmark = !showBookmarkedOnly || template.isBookmarked
    
    return matchesSearch && matchesCategory && matchesTags && matchesBookmark
  })

  const toggleBookmark = useCallback((templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId 
        ? { ...template, isBookmarked: !template.isBookmarked }
        : template
    ))
  }, [])

  const handleAddTemplate = useCallback((template: NodeTemplate) => {
    onAddTemplate(template)
  }, [onAddTemplate])

  const TemplateCard: React.FC<{ template: NodeTemplate }> = ({ template }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: `${template.color}20`, color: template.color }}
            >
              {template.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate flex items-center">
                {template.name}
                {template.isPremium && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Premium
                  </Badge>
                )}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                by {template.author} • v{template.version}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBookmark(template.id)}
              className="h-6 w-6 p-0"
            >
              <Bookmark 
                className={`w-3 h-3 ${template.isBookmarked ? 'fill-current text-yellow-500' : ''}`} 
              />
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => handleAddTemplate(template)}
              className="h-6 w-6 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{template.rating}</span>
            <span>•</span>
            <span>{template.popularity}%</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div>Inputs: {template.inputs.length} • Outputs: {template.outputs.length}</div>
        </div>
        
        <Button 
          size="sm" 
          className="w-full"
          onClick={() => handleAddTemplate(template)}
        >
          Add to Workflow
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-6 w-full">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={showBookmarkedOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
            >
              <Bookmark className="w-4 h-4 mr-1" />
              Bookmarked
            </Button>
            
            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-1">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button
                      onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {loading ? 'Loading…' : `${filteredTemplates.length} templates`}
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      <ScrollArea className="h-[600px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p>Loading templates…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-destructive mb-1">{error}</p>
            <p className="text-sm">Check your connection and try again</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${template.color}20`, color: template.color }}
                    >
                      {template.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-sm truncate">{template.name}</h3>
                        {template.isPremium && (
                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          ⭐ {template.rating} • {template.popularity}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleBookmark(template.id)}
                    >
                      <Bookmark 
                        className={`w-4 h-4 ${template.isBookmarked ? 'fill-current text-yellow-500' : ''}`} 
                      />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleAddTemplate(template)}
                    >
                      Add to Workflow
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">🔍</div>
            <p>{templates.length === 0 ? 'No templates available' : 'No templates found'}</p>
            <p className="text-sm">
              {templates.length === 0
                ? 'Create a workflow template to get started'
                : 'Try adjusting your search criteria'}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default NodeTemplateLibrary
