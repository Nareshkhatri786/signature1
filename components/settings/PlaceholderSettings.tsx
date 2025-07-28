import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { LucideIcon } from 'lucide-react';

interface PlaceholderSettingsProps {
  title: string;
  description: string;
  icon: LucideIcon;
  message: string;
}

export default function PlaceholderSettings({ title, description, icon: Icon, message }: PlaceholderSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Icon className="h-4 w-4" />
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}