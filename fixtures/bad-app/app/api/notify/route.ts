export async function POST(request: Request) {
  const { email } = await request.json();
  const res = await fetch("http://localhost:4000/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return Response.json({ ok: res.ok });
}
