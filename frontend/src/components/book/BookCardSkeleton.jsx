import React from 'react';

export default function BookCardSkeleton() {
  return (
    <div className="bg-bg-surface rounded-2xl p-3 border border-border/80 shadow-soft animate-pulse flex flex-col h-full">
      {/* Cover Skeleton */}
      <div className="aspect-[2/3] w-full mb-3 rounded-xl bg-bg-muted" />

      {/* Content Skeleton */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-3 w-1/3 bg-bg-muted rounded-full mb-2" />
          <div className="h-4 w-full bg-bg-muted rounded mb-1" />
          <div className="h-4 w-3/4 bg-bg-muted rounded mb-2" />
          <div className="h-3 w-1/2 bg-bg-muted rounded" />
        </div>
        <div className="h-8 w-full bg-bg-muted rounded mt-3" />
      </div>
    </div>
  );
}
