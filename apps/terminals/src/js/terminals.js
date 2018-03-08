$(function() {
	var socket = null;

	var $slides = null;
	var $video = $('.video');
	var video = $video[0];

	var play = false;
	var video_count = 0;
	var image_timer = null;
	var add_timer = null;


	// ---
	// Buttons block
	// ---


	$('.button.places').on('click', function(e) {
		$(this).toggleClass('active');
		$('.panel_block, .places_block').toggleClass('show');
	});

	$('.button.reboot').on('click', function(e) {
		location.reload();
	});

	$('.button.reset').on('click', function(e) {
		localStorage.clear();
		location.reload();
	});

	$('.button.ribbon').on('click', function(e) {
		$(this).toggleClass('active');
		$('.panel_block, .slider_block').toggleClass('show');
	});

	$('.button.start').on('click', function(e, fire) {
		if (fire || !play) {
			$('.button').filter('.stop').removeClass('active').end()
									.filter(this).addClass('active');

			play = true;
			$('.slide_item').first().trigger('click');
		}
	});

	$('.button.stop').on('click', function(e) {
		if (play) {
			$('.button').filter('.start').removeClass('active').end()
									.filter(this).addClass('active');

			play = false;
			video_count = 0;
			clearTimeout(image_timer);
			clearTimeout(add_timer);
		}
	});


	// ---
	// Cache block
	// ---


	var loadFile = function(url, cache, timeout, callback) {
		if (cache) return callback(null, 'cache');

		var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';

		xhr.ontimeout = function () {
			callback('err');
		};

		xhr.onload = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					callback(null, URL.createObjectURL(xhr.response));
				} else {
					callback('err');
				}
			}
		};

		xhr.open("GET", url, true);
		xhr.timeout = timeout;
		xhr.send(null);
	};


	// ---
	// Slider block
	// ---


	$('.slider_block').on('mousemove', function(e) {
		var $this = $(this);

		var percent = (e.pageX - $this.offset().left) / $this.width() * 1.1 - 0.25;
		$this.scrollLeft($this.children('.slider_inner').width() * percent);
	});


	$(document).on('click', '.slide_item', function(e) {
		var $current_slide = $(this);

		// seq monitor
		$slides.removeClass('current go').filter(this).addClass('current');

		var media_type = $current_slide.attr('media-type');
		var media_counter = +$current_slide.attr('media-counter');
		var media_src = $current_slide.attr('media-src');
		var media_cache = $current_slide.attr('media-cache');

		var $next_slide = $current_slide.index() < $slides.length - 1
			? $slides.removeClass('active').filter(this).next().addClass('active')
			: $slides.removeClass('active').first().addClass('active');

		video_count = 0;
		clearTimeout(image_timer);
		clearTimeout(add_timer);

		add_timer = setTimeout(function() {

			// seq monitor
			$slides.filter('.current').addClass('go').removeClass('current');

			loadFile(media_src, media_cache, 5000, function(err, data) {
				if (err) return $next_slide.trigger('click');

				if (data == 'cache') {
					var url = media_cache;
				} else {
					var url = data;
					$current_slide.attr('media-cache', url);
				}

				if (media_type == 'video') {
					video.pause();
					video.src = url;
					video.poster = '/stuff/terminals/backgrounds/bg.png';
					video.load();
					video.play();

					$video.off().on('ended', function(e) {
						if (play && (video_count != media_counter - 1)) {
							video_count = video_count + 1;

							video.pause();
							video.currentTime = 0;
							video.load();
							video.play();
						} else {
							if (play) $next_slide.trigger('click');
						}
					});
				}

				if (media_type == 'image') {
					video.pause();
					video.src = '';
					video.poster = url;
					video.load();

					image_timer = setTimeout(function() {
						if (play) $next_slide.trigger('click');
					}, media_counter * 1000);
				}

			});

		}, 1000);

	});


	// ---
	// Places block
	// ---


	$(document)
		.on('click', '.places_connect.active', function(e, data) {
			var $active = $('.places_list').children('.active');

			localStorage.terminal_name = (data && data.name) || $active.text();
			localStorage.terminal_id = (data && data.id) || $active.attr('place_id');

			$('.place_title').text(localStorage.terminal_name);

			if (socket) {
				socket.disconnect();
				socket = null;
			}

			socket = io.connect('', {
				port: 3002,
				forceNew: true,
				query: { terminal: localStorage.terminal_id }
			});

			socket.on('content', function(data) {
				$slides = $(data.content).first().addClass('active').end();

				$('.slider_inner').empty().append($slides);

				if (play) $('.button.start').trigger('click', true);
			});

			socket.on('update', function(data) {
				var content = $(data.content).toArray();
				var cache = {};

				$slides.each(function(i, slide) {
					var $slide = $(slide);
					var media_cache = $slide.attr('media-cache');
					var media_id = $slide.attr('media-id');

					if (media_cache) {
						cache[media_id] = media_cache;
					} else {
						content.every(function(slide_new) {

							return $(slide_new).attr('media-id') != media_id;

						}) && URL.revokeObjectURL(media_cache);
					}
				});

				var slides_new = content.map(function(slide_new) {
					var $slide_new = $(slide_new);
					var media_id = $slide_new.attr('media-id');

					if (cache[media_id]) {
						return $slide_new.attr('media-cache', cache[media_id]);
					} else {
						return $slide_new;
					}
				});

				$slides = $(slides_new).map($.fn.toArray).first().addClass('active').end();

				$('.slider_inner').empty().append($slides);
			});

			socket.on('push_reload', function(data) {
				location.reload();
			});

		})
		.on('click', '.p_title', function(e) {
			var $this = $(this);

			var place_type = $this.attr('place_type');
			var place_id = $this.prev().attr('place_id');

			$this.nextAll().addBack().remove();
			$('.places_connect').removeClass('active');

			if (place_type == 'shop' || place_type == 'city') {
				$.post('', { 'parent': place_id }).done(function(data) {
					$('.places_list').empty().append(data);
				});
			} else if (place_type == 'device') {
				$('.places_list').children().removeClass('active');
				$('.places_connect').removeClass('active');
			}
		})
		.on('click', '.place_item', function(e) {
			var $this = $(this);
			var $title = $this.clone().addClass('p_title').removeClass('place_item');

			var place_type = $this.attr('place_type');
			var place_id = $this.attr('place_id');

			if (place_type == 'city' || place_type == 'shop') {
				$('.places_title').append($title);
				$.post('', { 'parent': place_id }).done(function(data) {
					$('.places_list').empty().append(data);
				});
			} else if (place_type == 'device') {
				$('.places_title').children('[place_type=device]').remove().end().append($title);
				$('.places_list').children().removeClass('active').filter(this).addClass('active');
				$('.places_connect').addClass('active');
			}
		});

		if (localStorage.terminal_id && localStorage.terminal_name) {
			play = true;
			var data = {
				name: localStorage.terminal_name,
				id: localStorage.terminal_id
			};

			$('.places_connect').addClass('active').trigger('click', data).removeClass('active');
		}
});