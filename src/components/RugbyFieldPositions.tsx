
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RugbyFieldPositionsProps {
  onPositionSelect: (position: string) => void;
  selectedPosition: string;
}

const fieldPositions = [
  // Try lines
  { id: 'TL1', name: 'Try Line 1', x: 5, y: 20, label: 'Try Line Left' },
  { id: 'TL2', name: 'Try Line 2', x: 5, y: 50, label: 'Try Line Center' },
  { id: 'TL3', name: 'Try Line 3', x: 5, y: 80, label: 'Try Line Right' },
  
  // 5m lines
  { id: '5L1', name: '5m Line 1', x: 15, y: 20, label: '5m Line Left' },
  { id: '5L2', name: '5m Line 2', x: 15, y: 50, label: '5m Line Center' },
  { id: '5L3', name: '5m Line 3', x: 15, y: 80, label: '5m Line Right' },
  
  // 22m lines
  { id: '22L1', name: '22m Line 1', x: 25, y: 20, label: '22m Line Left' },
  { id: '22L2', name: '22m Line 2', x: 25, y: 50, label: '22m Line Center' },
  { id: '22L3', name: '22m Line 3', x: 25, y: 80, label: '22m Line Right' },
  
  // 10m lines
  { id: '10L1', name: '10m Line 1', x: 35, y: 20, label: '10m Line Left' },
  { id: '10L2', name: '10m Line 2', x: 35, y: 50, label: '10m Line Center' },
  { id: '10L3', name: '10m Line 3', x: 35, y: 80, label: '10m Line Right' },
  
  // Halfway line
  { id: 'HL1', name: 'Halfway 1', x: 50, y: 20, label: 'Halfway Left' },
  { id: 'HL2', name: 'Halfway 2', x: 50, y: 50, label: 'Halfway Center' },
  { id: 'HL3', name: 'Halfway 3', x: 50, y: 80, label: 'Halfway Right' },
  
  // Right side 10m lines
  { id: '10R1', name: '10m Line 4', x: 65, y: 20, label: '10m Line Left (Right Side)' },
  { id: '10R2', name: '10m Line 5', x: 65, y: 50, label: '10m Line Center (Right Side)' },
  { id: '10R3', name: '10m Line 6', x: 65, y: 80, label: '10m Line Right (Right Side)' },
  
  // Right side 22m lines
  { id: '22R1', name: '22m Line 4', x: 75, y: 20, label: '22m Line Left (Right Side)' },
  { id: '22R2', name: '22m Line 5', x: 75, y: 50, label: '22m Line Center (Right Side)' },
  { id: '22R3', name: '22m Line 6', x: 75, y: 80, label: '22m Line Right (Right Side)' },
  
  // Right side 5m lines
  { id: '5R1', name: '5m Line 4', x: 85, y: 20, label: '5m Line Left (Right Side)' },
  { id: '5R2', name: '5m Line 5', x: 85, y: 50, label: '5m Line Center (Right Side)' },
  { id: '5R3', name: '5m Line 6', x: 85, y: 80, label: '5m Line Right (Right Side)' },
  
  // Right try lines
  { id: 'TR1', name: 'Try Line 4', x: 95, y: 20, label: 'Try Line Left (Right Side)' },
  { id: 'TR2', name: 'Try Line 5', x: 95, y: 50, label: 'Try Line Center (Right Side)' },
  { id: 'TR3', name: 'Try Line 6', x: 95, y: 80, label: 'Try Line Right (Right Side)' },
];

export const RugbyFieldPositions = ({ onPositionSelect, selectedPosition }: RugbyFieldPositionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rugby Field Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-green-100 p-6 rounded-lg relative">
          {/* Rugby Field */}
          <div className="relative h-64 bg-green-200 rounded border-4 border-white overflow-hidden">
            {/* Field markings - vertical lines */}
            <div className="absolute inset-y-0 left-[5%] w-px bg-white opacity-80"></div>
            <div className="absolute inset-y-0 left-[15%] w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 left-[25%] w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 left-[35%] w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 left-1/2 w-px bg-white border-2"></div>
            <div className="absolute inset-y-0 right-[35%] w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 right-[25%] w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 right-[15%] w-px bg-white opacity-60"></div>
            <div className="absolute inset-y-0 right-[5%] w-px bg-white opacity-80"></div>
            
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-white rounded-full"></div>
            
            {/* Position buttons on the field */}
            {fieldPositions.map((position) => (
              <Button
                key={position.id}
                variant={selectedPosition === position.name ? "default" : "outline"}
                size="sm"
                onClick={() => onPositionSelect(position.name)}
                className="absolute text-xs px-1 py-0.5 h-6 min-w-0 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                title={position.label}
              >
                {position.id.replace(/\d+$/, '')}
              </Button>
            ))}
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
