
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface PlayerEmptyStateProps {
  hasPlayers: boolean;
  hasFilteredResults: boolean;
  onAddPlayer: () => void;
}

export const PlayerEmptyState = ({ hasPlayers, hasFilteredResults, onAddPlayer }: PlayerEmptyStateProps) => {
  if (hasFilteredResults) return null;

  return (
    <div className="text-center py-12">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasPlayers ? 'No players found' : 'No players yet'}
      </h3>
      <p className="text-gray-600 mb-4">
        {hasPlayers ? 
          'Try adjusting your search or filter criteria' : 
          'Add your first player to get started'
        }
      </p>
      {!hasPlayers && (
        <Button className="bg-purple-500 hover:bg-purple-600" onClick={onAddPlayer}>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      )}
    </div>
  );
};
