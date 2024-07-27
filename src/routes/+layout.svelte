<script>
	import Footer from '$lib/components/custom/footer.svelte';
	import Navbar from '$lib/components/custom/navbar.svelte';
	import '../app.css';
</script>

<div class="app">
	<Navbar/>

	<main>
		<slot></slot>
	</main>
	
	<Footer/>
</div>
