
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Building, Mail } from 'lucide-react';

export interface UserSearchResult {
  name: string;
  email: string;
  company: string | null;
}

interface UserSearchResultsProps {
  results: UserSearchResult[];
  isLoading?: boolean;
}

const UserSearchResults = ({ results, isLoading = false }: UserSearchResultsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center py-8 text-muted-foreground">
            No users found for this project
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><User className="mr-2 inline-block" size={16} />Name</TableHead>
              <TableHead><Mail className="mr-2 inline-block" size={16} />Email</TableHead>
              <TableHead><Building className="mr-2 inline-block" size={16} />Company</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((user, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.company || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserSearchResults;
