import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;
export async function createUser(email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const alreadyExist = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (alreadyExist) {
      return { id: alreadyExist.id, email: alreadyExist.email };
    }
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return { id: user.id, email: user.email };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}
export async function GET() {
  const tasks = await prisma.task.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const task = await prisma.task.create({
    data: body,
  });
  return NextResponse.json(task);
}
