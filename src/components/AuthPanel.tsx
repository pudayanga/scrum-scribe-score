
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AuthPanelProps {
  onLogin: (user: { role: 'coach' | 'viewer' | 'admin'; teamId?: string }) => void;
}

export const AuthPanel = ({ onLogin }: AuthPanelProps) => {
  const [selectedRole, setSelectedRole] = useState<'coach' | 'viewer' | 'admin'>('viewer');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const handleLogin = () => {
    onLogin({
      role: selectedRole,
      teamId: selectedRole === 'coach' ? selectedTeam : undefined
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Rugby Scoring System</CardTitle>
          <CardDescription>Select your role to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select value={selectedRole} onValueChange={(value: 'coach' | 'viewer' | 'admin') => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === 'coach' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Dragons</SelectItem>
                  <SelectItem value="team2">Lions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            onClick={handleLogin} 
            className="w-full"
            disabled={selectedRole === 'coach' && !selectedTeam}
          >
            Enter Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
