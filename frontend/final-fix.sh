#!/bin/bash

echo "Applying final ESLint fixes..."

# Fix PluginHub - remove unused interface
sed -i '/^interface PluginInstallation {$/,/^}$/d' src/components/plugins/PluginHub.tsx

# Fix PluginMarketplace - fix useEffect dependencies
sed -i 's/  }, \[\]);/  }, [loadPlugins]);/' src/components/plugins/PluginMarketplace.tsx
sed -i 's/  }, \[searchTerm, categoryFilter, sortBy, plugins\]);/  }, [searchTerm, categoryFilter, sortBy, plugins, filterAndSortPlugins]);/' src/components/plugins/PluginMarketplace.tsx

# Fix any types in WorkflowDashboard.tsx
sed -i 's/: any\[\]/: unknown[]/g; s/: any;/: unknown;/g; s/: any)/: unknown)/g; s/<any>/<unknown>/g' src/components/workflow/WorkflowDashboard.tsx

# Fix any types in CollaborativeWorkflowSystem.tsx
sed -i 's/collaborators: any\[\]/collaborators: unknown[]/; s/config: any/config: unknown/; s/data: any/data: unknown/' src/components/workflows/CollaborativeWorkflowSystem.tsx

# Fix any types in SmartVersionControl.tsx
sed -i 's/versions: any\[\]/versions: unknown[]/' src/components/workflows/SmartVersionControl.tsx

# Fix any types in WorkflowAutomationManager.tsx
sed -i 's/automation: any/automation: unknown/; s/config: any/config: unknown/' src/components/workflows/WorkflowAutomationManager.tsx

# Fix escaped quotes in WorkflowAutomationManager.tsx
sed -i 's/"Execute Action"/"Execute Action"/g; s/"Send Email"/"Send Email"/g' src/components/workflows/WorkflowAutomationManager.tsx

# Fix any types in WorkflowBuilder.tsx
sed -i 's/setWorkflowTemplates] = useState<any\[\]>/setWorkflowTemplates] = useState<unknown[]>/; s/setScheduleConfig] = useState<any>/setScheduleConfig] = useState<unknown>/' src/components/workflows/WorkflowBuilder.tsx

# Fix any types in AuthContext.tsx
sed -i 's/Record<string, any>/Record<string, unknown>/g' src/contexts/AuthContext.tsx

# Fix any types in PWAContext.tsx
sed -i 's/: any/: unknown/g; s/<any>/<unknown>/g' src/contexts/PWAContext.tsx

# Fix any type in animations.ts
sed -i 's/easing?: any/easing?: string | number[]/' src/lib/animations.ts

# Fix AdvancedReportingDashboard.tsx any types
sed -i 's/metrics: any\[\]/metrics: unknown[]/; s/data: any\[\]/data: unknown[]/; s/config: any/config: unknown/' src/components/reporting/AdvancedReportingDashboard.tsx

echo "Final fixes applied!"
