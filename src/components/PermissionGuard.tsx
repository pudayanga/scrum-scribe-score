
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

interface PermissionGuardProps {
  children: React.ReactNode;
  page: string;
}

export const PermissionGuard = ({ children, page }: PermissionGuardProps) => {
  const { checkPermission } = useAuth();

  if (!checkPermission(page)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please contact admin to get permission for this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
