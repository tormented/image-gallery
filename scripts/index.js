var fs = new FileAPI();

document.addEventListener('DOMContentLoaded', function(){
	var carousel,
		addForm = document.getElementsByTagName('form')[0],
		removeButton = document.getElementsByClassName('remove-item')[0];

	fs.init()
		.then(function(){
			carousel = new Carousel(document.getElementsByClassName('carousel')[0]);
			carousel.init();
			addForm.button.addEventListener('click', function(){
				carousel.addItem({
					title: addForm.title.value,
					url: addForm.url.value
				});
				addForm.reset();
			});
			removeButton.addEventListener('click', function(){
				carousel.removeItem()
			});
		});
});