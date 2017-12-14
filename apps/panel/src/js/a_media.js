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
				months: [
					'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
					'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
				],
				monthsShort: [
					'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
					'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
				]
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
				var $items = $('.select_item.selected').parent();

				$.post('/admin/media/remove', { ids: $items.map(function() { return $(this).attr('id'); }).toArray() }).done(function() {
					$items.remove();
				});
		}
	});

	$('.templ_apply').on('click', function(e) {
		if (confirm('Применить шаблон к выбранным элементам?\n\nИзменения будут применены ко всем лентам.')) {
			var $items = $('.select_item.selected');

			var data = {
				'ids': $items.parent().map(function() { return $(this).attr('id'); }).toArray(),
				'interval': $('.templ_interval').val(),
				'counter': $('.templ_duration').val()
			};

			$.post('/admin/media/update', data).done(function() {
				$items.removeClass('selected').parent().children('.meta.counter').text(data.counter).end()
																							 .children('.meta.interval').text(data.interval)
																							 .each(function() {
																								 pickmeup(this).set_date($(this).text());
																							 });
			});
		}
	});

	// not live !!!!!!!!
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
			'templ_interval': function() {
				return $('.templ_interval').val();
			},
			'templ_duration': function() {
				return $('.templ_duration').val();
			},
			'templ_repeat': function() {
				return $('.templ_repeat').val();
			},
		},
		dragOver: function() {
			$('.add_media').addClass('active');
		},
		dragLeave: function() {
			$('.add_media').removeClass('active');
		},
		uploadStarted: function(i, file, len) {

		},
		uploadFinished: function(i, file, response, time) {
			var $media_item = $('<div/>', { 'class':'media_item', 'id': response.id });

			var $select_item = $('<div/>', { 'class':'option select_item' });
			var $tobegin_item = $('<div/>', { 'class':'option tobegin_item' });
			var $remove_item = $('<div/>', { 'class':'option remove_item' });
			var $update_item = $('<div/>', { 'class':'option update_item' });
			var $button_plus = $('<div/>', { 'class':'option button plus hide' });
			var $button_minus = $('<div/>', { 'class':'option button minus hide' });

			var $meta_counter = $('<div/>', { 'class':'meta counter', 'text': $('.templ_duration').val() });
			var $meta_interval = $('<div/>', { 'class':'meta interval', 'text': $('.templ_interval').val() });

			calendar.date = $('.templ_interval').val();
			pickmeup($meta_interval[0], calendar);

			$media_item.append($select_item, $tobegin_item, $remove_item,
												 $update_item, $button_plus, $button_minus,
												 $meta_counter, $meta_interval)
								 .css('background-image', 'url(' + response.path + ')')
								 .prependTo('.media_block');
		},
		globalProgressUpdated: function(progress) {
			$('.add_progress').width(progress + '%');
		},
		progressUpdated: function(i, file, progress) {

		},
		afterAll: function() {
			$('.add_media').removeClass('active');
			$('.add_progress').width(0);
		}
	});

	$(document)
		.on('mouseup touchend', function(e) {
				if ($(e.target).closest('.button').length) return;

				$('.button').addClass('hide');

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
			var $item = $(this).parent();

			$.post('/admin/media/tobegin', { id: $item.attr('id') }).done(function() {
				$item.prependTo('.media_block');
			});
		})
		.on('click', '.remove_item', function(e) {
			if (confirm('Удалить элемент?\n\nТак же этот элемент будет удален из всех лент.')) {
				var $item = $(this).parent();

				$.post('/admin/media/remove', { ids: [$item.attr('id')] }).done(function() {
					$item.remove();
				});
			}
		})
		.on('click', '.update_item', function(e) {
			if (confirm('Обновить метаданные для данного элемента?\n\nИзменения будут применены ко всем лентам.')) {
				var $item = $(this).parent();

				var data = {
					'ids': [$item.attr('id')],
					'interval': $item.children('.interval').text(),
					'counter': $item.children('.counter').text()
				};

				$.post('/admin/media/update', data).done(function() {
					$item.end().removeClass('active');
				});
			}
		})
		.on('click', '.counter', function(e) {
			$(this).parent().children('.button').removeClass('hide');
		})
		.on('click', '.button', function(e) {
			var $this = $(this);

			$this.parent().children('.update_item').addClass('active');

			var $counter = $this.parent().children('.counter');
			var type = $this.attr('class').split(' ')[2];
			var val = $counter.text();

			if (type == 'plus' && val < 9) {
				$counter.text(+val + 1);
			} else if (type == 'minus' && val > 1) {
				$counter.text(+val - 1);
			}

		});
});