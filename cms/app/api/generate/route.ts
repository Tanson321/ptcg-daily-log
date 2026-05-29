import { NextRequest, NextResponse } from "next/server";
import { dispatchWorkflow } from "@/lib/github";

function isLegacyWorkflowInputError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("Unexpected inputs provided")
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const range = body.range;
  const date = body.date;
  const startDate = body.startDate;
  const endDate = body.endDate;

  if (!["today", "date", "week", "period"].includes(range)) {
    return NextResponse.json(
      { error: "range must be today, date, week, or period" },
      { status: 400 },
    );
  }

  if (
    range === "date" &&
    (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
  ) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  if (
    range === "week" &&
    date !== undefined &&
    date !== "" &&
    (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date))
  ) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  if (
    range === "period" &&
    (typeof startDate !== "string" ||
      typeof endDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
      endDate < startDate)
  ) {
    return NextResponse.json(
      {
        error:
          "startDate and endDate must be YYYY-MM-DD, and endDate must be on or after startDate",
      },
      { status: 400 },
    );
  }

  const inputs: Record<string, string> = { range };

  if (typeof date === "string" && date) {
    inputs.date = date;
  }

  if (typeof startDate === "string" && startDate) {
    inputs.start_date = startDate;
  }

  if (typeof endDate === "string" && endDate) {
    inputs.end_date = endDate;
  }

  let usedLegacyWorkflowFallback = false;

  try {
    await dispatchWorkflow({
      workflowId: "generate-report.yml",
      inputs,
    });
  } catch (error) {
    if (
      (range === "today" || range === "week") &&
      Object.keys(inputs).length > 1 &&
      isLegacyWorkflowInputError(error)
    ) {
      usedLegacyWorkflowFallback = true;

      await dispatchWorkflow({
        workflowId: "generate-report.yml",
        inputs: { range },
      });
    } else {
      throw error;
    }
  }

  return NextResponse.json({
    ok: true,
    range,
    date,
    startDate,
    endDate,
    usedLegacyWorkflowFallback,
  });
}
