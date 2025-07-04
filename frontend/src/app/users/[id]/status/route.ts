import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export default async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get user role from cookies
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;

  // Only Admins can approve motivators
  if (userRole !== "admin") {
    return NextResponse.json(
      { success: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (status != "active" && status !== "inactive") {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }
  } catch {}

  //   // In a real app, you would update the user's status in your database
  return NextResponse.json({
    success: true,
    message: `Motivator with ID ${params.id} approved successfuly`,
  });
}
