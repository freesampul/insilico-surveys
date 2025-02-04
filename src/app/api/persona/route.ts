import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const big5Path = path.join(process.cwd(), "data/big5.csv");
console.log("Resolved path:", big5Path);

export async function GET() {
  try {
    const fileContent = fs.readFileSync(big5Path, "utf-8");
    const big5Data = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    }).data;

    return NextResponse.json(big5Data);
  } catch (err) {
    console.error("Error reading big5.csv:", err);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}