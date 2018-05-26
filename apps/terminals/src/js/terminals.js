$(function() {
	var socket = null;
	var $video = $('.video');
	var video = $video[0];

	// setTimeout(function() {
	// 	video.pause();
	// 	video.src = '';
	// 	video.load();
	// 	$video.remove().length = 0;

	// 	window.location.reload(true);
	// }, 1000 * 60 * 60 * 3); // 1000 * 60 * 60 * 3

	setTimeout(function() {
		location.reload();
	}, 1000 * 60 * 60 * 3);

	navigator.sayswho= (function(){
			var ua= navigator.userAgent, tem,
			M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
			if(/trident/i.test(M[1])){
					tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
					return 'IE '+(tem[1] || '');
			}
			if(M[1]=== 'Chrome'){
					tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
					if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
			}
			M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
			if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
			return M.join(' ');
	})();

	$('.panel_block').text(navigator.sayswho);


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
		window.location.hash = '#';
		window.location.reload();
	});

	$('.button.url').on('click', function(e) {
		$(this).toggleClass('active');

		$('.place_url').toggle().val(window.location);
	});

	$('.button.controls').on('click', function(e) {
		$(this).hasClass('active')
			? $video.prop('controls', false).trigger('play')
			: $video.prop('controls', true).trigger('pause');

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
			video.pause();
			video.src = data.content;
			video.load();
			video.play();
		});

		socket.on('update', function(data) {
			window.location.reload();
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
			var $active = $('.places_list').children('.active');

			window.location.hash = '#' + $active.attr('place_id');
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

				$('.button.url').addClass('active');
				$('.place_url').show().val(window.location.href.split('#')[0] + '#' + place_id);
			}
		});

});