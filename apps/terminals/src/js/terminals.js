$(function() {
	var socket = null;

	var play = false;
	var video_count = 0;
	var image_timer = null;

	var mSwiper = new Swiper('.swiper-container', {
		speed: 1,
		spaceBetween: 0,
		allowTouchMove: false,
		loop: true,
		effect: 'fade'
	});

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

	$('.button.next').on('click', function(e) {
		mSwiper.slideNext();
	});

	$('.button.prev').on('click', function(e) {
		mSwiper.slidePrev();
	});

	$('.button.start').on('click', function(e) {
		if (!play) {
			play = true;
			mSwiper.slideNext();
		}
	});

	$('.button.stop').on('click', function(e) {
		play = false;
		video_count = 0;
		clearTimeout(image_timer);

		$('video').each(function() {
			$(this).trigger('pause')[0].currentTime = 0;
		});
	});


	$('.play_btn').on('click', function(e) {
		$('video')[0].play();
	});


	$('.slide_btn').on('click', function(e) {
		var index = $(this).index('.slide_btn');
		var $current_slide = $('.slide_item').eq(index);

		var media_type = $current_slide.attr('media-type');
		var media_counter = +$current_slide.attr('media-counter');
		var media_src = $current_slide.attr('media-src');

		if (media_type == 'video') {
			var $video = $('<video/>', { muted: true, preload: 'auto', src: media_src });

			$('.view_block').empty().append($video);
			$video[0].load();
			$video[0].play();
		} else {
			var $image = $('<img/>', { src: media_src });
			$('.view_block').empty().append($image);
		}

	});








	mSwiper.on('slideChangeTransitionStart', function () {
		if (!play) return false;

		var $current_slide = $(mSwiper.slides).eq(mSwiper.realIndex).next();
		var media_type = $current_slide.attr('media-type');
		var media_counter = +$current_slide.attr('media-counter');

		clearTimeout(image_timer);
		video_count = 0;

		$('video').each(function() {
			$(this).trigger('pause')[0].currentTime = 0;
		});

		if (media_type == 'video') {
			var $video = $current_slide.find('video');

			$video.on('ended', function(e) {
				if (video_count != media_counter - 1) {
					video_count = video_count + 1;
					$video[0].currentTime = 0;
					$video.trigger('play');
				} else {
					mSwiper.slideNext();
				}
			}).trigger('play');

		} else {
			image_timer = setTimeout(function() {
				mSwiper.slideNext();
			}, media_counter * 1000);
		}

	});































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
				$('.slider_block').empty().append(data.content);

				// $('.button.start').trigger('click');
			});

			socket.on('update', function(data) {
				$('.slider_block').empty().append(data.content);

				// $('.button.start').trigger('click');
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
			var data = {
				name: localStorage.terminal_name,
				id: localStorage.terminal_id
			};

			$('.places_connect').addClass('active').trigger('click', data).removeClass('active');
		}
});