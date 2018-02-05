$(function() {
	$('.button.places').on('click', function(e) {
		$(this).toggleClass('active');
		$('.panel_block, .places_block').toggleClass('show');
	});

	$('.button.reboot').on('click', function(e) {
		location.reload();
	});

	var mySwiper = new Swiper('.swiper-container', {
		speed: 400,
		spaceBetween: 100,
		loop: true,
		navigation: {
			nextEl: '.swiper-button-next',
			prevEl: '.swiper-button-prev',
		},
	});

	$(document)
		.on('click', '.places_connect.active', function(e) {
			var terminal_name = $('.places_list').children('.active').text();
			var terminal_id = $('.places_list').children('.active').attr('place_id');

			$('.place_title').text(terminal_name);

			var socket = io.connect('', {
				port: 3002,
				forceNew: true,
				query: { terminal: terminal_id }
			});

			socket.on('content', function(data) {
				mySwiper.removeAllSlides();
				mySwiper.appendSlide(data.content);
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
});