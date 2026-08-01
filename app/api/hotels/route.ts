import { NextResponse } from "next/server";

export async function GET() {
  const hotels = [
    {
      id: "local-1",
      name: "Taj Mahal Palace",
      location: "Mumbai",
      category: "Luxury",
      rating: 4.9,
      price: 12000,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Spa", "Concierge"],
      img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
    },
    {
      id: "local-2",
      name: "Leela Palace",
      location: "Delhi",
      category: "Luxury",
      rating: 4.8,
      price: 9500,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Gym"],
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
    },
    {
      id: "local-3",
      name: "Goa Beach Resort",
      location: "Goa",
      category: "Beach",
      rating: 4.5,
      price: 5500,
      amenities: ["Free WiFi", "Beach Access", "Pool", "Bar"],
      img: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800"
    },
    {
      id: "local-4",
      name: "The Oberoi Amarvilas",
      location: "Agra",
      category: "Heritage",
      rating: 4.9,
      price: 18000,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Spa", "Taj View"],
      img: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"
    },
    {
      id: "local-5",
      name: "Wildflower Hall",
      location: "Shimla",
      category: "Mountain",
      rating: 4.7,
      price: 8000,
      amenities: ["Free WiFi", "Spa", "Breakfast", "Trekking"],
      img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    },
    {
      id: "local-6",
      name: "Umaid Bhawan Palace",
      location: "Jodhpur",
      category: "Heritage",
      rating: 4.8,
      price: 15000,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Museum", "Spa"],
      img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800"
    },
    {
      id: "local-7",
      name: "Zuri Kumarakom",
      location: "Kerala",
      category: "Beach",
      rating: 4.6,
      price: 7000,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Ayurveda", "Backwaters"],
      img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800"
    },
    {
      id: "local-8",
      name: "The LaLiT Resort",
      location: "Manali",
      category: "Mountain",
      rating: 4.4,
      price: 6000,
      amenities: ["Free WiFi", "Fireplace", "Breakfast", "Skiing"],
      img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"
    },
    {
      id: "local-9",
      name: "ITC Grand Chola",
      location: "Chennai",
      category: "Luxury",
      rating: 4.7,
      price: 8500,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Gym", "Spa"],
      img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    },
    {
      id: "local-10",
      name: "Alila Fort Bishangarh",
      location: "Jaipur",
      category: "Heritage",
      rating: 4.8,
      price: 14000,
      amenities: ["Free WiFi", "Pool", "Breakfast", "Fort View", "Spa"],
      img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800"
    }
  ];

  return NextResponse.json(hotels);
}