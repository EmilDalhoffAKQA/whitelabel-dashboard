"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Welcome to Your Workspace!",
    description:
      "Let's take a quick tour to help you customize your analytics dashboard.",
    target: null,
    position: "center",
  },
  {
    title: "Edit Your Layout",
    description:
      'Click "Edit layout" to start customizing. You can add, remove, and rearrange widgets.',
    target: '[data-onboarding="edit-button"]',
    position: "bottom",
  },
  {
    title: "Add Widgets",
    description:
      'Click "Add Widget" to browse available analytics widgets for your dashboard.',
    target: '[data-onboarding="add-widget-button"]',
    position: "bottom",
  },
  {
    title: "Drag to Rearrange",
    description:
      "Drag widgets to rearrange them. Create the perfect layout for your workflow.",
    target: '[data-onboarding="widget-grid"]',
    position: "top",
  },
  {
    title: "Save Your Changes",
    description:
      'Click "Save" when you\'re done. You can edit your layout anytime!',
    target: '[data-onboarding="save-button"]',
    position: "bottom",
  },
  {
    title: "Learn About Widgets",
    description:
      "Visit Dashboard Settings to learn more about each widget and their features.",
    target: '[data-onboarding="dashboard-settings"]',
    position: "right",
  },
];

interface OnboardingProps {
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export default function DashboardOnboarding({
  isActive,
  currentStep,
  onNext,
  onPrev,
  onComplete,
  onSkip,
}: OnboardingProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [arrowPosition, setArrowPosition] = useState<{
    side: "top" | "bottom" | "left" | "right";
    offset: number;
  } | null>(null);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  useEffect(() => {
    if (!isActive || !step.target) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(step.target as string);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Calculate tooltip position with smart boundary detection
      const TOOLTIP_HEIGHT = 320; // Approximate tooltip height
      const TOOLTIP_WIDTH = 448; // max-w-md = 28rem = 448px
      const MARGIN = 20;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = 0;
      let left = rect.left;

      if (step.position === "bottom") {
        // Try placing below the element
        const spaceBelow = viewportHeight - rect.bottom;
        if (spaceBelow >= TOOLTIP_HEIGHT + MARGIN) {
          top = rect.bottom + MARGIN;
        } else {
          // Not enough space below, place above
          top = rect.top - TOOLTIP_HEIGHT - MARGIN;
        }
      } else if (step.position === "top") {
        // Try placing above the element
        const spaceAbove = rect.top;
        if (spaceAbove >= TOOLTIP_HEIGHT + MARGIN) {
          top = rect.top - TOOLTIP_HEIGHT - MARGIN;
        } else {
          // Not enough space above, place below
          top = rect.bottom + MARGIN;
        }
      } else if (step.position === "right") {
        // Place to the right of the element
        left = rect.right + MARGIN;
        top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2;

        // If not enough space on right, place on left
        if (left + TOOLTIP_WIDTH > viewportWidth - MARGIN) {
          left = rect.left - TOOLTIP_WIDTH - MARGIN;
        }
      }

      // Ensure tooltip doesn't go off screen vertically
      if (top < MARGIN) {
        top = MARGIN;
      } else if (top + TOOLTIP_HEIGHT > viewportHeight - MARGIN) {
        top = viewportHeight - TOOLTIP_HEIGHT - MARGIN;
      }

      // Ensure tooltip doesn't go off screen horizontally
      if (left + TOOLTIP_WIDTH > viewportWidth - MARGIN) {
        left = viewportWidth - TOOLTIP_WIDTH - MARGIN;
      }
      if (left < MARGIN) {
        left = MARGIN;
      }

      // Calculate arrow position to point at the target element
      let arrowSide: "top" | "bottom" | "left" | "right" = "top";
      let arrowOffset = 0;

      if (step.position === "right" || left > rect.right) {
        // Arrow on the left side of tooltip pointing to the element
        arrowSide = "left";
        arrowOffset = Math.max(
          MARGIN,
          Math.min(rect.top + rect.height / 2 - top, TOOLTIP_HEIGHT - MARGIN)
        );
      } else {
        // Arrow on top or bottom
        arrowSide = top > rect.bottom ? "top" : "bottom";
        arrowOffset = Math.max(
          MARGIN,
          Math.min(rect.left + rect.width / 2 - left, TOOLTIP_WIDTH - MARGIN)
        );
      }

      setTooltipPos({ top, left });
      setArrowPosition({ side: arrowSide, offset: arrowOffset });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isActive, step, currentStep]);

  if (!isActive) return null;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={onSkip} />

      {/* Spotlight on target element - creates a bright cutout */}
      {targetRect && (
        <>
          {/* White overlay on the target element itself to brighten it */}
          <div
            className="fixed z-[9998] pointer-events-none rounded-lg"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              backdropFilter: "brightness(1.5) contrast(1.1)",
            }}
          />
          {/* Dark overlay cutout with border */}
          <div
            className="fixed z-[9999] pointer-events-none rounded-lg"
            style={{
              top: `${targetRect.top - 4}px`,
              left: `${targetRect.left - 4}px`,
              width: `${targetRect.width + 8}px`,
              height: `${targetRect.height + 8}px`,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.4)",
              border: "3px solid rgb(59, 130, 246)",
            }}
          />
        </>
      )}

      {/* Tooltip Card */}
      <div
        className={`fixed z-[10000] ${
          step.position === "center"
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : ""
        }`}
        style={step.position !== "center" && tooltipPos ? tooltipPos : {}}
      >
        <Card className="max-w-md shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSkip}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            <div className="relative h-2.5 bg-secondary rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-black transition-all duration-500 ease-out relative shadow-sm"
                style={{
                  width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                }}
              ></div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onSkip}>
                  Skip
                </Button>
                <Button size="sm" onClick={handleNext}>
                  {isLast ? "Finish" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
