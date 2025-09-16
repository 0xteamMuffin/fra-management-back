import fs from "fs";

const API_URL = "http://localhost:3000/api/v1/analysis/segment";

async function testSegmentation() {
  try {
    // Load image into buffer
    const filePath = "test.jpeg";
    const buffer = fs.readFileSync(filePath);

    // Prepare multipart form-data
    const form = new FormData();
    const file = new File([buffer], "test.jpeg", { type: "image/jpeg" });
    form.append("file", file);

    // Call Node API
    const res = await fetch(API_URL, { method: "POST", body: form });

    console.log("Status:", res.status, res.statusText);
    console.log("Content-Type:", res.headers.get("content-type"));

    if (!res.ok) {
      console.error("Error response:", await res.text());
      return;
    }

    // Get back image as buffer
    const arrayBuffer = await res.arrayBuffer();
    const output = Buffer.from(arrayBuffer);

    fs.writeFileSync("overlay.jpg", output);
    console.log("✅ Saved overlay.jpg");
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

testSegmentation();
