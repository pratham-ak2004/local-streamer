import ffmpeg from 'fluent-ffmpeg';
import type { MetaData } from './types';

ffmpeg.setFfprobePath('D:\\apps\\ffmpeg\\bin\\ffprobe.exe');

export function getFileProperties(file: string) {
	return new Promise((resolve, reject) => {
		try {
			const command = ffmpeg(file);
			command.ffprobe((err, data) => {
				if (err) {
					reject(err);
				}
				const metaData: MetaData = {
					format: data.format.format_name as string,
					duration: data.format.duration as number,
					bitrate: data.format.bit_rate as number,
					size: data.format.size as number,
					title: data.format.tags?.title as string
				};
				resolve(metaData);
			});
		} catch (err) {
			reject(err);
		}
	});
}
