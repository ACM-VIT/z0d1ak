import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const SUBMODULE_PATH = "z0d1ak-writeups";
const WEBHOOK_HEADER = "x-webhook-token";

function getExpectedWebhookToken() {
  return process.env.X_WEBHOOK_TOKEN;
}

function getUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const expectedToken = getExpectedWebhookToken();

  if (!expectedToken) {
    console.error("Missing X_WEBHOOK_TOKEN environment variable");

    return NextResponse.json(
      { error: "Server webhook token is not configured" },
      { status: 500 },
    );
  }

  const providedToken = request.headers.get(WEBHOOK_HEADER);

  if (!providedToken || providedToken !== expectedToken) {
    return getUnauthorizedResponse();
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      "git",
      ["submodule", "update", "--init", "--remote", SUBMODULE_PATH],
      {
        cwd: process.cwd(),
      },
    );

    const trimmedStdout = stdout.trim();
    const trimmedStderr = stderr.trim();
    const combinedOutput = [trimmedStdout, trimmedStderr]
      .filter(Boolean)
      .join("\n");

    return NextResponse.json({
      ok: true,
      message: "Submodule updated successfully",
      submodule: SUBMODULE_PATH,
      output: combinedOutput,
    });
  } catch (error) {
    console.error("Failed to update submodule", error);

    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr).trim()
        : "";
    const stdout =
      error && typeof error === "object" && "stdout" in error
        ? String(error.stdout).trim()
        : "";
    const combinedOutput = [stdout, stderr].filter(Boolean).join("\n");

    return NextResponse.json(
      {
        error: "Failed to update submodule",
        submodule: SUBMODULE_PATH,
        output: combinedOutput,
      },
      { status: 500 },
    );
  }
}
