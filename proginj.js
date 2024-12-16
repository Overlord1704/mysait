const headers = document.querySelectorAll('.accordion-header');

headers.forEach(header => {
	header.addEventListener('click', () => {
		const content = header.nextElementSibling;
		content.classList.toggle('active');
		headers.forEach(h => {
			if (h !== header) {
				h.nextElementSibling.classList.remove('active');
			}
		});
	});
});