$(function() {
	var shift = false;

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

	$('.deselect').on('click', function(e) {
		$('.select_item').removeClass('selected');
	});

	$('.invert').on('click', function(e) {
		$('.select_item').toggleClass('selected');
	});

	$('.remove_items').on('click', function(e) {
		if (confirm('Удалить выбранные элементы?\n\nТак же эти элементы будут удалены из всех лент.')) {
			$('.select_item.selected').parent().remove();
		}
	});

	$('.templ_apply').on('click', function(e) {
		if (confirm('Применить шаблон к выбранным элементам?\n\nИзменения будут применены ко всем лентам.')) {
			var interval = $('.templ_interval').val();
			var duration = $('.templ_duration').val();
			var repeat = $('.templ_repeat').val();

			$('.select_item.selected').removeClass('selected').parent().children('.meta.duration').text(duration).end()
																				 												 .children('.meta.interval').text(interval)
																				 												 .each(function() {
																																		pickmeup(this).set_date($(this).text());
																				 												 });
		}
	});

	$('.interval').each(function() {
		var $this = $(this);

		calendar.date = $this.text();
		pickmeup(this, calendar);

		$this.on('pickmeup-change', function(e) {
			$this.parent().children('.update_item').addClass('active');

			var $item = $this.parent().children('.interval');
			var date_interval = pickmeup($item[0]).get_date(true);

			$item.text(date_interval[0] + ' - ' + date_interval[1]);
		});
	});

	$('.add_media').filedrop({
		url: '/admin/media/upload',
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
			var $media_item = $('<div/>', { 'class':'media_item' });

			var $select_item = $('<div/>', { 'class':'option select_item' });
			var $tobegin_item = $('<div/>', { 'class':'option tobegin_item' });
			var $remove_item = $('<div/>', { 'class':'option remove_item' });
			var $update_item = $('<div/>', { 'class':'option update_item' });
			var $counter_plus = $('<div/>', { 'class':'option counter plus hide' });
			var $counter_minus = $('<div/>', { 'class':'option counter minus hide' });

			var $meta_duration = $('<div/>', { 'class':'meta duration', 'text': $('.templ_duration').val() });
			var $meta_interval = $('<div/>', { 'class':'meta interval', 'text': $('.templ_interval').val() });

			calendar.date = $('.templ_interval').val();
			pickmeup($meta_interval[0], calendar);

			$media_item.append($select_item, $tobegin_item, $remove_item,
												 $update_item, $counter_plus, $counter_minus,
												 $meta_duration, $meta_interval)
								 .css('background-image', 'url(' + response + ')')
								 .prependTo('.media_block');
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
		.on('keydown', function(e) {
			if (e.which == 16) shift = true;
		})
		.on('keyup', function(e) {
			if (e.which == 16) shift = false;
		})
		.on('dblclick mouseenter', '.media_item', function(e) {
			if (e.type == 'mouseenter' && !shift) return false;

			$(this).children('.select_item').toggleClass('selected');
		})
		.on('click', '.select_item', function(e) {
			$(this).toggleClass('selected');
		})
		.on('click', '.tobegin_item', function(e) {
			$(this).parent().prependTo('.media_block');
		})
		.on('click', '.remove_item', function(e) {
			if (confirm('Удалить элемент?\n\nТак же этот элемент будет удален из всех лент.')) {
				$(this).parent().remove();
			}
		})
		.on('click', '.update_item', function(e) {
			if (confirm('Обновить метаданные для данного элемента?\n\nИзменения будут применены ко всем лентам.')) {
				$(this).removeClass('active');
			}
		})
		.on('click', '.duration', function(e) {
			$(this).parent().children('.counter').removeClass('hide');
		})
		.on('click', '.counter', function(e) {
			var $this = $(this);

			$this.parent().children('.update_item').addClass('active');

			var $duration = $this.parent().children('.duration');
			var type = $this.attr('class').split(' ')[2];
			var val = $duration.text();

			if (type == 'plus' && val < 9) {
				$duration.text(+val + 1);
			} else if (type == 'minus' && val > 1) {
				$duration.text(+val - 1);
			}

		});
});