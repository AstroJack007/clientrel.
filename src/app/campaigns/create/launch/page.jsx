import { Suspense } from 'react';
import LaunchForm from './LaunchForm';

export default function LaunchPage() {
  return (
    <Suspense fallback={<div>Loading campaign details...</div>}>
      <LaunchForm />
    </Suspense>
  );
}