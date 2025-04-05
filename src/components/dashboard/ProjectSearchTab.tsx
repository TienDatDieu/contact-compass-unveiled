
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserSearchResults, { UserSearchResult } from '../UserSearchResults';
import LoadingSpinner from '../LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { searchUsersByProject } from '@/lib/supabase';

const ProjectSearchTab = () => {
  const { toast } = useToast();
  const [projectQuery, setProjectQuery] = useState<string>('Cuong Ho Project');
  const [isProjectSearching, setIsProjectSearching] = useState(false);
  const [projectResults, setProjectResults] = useState<UserSearchResult[]>([]);

  const handleProjectSearch = async () => {
    setIsProjectSearching(true);
    try {
      const users = await searchUsersByProject(projectQuery);
      setProjectResults(users || []);
    } catch (error) {
      console.error('Project search error:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search for project users',
        variant: 'destructive',
      });
    } finally {
      setIsProjectSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project User Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Project name"
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                className="h-12"
                disabled={isProjectSearching}
              />
            </div>
            <Button 
              onClick={handleProjectSearch}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700"
              disabled={isProjectSearching}
            >
              {isProjectSearching ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <span className="mr-2">🔍</span>
              )}
              Search Users
            </Button>
          </div>
        </CardContent>
      </Card>

      <UserSearchResults 
        results={projectResults}
        isLoading={isProjectSearching} 
      />
    </div>
  );
};

export default ProjectSearchTab;
