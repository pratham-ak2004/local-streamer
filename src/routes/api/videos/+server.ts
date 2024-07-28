import * as uuid from "uuid";
import fs from "fs";
import { getFileProperties } from "$lib/utils";
import type { MetaData } from "$lib/types";

type VideoEncode = {
	path : string
	id : string
}

let videoEncode:VideoEncode[] = [];
const NAME_SPACE = uuid.v4();
const CHUNK_SIZE = 10**6; // 10MB

export async function POST({request} : {request : Request}) {
	try {
		const { dir } = await request.json();
		
		const id = uuid.v5(dir, NAME_SPACE);		
		const url = `/api/videos?path=${id}`

		videoEncode.push({
			path : dir,
			id : id
		})

		return new Response(JSON.stringify({message: "Source generated successfully", source : url}), { status: 200 });		
	} catch (err:any) {
		return new Response(JSON.stringify({message: "Error occured" , error : err.message}), { status: 500 });
	}
}

export async function GET({request} : {request : Request}){
	try {
		const params = new URLSearchParams(request.url.split("?")[1]);
		const path = getFilePath(params.get("path") as string) || "";
		
		if(!path) return new Response(JSON.stringify({message: "File not found"}), { status: 404 });

		const stat = fs.statSync(path);
		const fileSize = stat.size;
		const range = request.headers.get("Range");
		
		if(!range)return new Response(JSON.stringify({message: "Range header not found"}), { status: 400 });

		const parts = range.replace(/bytes=/, "").split("-");
		const start = Number(parts[0]);
		const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
		const contentLength = (end - start + 1).toString();
		const headers = {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': contentLength,
			'Content-Type': `video/${await getFileFormat(path)}`,
		}

		const stream = fs.createReadStream(path, { start, end });

		const readableStream = new ReadableStream({
            start(controller) {
                stream.on('data', (chunk) => controller.enqueue(chunk));
                stream.on('end', () => controller.close());
                stream.on('error', (err) => controller.error(err));
            },
			 cancel() {
                stream.destroy();
            }
        });

	 	return new Response(readableStream, { status: 206, headers });
	} catch (err:any) {
		return new Response(JSON.stringify({message: "Error occured" , error : err.message}), { status: 500 });
	}
}

function getFilePath(id:string){
	const video = videoEncode.find((video) => video.id === id);
	return video?.path ?? ""
}

function getFileFormat(path:string){
	return new Promise(async(resolve, reject) => {
		try {
			const metaData:MetaData = await getFileProperties(path) as MetaData
			const formats = metaData.format.replaceAll(',','+')
			resolve(formats);
		} catch (error:any) {
			reject(error)
		}
	})
}