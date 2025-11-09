#!/bin/bash

# Fix unused imports in PluginHub.tsx
sed -i '/^  Upload,$/d; /^  Eye,$/d; /^  EyeOff,$/d; /^  Play,$/d; /^  Pause,$/d; /^  Filter,$/d' src/components/plugins/PluginHub.tsx

# Fix unused imports in PluginMarketplace.tsx
sed -i '/^  Filter,$/d' src/components/plugins/PluginMarketplace.tsx

# Fix unused imports in AdvancedReportingDashboard.tsx
sed -i '/^  Separator,$/d; /^  Input,$/d; /^  Calendar,$/d; /^  TrendingDown,$/d; /^  Activity,$/d; /^  Users,$/d; /^  DollarSign,$/d; /^  Target,$/d; /^  Zap,$/d; /^  Brain,$/d; /^  Database,$/d; /^  Globe,$/d; /^  Table,$/d; /^  AlertTriangle,$/d; /^  CheckCircle2,$/d; /^  Mail,$/d; /^  Printer,$/d; /^  Upload,$/d' src/components/reporting/AdvancedReportingDashboard.tsx

# Fix unused imports in TaskManager.tsx
sed -i 's/import React, { useState, useEffect }/import React, { useState }/; /^  Tabs,$/d; /^  TabsContent,$/d; /^  TabsList,$/d; /^  TabsTrigger,$/d; /^  Input,$/d; /^  Textarea,$/d; /^  Filter,$/d; /^  Calendar,$/d' src/components/tasks/TaskManager.tsx

# Fix unused imports in animated-card.tsx
sed -i '/^  cardHover,$/d' src/components/ui/animated-card.tsx

# Fix unused imports in modern-button.tsx
sed -i '/ArrowRight,$/d; /Download,$/d' src/components/ui/modern-button.tsx

# Fix unused imports in WorkflowDashboard.tsx  
sed -i '/^  Select,$/d; /^  SelectContent,$/d; /^  SelectItem,$/d; /^  SelectTrigger,$/d; /^  SelectValue,$/d; /^  Pause,$/d' src/components/workflow/WorkflowDashboard.tsx

# Fix unused imports in CollaborativeWorkflowSystem.tsx
sed -i '/^  GitBranch,$/d; /^  Clock,$/d; /^  Eye,$/d; /^  Edit,$/d; /^  Bell,$/d; /^  Star,$/d' src/components/workflows/CollaborativeWorkflowSystem.tsx

# Fix unused imports in SmartVersionControl.tsx  
sed -i '/^  ScrollArea,$/d; /^  History,$/d; /^  ArrowDown,$/d; /^  Share,$/d; /^  AlertTriangle,$/d; /^  CheckCircle,$/d; /^  Archive,$/d' src/components/workflows/SmartVersionControl.tsx

# Fix unused imports in WorkflowAutomationManager.tsx
sed -i '/^  PauseCircle,$/d; /^  RotateCcw,$/d' src/components/workflows/WorkflowAutomationManager.tsx

# Fix unused imports in WorkflowBuilder.tsx
sed -i '/^  Copy,$/d; /^  Download,$/d; /^  Upload,$/d; /^  Clock,$/d; /^  Database,$/d; /^  Bell,$/d; /^  MoreHorizontal,$/d; /^  Eye,$/d; /^  EyeOff,$/d; /^  Sparkles,$/d' src/components/workflows/WorkflowBuilder.tsx

# Fix unused imports in usePlugins.ts
sed -i 's/import { useState, useEffect }/import { }/' src/hooks/usePlugins.ts

echo "Fixes applied!"
