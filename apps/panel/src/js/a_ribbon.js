$(function() {
	$ribbon = $('.slider_block.ribbon .slider_inner');
	$pool = $('.slider_block.pool .slider_inner');

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

	var ribbon_sort = {
		placeholder: 'placeholder',
		revert: 'invalid',
		containment: 'document',
		cancel: '.option, .meta'
	};

	$ribbon.sortable(ribbon_sort);

	$ribbon.find('.interval').each(function(index, el) {
		var $this = $(this);

		calendar.date = $this.text();
		pickmeup(this, calendar);

		$this.on('pickmeup-change', function(e) {
			var $item = $this.parent().children('.interval');
			var date_interval = pickmeup($item[0]).get_date(true);

			$item.text(date_interval[0] + ' - ' + date_interval[1]);
		});
	});

	$pool.find('.media_item').draggable({
		cancel: '.option',
		revert: 'invalid',
		containment: 'document',
		helper: 'clone',
		cursor: 'move',
		connectToSortable: $ribbon,
		start: function(event, ui) {
			ui.helper.children('.meta').remove().end()
							 .children('.add_item').addClass('hide').end()
							 .children('.new_item').removeClass('hide').end()
							 .children('.add_meta, .remove_item').removeClass('hide').end();
		}
	});

	$('.show_ribbon').on('click', function(e) {
		$(this).toggleClass('active');

		$ribbon.scrollLeft(0).promise().done(function() {
			$('.pool_title, .slider_block.pool').toggle();
			$('.slider_block.ribbon').toggleClass('open');
		});
	});

	$('form').on('submit', function(e) {
		e.preventDefault();

		$('.slider_block.ribbon').find('.media_item').toArray().forEach(function(item, i) {

			$('<input />').attr('type', 'hidden')
										.attr('name', 'media' + '[' + i + ']' + '[object]')
										.attr('value', $(item).attr('media_id'))
										.appendTo('form');

			if ($(item).find('.meta').length !== 0) {
				$('<input />').attr('type', 'hidden')
											.attr('name', 'media' + '[' + i + ']' + '[meta][interval]')
											.attr('value', $(item).find('.interval').text())
											.appendTo('form');

				$('<input />').attr('type', 'hidden')
											.attr('name', 'media' + '[' + i + ']' + '[meta][counter]')
											.attr('value', $(item).find('.counter').text())
											.appendTo('form');
			}
		});

		this.submit();
	});

	$(document)
		.on('mouseup touchend', function(e) {
				if ($(e.target).closest('.button').length) return;

				$('.button').addClass('hide');

				e.stopPropagation();
		})
		.on('click', '.remove_item', function(e) {
			$(this).parent().remove();
			$ribbon.sortable(ribbon_sort);
		})
		.on('click', '.add_item', function(e) {
			$(this).parent().clone()
						 .children('.add_item').addClass('hide').end()
						 .children('.new_item').removeClass('hide').end()
						 .children('.remove_item, .add_meta').removeClass('hide').end()
						 .children('.meta').remove().end()
						 .appendTo($ribbon);

			$ribbon.sortable(ribbon_sort);
		})
		.on('click', '.add_meta', function(e) {
			var media_id = $(this).parent().attr('media_id');
			var $pool_item = $pool.find('[media_id=' + media_id + ']');

			var $counter =  $('<div/>', { 'class': 'meta counter', 'text': $pool_item.children('.counter').text() });
			var $interval =  $('<div/>', { 'class': 'meta interval', 'text': $pool_item.children('.interval').text() });

			calendar.date = $interval.text();
			pickmeup($interval[0], calendar);

			$interval.on('pickmeup-change', function(e) {
				var $item = $(this).parent().children('.interval');
				var date_interval = pickmeup($item[0]).get_date(true);

				$item.text(date_interval[0] + ' - ' + date_interval[1]);
			});

			$(this).addClass('hide').parent().append($counter, $interval).children('.revert_meta').removeClass('hide');

		})
		.on('click', '.revert_meta', function(e) {
			$(this).addClass('hide').parent().children('.meta').remove().end()
																			 .children('.add_meta').removeClass('hide').end()
																			 .children('.counter').addClass('hide');
		})
		.on('click', '.ribbon .counter', function(e) {
			$(this).parent().children('.button').removeClass('hide');
		})
		.on('click', '.button', function(e) {
			var $counter = $(this).parent().children('.counter');
			var type = $(this).attr('class').split(' ')[2];
			var val = $counter.text();

			if (type == 'plus' && val < 9) {
				$counter.text(+val + 1);
			} else if (type == 'minus' && val > 1) {
				$counter.text(+val - 1);
			}

		});
});