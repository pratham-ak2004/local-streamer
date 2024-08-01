<script lang="ts">
	import { onMount } from 'svelte';
	import { debounce } from '$lib/client-utils';
	import { Icon } from '.';
	import { Slider } from '$lib/components/ui/slider';

	export { path as path };

	let path = '';
	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let timeoutId: any;
	let controlsElement: HTMLElement;

	$: progress = 0;
	let isOpen = false;
	let isPlaying = true;
	let dragTimeout: any;
	$: isDragging = false;
	$: isVolumeHidden = true;

	async function fetchVideoSource() {
		const response = await fetch('/api/videos', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ dir: path })
		});

		const data = await response.json();
		videoElement.src = data.source;
		videoElement.play();
	}

	function mouseEvent(e: Event) {
		if (e.type == 'click') {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			if (isOpen) {
				canvasElement.classList.remove('bg-black');
				canvasElement.classList.add('cursor-none');
				controlsElement.classList.replace('flex-col', 'hidden');
				isOpen = false;
			} else {
				isOpen = true;
				if (!canvasElement.classList.contains('bg-black')) {
					canvasElement.classList.add('bg-black');
					canvasElement.classList.remove('cursor-none');
					controlsElement.classList.replace('hidden', 'flex-col');
				}
				timeoutId = setTimeout(() => {
					canvasElement.classList.remove('bg-black');
					canvasElement.classList.add('cursor-none');
					controlsElement.classList.replace('flex-col', 'hidden');
					isOpen = false;
				}, 2000);
			}
		} else {
			isOpen = true;
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			if (!canvasElement.classList.contains('bg-black')) {
				canvasElement.classList.add('bg-black');
				canvasElement.classList.remove('cursor-none');
				controlsElement.classList.replace('hidden', 'flex-col');
			}
			timeoutId = setTimeout(() => {
				canvasElement.classList.remove('bg-black');
				canvasElement.classList.add('cursor-none');
				controlsElement.classList.replace('flex-col', 'hidden');
				isOpen = false;
			}, 2000);
		}
	}

	function playPause() {
		if (isPlaying && videoElement) {
			videoElement.pause();
		} else {
			videoElement.play();
		}
		isPlaying = !isPlaying;
	}

	onMount(() => {
		fetchVideoSource();
		videoElement.addEventListener('timeupdate', () => {
			if (videoElement && !isDragging && isPlaying) {
				progress = videoElement.currentTime;
			}
		});
		document.addEventListener('keydown', (e) => {
			const key = e.key;

			switch (key) {
				case 'spacebar':
				case ' ':
					playPause();
					break;

				case 'ArrowRight':
					videoElement.currentTime += 5;
					break;
				case 'ArrowLeft':
					videoElement.currentTime -= 5;
					break;

				case 'ArrowUp':
					videoElement.volume += 0.1;
					break;
				case 'ArrowDown':
					videoElement.volume -= 0.1;
					break;

				case 'f':
					if (document.fullscreenElement) {
						document.exitFullscreen();
					} else {
						videoElement.requestFullscreen();
					}
					break;

				case 'p':
					if (document.pictureInPictureElement) {
						document.exitPictureInPicture();
					} else {
						videoElement.requestPictureInPicture();
					}
					break;

				default:
					console.log('Got key : ', key);
					break;
			}
		});
	});
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<div class="relative aspect-video max-w-[80rem] m-auto">
	<video bind:this={videoElement} class="h-full w-full" autoplay />
	<canvas
		class="absolute top-0 z-10 h-full w-full opacity-50 transition-all duration-500"
		bind:this={canvasElement}
		on:click={mouseEvent}
		on:mousemove={debounce(mouseEvent, 0)}
	>
	</canvas>
	<div
		class="absolute left-0 top-0 hidden h-full w-full flex-col transition-all duration-500"
		bind:this={controlsElement}
	>
		<div class="flex h-full items-center justify-center">
			{#if isPlaying}
				<Icon
					icon="solar:pause-bold"
					class="size-40"
					zIndex="z-20"
					style="color:#b1b1b1"
					on:click={playPause}
				></Icon>
			{:else}
				<Icon
					icon="solar:play-bold"
					class="size-40"
					zIndex="z-20"
					style="color:#b1b1b1"
					on:click={playPause}
				></Icon>
			{/if}
		</div>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="absolute bottom-0 left-0 z-50 flex h-14 w-full flex-col" on:mousemove={debounce(mouseEvent, 0)}>
			<div class="h-fit w-full">
				{#if videoElement && videoElement.duration}
					<Slider
						class="h-1"
						max={videoElement.duration}
						value={[progress]}
						onValueChange={(value) => {
							const sliderTime = value[0];

							if (Math.abs(sliderTime - videoElement.currentTime) > 1) {
								videoElement.pause();
								isDragging = true;

								if (dragTimeout) {
									clearTimeout(dragTimeout);
								}

								dragTimeout = setTimeout(() => {
									videoElement.currentTime = sliderTime;
									videoElement.play();
									isDragging = false;
								}, 500);
							} else {
								videoElement.play();
								isPlaying = true;
							}
						}}
					/>
				{/if}
			</div>
			<div class="flex h-full w-full items-center gap-4 px-4">
				{#if videoElement && videoElement.duration}
					{#if isPlaying}
						<Icon
							icon="solar:pause-bold"
							class="size-8"
							zIndex="z-20"
							style="color:#b1b1b1"
							on:click={playPause}
						></Icon>
					{:else}
						<Icon
							icon="solar:play-bold"
							class="size-8"
							zIndex="z-20"
							style="color:#b1b1b1"
							on:click={playPause}
						></Icon>
					{/if}
				{/if}
				{#if videoElement}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="reaveal-slider flex w-8 flex-row gap-2 hover:w-fit"
						on:mouseenter={() => {
							isVolumeHidden = false;
						}}
						on:mouseleave={() => {
							setTimeout(() => {
								isVolumeHidden = true;
							}, 300);
						}}
					>
						<Icon
							icon={'material-symbols:volume-up'}
							class="size-8 z-50"
							style="color:#b1b1b1"
							on:click={() => {
								videoElement.muted = !videoElement.muted;
							}}
							
						></Icon>
						<Slider
							class={`my-auto h-full w-28 ${isVolumeHidden ? 'hidden' : 'flex'}`}
							max={100}
							value={[videoElement.muted ? 0 :videoElement.volume * 100]}
							onValueChange={(value) => {
								videoElement.volume = value[0] / 100;
							}}
						/>
					</div>
				{/if}
				{#if videoElement && videoElement.duration}
					{@const start = videoElement.duration > 3600 ? 11 : 14}
					{@const length = videoElement.duration > 3600 ? 8 : 5}
					<span class="text-center text-white text-nowrap"
						>{new Date(progress * 1000).toISOString().substr(start, length)} / {new Date(
							videoElement.duration * 1000
						)
							.toISOString()
							.substr(start, length)}</span
					>
				{/if}
				<div class="w-full"/>
				<Icon icon="mingcute:fullscreen-fill" class="size-8" style="color:#b1b1b1" on:click={() => {
					if (document.fullscreenElement) {
						document.exitFullscreen();
					} else {
						videoElement.requestFullscreen();
					}
				}}/>
			</div>
		</div>
	</div>
</div>

<style>
	.reaveal-slider {
		width: 2.5rem;
		transition: width 0.3s ease-in-out;
	}

	.reaveal-slider:hover {
		width: 7rem;
	}
</style>
