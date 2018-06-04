$(function() {
	var socket = null;


	setTimeout(function() {
		location.reload();
	}, 1000 * 60 * 60 * 6);

	// $('.stats_block').text(navigator.userAgent).on('click', function(e) {
	// 	$(this).remove();
	// });

	if (!window.exoJs) {
		$('body').addClass('browser');
	}


	// ---
	// Buttons block
	// ---


	$('.button.places').on('click', function(e) {
		$(this).toggleClass('active');

		$('.panel_block, .places_block').toggleClass('show');
	});

	$('.button.reboot').on('click', function(e) {
		window.location.reload();
	});

	$('.button.reset').on('click', function(e) {
		if (window.exoJs) {
			window.exoJs.clearCache();
			window.exoJs.clearSavedUrl();
			$('.panel_block').addClass('show').text('Теперь перезапустите приложение!');
		} else {
			window.location.hash = '#';
			window.location.reload();
		}
	});

	$('.button.url').on('click', function(e) {
		$(this).toggleClass('active');

		$('.place_url').toggle().val(window.location);
	});

	$('.button.controls').on('click', function(e) {
		if (window.exoJs) {
			$(this).hasClass('active')
				? window.exoJs.playerControls(false)
				: window.exoJs.playerControls(true);
		} else {
			$(this).hasClass('active')
				? $('video').prop('controls', false).trigger('play')
				: $('video').prop('controls', true).trigger('pause');
		}

		$(this).toggleClass('active');
	});

	$('.place_url').on('click', function() {
		$(this).trigger('select');
	});


	// ---
	// Connect block
	// ---


	$(window).on('load hashchange', function(e) {
		if (socket) {
			socket.disconnect();
			socket = null;
		}

		if (window.location.hash == '') return false;

		socket = io.connect('', {
			port: 3002,
			forceNew: true,
			query: { terminal: window.location.hash.replace('#', '') }
		});

		socket.on('content', function(data) {
			var video_path = window.location.href.split('#')[0].replace(/\/$/, '') + data.content;

			if (window.exoJs) {
				window.exoJs.clearCache();
				window.exoJs.loadVideoUrl(video_path,
					0 /* margin left */ ,
					0 /* margin top */ ,
					0 /* margin right */ ,
					0 /* margin bottom */ ,
					true /* mute audio */ );

				window.exoJs.playerPlay();
			} else {
				var video = $('video')[0];

				video.pause();
				video.src = video_path;
				video.load();
				video.play();
			}
		});

		socket.on('update', function(data) {
			if (window.exoJs) {
				window.exoJs.clearCache();
				window.location.reload();
			} else {
				window.location.reload();
			}
		});

		socket.on('push_reload', function(data) {
			window.location.reload();
		});
	});


	// ---
	// Places block
	// ---


	$(document)
		.on('click', '.places_connect.active', function(e, data) {
			var active_place = $('.places_list').children('.active').attr('place_id');

			if (window.exoJs) {
				window.exoJs.saveUrl(window.location.href.split('#')[0] + '#' + active_place);
				window.location.hash = '#' + active_place;
			} else {
				window.location.hash = '#' + active_place;
			}
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