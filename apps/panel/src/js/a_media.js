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

	pickmeup('.interval', calendar);

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

	$(document)
		.on('mouseup touchend', function(e) {
				if ($(e.target).closest('.counter').length) return;

				$('.counter').addClass('hide');

				e.stopPropagation();
		})
		.on('click', '.remove_item', function(e) {
			alert('Remove item!');
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