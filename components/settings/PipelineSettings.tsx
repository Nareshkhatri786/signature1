import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { PipelineStage } from './SettingsConstants';

interface PipelineSettingsProps {
  pipelineStages: PipelineStage[];
  onAddStage: () => void;
  onEditStage: (stage: PipelineStage) => void;
  onDeleteStage: (stageId: string) => void;
}

export default function PipelineSettings({ 
  pipelineStages, 
  onAddStage, 
  onEditStage, 
  onDeleteStage 
}: PipelineSettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Lead Pipeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lead Pipeline Stages</CardTitle>
            <p className="text-muted-foreground">Manage stages for lead progression</p>
          </div>
          <Button onClick={onAddStage}>
            Add Stage
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelineStages
              .filter(stage => stage.type === 'leads')
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
              <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium">{stage.name}</span>
                  <Badge variant={stage.active ? 'default' : 'secondary'}>
                    {stage.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditStage(stage)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteStage(stage.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opportunity Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Pipeline Stages</CardTitle>
          <p className="text-muted-foreground">Manage stages for opportunity progression</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelineStages
              .filter(stage => stage.type === 'opportunities')
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
              <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-medium">{stage.name}</span>
                  <Badge variant={stage.active ? 'default' : 'secondary'}>
                    {stage.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditStage(stage)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteStage(stage.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}