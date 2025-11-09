'use client'

import React, { useState, useCallback } from 'react'
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
  Plus
} from 'lucide-react'

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

const mockTemplates: NodeTemplate[] = [
  {
    id: 'smart-text-analyzer',
    name: 'Smart Text Analyzer',
    description: 'Analyzes text sentiment, entities, and key phrases using multiple AI models',
    category: 'AI/ML',
    tags: ['nlp', 'sentiment', 'entities', 'ai'],
    icon: '🧠',
    color: '#8b5cf6',
    config: {
      models: ['openai', 'huggingface'],
      analysisTypes: ['sentiment', 'entities', 'keywords'],
      confidence_threshold: 0.8
    },
    inputs: [
      { id: 'text', name: 'Text Input', type: 'string' },
      { id: 'language', name: 'Language Code', type: 'string' }
    ],
    outputs: [
      { id: 'sentiment', name: 'Sentiment Score', type: 'number' },
      { id: 'entities', name: 'Named Entities', type: 'array' },
      { id: 'keywords', name: 'Key Phrases', type: 'array' }
    ],
    popularity: 95,
    rating: 4.8,
    author: 'AI Labs',
    version: '2.1.0',
    isBookmarked: true
  },
  {
    id: 'data-validator',
    name: 'Advanced Data Validator',
    description: 'Validates data against custom schemas with detailed error reporting',
    category: 'Data Processing',
    tags: ['validation', 'schema', 'data-quality'],
    icon: '✅',
    color: '#10b981',
    config: {
      schema_type: 'json',
      strict_validation: true,
      error_collection: true
    },
    inputs: [
      { id: 'data', name: 'Data to Validate', type: 'object' },
      { id: 'schema', name: 'Validation Schema', type: 'object' }
    ],
    outputs: [
      { id: 'isValid', name: 'Validation Result', type: 'boolean' },
      { id: 'errors', name: 'Validation Errors', type: 'array' },
      { id: 'cleaned_data', name: 'Cleaned Data', type: 'object' }
    ],
    popularity: 87,
    rating: 4.6,
    author: 'DataFlow Team',
    version: '1.5.2',
    isBookmarked: false
  },
  {
    id: 'multi-api-aggregator',
    name: 'Multi-API Aggregator',
    description: 'Calls multiple APIs in parallel and aggregates responses intelligently',
    category: 'Integration',
    tags: ['api', 'parallel', 'aggregation', 'integration'],
    icon: '🌐',
    color: '#3b82f6',
    config: {
      max_concurrent: 5,
      timeout: 30000,
      retry_policy: 'exponential',
      response_format: 'unified'
    },
    inputs: [
      { id: 'endpoints', name: 'API Endpoints', type: 'array' },
      { id: 'headers', name: 'Request Headers', type: 'object' }
    ],
    outputs: [
      { id: 'aggregated_data', name: 'Combined Response', type: 'object' },
      { id: 'individual_responses', name: 'Individual Results', type: 'array' },
      { id: 'performance_metrics', name: 'Performance Data', type: 'object' }
    ],
    popularity: 72,
    rating: 4.4,
    author: 'Integration Hub',
    version: '3.0.1',
    isBookmarked: false,
    isPremium: true
  }
]

const categories = ['All', 'AI/ML', 'Data Processing', 'Integration', 'Utility', 'Custom']

interface NodeTemplateLibraryProps {
  onAddTemplate: (template: NodeTemplate) => void
}

const NodeTemplateLibrary: React.FC<NodeTemplateLibraryProps> = ({ onAddTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false)
  const [templates, setTemplates] = useState(mockTemplates)

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

  // Get all unique tags from templates if needed for future tag selector

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
            {filteredTemplates.length} templates
          </div>
        </div>
      </div>

      {/* Templates Grid/List */}
      <ScrollArea className="h-[600px]">
        {viewMode === 'grid' ? (
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
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-4xl mb-2">🔍</div>
            <p>No templates found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default NodeTemplateLibrary