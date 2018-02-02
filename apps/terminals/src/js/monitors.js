$(function() {

	var socket = null;


	// Slides Block


	var slider = new Slider();

	$('.play')
		.on('click', slider.play(30000))
		.on('click', function() { localStorage.setItem('slider', 'play'); });
	$('.pause')
		.on('click', slider.pause)
		.on('click', function() { localStorage.removeItem('slider'); });
	$('.next').on('click', slider.flipNext);
	$('.back').on('click', slider.flipBack);


	// Panel Block


	$('.hide').on('click', function() {
		$('body').toggleClass('cursor');
		$('.monitor_panel').toggleClass('hide');
	});

	$(document).on('click', '.logo', function() {
		$('.hide').trigger('click');
	});

	$(document).on('keyup', function(event) {
		var num_codes = [49, 50, 51, 52, 53, 54, 55, 56, 57];

		if (event.which == 27) {
			$('.hide').trigger('click');
		}

		if (event.which == 37) {
			$('.back').trigger('click');
		}

		if (event.which == 39) {
			$('.next').trigger('click');
		}

		if (event.altKey && /^[0-9]+$/.test(num_codes.indexOf(event.which))) {
			$('.area_select')[0].selectedIndex = num_codes.indexOf(event.which);
			$('.connect').trigger('click');
		}

		if (event.altKey && event.ctrlKey && event.which == 66) {
			$('body').toggleClass('barsuk');
		}

		if (event.altKey && event.ctrlKey && event.which == 82) {
			if (socket) socket.emit('reload');
		}
	});


	// Connect Block


	$('.update').on('click', function() {
		socket.emit('update', { status: 'update' });
	});


	$('.connect').on('click', function() {
		var area_id = $('.area_select').val();

		localStorage.setItem('area_id', area_id);

		if (socket) {
			socket.disconnect();
			$('.slider_block').empty();
			socket = null;
		}

		socket = io.connect('', {
			port: 3002,
			forceNew: true,
			query: { area: area_id }
		});

		socket.on('events', function(data) {
			if (data.status == 'update') {
				slider.pushSlides(data.areas);
			} else {
				$('.slider_block').append(data.areas);
				slider.reinit();
			}
		});

		socket.on('push_reload', function(data) {
			location.reload();
		});
	});

	if (localStorage.getItem('area_id')) {
		$('.area_select')[0].selectedIndex = $('.area_select').children('option').map(function() {
			return $(this).val();
		}).toArray().indexOf(localStorage.getItem('area_id'));

		$('.hide').trigger('click');
		$('.connect').trigger('click');
	}

	if (localStorage.getItem('slider')) {
		$('.play').trigger('click');
	} else {
		$('.pause').trigger('click');
	}


	// Time block


	var time = function() {
		var date = new Date();
		var days = ['ВОСКРЕСЕНЬЕ','ПОНЕДЕЛЬНИК','ВТОРНИК','СРЕДА','ЧЕТВЕРГ','ПЯТНИЦА','СУББОТА'];
		var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

		var day = days[date.getDay()];
		var hours = ('0' + date.getHours()).slice(-2);
		var min = ('0' + date.getMinutes()).slice(-2);

		$('.date').text(day + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ',');
		$('.hours').text(hours);
		$('.minutes').text(min);
		$('.time_sep').toggleClass('tick');
	};

	var _timer = setInterval(time, 1000);

});