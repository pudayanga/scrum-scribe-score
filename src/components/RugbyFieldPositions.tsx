
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RugbyFieldPositionsProps {
  onPositionSelect: (position: string) => void;
  selectedPosition: string;
}

const fieldPositions = [
  // Left side positions
  { id: 'L1', name: 'L1', label: 'Left Try Line' },
  { id: 'L2', name: 'L2', label: 'Left 5m Line' },
  { id: 'L3', name: 'L3', label: 'Left 22m Line' },
  { id: 'L4', name: 'L4', label: 'Left 10m Line' },
  { id: 'L5', name: 'L5', label: 'Left Halfway' },
  { id: 'L6', name: 'L6', label: 'Left 10m Line' },
  { id: 'L7', name: 'L7', label: 'Left 22m Line' },
  { id: 'L8', name: 'L8', label: 'Left Try Line' },
  // Right side positions
  { id: 'R1', name: 'R1', label: 'Right Try Line' },
  { id: 'R2', name: 'R2', label: 'Right 5m Line' },
  { id: 'R3', name: 'R3', label: 'Right 22m Line' },
  { id: 'R4', name: 'R4', label: 'Right 10m Line' },
  { id: 'R5', name: 'R5', label: 'Right Halfway' },
  { id: 'R6', name: 'R6', label: 'Right 10m Line' },
  { id: 'R7', name: 'R7', label: 'Right 22m Line' },
  { id: 'R8', name: 'R8', label: 'Right Try Line' },
];

export const RugbyFieldPositions = ({ onPositionSelect, selectedPosition }: RugbyFieldPositionsProps) => {
  const leftPositions = fieldPositions.slice(0, 8);
  const rightPositions = fieldPositions.slice(8, 16);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rugby Field Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-100 p-6 rounded-lg relative">
          {/* Field lines representation */}
          <div className="relative h-40 bg-green-200 rounded border-2 border-white">
            {/* Field markings */}
            <div className="absolute inset-y-0 left-0 w-px bg-white"></div>
            <div className="absolute inset-y-0 left-1/8 w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 left-1/4 w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 left-3/8 w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 left-1/2 w-px bg-white border-2"></div>
            <div className="absolute inset-y-0 right-3/8 w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 right-1/4 w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 right-1/8 w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 right-0 w-px bg-white"></div>
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white rounded-full"></div>
          </div>
          
          {/* Position buttons */}
          <div className="grid grid-cols-2 gap-8 mt-6">
            {/* Left side */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-center">Left Side</h4>
              <div className="grid grid-cols-4 gap-2">
                {leftPositions.map((position) => (
                  <Button
                    key={position.id}
                    variant={selectedPosition === position.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPositionSelect(position.name)}
                    className="text-xs"
                    title={position.label}
                  >
                    {position.name}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Right side */}
            <div>
              <h4 className="text-sm font-medium mb-3 text-center">Right Side</h4>
              <div className="grid grid-cols-4 gap-2">
                {rightPositions.map((position) => (
                  <Button
                    key={position.id}
                    variant={selectedPosition === position.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPositionSelect(position.name)}
                    className="text-xs"
                    title={position.label}
                  >
                    {position.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {selectedPosition && (
            <div className="mt-4 p-2 bg-blue-100 rounded text-center">
              <span className="text-sm font-medium">Selected Position: {selectedPosition}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
