import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const msg = message.toLowerCase();

  let reply = "";

  if (msg.includes("goa") || msg.includes("beach")) {
    reply = "Goa is perfect for a beach holiday! 🏖️ Check out our Goa Beach Resort at ₹5,500/night or Zuri Kumarakom in Kerala at ₹7,000/night. Both have amazing pool and beach access!";
  } else if (msg.includes("mumbai")) {
    reply = "Mumbai has our most iconic stay — the Taj Mahal Palace at ₹12,000/night! 🌟 It's right at the Gateway of India with stunning views and legendary service.";
  } else if (msg.includes("delhi")) {
    reply = "In Delhi, the Leela Palace is our top pick at ₹9,500/night! 👑 Located in the diplomatic enclave with grand architecture and world-class amenities.";
  } else if (msg.includes("mountain") || msg.includes("shimla") || msg.includes("manali") || msg.includes("hill")) {
    reply = "For mountains, we have two amazing options! 🏔️ Wildflower Hall in Shimla at ₹8,000/night or The LaLiT Resort in Manali at ₹6,000/night — both have breathtaking Himalayan views!";
  } else if (msg.includes("heritage") || msg.includes("palace") || msg.includes("rajasthan") || msg.includes("jaipur") || msg.includes("jodhpur")) {
    reply = "Rajasthan is magical! 🏰 We have Umaid Bhawan Palace in Jodhpur at ₹15,000/night and Alila Fort Bishangarh near Jaipur at ₹14,000/night — both are stunning heritage properties!";
  } else if (msg.includes("agra") || msg.includes("taj mahal") || msg.includes("taj")) {
    reply = "For the Taj Mahal experience, Oberoi Amarvilas in Agra is unbeatable at ₹18,000/night! 🕌 Every room has a direct Taj Mahal view — it's the most magical hotel in India!";
  } else if (msg.includes("kerala") || msg.includes("backwater")) {
    reply = "Kerala is paradise! 🌴 Zuri Kumarakom sits right on the backwaters at ₹7,000/night. Enjoy Ayurveda treatments and traditional Kerala cuisine in a stunning setting!";
  } else if (msg.includes("chennai") || msg.includes("south")) {
    reply = "In Chennai, ITC Grand Chola is our top luxury pick at ₹8,500/night! 🏛️ It's inspired by the Chola Empire with incredible South Indian cuisine and a stunning rooftop pool.";
  } else if (msg.includes("budget") || msg.includes("cheap") || msg.includes("affordable") || msg.includes("low")) {
    reply = "Our most affordable options start at ₹5,500/night! 💰 Goa Beach Resort at ₹5,500, LaLiT Resort Manali at ₹6,000, and Zuri Kumarakom Kerala at ₹7,000 are all great value picks!";
  } else if (msg.includes("luxury") || msg.includes("expensive") || msg.includes("best") || msg.includes("top")) {
    reply = "Our finest luxury stays are Taj Mahal Palace Mumbai at ₹12,000, Umaid Bhawan Palace Jodhpur at ₹15,000, and Oberoi Amarvilas Agra at ₹18,000/night! 💎 All are world-class properties!";
  } else if (msg.includes("wifi") || msg.includes("pool") || msg.includes("spa") || msg.includes("breakfast")) {
    reply = "All our hotels include Free WiFi! 🌐 Most luxury properties also include pool access, spa, and breakfast. Check the amenities section on each hotel page for full details!";
  } else if (msg.includes("book") || msg.includes("booking") || msg.includes("reserve")) {
    reply = "Booking is super easy! 🎉 Just click 'Book Now' on any hotel card, select your room type, enter check-in/out dates and fill in your details. You'll get a confirmation ticket instantly!";
  } else if (msg.includes("cancel") || msg.includes("refund")) {
    reply = "We offer free cancellation up to 24 hours before check-in! ✅ For refunds, please contact us at hello@kahajaoge.com and we'll process it within 5-7 business days.";
  } else if (msg.includes("couple") || msg.includes("honeymoon") || msg.includes("romantic")) {
    reply = "For a romantic getaway, Oberoi Amarvilas Agra with Taj Mahal views is unbeatable! 💑 Wildflower Hall Shimla with snowy mountains is also incredibly romantic. Both are perfect for honeymoons!";
  } else if (msg.includes("family") || msg.includes("kids") || msg.includes("children")) {
    reply = "For families, Goa Beach Resort and Zuri Kumarakom Kerala are perfect! 👨‍👩‍👧‍👦 Both have pools, spacious rooms and kid-friendly activities. Leela Palace Delhi is also great for families!";
  } else if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste") || msg.includes("hey")) {
    reply = "Namaste! 🙏 Welcome to Kaha Jaoge! I'm here to help you find the perfect hotel across India. Where are you planning to travel? Tell me your destination or budget!";
  } else if (msg.includes("thank") || msg.includes("thanks")) {
    reply = "You're welcome! 😊 Happy to help you plan your perfect trip. Feel free to ask anything about our hotels, destinations or booking process. Happy travels! ✈️";
  } else if (msg.includes("package") || msg.includes("tour")) {
    reply = "We have amazing holiday packages! 🎒 Royal Rajasthan — 5 nights with palace tours at ₹45,000/person, and Tropical Goa — beach parties and sunset cruises at ₹28,000/person. Check the Packages section!";
  } else {
    reply = "Great question! 😊 We have 10 amazing hotels across India — from beach resorts in Goa to mountain retreats in Shimla and heritage palaces in Rajasthan. Tell me your preferred destination or budget and I'll find the perfect stay for you!";
  }

  return NextResponse.json({ reply });
}