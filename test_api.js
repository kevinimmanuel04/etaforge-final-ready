const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBjj9Pd0nKvQe7IWir3yNs9Fq47CDaHXKQ";

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `I am at Lat: 12.9781, Lng: 77.5696 (near KSR Bengaluru Station). Identify the single NEAREST operational major hospital. Return ONLY a JSON object: {"name": string, "lat": number, "lng": number}. No markdown explanation.` }] }]
      })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Text response:", data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
