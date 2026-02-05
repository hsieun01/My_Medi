"use client";

import { Pill, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardEmptyStateProps {
  onAddClick: () => void;
}

export function DashboardEmptyState({ onAddClick }: DashboardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
        <Pill className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        아직 등록된 약이 없어요
      </h2>
      <p className="text-muted-foreground mb-6">
        첫 복용 약을 추가해보세요!
      </p>
      <Button
        onClick={onAddClick}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        약 추가하기
      </Button>
    </div>
  );
}

