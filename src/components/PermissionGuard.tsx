
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Layout } from '@/components/Layout';

interface PermissionGuardProps {
  children: React.ReactNode;
  page: string;
}

export const PermissionGuard = ({ children, page }: PermissionGuardProps) => {
  const { checkPermission } = useAuth();

  if (!checkPermission(page)) {
    return (
      <Layout>
        <div className="min-h-96 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">Please contact admin for getting access to this page.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
};
