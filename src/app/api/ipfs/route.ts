import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest): Promise<NextResponse> {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File | null;
		if (!file) {
			return NextResponse.json({ error: "Missing file" }, { status: 400 });
		}

		const pinataKey = process.env.PINATA_API_KEY;
		const pinataSecret = process.env.PINATA_SECRET_KEY;
		if (!pinataKey || !pinataSecret) {
			return NextResponse.json({ error: "Missing Pinata credentials" }, { status: 500 });
		}

		const pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
		const upstream = await fetch(pinataUrl, {
			method: "POST",
			headers: {
				pinata_api_key: pinataKey,
				pinata_secret_api_key: pinataSecret,
			},
			body: (() => {
				const fd = new FormData();
				fd.append("file", file);
				return fd;
			})(),
		});

		if (!upstream.ok) {
			const text = await upstream.text();
			return NextResponse.json({ error: "Pinata upload failed", details: text }, { status: 502 });
		}

		const data = await upstream.json();
		return NextResponse.json({ IpfsHash: data.IpfsHash }, { status: 200 });
	} catch (err) {
		return NextResponse.json({ error: "Unexpected error", details: String(err) }, { status: 500 });
	}
}


