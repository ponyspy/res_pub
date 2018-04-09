	$(function() {
	var shift = false;
	var preview;


	// -- Cal init


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

	var setExpired = function($item) {
		var now = new Date();
		var date = pickmeup($item[0]).get_date();

		if (date[0].setHours(0,0,0,0) <= now.setHours(0,0,0,0) && date[1].setHours(0,0,0,0) >= now.setHours(0,0,0,0)) {
			$item.parent().removeClass('expired');
		} else {
			$item.parent().addClass('expired');
		}
	};

	var calChange = function(e) {
		var $this = $(this);

		$this.parent().addClass('changed');

		var $item = $this.parent().children('.interval');
		var date_interval = pickmeup($item[0]).get_date(true);

		setExpired($item);

		$item.text(date_interval[0] + ' - ' + date_interval[1]);
	};

	pickmeup('.templ_interval', calendar);

	$('.interval').each(function() {
		var $this = $(this);

		calendar.date = $this.text();
		pickmeup(this, calendar);

		$this.on('pickmeup-change', calChange);
	});


	// -- Menu toggles block


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


	// -- Menu buttons block


	$('.remove_items').on('click', function(e) {
		if ($('.selected').length == 0) {
			alert('Нет выбранных элементов!');
			return false;
		}

		if (confirm('Удалить выбранные элементы?\n\nТак же эти элементы будут удалены из всех лент.')) {
				var $items = $('.select_item.selected').parent();

				$.post('/admin/media/remove', { ids: $items.map(function() { return $(this).attr('id'); }).toArray() }).done(function() {
					$items.remove();
				});
		}
	});

	$('.templ_apply').on('click', function(e) {
		if ($('.selected').length == 0) {
			alert('Нет выбранных элементов!');
			return false;
		}

		var templ = {
			'interval': $('.templ_interval').val(),
			'duration': $('.templ_duration').val(),
			'repeat': $('.templ_repeat').val()
		};

		$('.select_item.selected').removeClass('selected').parent().addClass('changed')
					.filter('.image').children('.meta.counter').text(templ.duration).end().end()
					.filter('.video').children('.meta.counter').text(templ.repeat).end().end()
					.children('.meta.interval').text(templ.interval)
					.each(function() {
						var $this = $(this);

						pickmeup(this).set_date($this.text());
						setExpired($this);
					});
	});

	$('.revert_items').on('click', function(e) {
		var $changed_items = $('.media_item.changed');

		if ($changed_items.length == 0) {
			alert('Нет измененных элементов!');
			return false;
		}

		var ids = $changed_items.map(function() {
			return $(this).attr('id');
		}).toArray();

		$.post('/admin/media/revert', { ids: ids }).done(function(data) {
			data.items.forEach(function(item) {
				var $item = $('#' + item._id);

				var $counter = $item.children('.counter');
				var $interval = $item.children('.interval');

				$counter.text(item.counter);
				$interval.text(item.interval);

				pickmeup($interval[0]).set_date($interval.text());
				setExpired($interval);

				$item.removeClass('changed');
			});
		});
	});

	$('.save_items').on('click', function(e) {
		var $changed_items = $('.media_item.changed');

		if ($changed_items.length == 0) {
			alert('Нет измененных элементов!');
			return false;
		}

		if (confirm('Сохранить метаданные для данных элементов?\n\nИзменения будут применены ко всем лентам.')) {
			var data = $changed_items.map(function() {
				var $this = $(this);

				return {
					id: $this.attr('id'),
					counter: $this.children('.counter').text(),
					interval: $this.children('.interval').text(),
				};
			}).toArray();

			$.post('/admin/media/update', {items: data }).done(function() {
				$changed_items.removeClass('changed');
			});
		}
	});


	// -- Drop zone block


	$('.add_media').filedrop({
		url: '/admin/media/upload',
		paramname: 'media',
		fallback_id: 'add_fallback',
		fallback_dropzoneClick : true,
		allowedfiletypes: ['image/jpeg','image/png','image/gif', 'video/mp4'],
		allowedfileextensions: ['.jpg','.jpeg','.png', '.gif', '.mp4'],
		queuefiles: 1,
		// maxfiles: 5,
		maxfilesize: 80,
		data: {
			'video_preview': function() {
				return preview;
			},
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
		uploadFinished: function(i, file, response, time) {
			var $media_item = $('<div/>', { 'class':'media_item', 'id': response.id });

			var $select_item = $('<div/>', { 'class':'option select_item' });
			var $tobegin_item = $('<div/>', { 'class':'option tobegin_item' });
			var $remove_item = $('<div/>', { 'class':'option remove_item' });
			var $update_item = $('<div/>', { 'class':'option update_item' });
			var $button_plus = $('<div/>', { 'class':'option button plus hide' });
			var $button_minus = $('<div/>', { 'class':'option button minus hide' });

			var counter = $(response.type == 'image' ? '.templ_duration' : '.templ_repeat').val();

			var $meta_counter = $('<div/>', { 'class':'meta counter', 'text': counter });
			var $meta_interval = $('<div/>', { 'class':'meta interval', 'text': $('.templ_interval').val() });

			calendar.date = $('.templ_interval').val();
			pickmeup($meta_interval[0], calendar);
			$meta_interval.on('pickmeup-change', calChange);

			$media_item.append($select_item, $tobegin_item, $remove_item,
												 $update_item, $button_plus, $button_minus,
												 $meta_counter, $meta_interval)
								 .css('background-image', 'url(' + response.path + ')')
								 .addClass(response.type)
								 .each(function() { setExpired($(this).children('.interval')); })
								 .prependTo('.media_block');
		},
		globalProgressUpdated: function(progress) {
			$('.add_progress').width(progress + '%');
		},
		beforeSend: function(file, i, done) {
			if (file.type !== 'video/mp4') return done();

			var scale = 0.25;
			var canvas = document.createElement('canvas');
			var video = document.createElement('video');

			video.src = URL.createObjectURL(file);

			video.onloadeddata = function() {

				canvas.width = video.videoWidth * scale;
				canvas.height = video.videoHeight * scale;
				canvas.getContext('2d')
							.drawImage(video, 0, 0, canvas.width, canvas.height);

				preview = canvas.toDataURL('image/jpeg');

				done();
			};
		},
		afterAll: function() {
			$('.add_media').removeClass('active');
			$('.add_progress').width(0);
		}
	});


	// -- Live events block


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
		.on('click', '.revert_item', function(e) {
			var $item = $(this).parent();

			$.post('/admin/media/revert', { ids: [$item.attr('id')] }).done(function(data) {
				var $counter = $item.children('.counter');
				var $interval = $item.children('.interval');

				$counter.text(data.items[0].counter);
				$interval.text(data.items[0].interval);

				pickmeup($interval[0]).set_date($interval.text());
				setExpired($interval);

				$item.removeClass('changed');
			});
		})
		.on('click', '.update_item', function(e) {
			if (confirm('Сохранить метаданные для данного элемента?\n\nИзменения будут применены ко всем лентам.')) {
				var $item = $(this).parent();

				var data = {
					'id': $item.attr('id'),
					'interval': $item.children('.interval').text(),
					'counter': $item.children('.counter').text()
				};

				$.post('/admin/media/update', {items: [data] }).done(function() {
					$item.removeClass('changed');
				});
			}
		})
		.on('click', '.counter', function(e) {
			$(this).parent().children('.button').removeClass('hide');
		})
		.on('click', '.button', function(e) {
			var $this = $(this);

			$this.parent().addClass('changed');

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