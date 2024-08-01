<script lang="ts">
	import { cn } from "$lib/utils";
	import Icon from "@iconify/svelte"

	let className:string = "";
	let icon:string = "";
	let style:string = "";
	let btnClass:string = "";
	let zIndex:string = "";

	export { className as class };
	export { icon as icon };
	export { style as style };
	export { btnClass as btnClass };
	export { zIndex as zIndex };
</script>

<button class={cn(btnClass , zIndex)} on:click on:keydown on:mouseenter on:mouseleave>
	<Icon icon={icon} style={style} class={cn(className,zIndex)}/>
	<slot/>
</button>