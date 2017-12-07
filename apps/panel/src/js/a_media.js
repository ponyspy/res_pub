$(function() {
	var calendar = {
		format: 'd.m.y',
		hide_on_select: false,
		position: 'bottom',
		mode: 'range',
		locale: 'ru',
		locales: {
			ru: {
				days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
				daysShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
				daysMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
				months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
				monthsShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
			}
		}
	};

	pickmeup('.templ_interval', calendar);

	$('.toggle_meta').on('click', function(e) {
		$(this).toggleClass('select');
		$('.media_block').toggleClass('meta_show');
	});

	$('.interval').each(function(index, el) {
		var $this = $(this);

		calendar.date = $this.text();
		pickmeup(this, calendar);

		$this.on('pickmeup-change', function(e) {
			var $item = $this.parent().children('.interval');
			var date_interval = pickmeup($item[0]).get_date(true);

			$item.text(date_interval[0] + ' - ' + date_interval[1]);
		});
	});

	$('.add_media').filedrop({
		url: '/admin/preview',
		paramname: 'media',
		fallback_id: 'add_fallback',
		fallback_dropzoneClick : true,
		allowedfiletypes: ['image/jpeg','image/png','image/gif', 'video/mp4'],
		allowedfileextensions: ['.jpg','.jpeg','.png', '.gif', '.mp4'],
		maxfiles: 5,
		maxfilesize: 15,
		data: {
			'templ_interval': $('.templ_interval').val(),
			'templ_duration': $('.templ_duration').val(),
			'templ_repeat': $('.templ_repeat').val(),
		},
		dragOver: function() {
			$('.add_media').addClass('selected');
		},
		dragLeave: function() {
			$('.add_media').removeClass('selected');
		},
		uploadStarted: function(i, file, len) {

		},
		uploadFinished: function(i, file, response, time) {

		},
		globalProgressUpdated: function(progress) {
			$('.add_progress').width(progress + '%');
		},
		progressUpdated: function(i, file, progress) {

		},
		afterAll: function() {
			$('.add_media').removeClass('selected');
			$('.add_progress').width(0);
		}
	});

	$(document)
		.on('mouseup touchend', function(e) {
				if ($(e.target).closest('.counter').length) return;

				$('.counter').addClass('hide');

				e.stopPropagation();
		})
		.on('click', '.select_item', function(e) {
			$(this).toggleClass('selected');
		})
		.on('click', '.tobegin_item', function(e) {
			$(this).parent().prependTo('.media_block');
		})
		.on('click', '.remove_item', function(e) {
			$(this).parent().remove();
		})
		.on('click', '.update_item', function(e) {
			alert('Update item!');
		})
		.on('click', '.duration', function(e) {
			$(this).parent().children('.counter').removeClass('hide');
		})
		.on('click', '.counter', function(e) {
			var $duration = $(this).parent().children('.duration');
			var type = $(this).attr('class').split(' ')[2];
			var val = $duration.text();

			if (type == 'plus' && val < 9) {
				$duration.text(+val + 1);
			} else if (type == 'minus' && val > 1) {
				$duration.text(+val - 1);
			}

		});
});