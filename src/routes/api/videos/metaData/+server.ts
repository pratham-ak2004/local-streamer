import type { MetaData } from "$lib/types";
import { getFileProperties } from "$lib/server-utils";

export async function POST({request}: {request: Request}) {
    const {dir} = await request.json();

    const metaData = await getFileProperties(dir) as MetaData;

    return new Response(JSON.stringify(metaData), {
        headers: {
            "Content-Type": "application/json"
        },
        status: 200
    });
}