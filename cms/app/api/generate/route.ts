import { NextRequest, NextResponse } from "next/server";
import { dispatchWorkflow } from "@/lib/github";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const range = body.range;

  if (range !== "today" && range !== "week") {
    return NextResponse.json(
      { error: "range must be today or week" },
      { status: 400 },
    );
  }

  await dispatchWorkflow({
    workflowId: "generate-report.yml",
    inputs: {
      range,
    },
  });

  return NextResponse.json({
    ok: true,
    range,
  });
}
