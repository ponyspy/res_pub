$(function() {
	$ribbon = $('.slider_block.ribbon .slider_inner');
	$pool = $('.slider_block.pool .slider_inner');

	var calendar = {
		format: 'd.m.y',
		hide_on_select: false,
		position: 'top',
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
		axis: 'x',
		containment: 'document',
		cancel: '.option, .meta'
	};

	$ribbon.sortable(ribbon_sort);

	$ribbon.find('.interval').each(function(index, el) {
		var $this = $(this);

		pickmeup(this, calendar);
		$this.on('pickmeup-hide', function(e) {
			var $item = $(this).parent().children('.interval');
			var date_interval = pickmeup($item[0]).get_date(true);

			$item.text(date_interval[0] + ' - ' + date_interval[1]);
		});
	});

	$('.media_item', '.slider_block.pool').draggable({
		cancel: '.option',
		revert: 'invalid',
		containment: 'document',
		zIndex: 100,
		helper: 'clone',
		cursor: 'move',
		connectToSortable: $ribbon,
	});

	$ribbon.droppable({
		drop: function(event, ui) {
			alert(event.target.className)
			ui.helper.children('.meta').remove().end()
							 .children('.add_item').addClass('hide').end()
							 .children('.add_meta, .remove_item').removeClass('hide').end()
							 .removeAttr('style');
		}
	});

	$(document)
		.on('click', '.remove_item', function(e) {
			$(this).parent().remove();
			$ribbon.sortable(ribbon_sort);
		})
		.on('click', '.add_item', function(e) {
			$(this).parent().clone()
						 .children('.add_item').addClass('hide').end()
						 .children('.remove_item, .add_meta').removeClass('hide').end()
						 .children('.meta').remove().end()
						 .appendTo($ribbon);

			$ribbon.sortable(ribbon_sort);
		})
		.on('click', '.add_meta', function(e) {
			var $duration =  $('<div/>', { 'class': 'meta duration', 'text': '3' });
			var $interval =  $('<div/>', { 'class': 'meta interval', 'text': '24.09.17 - 28.09.17' });

			pickmeup($interval[0], calendar);

			$interval.on('pickmeup-hide', function(e) {
				var $item = $(this).parent().children('.interval');
				var date_interval = pickmeup($item[0]).get_date(true);

				$item.text(date_interval[0] + ' - ' + date_interval[1]);
			});

			$(this).addClass('hide').parent().append($duration, $interval).children('.revert_meta').removeClass('hide');

		})
		.on('click', '.revert_meta', function(e) {
			$(this).addClass('hide').parent().children('.meta').remove().end()
																			 .children('.add_meta').removeClass('hide');
		});

});