import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';
import type { IReactChildren } from '@/shared/types';

const MyErrorBoundary = ({ children }: IReactChildren) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(...errors) => {
        console.log({ errors });
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default MyErrorBoundary;
