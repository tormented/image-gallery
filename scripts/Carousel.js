(function(){
	"use strict";
	function Carousel(element){
		this.ELEMENT_WIDTH = 860;
		this.scroller = document.createElement('div');
		this.items = [];
		this.currentIndex = 0;
		this.navigation = {
			arrows: {
				next: element.getElementsByClassName('nav_next')[0],
				prev: element.getElementsByClassName('nav_prev')[0]
			},
			thumbnails: element.getElementsByClassName('thumbnails')[0]
		};

		this.scroller.className = 'scroller';
		element.getElementsByClassName('content')[0].appendChild(this.scroller);
	}

	Carousel.prototype.init = function(){
		var that = this;
		return this.initLocalFs()
			.then(function(){
				if(that.items.length){
					that.scroller.style.width = that.ELEMENT_WIDTH * that.items.length;
					that.navigation.arrows.next.addEventListener('click', function(){
						if((that.currentIndex + 1) >= that.navigation.thumbnails.children.length){
							return false;
						}else{
							that.setActive(that.navigation.thumbnails.children[that.currentIndex + 1])
						}
					});
					that.navigation.arrows.prev.addEventListener('click', function(){
						if((that.currentIndex) <= 0){
							return false;
						}else{
							that.setActive(that.navigation.thumbnails.children[that.currentIndex - 1])
						}
					});
					that.refresh();
					that.setActive(that.navigation.thumbnails.children[0]);
				}else{
					alert('Gallery is empty!')
				}
			})
			.catch(function(err){
				console.log(err);
			})
	};

	Carousel.prototype.setActive = function(item){
		var that = this,
			transform;

		this.currentIndex = [].indexOf.call(this.navigation.thumbnails.children, item);
		transform = (this.currentIndex !== 0) ? -(this.currentIndex * that.ELEMENT_WIDTH) : 0;
		utils.toArray(this.navigation.thumbnails.children).forEach(function(thumb){
			thumb.classList.remove('active');
		});
		item.classList.add('active');
		this.scroller.style.transform = 'translate(' + transform + 'px, 0)';
	};

	Carousel.prototype.initLocalFs = function(){
		var that = this;
		return new Promise(function(resolve, reject){
			return fs.checkFile('gallery.json')
				.then(function(){
					return fs.readFile('gallery.json')
						.then(function(data){
							that.items = JSON.parse(data);
							resolve(data);
						});
				}, function(){
					return fs.checkDirectory('assets')
						.then(resolve, function(err){
							return fs.createDirectory('assets')
								.then(function(){
									return Promise.all([utils.request('./assets/img1.png', {type: 'arraybuffer'}), utils.request('./assets/img2.png', {type: 'arraybuffer'})])
								})
								.then(function(data){
									return Promise.all([fs.writeFile('assets/' + utils.getHash() + '.png', data[0].response, 'image/png'), fs.writeFile('assets/' + utils.getHash() + '.png', data[1].response, 'image/png')])
								})
								.then(function(data){
									console.log('Images created');
									that.items = data.map(function(item, index){
										return {
											url: utils.getFileAbsolutePath(item.fullPath),
											title: 'Img'+ index + ' Title'
										}
									});
									return fs.writeFile('gallery.json', JSON.stringify(that.items), 'application/json')
								})
								.then(resolve)
						});
				}).catch(reject);
		});
	};

	Carousel.prototype.refresh = function(){
		var that = this;
		this.scroller.innerHTML = '';
		this.navigation.thumbnails.innerHTML = '';

		that.items.forEach(function(item){
			that.scroller.appendChild(createItem(item));
			that.navigation.thumbnails.appendChild(createThumbnail.call(that, item))
		});
	};

	Carousel.prototype.addItem = function(data){
		var that = this;
		utils.request(data.url, {type: 'arraybuffer'})
			.then(function(res){
				return fs.writeFile('assets/' + utils.getHash() + '.png', res.response, 'image/png')
			})
			.then(function(entry){
				that.items.push({url: utils.getFileAbsolutePath(entry.fullPath), title: data.title});
				that.refresh();
				that.setActive(that.navigation.thumbnails.children[that.navigation.thumbnails.children.length - 1]);
				fs.updateFile('gallery.json', JSON.stringify(that.items), 'application/json');
			})
	};

	Carousel.prototype.removeItem = function(){
		var that = this,
			item = this.items[that.currentIndex];

		return new Promise(function(resolve, reject){
			return fs.removeFile(utils.getFileRelativePath(item.url))
				.then(function(){
					that.items.splice(that.currentIndex, 1);
					that.scroller.removeChild(that.scroller.children[that.currentIndex]);
					that.navigation.thumbnails.removeChild(that.navigation.thumbnails.children[that.currentIndex]);
					if(that.navigation.thumbnails.children.length){
						that.setActive(that.navigation.thumbnails.children[that.currentIndex ? that.currentIndex - 1 : 0]);
					}
					return fs.updateFile('gallery.json', JSON.stringify(that.items), 'application/json');
				})
				.then(resolve)
		});


	};

	function createItem(data){
		var fragment = document.createDocumentFragment(),
			item = document.createElement('figure'),
			itemImage = document.createElement('img'),
			itemTitle = document.createElement('figcaption');

		itemImage.setAttribute('src', data.url);
		itemTitle.innerText = data.title;
		item.appendChild(itemImage);
		item.appendChild(itemTitle);
		fragment.appendChild(item);

		return fragment;
	}

	function createThumbnail(data){
		var that = this,
			fragment = document.createDocumentFragment(),
			item = document.createElement('div'),
			itemImage = document.createElement('img');

		itemImage.setAttribute('src', data.url);
		item.className = 'thumbnail';
		item.addEventListener('click', function(){
			that.setActive(item)
		});
		item.appendChild(itemImage);
		fragment.appendChild(item);

		return fragment;
	}

	window.Carousel = Carousel;
})();