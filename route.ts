import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    {
      id: "1",
      name: "Taj Hotel",
      location: "Mumbai",
      price: 5000,
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    },
    {
      id: "2",
      name: "Leela Palace",
      location: "Delhi",
      price: 6500,
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
    },
    {
      id: "3",
      name: "Beach Resort",
      location: "Goa",
      price: 4000,
      img: "https://images.unsplash.com/photo-1505691938895-1758d7feb511"
    }
  ]);
}